const Task = require("../models/taskModel");
const TaskArchive = require("../models/taskArchiveModel");
const User = require("../models/userModel");

function mapSnapshotTask(task) {
    return {
        _id: task._id,
        title: task.title,
        category: task.category ?? "others",
        containerColor: task.containerColor ?? "#ffffff",
        status: "failed"
    };
}

async function getArchivedFailedTasksForCycle(userId, cycleKey) {
    if (!cycleKey) return [];

    return TaskArchive.find({
        userId,
        archiveType: "failed",
        sourceCycleKey: cycleKey
    }).sort({ archivedAt: 1, createdAt: 1, orderIndex: 1 });
}

async function getLiveFailedTasksForUser(userId) {
    return Task.find({
        userId,
        status: "failed"
    }).sort({ createdAt: 1, orderIndex: 1 });
}

async function resolveFailedTasksForSnapshot({ userId, cycleKey }) {
    const archivedFailedTasks = await getArchivedFailedTasksForCycle(userId, cycleKey);

    if (archivedFailedTasks.length > 0) {
        return {
            source: "archive",
            tasks: archivedFailedTasks.map(mapSnapshotTask)
        };
    }

    const liveFailedTasks = await getLiveFailedTasksForUser(userId);

    return {
        source: "live",
        tasks: liveFailedTasks.map(mapSnapshotTask)
    };
}

async function writeFailedTaskSnapshot({ userId, cycleKey, resetAt, tasks }) {
    if (!tasks || tasks.length === 0) {
        await User.findByIdAndUpdate(userId, {
            $set: {
                "stats.tasksFailedYesterday": 0
            },
            $unset: { failedTaskSnapshot: "" }
        });

        return {
            cycleKey,
            taskCount: 0
        };
    }

    await User.findByIdAndUpdate(userId, {
        $set: {
            "stats.tasksFailedYesterday": tasks.length
        },
        failedTaskSnapshot: {
            cycleKey,
            resetAt,
            tasks
        }
    });

    return {
        cycleKey,
        taskCount: tasks.length
    };
}

async function syncFailedTaskSnapshotForCycle({ userId, cycleKey, resetAt = new Date() }) {
    const resolved = await resolveFailedTasksForSnapshot({ userId, cycleKey });

    const result = await writeFailedTaskSnapshot({
        userId,
        cycleKey,
        resetAt,
        tasks: resolved.tasks
    });

    return {
        ...result,
        source: resolved.source
    };
}

module.exports = {
    mapSnapshotTask,
    getArchivedFailedTasksForCycle,
    getLiveFailedTasksForUser,
    resolveFailedTasksForSnapshot,
    writeFailedTaskSnapshot,
    syncFailedTaskSnapshotForCycle
};
