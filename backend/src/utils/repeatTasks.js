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
const { DEFAULT_ARCHIVE_LABEL } = require("./repeatReviewConstants");
const { computeRepeatDeadline, computeRepeatCycleKey } = require("./resetCycle");
const { syncPreviousCycleTasksToArchiveForUser } = require("./taskArchiveSync");

function buildRepeatedTaskPayload(task, userId, deadline) {
    return {
        userId,
        title: task.title,
        description: task.description,
        category: task.category,
        containerColor: task.containerColor,
        status: "pending",
        completedAt: null,
        failedAt: null,
        deadline
    };
}

async function repeatTasksForUser({ userId, repeatTaskIds = [] }) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const resetHour = user.preference?.resetHour ?? 0;
    const { cycleWindow } = await syncPreviousCycleTasksToArchiveForUser({
        userId,
        resetHour,
        userPreference: user.preference
    });

    const reviewEntries = await TaskArchive.find({
        userId,
        sourceCycleKey: cycleWindow.currentCycleKey,
        repeatedAt: null
    }).sort({ archivedAt: 1, createdAt: 1, orderIndex: 1 });

    if (reviewEntries.length === 0) {
        return {
            ok: false,
            statusCode: 400,
            body: { message: "No Completed or Failed Tasks to Repeat" }
        };
    }

    const now = new Date();
    const newDeadline = computeRepeatDeadline(resetHour, now);
    const cycleKey = computeRepeatCycleKey(resetHour, now);
    const repeatIdSet = new Set((repeatTaskIds || []).map(String));
    const tasksToRepeat = reviewEntries.filter((entry) => repeatIdSet.has(entry._id.toString()));

    const newTaskPayloads = tasksToRepeat.map((entry) =>
        buildRepeatedTaskPayload(entry, userId, newDeadline)
    );

    const insertedTasks = newTaskPayloads.length > 0
        ? await Task.insertMany(newTaskPayloads)
        : [];

    const repeatedTaskIdMap = new Map();
    tasksToRepeat.forEach((entry, index) => {
        repeatedTaskIdMap.set(entry._id.toString(), insertedTasks[index]?._id ?? null);
    });

    const archivedAt = new Date();
    if (tasksToRepeat.length > 0) {
        await Promise.all(tasksToRepeat.map((entry) =>
            TaskArchive.updateOne(
                { _id: entry._id, userId, repeatedAt: null },
                {
                    $set: {
                        archiveReason: "repeat-selected-source",
                        repeatedAt: archivedAt,
                        repeatedIntoTaskId: repeatedTaskIdMap.get(entry._id.toString()) ?? null,
                        retentionDeleteAt: newDeadline
                    }
                }
            )
        ));
    }

    await TaskArchive.updateMany(
        {
            userId,
            sourceCycleKey: cycleKey,
            repeatedAt: null,
            archiveReason: "review-pending"
        },
        {
            $set: {
                archiveReason: "repeat-unselected"
            }
        }
    );

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
            archivedCount: reviewEntries.length,
            archivedFailedCount: reviewEntries.filter((task) => task.archiveType === "failed").length,
            archivedCompletedCount: reviewEntries.filter((task) => task.archiveType === "completed").length
        }
    };
}

module.exports = {
    computeRepeatDeadline,
    computeRepeatCycleKey,
    buildRepeatedTaskPayload,
    repeatTasksForUser
};
