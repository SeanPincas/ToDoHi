const Memo = require("../models/memoModel.js");
const Task = require("../models/taskModel.js");

// --------------------------- CREATE MEMO MANUALLY ---------------------------
exports.createMemo = async (req, res) => {
    try {
        const { title, content, category, containerColor, position } = req.body

        const validCategories = [
            'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
            'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
            'errands', 'pet-care', 'learning', 'creative', 'maintenance',
            'shopping', 'travel', 'others'
        ];

        const newMemo = await Memo.create({
            userId: req.user._id,
            title,
            content,
            category: validCategories.includes(category) ? category : "others",
            containerColor: containerColor || "#ffffff",
            position: position || { x: 0, y: 0, z: 1 }
        })

        res.status(201).json({ message: "Memo Created Successfully", memo: newMemo })
    } catch (err) {
        res.status(500).json({ message: "Error Creating Memo", error: err.message })
    }
}

// --------------------------- CREATE MEMO FROM TASK ---------------------------
exports.createMemoFromTask = async (req, res) => {
    try {
        const { taskId } = req.body;

        const validCategories = [
            'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
            'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
            'errands', 'pet-care', 'learning', 'creative', 'maintenance',
            'shopping', 'travel', 'others'
        ];

        const task = await Task.findOne({ _id: taskId, userId: req.user._id });
        if (!task) return res.status(404).json({ message: "Task Not Found" });

        const category = validCategories.includes(task.category)
            ? task.category
            : "others";

        // Copy the Task data into the Memo
        const memoData = {
            userId: req.user._id,
            title: task.title,
            content: task.description || "",
            category: category,
            containerColor: task.containerColor || "#ffffff",
            taskSourceId: task._id
        };

        const newMemo = await Memo.create(memoData);

        res.status(201).json({ message: "Memo Created From Task", memo: newMemo });
    } catch (err) {
        res.status(500).json({ message: " Error Creating Memo From Task", error: err.message })
    };
}

// -------------------------------- GET ALL MEMOS --------------------------------
exports.getAllMemos = async (req, res) => {
    try {
        const memos = await Memo.find({ userId: req.user._id })
            .sort({ "position.z": 1, createdAt: -1 });
        res.json(memos);
    } catch (err) {
        res.status(500).json({ message: "Error Fetching Memos", error: err.message })
    }
}

// ------------------------------ UPDATE MEMO CONTENT ------------------------------
exports.updateMemo = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updateMemo = await Memo.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            updates,
            { new: true }
        )

        if (!updateMemo) return res.status(404).json({ message: "Memo Not Found" });

        res.json({ message: "Memo Updated Successfully", memo: updateMemo });
    } catch (err) {
        res.status(500).json({ message: "Error Updating Memo", error: err.message });
    }
};

// ------------------------------ UPDATE MEMO POSITION -----------------------------
exports.updateMemoPosition = async (req, res) => {
    try {
        const { id } = req.params;
        const { x, y, z } = req.body;

        const updateMemo = await Memo.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { "position.x": x, "position.y": y, "position.z": z },
            { new: true }
        );
        

        if (!updateMemo) return res.status(404).json({ message: "Memo Not Found" });

        res.json({ message: "Memo Position Updated", memo: updateMemo });
    } catch (err) {
        res.status(500).json({ message: "Error Updating Memo Position", error: err.message })
    }
};

// -------------------------------- DELETE MEMO ----------------------------------
exports.deleteMemo = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Memo.findOneAndDelete({ _id: id, userId: req.user._id });

        if (!deleted) return res.status(404).json({ message: "Memo Not Found" });

        res.json({ message: "Memo Deleted Successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error Deleting Memo", error: err.message })
    }
};