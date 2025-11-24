const DailyPlan = require("../models/dailyPlanModel.js");
const PlanHistory = require("../models/planHistoryModel.js");
const Task = require("../models/taskModel.js");
const Memo = require("../models/memoModel.js");
const User = require("../models/userModel.js");

const {
    validCategories,
    isValidTimeFormat,
    timeToMinutes,
    minutesToTime,
    splitOverMidnight,
    overwriteExistingPlans,
    getNextDay
} = require("../utils/helpers.js");

// ======================================================================
// --------------------------- CREATE PLAN FOR A GIVEN DATE ------------
// ======================================================================
exports.createDailyPlanEntry = async (req, res) => {
    try {
        const {
            date,
            title,
            description,
            startTime,
            endTime,
            category,
            containerColor,
            addToTask,
            addToMemo
        } = req.body;

        const userId = req.user._id;

        // ---------- VALIDATIONS ----------
        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            return res.status(400).json({ message: "Invalid Time Format. Use HH:mm" });
        }

        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid Category" });
        }

        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);

        // Split into chunks (1 or 2)
        const chunks = splitOverMidnight(startMin, endMin);

        // ---------- PROCESS EACH CHUNK ----------
        for (const chunk of chunks) {
            const chunkDate = chunk.isNextDay ? getNextDay(date) : date;

            let doc = await DailyPlan.findOne({ userId, date: chunkDate });
            if (!doc) {
                doc = await DailyPlan.create({
                    userId,
                    date: chunkDate,
                    dailyPlan: []
                });
            }

            // Overwrite overlaps
            doc.dailyPlan = overwriteExistingPlans(doc.dailyPlan, chunk.start, chunk.end);

            // New plan object
            const newPlan = {
                title,
                description,
                startTime: minutesToTime(chunk.start),
                endTime: minutesToTime(chunk.end),
                duration: chunk.end - chunk.start,
                category,
                containerColor
            };

            if (chunk.isNextDay) doc.dailyPlan.unshift(newPlan);
            else doc.dailyPlan.push(newPlan);

            await doc.save();
        }

        // Save to history
        await PlanHistory.create({
            userId,
            title,
            description,
            startTime,
            endTime,
            category,
            containerColor
        });

        // Sync to Task
        if (addToTask) {
            await Task.create({
                userId,
                title,
                description,
                deadline: date,
                category,
                containerColor
            });
        }

        // Sync to Memo
        if (addToMemo) {
            await Memo.create({
                userId,
                title,
                content: description,
                created_at: new Date(),
                category,
                containerColor
            });
        }

        res.status(201).json({
            message: "Daily plan created successfully",
            taskAdded: !!addToTask,
            memoAdded: !!addToMemo
        });

    } catch (err) {
        res.status(500).json({ message: "Error Creating Daily Plan", error: err.message });
    }
};

// ======================================================================
// --------------------------- GET DAILY PLAN (SORTED) ------------------
// ======================================================================
exports.getDailyPlan = async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user._id;

        const doc = await DailyPlan.findOne({ userId, date });

        if (!doc) {
            return res.status(200).json({ dailyPlan: [], message: "No Plans Yet" });
        }

        const sorted = doc.dailyPlan.sort(
            (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );

        res.json({ dailyPlan: sorted });

    } catch (err) {
        res.status(500).json({ message: "Error Fetching Plans", error: err.message });
    }
};

// ======================================================================
// --------------------------- EDIT DAILY PLAN --------------------------
// ======================================================================
exports.editDailyPlan = async (req, res) => {
    try {
        const { date, planId } = req.params;
        const userId = req.user._id;

        const {
            title,
            description,
            startTime,
            endTime,
            category,
            containerColor,
            addToTask,
            addToMemo
        } = req.body;

        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            return res.status(400).json({ message: "Invalid Time Format. Use HH:mm" });
        }

        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid Category" });
        }

        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);
        const newChunks = splitOverMidnight(startMin, endMin);

        let currentDoc = await DailyPlan.findOne({ userId, date });
        if (!currentDoc) return res.status(404).json({ message: "Day Not Found" });

        const oldPlan = currentDoc.dailyPlan.id(planId);
        if (!oldPlan) return res.status(404).json({ message: "Plan Not Found" });

        const linkedTaskId = oldPlan.linkedTaskId || null;
        const linkedMemoId = oldPlan.linkedMemoId || null;

        // Remove old plan
        currentDoc.dailyPlan = currentDoc.dailyPlan.filter(p => p._id.toString() !== planId);
        await currentDoc.save();

        // Insert updated chunks
        for (const chunk of newChunks) {
            const chunkDate = chunk.isNextDay ? getNextDay(date) : date;

            let doc = await DailyPlan.findOne({ userId, date: chunkDate });
            if (!doc) {
                doc = await DailyPlan.create({
                    userId,
                    date: chunkDate,
                    dailyPlan: []
                });
            }

            doc.dailyPlan = overwriteExistingPlans(doc.dailyPlan, chunk.start, chunk.end);

            const updatedPlan = {
                _id: planId,
                title,
                description,
                startTime: minutesToTime(chunk.start),
                endTime: minutesToTime(chunk.end),
                duration: chunk.end - chunk.start,
                category,
                containerColor,
                linkedTaskId,
                linkedMemoId,
                updatedAt: new Date()
            };

            doc.dailyPlan.push(updatedPlan);
            await doc.save();
        }

        // Sync Task or Memo
        if (addToTask && linkedTaskId) {
            await Task.findByIdAndUpdate(linkedTaskId, {
                title,
                description,
                category,
                containerColor
            });
        }

        if (addToMemo && linkedMemoId) {
            await Memo.findByIdAndUpdate(linkedMemoId, {
                title,
                content: description,
                category,
                containerColor
            });
        }

        // Save history
        await PlanHistory.create({
            userId,
            title,
            description,
            startTime,
            endTime,
            category,
            containerColor
        });

        res.json({ message: "Daily Plan Updated Successfully" });

    } catch (err) {
        res.status(500).json({ message: "Error Updating Plan", error: err.message });
    }
};

// ======================================================================
// --------------------------- UPDATE PLAN TIME --------------------------
// ======================================================================
exports.updatePlanTime = async (req, res) => {
    try {
        const { date, planId } = req.params;
        const { startTime, endTime } = req.body;
        const userId = req.user._id;

        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            return res.status(400).json({ message: "Invalid Time Format" });
        }

        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);
        const newChunks = splitOverMidnight(startMin, endMin);

        let currentDoc = await DailyPlan.findOne({ userId, date });
        if (!currentDoc) return res.status(404).json({ message: "Day Not Found" });

        const oldPlan = currentDoc.dailyPlan.id(planId);
        if (!oldPlan) return res.status(404).json({ message: "Plan Not Found" });

        const linkedTaskId = oldPlan.linkedTaskId || null;
        const linkedMemoId = oldPlan.linkedMemoId || null;

        currentDoc.dailyPlan = currentDoc.dailyPlan.filter(p => p._id.toString() !== planId);
        await currentDoc.save();

        for (const chunk of newChunks) {
            const chunkDate = chunk.isNextDay ? getNextDay(date) : date;

            let doc = await DailyPlan.findOne({ userId, date: chunkDate });
            if (!doc) {
                doc = await DailyPlan.create({
                    userId,
                    date: chunkDate,
                    dailyPlan: []
                });
            }

            doc.dailyPlan = overwriteExistingPlans(doc.dailyPlan, chunk.start, chunk.end);

            const updatedPlan = {
                _id: planId,
                title: oldPlan.title,
                description: oldPlan.description,
                startTime: minutesToTime(chunk.start),
                endTime: minutesToTime(chunk.end),
                duration: chunk.end - chunk.start,
                category: oldPlan.category,
                containerColor: oldPlan.containerColor,
                linkedTaskId,
                linkedMemoId,
                updatedAt: new Date()
            };

            doc.dailyPlan.push(updatedPlan);
            await doc.save();
        }

        res.json({ message: "Plan Time Updated" });

    } catch (err) {
        res.status(500).json({ message: "Error Updating Plan Time", error: err.message });
    }
};

// ======================================================================
// --------------------------- DELETE PLAN -------------------------------
// ======================================================================
exports.deletePlan = async (req, res) => {
    try {
        const { date, planId } = req.params;
        const userId = req.user._id;

        const doc = await DailyPlan.findOne({ userId, date });
        if (!doc) return res.status(404).json({ message: "Day Not Found" });

        const exists = doc.dailyPlan.some(p => p._id.toString() === planId);
        if (!exists) return res.status(404).json({ message: "Plan Not Found" });

        doc.dailyPlan = doc.dailyPlan.filter(p => p._id.toString() !== planId);
        await doc.save();

        res.json({ message: "Plan Deleted" });

    } catch (err) {
        res.status(500).json({ message: "Error Deleting Plan", error: err.message });
    }
};

// ======================================================================
// --------------------------- COPY DAILY PLAN ---------------------------
// ======================================================================
exports.copyDailyPlan = async (req, res) => {
    try {
        const { fromDate, toDates, range } = req.body;
        const userId = req.user._id;

        const from = await DailyPlan.findOne({ userId, date: fromDate });
        if (!from) return res.status(404).json({ message: "Source Day Not Found" });

        let targetDays = [];

        if (Array.isArray(toDates) && toDates.length > 0) {
            targetDays.push(...toDates);
        }

        if (range?.start && range?.end) {
            let current = new Date(range.start);
            const end = new Date(range.end);

            while (current <= end) {
                targetDays.push(current.toISOString().split("T")[0]);
                current.setDate(current.getDate() + 1);
            }
        }

        if (targetDays.length === 0) {
            return res.status(400).json({ message: "No valid target dates provided" });
        }

        targetDays = [...new Set(targetDays)].filter(d => d !== fromDate);

        if (targetDays.length === 0) {
            return res.status(400).json({ message: "Cannot copy to the same day" });
        }

        const clonedPlans = JSON.parse(JSON.stringify(from.dailyPlan));

        for (const date of targetDays) {
            let to = await DailyPlan.findOne({ userId, date });

            if (!to) {
                to = await DailyPlan.create({
                    userId,
                    date,
                    dailyPlan: []
                });
            }

            to.dailyPlan = clonedPlans;
            to.updatedAt = new Date();
            await to.save();
        }

        res.json({
            message: "Copied successfully to multiple days",
            copiedTo: targetDays
        });

    } catch (err) {
        res.status(500).json({
            message: "Error Copying Day",
            error: err.message
        });
    }
};

// ======================================================================
// --------------------------- MARK DAY COMPLETE (TOGGLE) ---------------
// ======================================================================
exports.markDayComplete = async (req, res) => {
    try {
        const { date } = req.body;
        const userId = req.user._id;

        const today = new Date();
        const target = new Date(date);

        const clean = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

        const todayClean = clean(today);
        const targetClean = clean(target);

        const isToday = todayClean.getTime() === targetClean.getTime();

        // --------------------- ONLY TODAY CAN BE MARKED/UNMARKED ---------------------
        if (!isToday) {
            return res.status(400).json({
                message: "Only today's day can be marked or unmarked."
            });
        }

        // Fetch daily plan document
        const doc = await DailyPlan.findOne({ userId, date });
        if (!doc) return res.status(404).json({ message: "Day Not Found" });

        // Fetch user stats
        const user = await User.findById(userId);
        let { dailyStreak, longestStreak } = user.stats;

        // --------------------- CASE A: Already Completed → UNDO ---------------------
        if (doc.status === "completed") {

            doc.status = "pending";
            doc.updatedAt = new Date();
            await doc.save();

            dailyStreak = Math.max(0, dailyStreak - 1);

            await User.findByIdAndUpdate(userId, {
                $set: { "stats.dailyStreak": dailyStreak }
            });

            return res.json({
                message: "Day Completion Undone",
                dailyStreak
            });
        }

        // --------------------- CASE B: Mark as Completed ---------------------
        doc.status = "completed";
        doc.updatedAt = new Date();
        await doc.save();

        dailyStreak += 1;
        if (dailyStreak > longestStreak) longestStreak = dailyStreak;

        await User.findByIdAndUpdate(userId, {
            $inc: { "stats.totalDailyPlanCompleted": 1 },
            $set: {
                "stats.dailyStreak": dailyStreak,
                "stats.longestStreak": longestStreak
            }
        });

        return res.json({
            message: "Day Marked as Completed",
            dailyStreak,
            longestStreak
        });

    } catch (err) {
        res.status(500).json({
            message: "Error Completing Day",
            error: err.message
        });
    }
};