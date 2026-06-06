const Task = require("../models/taskModel");
const User = require("../models/userModel");
const { computeRepeatCycleKey } = require("./repeatTasks");
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

async function getRepeatReviewForUser({ userId, limit = DEFAULT_REVIEW_LIMIT }) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    const resetHour = user.preference?.resetHour ?? 0;
    const currentCycleKey = computeRepeatCycleKey(resetHour, new Date());
    const retentionDays = user.preference?.dayTaskDelete ?? 30;

    const repeatableTasks = await Task.find({
        userId,
        status: { $in: ["completed", "failed"] }
    })
        .sort({ createdAt: 1, orderIndex: 1 })
        .limit(limit);

    const summary = buildRepeatReviewSummary(repeatableTasks);

    return {
        reviewRequired: repeatableTasks.length > 0 && user.repeatCycleAcknowledged !== currentCycleKey,
        cycleKey: currentCycleKey,
        repeatCycleAcknowledged: user.repeatCycleAcknowledged,
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
    getRepeatReviewForUser
};
