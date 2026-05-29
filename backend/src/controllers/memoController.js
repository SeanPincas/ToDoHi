const Memo = require("../models/memoModel.js");
const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");

const { getNextZIndex } = require("../utils/memoBoard");
const { validCategories } = require("../utils/helpers");

// --------------------------- CREATE MEMO MANUALLY ---------------------------
exports.createMemo = async (req, res) => {
    try {
        const { title, content, category, containerColor, pinColor, position } = req.body

        const nextZ = await getNextZIndex(req.user._id);

        const newMemo = await Memo.create({
            userId: req.user._id,
            title,
            content,
            category: validCategories.includes(category) ? category : "others",
            containerColor: containerColor || "#ffffff",
            pinColor: pinColor || "#d32f2f",
            position: {
                xPct: position?.xPct ?? 50,
                yPct: position?.yPct ?? 50,
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
                xPct: 50,
                yPct: 50,
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

// ------------------------------ UPDATE MEMO LAYOUT -----------------------------
exports.updateMemoLayout = async (req, res) => {
    try {
        const userId = req.user._id;
        const { layout } = req.body;

        // ---------------------------------------------------------------------
        // 1️⃣ VALIDATION
        // ---------------------------------------------------------------------

        if (!Array.isArray(layout)) {
            return res.status(400).json({
                message: "Layout must be an array"
            });
        }

        if (layout.length === 0) {
            return res.status(400).json({
                message: "Layout cannot be empty"
            });
        }

        // Validate each item shape
        for (const item of layout) {
            if (
                !item.id ||
                typeof item.xPct !== "number" ||
                typeof item.yPct !== "number" ||
                typeof item.z !== "number"
            ) {
                return res.status(400).json({
                    message: "Invalid layout item structure"
                });
            }

            if (
                item.xPct < 0 || item.xPct > 100 ||
                item.yPct < 0 || item.yPct > 100
            ) {
                return res.status(400).json({
                    message: "xPct / yPct must be between 0 and 100"
                });
            }
        }

        // ---------------------------------------------------------------------
        // 2️⃣ OWNERSHIP CHECK
        // ---------------------------------------------------------------------

        const memoIds = layout.map(item => item.id);

        const existingMemos = await Memo.find({
            _id: { $in: memoIds },
            userId
        });

        if (existingMemos.length !== layout.length) {
            return res.status(403).json({
                message: "One or more memos do not belong to user"
            });
        }

        // ---------------------------------------------------------------------
        // 3️⃣ SORT + COMPACT Z (BACKEND SAFETY NET)
        // ---------------------------------------------------------------------

        // Sort by z ascending (bottom → top)
        const sortedLayout = [...layout].sort((a, b) => a.z - b.z);

        // ---------------------------------------------------------------------
        // 4️⃣ BULK UPDATE (ATOMIC)
        // ---------------------------------------------------------------------

        const bulkOps = sortedLayout.map((item, index) => ({
            updateOne: {
                filter: { _id: item.id, userId },
                update: {
                    "position.xPct": item.xPct,
                    "position.yPct": item.yPct,
                    "position.z": index // compacted, authoritative
                }
            }
        }));

        await Memo.bulkWrite(bulkOps);

        res.json({
            message: "Memo layout updated successfully"
        });

    } catch (err) {
        console.error("🔥 updateMemoLayout ERROR:", err);
        res.status(500).json({
            message: "Failed to update memo layout",
            error: err.message
        });
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
