const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");

const {
    validCategories,
    isToday,
    isYesterday
} = require("../utils/helpers.js");

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

// --------------------------- UPDATE TASK -----------------------------
exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, containerColor, status, deadline } = req.body;

        // Validate category: fallback to "others" if invalid
        const validCategories = [
            'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
            'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
            'errands', 'pet-care', 'learning', 'creative', 'maintenance',
            'shopping', 'travel', 'others'
        ];

        const updates = {
            title,
            description,
            status,
            deadline,
            containerColor,
            category: validCategories.includes(category) ? category : undefined
        }

        // Remove undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key])

        const updated = await Task.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            updates,
            { new: true }
        )

        if (!updated) return res.status(404).json({ message: "Task Not Found" });

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

// --------------------------- MARK COMPLETED TASK -----------------------------
exports.markComplete = async (req, res) => {
    try {
        const { id } = req.params
        const task = await Task.findByIdAndUpdate(
            { _id: id, userId: req.user._id },
            { status: "completed" },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: "Task Not Found" })

        // ---------------- STATS: increment totalTasksCompleted ----------------
        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { "stats.totalTasksCompleted": 1 } }
        );

        res.json({ message: "Task Completed", task })
    } catch (err) {
        res.status(500).json({ message: "Error Marking Task Complete", error: err.message })
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