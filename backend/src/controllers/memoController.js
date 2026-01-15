const Memo = require("../models/memoModel.js");
const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");

const { getNextZIndex, bringMemoToFront, sendMemoToBack } = require("../utils/memoboard")

// --------------------------- CREATE MEMO MANUALLY ---------------------------
exports.createMemo = async (req, res) => {
    try {
        const { title, content, category, containerColor, pinColor, position } = req.body

        const validCategories = [
            'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
            'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
            'errands', 'pet-care', 'learning', 'creative', 'maintenance',
            'shopping', 'travel', 'others'
        ];

        const nextZ = await getNextZIndex(req.user._id);

        const newMemo = await Memo.create({
            userId: req.user._id,
            title,
            content,
            category: validCategories.includes(category) ? category : "others",
            containerColor: containerColor || "#ffffff",
            pinColor: pinColor || "#d32f2f",
            position: {
                x: position?.x ?? 0,
                y: position?.y ?? 0,
                z: nextZ
            }
        });

        // ---------------- STATS: increment totalMemosCreated ----------------
        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { "stats.totalMemosCreated": 1 } }
        );

        res.status(201).json({ message: "Memo Created Successfully", memo: newMemo })
    } catch (err) {
        res.status(500).json({ message: "Error Creating Memo", error: err.message })
    }
}

// --------------------------- CREATE MEMO FROM TASK ---------------------------
exports.createMemoFromTask = async (req, res) => {
    try {
        const { taskId, pinColor } = req.body;

        const validCategories = [
            'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
            'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
            'errands', 'pet-care', 'learning', 'creative', 'maintenance',
            'shopping', 'travel', 'others'
        ];

        const task = await Task.findOne({
            _id: taskId,
            userId: req.user._id
        });

        if (!task) return res.status(404).json({ message: "Task Not Found" });

        const category = validCategories.includes(task.category)
            ? task.category
            : "others";

        // Determine next zIndex
        const nextZ = await getNextZIndex(req.user._id);

        // Copy the Task data into the Memo
        const newMemo = await Memo.create({
            userId: req.user._id,
            taskSourceId: task._id,
            title: task.title,
            content: task.description || "",
            category: category,
            containerColor: task.containerColor || "#fff2b3",
            pinColor: pinColor || "#d32f2f",
            position: {
                x: 0,
                y: 0,
                z: nextZ
            }
        });

        // ---------------- STATS: increment totalMemosCreated ----------------
        await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { "stats.totalMemosCreated": 1 } }
        );

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

        const {
            title,
            content,
            category,
            containerColor,
            pinColor
        } = req.body

        const updateMemo = await Memo.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            {
                title,
                content,
                category,
                containerColor,
                pinColor
            },
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
        const { x, y } = req.body;

        const updateMemo = await Memo.findOneAndUpdate(
            { _id: id, userId: req.user._id },
            { "position.x": x, "position.y": y },
            { new: true }
        );

        if (!updateMemo) return res.status(404).json({ message: "Memo Not Found" });

        res.json({ message: "Memo Position Updated", memo: updateMemo });
    } catch (err) {
        res.status(500).json({ message: "Error Updating Memo Position", error: err.message })
    }
};

// -------------------------- BRING MEMO TO FRONT ------------------------------
exports.bringMemoToFront = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMemo = await bringMemoToFront(id, req.user._id);

        if (!updatedMemo) {
            return res.status(404).json({ message: "Memo Not Found" });
        }

        res.json({ message: "Memo brought to front", memo: updatedMemo });
    } catch (err) {
        res.status(500).json({ message: "Error bringing memo to front",error: err.message })
    }
}

// -------------------------- SEND MEMO TO BACK -------------------------------
exports.sendMemoToBack = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedMemo = await sendMemoToBack(id, req.user._id);

        if (!updatedMemo) {
            return res.status(404).json({ message: "Memo Not Found" });
        }

        res.json({ message: "Memo brought to front", memo: updatedMemo });
    } catch (err) {
        res.status(500).json({ message: "Error bringing memo to front", error: err.message });
    }
};

// -------------------------------- DELETE MEMO ----------------------------------
exports.deleteMemo = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await Memo.findOneAndDelete({
            _id: id,
            userId: req.user._id
        });

        if (!deleted) return res.status(404).json({ message: "Memo Not Found" });

        res.json({ message: "Memo Deleted Successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error Deleting Memo", error: err.message });
    }
};