// ============================================================================
// File Name: repeatReview.js
// Purpose:
// - Builds the backend payload for the daily repeat/review step.
// - Returns repeatable completed/failed tasks plus review metadata.
// - Supports a calmer review flow without embedding UI-specific copy here.
// ============================================================================

const Task = require("../models/taskModel");
const TaskArchive = require("../models/taskArchiveModel");
const User = require("../models/userModel");
const { getCycleWindow } = require("./resetCycle");
const { DEFAULT_ARCHIVE_LABEL, DEFAULT_REVIEW_LIMIT } = require("./repeatReviewConstants");
const { syncPreviousCycleTasksToArchiveForUser } = require("./taskArchiveSync");

function buildRepeatReviewSummary(tasks) {
    const summary = {
        total: tasks.length,
        completed: 0,
        failed: 0
    };

    for (const task of tasks) {
        if (task.status === "completed") {
            summary.completed += 1;
        } else if (task.status === "failed") {
            summary.failed += 1;
        }
    }

    return summary;
}

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

    // Treat the exact reset boundary as part of the cycle that just ended.
    // This keeps tasks that fail/complete exactly at resetHour visible in the
    // previous-cycle review instead of dropping into a gap between cycles.
    return eventAt >= cycleWindow.previousCycleStart && eventAt <= cycleWindow.currentCycleStart;
}

function mapArchiveEntryToReviewTask(entry) {
    return {
        _id: entry._id,
        userId: entry.userId,
        title: entry.title,
        description: entry.description ?? "",
        category: entry.category,
        status: entry.archiveType,
        completedAt: entry.completedAt ?? null,
        failedAt: entry.failedAt ?? null,
        createdAt: entry.createdAt,
        updatedAt: entry.archivedAt ?? entry.createdAt,
        deadline: entry.deadline ?? null,
        orderIndex: entry.orderIndex ?? 0,
        isExpired: entry.isExpired ?? false,
        memoId: entry.memoId ?? null,
        containerColor: entry.containerColor
    };
}

async function getRepeatableTasksForUser({
    userId,
    resetHour,
    limit = DEFAULT_REVIEW_LIMIT
}) {
    const cycleWindow = getCycleWindow(resetHour, new Date());

    const candidateTasks = await Task.find({
        userId,
        status: { $in: ["completed", "failed"] }
    }).sort({ createdAt: 1, orderIndex: 1 });

    const tasks = candidateTasks
        .filter((task) => isWithinPreviousCycle(getTaskCycleEventAt(task), cycleWindow))
        .sort((a, b) => {
            const aTime = new Date(getTaskCycleEventAt(a) ?? a.createdAt ?? 0).getTime();
            const bTime = new Date(getTaskCycleEventAt(b) ?? b.createdAt ?? 0).getTime();

            if (aTime !== bTime) {
                return aTime - bTime;
            }

            return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        })
        .slice(0, limit);

    return {
        cycleWindow,
        tasks
    };
}

async function getRepeatReviewForUser({ userId, limit = DEFAULT_REVIEW_LIMIT }) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const resetHour = user.preference?.resetHour ?? 0;
    const retentionDays = user.preference?.dayTaskDelete ?? 30;
    const { cycleWindow } = await syncPreviousCycleTasksToArchiveForUser({
        userId,
        resetHour,
        userPreference: user.preference
    });

    const archivedEntries = await TaskArchive.find({
        userId,
        sourceCycleKey: cycleWindow.currentCycleKey,
        repeatedAt: null
    })
        .sort({ archivedAt: 1, createdAt: 1, orderIndex: 1 })
        .limit(limit);

    const reviewTasks = archivedEntries.map(mapArchiveEntryToReviewTask);

    const summary = buildRepeatReviewSummary(reviewTasks);

    return {
        reviewRequired: reviewTasks.length > 0,
        cycleKey: cycleWindow.currentCycleKey,
        retentionDays,
        archiveLabel: DEFAULT_ARCHIVE_LABEL,
        reviewSource: "archive",
        summary,
        tasks: reviewTasks
    };
}

module.exports = {
    DEFAULT_ARCHIVE_LABEL,
    DEFAULT_REVIEW_LIMIT,
    buildRepeatReviewSummary,
    getTaskCycleEventAt,
    isWithinPreviousCycle,
    mapArchiveEntryToReviewTask,
    getRepeatableTasksForUser,
    getRepeatReviewForUser
};
