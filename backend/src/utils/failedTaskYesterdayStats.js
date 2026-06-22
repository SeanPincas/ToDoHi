// ============================================================================
// File Name: failedTaskYesterdayStats.js
// Purpose:
// - Keeps the "Failed Tasks Yesterday" stat aligned with reset-hour cycle logic.
// - Counts yesterday failed tasks from both live Task rows and TaskArchive rows.
// - Avoids dropping the stat after previous-cycle tasks move into the archive.
// ============================================================================

const Task = require("../models/taskModel");
const TaskArchive = require("../models/taskArchiveModel");
const User = require("../models/userModel");
const { getCycleWindow } = require("./resetCycle");

function getTaskFailedCycleEventAt(task) {
    if (!task) return null;

    return task.deadline
        ?? task.failedAt
        ?? task.createdAt
        ?? null;
}

function isWithinPreviousCycle(dateValue, cycleWindow) {
    if (!dateValue) return false;

    const eventAt = new Date(dateValue);

    if (Number.isNaN(eventAt.getTime())) {
        return false;
    }

    return eventAt >= cycleWindow.previousCycleStart && eventAt <= cycleWindow.currentCycleStart;
}

async function countFailedTasksYesterdayForUser({ userId, resetHour = 0, now = new Date() }) {
    const cycleWindow = getCycleWindow(resetHour, now);

    const [liveFailedTasks, archivedFailedOriginalIds] = await Promise.all([
        Task.find({
            userId,
            status: "failed"
        }).select("_id deadline failedAt createdAt"),
        TaskArchive.distinct("originalTaskId", {
            userId,
            archiveType: "failed",
            sourceCycleKey: cycleWindow.currentCycleKey
        })
    ]);

    const archivedOriginalIdSet = new Set(
        archivedFailedOriginalIds.map((id) => String(id))
    );

    const liveYesterdayFailedCount = liveFailedTasks.filter((task) => {
        if (archivedOriginalIdSet.has(String(task._id))) {
            return false;
        }

        return isWithinPreviousCycle(getTaskFailedCycleEventAt(task), cycleWindow);
    }).length;

    return liveYesterdayFailedCount + archivedOriginalIdSet.size;
}

async function reconcileUserFailedTasksYesterdayStat(userId, resetHour = 0, now = new Date()) {
    const failedTasksYesterday = await countFailedTasksYesterdayForUser({
        userId,
        resetHour,
        now
    });

    await User.findByIdAndUpdate(userId, {
        $set: { "stats.tasksFailedYesterday": failedTasksYesterday }
    });

    return failedTasksYesterday;
}

module.exports = {
    getTaskFailedCycleEventAt,
    isWithinPreviousCycle,
    countFailedTasksYesterdayForUser,
    reconcileUserFailedTasksYesterdayStat
};
