// ============================================================================
// File Name: completedTaskStats.js
// Purpose:
// - Builds the live "Total Tasks Completed" stat for the dashboard.
// - Treats past-cycle completions as stable history.
// - Treats current-cycle completed tasks as reversible while the cycle is active.
// ============================================================================

const Task = require("../models/taskModel");
const TaskArchive = require("../models/taskArchiveModel");
const User = require("../models/userModel");
const { getCycleWindow } = require("./resetCycle");

function getTaskCompletedEventAt(task) {
    if (!task) return null;

    return task.completedAt ?? task.createdAt ?? null;
}

function isWithinCurrentCycle(dateValue, cycleWindow) {
    if (!dateValue) return false;

    const eventAt = new Date(dateValue);

    if (Number.isNaN(eventAt.getTime())) {
        return false;
    }

    return eventAt >= cycleWindow.currentCycleStart && eventAt < cycleWindow.nextCycleStart;
}

function isBeforeCurrentCycle(dateValue, cycleWindow) {
    if (!dateValue) return false;

    const eventAt = new Date(dateValue);

    if (Number.isNaN(eventAt.getTime())) {
        return false;
    }

    return eventAt < cycleWindow.currentCycleStart;
}

async function countCompletedTaskTotals(userId, resetHour = 0, now = new Date()) {
    const cycleWindow = getCycleWindow(resetHour, now);

    const [candidateTasks, archivedCompletedTaskIds] = await Promise.all([
        Task.find({
            userId,
            $or: [
                { completedOnce: true },
                { status: "completed" },
                { completedAt: { $ne: null } }
            ]
        }).select("_id status completedAt createdAt"),
        TaskArchive.distinct("originalTaskId", {
            userId,
            archiveType: "completed"
        })
    ]);

    const archivedCompletedIdSet = new Set(
        archivedCompletedTaskIds.map((id) => String(id))
    );

    const historicalLiveCompletedCount = candidateTasks.filter((task) => {
        if (archivedCompletedIdSet.has(String(task._id))) {
            return false;
        }

        return isBeforeCurrentCycle(getTaskCompletedEventAt(task), cycleWindow);
    }).length;

    const currentCycleCompletedCount = candidateTasks.filter((task) => {
        if (task.status !== "completed") {
            return false;
        }

        return isWithinCurrentCycle(getTaskCompletedEventAt(task), cycleWindow);
    }).length;

    const totalTasksCompleted =
        archivedCompletedIdSet.size + historicalLiveCompletedCount + currentCycleCompletedCount;

    return {
        totalTasksCompleted,
        tasksCompletedToday: currentCycleCompletedCount
    };
}

async function reconcileUserCompletedTaskStat(userId, resetHour = 0, now = new Date()) {
    const user = await User.findById(userId).select(
        "stats.totalTasksCompleted stats.tasksCompletedToday"
    );

    if (!user) {
        return null;
    }

    const {
        totalTasksCompleted,
        tasksCompletedToday
    } = await countCompletedTaskTotals(userId, resetHour, now);

    if (
        user.stats?.totalTasksCompleted !== totalTasksCompleted ||
        user.stats?.tasksCompletedToday !== tasksCompletedToday
    ) {
        await User.findByIdAndUpdate(userId, {
            $set: {
                "stats.totalTasksCompleted": totalTasksCompleted,
                "stats.tasksCompletedToday": tasksCompletedToday
            }
        });
    }

    return {
        totalTasksCompleted,
        tasksCompletedToday
    };
}

module.exports = {
    getTaskCompletedEventAt,
    isWithinCurrentCycle,
    isBeforeCurrentCycle,
    countCompletedTaskTotals,
    reconcileUserCompletedTaskStat
};
