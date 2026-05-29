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
        const userId = req.user._id;
        const { repeatTaskIds } = req.body;

        // fetch all old tasks
        const oldTasks = await Task.find({
            userId,
            status: { $in: ["completed", "failed"] }
        });

        // no tasks → dont open repeatTaskModal
        if (oldTasks.length === 0) {
            return res.status(400).json({
                message: "No Completed or Failed Tasks to Repeat"
            });
        }

        // Filter Only: User picked tasks will be recreated
        const tasksToRepeat = oldTasks.filter(task => repeatTaskIds.includes(task._id.toString()));

        // Compute NEW DEADLINE using resetHour
        const user = await User.findById(userId);
        const resetHour = user.preference?.resetHour ?? 0;

        const now = new Date();
        const newDeadline = new Date(now);
        newDeadline.setHours(resetHour, 0, 0, 0);

        // resetHour passed? then deadline Tomorrow
        if (now >= newDeadline) {
            newDeadline.setDate(newDeadline.getDate() + 1);
        }

        // RECREATE  NEW TASKS
        const newTasks = tasksToRepeat.map(task => ({
            userId,
            title: task.title,
            description: task.description,
            category: task.category,
            containerColor: task.containerColor,
            status: "pending",
            deadline: newDeadline
        }));

        await Task.insertMany(newTasks);

        // ---------------- STATS: increment totalTasksCreated for repeated tasks ----------------
        await User.findByIdAndUpdate(userId, {
            $inc: {
                "stats.totalTasksCreated": newTasks.length
            }
        });

        // DELETE ALL unwanted tasks
        await Task.deleteMany({
            userId,
            status: { $in: ["completed", "failed"] }
        });

        // We MUST compute the SAME reset-cycle key as the scheduler
        const boundary = new Date();
        boundary.setHours(resetHour, 0, 0, 0);

        // If resetHour has NOT been reached yet today,
        // then the active cycle actually started YESTERDAY
        if (new Date() < boundary) {
            boundary.setDate(boundary.getDate() - 1);
        }

        // Build cycle key: YYYY-MM-DD@resetHour
        const yyyy = boundary.getFullYear();
        const mm = String(boundary.getMonth() + 1).padStart(2, "0");
        const dd = String(boundary.getDate()).padStart(2, "0");

        const cycleKey = `${yyyy}-${mm}-${dd}@${resetHour}`;

        // ---------------- DEBUG LOG: repeat cycle acknowledgement ----------------
        console.log("[repeatTasks] repeatCycleAcknowledged → writing:", {
            userId,
            cycleKey
        });

        // Store acknowledgement on USER document
        await User.findByIdAndUpdate(userId, {
            repeatCycleAcknowledged: cycleKey
        });

        res.json({
            message: "Tasks repeated successfully",
            repeatedCount: newTasks.length
        });
    } catch (err) {
        console.log("[repeatTasks] Error:", err);
        res.status(500).json({ message: "Error Repeating Tasks", error: err.message })
    }
};