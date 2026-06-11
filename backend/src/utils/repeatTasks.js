// ============================================================================
// File Name: repeatTasks.js
// Purpose:
// - Executes the backend daily-review repeat flow.
// - Recreates selected tasks as fresh live tasks.
// - Archives old completed/failed tasks after the review decision.
// - Owns repeat-specific date logic such as repeat deadlines and cycle keys.
// ============================================================================

const Task = require("../models/taskModel");
const TaskArchive = require("../models/taskArchiveModel");
const User = require("../models/userModel");
const { buildArchiveRecord } = require("./taskArchive");
const { DEFAULT_ARCHIVE_LABEL } = require("./repeatReviewConstants");

// Improvement note:
//   computeRepeatDeadline and computeRepeatCycleKey should eventually be moved
//   into a shared reset-cycle/date utility instead of living beside flow logic.
function computeRepeatDeadline(resetHour, now = new Date()) {
    const deadline = new Date(now);
    deadline.setHours(resetHour, 0, 0, 0);

    if (now >= deadline) {
        deadline.setDate(deadline.getDate() + 1);
    }

    return deadline;
}

function computeRepeatCycleKey(resetHour, now = new Date()) {
    const boundary = new Date(now);
    boundary.setHours(resetHour, 0, 0, 0);

    if (now < boundary) {
        boundary.setDate(boundary.getDate() - 1);
    }

    const yyyy = boundary.getFullYear();
    const mm = String(boundary.getMonth() + 1).padStart(2, "0");
    const dd = String(boundary.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}@${resetHour}`;
}

function buildRepeatedTaskPayload(task, userId, deadline) {
    return {
        userId,
        title: task.title,
        description: task.description,
        category: task.category,
        containerColor: task.containerColor,
        status: "pending",
        deadline
    };
}

async function repeatTasksForUser({ userId, repeatTaskIds = [] }) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const oldTasks = await Task.find({
        userId,
        status: { $in: ["completed", "failed"] }
    }).sort({ createdAt: 1, orderIndex: 1 });

    if (oldTasks.length === 0) {
        return {
            ok: false,
            statusCode: 400,
            body: { message: "No Completed or Failed Tasks to Repeat" }
        };
    }

    const resetHour = user.preference?.resetHour ?? 0;
    const now = new Date();
    const newDeadline = computeRepeatDeadline(resetHour, now);
    const cycleKey = computeRepeatCycleKey(resetHour, now);
    const repeatIdSet = new Set((repeatTaskIds || []).map(String));
    const tasksToRepeat = oldTasks.filter(task => repeatIdSet.has(task._id.toString()));

    const newTaskPayloads = tasksToRepeat.map(task =>
        buildRepeatedTaskPayload(task, userId, newDeadline)
    );

    const insertedTasks = newTaskPayloads.length > 0
        ? await Task.insertMany(newTaskPayloads)
        : [];

    const repeatedTaskIdMap = new Map();
    tasksToRepeat.forEach((task, index) => {
        repeatedTaskIdMap.set(task._id.toString(), insertedTasks[index]?._id ?? null);
    });

    const archivedAt = new Date();
    const archiveRecords = oldTasks.map(task => {
        const wasSelected = repeatIdSet.has(task._id.toString());

        return buildArchiveRecord(task, {
            archiveType: task.status,
            archiveReason: wasSelected ? "repeat-selected-source" : "repeat-unselected",
            sourceCycleKey: cycleKey,
            repeatedIntoTaskId: wasSelected
                ? repeatedTaskIdMap.get(task._id.toString()) ?? null
                : null,
            archivedAt,
            userPreference: user.preference
        });
    });

    if (archiveRecords.length > 0) {
        await TaskArchive.insertMany(archiveRecords);
    }

    await Task.deleteMany({
        userId,
        _id: { $in: oldTasks.map(task => task._id) }
    });

    const userUpdate = {};

    if (insertedTasks.length > 0) {
        userUpdate.$inc = {
            "stats.totalTasksCreated": insertedTasks.length
        };
    }

    if (Object.keys(userUpdate).length > 0) {
        await User.findByIdAndUpdate(userId, userUpdate);
    }

    return {
        ok: true,
        statusCode: 200,
        body: {
            message: "Daily review processed successfully",
            archiveLabel: DEFAULT_ARCHIVE_LABEL,
            retentionDays: user.preference?.dayTaskDelete ?? 30,
            repeatedCount: insertedTasks.length,
            archivedCount: archiveRecords.length,
            archivedFailedCount: archiveRecords.filter(task => task.archiveType === "failed").length,
            archivedCompletedCount: archiveRecords.filter(task => task.archiveType === "completed").length
        }
    };
}

module.exports = {
    computeRepeatDeadline,
    computeRepeatCycleKey,
    buildRepeatedTaskPayload,
    repeatTasksForUser
};
