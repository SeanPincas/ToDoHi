const Task = require("../models/taskModel");
const TaskArchive = require("../models/taskArchiveModel");
const User = require("../models/userModel");
const { syncFailedTaskSnapshotForCycle } = require("./failedTaskSnapshot");
const { computeRepeatDeadline, buildRepeatedTaskPayload } = require("./repeatTasks");
const { DEFAULT_ARCHIVE_LABEL } = require("./repeatReviewConstants");

async function repeatTaskArchiveEntryForUser({ userId, archiveEntryId }) {
    const [user, archiveEntry] = await Promise.all([
        User.findById(userId),
        TaskArchive.findOne({ _id: archiveEntryId, userId })
    ]);

    if (!user) {
        throw new Error("User not found");
    }

    if (!archiveEntry) {
        return {
            ok: false,
            statusCode: 404,
            body: { message: "Task Archive entry not found" }
        };
    }

    const resetHour = user.preference?.resetHour ?? 0;
    const deadline = computeRepeatDeadline(resetHour, new Date());
    const taskPayload = buildRepeatedTaskPayload(archiveEntry, userId, deadline);
    const repeatedTask = await Task.create(taskPayload);

    if (!archiveEntry.repeatedIntoTaskId) {
        archiveEntry.repeatedIntoTaskId = repeatedTask._id;
        await archiveEntry.save();
    }

    await User.findByIdAndUpdate(userId, {
        $inc: { "stats.totalTasksCreated": 1 }
    });

    return {
        ok: true,
        statusCode: 201,
        body: {
            message: "Task repeated from archive successfully",
            archiveLabel: DEFAULT_ARCHIVE_LABEL,
            task: repeatedTask,
            archiveEntryId: archiveEntry._id
        }
    };
}

async function deleteTaskArchiveEntryForUser({ userId, archiveEntryId }) {
    const user = await User.findById(userId, "failedTaskSnapshot.cycleKey");
    const archiveEntry = await TaskArchive.findOneAndDelete({
        _id: archiveEntryId,
        userId
    });

    if (!archiveEntry) {
        return {
            ok: false,
            statusCode: 404,
            body: { message: "Task Archive entry not found" }
        };
    }

    if (
        archiveEntry.archiveType === "failed" &&
        archiveEntry.sourceCycleKey &&
        user?.failedTaskSnapshot?.cycleKey === archiveEntry.sourceCycleKey
    ) {
        await syncFailedTaskSnapshotForCycle({
            userId,
            cycleKey: archiveEntry.sourceCycleKey,
            resetAt: new Date()
        });
    }

    return {
        ok: true,
        statusCode: 200,
        body: {
            message: "Task Archive entry deleted successfully",
            archiveLabel: DEFAULT_ARCHIVE_LABEL,
            archiveEntryId: archiveEntry._id
        }
    };
}

module.exports = {
    repeatTaskArchiveEntryForUser,
    deleteTaskArchiveEntryForUser
};
