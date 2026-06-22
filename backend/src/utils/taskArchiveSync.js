// ============================================================================
// File Name: taskArchiveSync.js
// Purpose:
// - Moves stale completed/failed live tasks into TaskArchive automatically.
// - Keeps the repeat-review window focused only on the active "yesterday"
//   cycle while preserving older outcome tasks in the archive.
// ============================================================================

const Task = require("../models/taskModel");
const TaskArchive = require("../models/taskArchiveModel");
const User = require("../models/userModel");
const { buildArchiveRecord } = require("./taskArchive");
const { computeRepeatCycleKey, getCycleWindow } = require("./resetCycle");

function getTaskCycleEventAt(task) {
    if (!task) return null;

    if (task.status === "completed") {
        return task.completedAt ?? task.createdAt ?? null;
    }

    if (task.status === "failed") {
        return task.deadline
            ?? task.failedAt
            ?? task.createdAt
            ?? null;
    }

    return null;
}

function isWithinPreviousCycle(dateValue, cycleWindow) {
    if (!dateValue) return false;

    const eventAt = new Date(dateValue);

    if (Number.isNaN(eventAt.getTime())) {
        return false;
    }

    return eventAt >= cycleWindow.previousCycleStart && eventAt <= cycleWindow.currentCycleStart;
}

function isTaskOlderThanReviewWindow(task, cycleWindow) {
    const eventAtValue = getTaskCycleEventAt(task);

    if (!eventAtValue) {
        return false;
    }

    const eventAt = new Date(eventAtValue);

    if (Number.isNaN(eventAt.getTime())) {
        return false;
    }

    // Keep only the current "yesterday" bucket in live tasks.
    // Anything earlier belongs to TaskArchive instead.
    return eventAt < cycleWindow.previousCycleStart;
}

async function archiveExpiredReviewWindowTasks(now = new Date()) {
    const users = await User.find({}, "_id preference.resetHour preference.dayTaskDelete");
    let archivedCount = 0;

    for (const user of users) {
        const userId = user._id;
        const resetHour = user.preference?.resetHour ?? 0;
        const cycleWindow = getCycleWindow(resetHour, now);

        const candidateTasks = await Task.find({
            userId,
            status: { $in: ["completed", "failed"] }
        }).sort({ createdAt: 1, orderIndex: 1 });

        const staleTasks = candidateTasks.filter((task) =>
            isTaskOlderThanReviewWindow(task, cycleWindow)
        );

        if (staleTasks.length === 0) {
            continue;
        }

        const archivedAt = new Date(now);
        const archiveRecords = staleTasks.map((task) => {
            const eventAtValue = getTaskCycleEventAt(task) ?? task.createdAt ?? archivedAt;
            const sourceCycleKey = computeRepeatCycleKey(resetHour, new Date(eventAtValue));

            return buildArchiveRecord(task, {
                archiveType: task.status,
                archiveReason: "review-window-expired",
                sourceCycleKey,
                archivedAt,
                userPreference: user.preference
            });
        });

        if (archiveRecords.length > 0) {
            await TaskArchive.insertMany(archiveRecords);

            await Task.deleteMany({
                userId,
                _id: { $in: staleTasks.map((task) => task._id) }
            });

            archivedCount += archiveRecords.length;
        }
    }

    return { archivedCount };
}

async function syncPreviousCycleTasksToArchiveForUser({
    userId,
    resetHour = 0,
    userPreference = null,
    now = new Date()
}) {
    const cycleWindow = getCycleWindow(resetHour, now);

    const candidateTasks = await Task.find({
        userId,
        status: { $in: ["completed", "failed"] }
    }).sort({ createdAt: 1, orderIndex: 1 });

    const previousCycleTasks = candidateTasks.filter((task) =>
        isWithinPreviousCycle(getTaskCycleEventAt(task), cycleWindow)
    );

    if (previousCycleTasks.length === 0) {
        return {
            cycleWindow,
            archivedCount: 0,
            removedLiveCount: 0
        };
    }

    const originalTaskIds = previousCycleTasks.map((task) => task._id);
    const existingEntries = await TaskArchive.find({
        userId,
        sourceCycleKey: cycleWindow.currentCycleKey,
        originalTaskId: { $in: originalTaskIds }
    }).select("originalTaskId");

    const existingIdSet = new Set(existingEntries.map((entry) => String(entry.originalTaskId)));
    const tasksToArchive = previousCycleTasks.filter(
        (task) => !existingIdSet.has(String(task._id))
    );

    if (tasksToArchive.length > 0) {
        const archivedAt = new Date(cycleWindow.currentCycleStart);
        const archiveRecords = tasksToArchive.map((task) =>
            buildArchiveRecord(task, {
                archiveType: task.status,
                archiveReason: "review-pending",
                sourceCycleKey: cycleWindow.currentCycleKey,
                archivedAt,
                userPreference
            })
        );

        await TaskArchive.insertMany(archiveRecords);
    }

    await Task.deleteMany({
        userId,
        _id: { $in: originalTaskIds }
    });

    return {
        cycleWindow,
        archivedCount: tasksToArchive.length,
        removedLiveCount: previousCycleTasks.length
    };
}

module.exports = {
    archiveExpiredReviewWindowTasks,
    isTaskOlderThanReviewWindow,
    syncPreviousCycleTasksToArchiveForUser
};
