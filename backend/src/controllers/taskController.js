const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");
const { repeatTasksForUser } = require("../utils/repeatTasks.js");
const { getTaskArchiveEntriesForUser } = require("../utils/taskArchiveQuery.js");
const { getRepeatReviewForUser } = require("../utils/repeatReview.js");
const {
    repeatTaskArchiveEntryForUser,
    deleteTaskArchiveEntryForUser
} = require("../utils/taskArchiveActions.js");

const {
    validCategories,
    isToday,
    isYesterday
} = require("../utils/helpers.js");

function buildStatusTimestampUpdates(existingTask, nextStatus, now = new Date()) {
    if (!nextStatus || nextStatus === existingTask.status) {
        return {};
    }

    if (nextStatus === "completed") {
        return {
            completedAt: now,
            failedAt: null,
            isExpired: false
        };
    }

    if (nextStatus === "failed") {
        return {
            completedAt: null,
            failedAt: now
        };
    }

    if (nextStatus === "pending") {
        return {
            completedAt: null,
            failedAt: null,
            isExpired: false
        };
    }

    return {};
}

// --------------------------- CREATE NEW TASK ---------------------------
exports.createTask = async (req, res) => {
    try {
        const { title, description, category, containerColor, deadline } = req.body;

        const newTask = await Task.create({
            userId: req.user._id,
            title,
            description,
            category: validCategories.includes(category) ? category : "others",
            containerColor: containerColor || '#ffffff',
            deadline: deadline || null
        });

        // ---------------- STATS: increment totalTasksCreated ----------------
        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { "stats.totalTasksCreated": 1 } }
        );

        res.status(201).json({ message: "Task created", task: newTask })
    } catch (err) {
        res.status(500).json({ message: "Error Creating Task", error: err.message })
    }
};

// --------------------------- GET ALL TASKS ---------------------------
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user._id })
            .sort({ orderIndex: 1, createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Error Fetching Tasks", error: err.message })
    }
};

// --------------------------- GET TASK ARCHIVE ---------------------------
exports.getTaskArchive = async (req, res) => {
    try {
        const user = await User.findById(req.user._id, "preference.resetHour preference.dayTaskDelete");
        const archiveResult = await getTaskArchiveEntriesForUser({
            userId: req.user._id,
            archiveType: req.query.archiveType,
            archiveReason: req.query.archiveReason,
            cycleKey: req.query.cycleKey,
            limit: req.query.limit,
            resetHour: user?.preference?.resetHour ?? 0,
            retentionDays: user?.preference?.dayTaskDelete ?? 30
        });

        res.json({
            message: "Task Archive fetched successfully",
            ...archiveResult
        });
    } catch (err) {
        res.status(500).json({ message: "Error Fetching Task Archive", error: err.message });
    }
};

// --------------------------- GET REPEAT REVIEW ---------------------------
exports.getRepeatReview = async (req, res) => {
    try {
        const review = await getRepeatReviewForUser({
            userId: req.user._id,
            limit: req.query.limit
        });

        res.json({
            message: "Repeat review fetched successfully",
            ...review
        });
    } catch (err) {
        res.status(500).json({ message: "Error Fetching Repeat Review", error: err.message });
    }
};

// --------------------------- REPEAT TASK ARCHIVE ENTRY ---------------------------
exports.repeatTaskArchiveEntry = async (req, res) => {
    try {
        const result = await repeatTaskArchiveEntryForUser({
            userId: req.user._id,
            archiveEntryId: req.params.id
        });

        if (!result.ok) {
            return res.status(result.statusCode).json(result.body);
        }

        res.status(result.statusCode).json(result.body);
    } catch (err) {
        res.status(500).json({ message: "Error Repeating Task Archive Entry", error: err.message });
    }
};

// --------------------------- UPDATE TASK -----------------------------
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, containerColor, status, deadline } = req.body;

        const existing = await Task.findOne({ _id: id, userId: req.user._id });

        if (!existing) return res.status(404).json({ message: "Task Not Found" });

        const updates = {
            title,
            description,
            status,
            deadline,
            containerColor,
            category: validCategories.includes(category) ? category : undefined
        }

        Object.assign(updates, buildStatusTimestampUpdates(existing, status));

        // Remove undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key])

        const updated = await Task.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            updates,
            { new: true }
        )

        res.json({ message: "Task Updated", task: updated });
    } catch (err) {
        res.status(500).json({ message: "Error Updating Task", error: err.message })
    }
}

// --------------------------- DELETE TASK -----------------------------
exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Task.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!deleted) return res.status(404).json({ message: "Task Not Deleted" })

        res.json({ message: "Task Deleted" })
    } catch (err) {
        res.status(500).json({ message: "Error Deleting Task", error: err.message });
    }
};

// --------------------------- DELETE TASK ARCHIVE ENTRY -----------------------------
exports.deleteTaskArchiveEntry = async (req, res) => {
    try {
        const result = await deleteTaskArchiveEntryForUser({
            userId: req.user._id,
            archiveEntryId: req.params.id
        });

        if (!result.ok) {
            return res.status(result.statusCode).json(result.body);
        }

        res.status(result.statusCode).json(result.body);
    } catch (err) {
        res.status(500).json({ message: "Error Deleting Task Archive Entry", error: err.message });
    }
};

// --------------------------- MARK COMPLETED TASK -----------------------------
exports.markComplete = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch first so we can detect status transition
        const existing = await Task.findOne({
            _id: id,
            userId: req.user._id
        });

        if (!existing)
            return res.status(404).json({ message: "Task Not Found" });

        // If already completed → do NOT increment stats again
        if (existing.status === "completed") {
            return res.json({
                message: "Task already completed",
                task: existing
            });
        }

        // Mark completed
        existing.status = "completed";
        existing.completedAt = new Date();
        existing.failedAt = null;
        existing.isExpired = false;
        await existing.save();

        // ---------------- STATS: increment totalTasksCompleted ----------------
        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { "stats.totalTasksCompleted": 1 } }
        );

        res.json({
            message: "Task Completed",
            task: existing
        });

    } catch (err) {
        res.status(500).json({
            message: "Error Marking Task Complete",
            error: err.message
        });
    }
};

// --------------------------- REORDER TASK MANUALLY -----------------------------
exports.reorderTasks = async (req, res) => {
    try {
        const { orderIds } = req.body;

        await Promise.all(
            orderIds.map((id, index) =>
                Task.findByIdAndUpdate(
                    { _id: id, userId: req.user._id },
                    { orderIndex: index })
            )
        )

        res.json({ message: "Tasks Reorded Successfully" })
    } catch (err) {
        res.status(500).json({ message: "Error Reordering Tasks", error: err.message })
    }
};

// --------------------------- REPEAT /RECREATE TASKS -----------------------------
exports.repeatTasks = async (req, res) => {
    try {
        const result = await repeatTasksForUser({
            userId: req.user._id,
            repeatTaskIds: req.body.repeatTaskIds || []
        });

        if (!result.ok) {
            return res.status(result.statusCode).json(result.body);
        }

        res.status(result.statusCode).json(result.body);
    } catch (err) {
        console.log("[repeatTasks] Error:", err);
        res.status(500).json({ message: "Error Repeating Tasks", error: err.message })
    }
};
