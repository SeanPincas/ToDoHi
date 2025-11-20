const Task = require("../models/taskModel.js");

// --------------------------- CREATE NEW TASK ---------------------------
exports.createTask = async (req, res) => {
    try {
        const { title, description, category, containerColor } = req.body;

        // Validate category: fallback to "others" if invalid
        const validCategories = [
            'cleaning', 'work', 'study', 'fitness', 'health', 'cooking', 
            'relax', 'praying', 'hobby', 'social', 'self-care', 'finance', 
            'errands', 'pet-care', 'learning', 'creative', 'maintenance', 
            'shopping', 'travel', 'others'
        ];

        const newTask = await Task.create({
            userId: req.user._id,
            title,
            description,
            category: validCategories.includes(category) ? category : "others",
            containerColor: containerColor || '#ffffff',
            deadline: deadline || null
        });

        res.status(201).json({ message: "Task created", task: newTask })
    } catch (err) {
        res.status(500).json({ message: "Error Creating Task", error: err.mesage })
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
        const { title, description, category, containerColor, status, deadline }= req.body;

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

        res.json({ message: "Task Completed", task })
    } catch (err) {
        res.status(500).json({ message: "Error Marking Task Complete", error: err.message })
    }
};

// --------------------------- REORDER TASK MANUALLY -----------------------------
exports.reorderTasks = async (req, res) => {
    try {
        const { orderIds } = res.body;

        await Promise.all(
            orderIds.map((id, index) =>
                Task.findByIdAndUpdate({ _id: id, userId: req.user._id }, { orderIndex: index })
            )
        )

        res.json({ message: "Tasks Reorded Successfully" })
    } catch (err) {
        res.status(500).json({ message: "Error Reordering Tasks", error: err.message })
    }
};

// --------------------------- AUTO FAIL EXPIRED TASK -----------------------------
exports.autoFailTasks = async (req,res) => {
    try {
        // find the user making this requrest
        const user = await User.findById(req.user._id);
        // determine tehir reset hour
        const resetHour = user?.preference?.resetHour ?? 0;

        const now = new Date();
        const userResetTime = new Date();
        userResetTime.setHours(resetHour,0,0,0);

        // If the current time is past resetHour, then we use today's resetHour, otherwise use today's  resetHour so it doesnt skip
        if (now < userResetTime) {
            userResetTime.setData(userResetTime.getDate() - 1)
        }

        //update Tasks created before reset time and not completed\failed
        const result = await Task.updateMany(
            {
                userId: req.user._id,
                status: { $nin: ['completed', 'failed'] },
                createAt: { $lt: userResetTime }
            },
            { status: 'failed', isExpired: true }
        )

        res.json({ message: 'Expired tasks marked as failed', result })
    } catch (err) {
        res.status(500).json({ message: "Error auto-fauling tasks", error: err.message })
    }
}