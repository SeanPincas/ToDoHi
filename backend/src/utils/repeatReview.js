// ============================================================================
// File Name: repeatReview.js
// Purpose:
// - Builds the backend payload for the daily repeat/review step.
// - Returns repeatable completed/failed tasks plus review metadata.
// - Supports a calmer review flow without embedding UI-specific copy here.
// ============================================================================

const Task = require("../models/taskModel");
const User = require("../models/userModel");
const { getCycleWindow } = require("./resetCycle");
const { DEFAULT_ARCHIVE_LABEL, DEFAULT_REVIEW_LIMIT } = require("./repeatReviewConstants");

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
        return task.failedAt
            ?? task.deadline
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

    return eventAt >= cycleWindow.previousCycleStart && eventAt < cycleWindow.currentCycleStart;
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
    const { cycleWindow, tasks: repeatableTasks } = await getRepeatableTasksForUser({
        userId,
        resetHour,
        limit
    });

    const summary = buildRepeatReviewSummary(repeatableTasks);

    return {
        reviewRequired: repeatableTasks.length > 0,
        cycleKey: cycleWindow.currentCycleKey,
        retentionDays,
        archiveLabel: DEFAULT_ARCHIVE_LABEL,
        summary,
        tasks: repeatableTasks
    };
}

module.exports = {
    DEFAULT_ARCHIVE_LABEL,
    DEFAULT_REVIEW_LIMIT,
    buildRepeatReviewSummary,
    getTaskCycleEventAt,
    getRepeatableTasksForUser,
    getRepeatReviewForUser
};
