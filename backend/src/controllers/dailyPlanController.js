const DailyPlan = require("../models/dailyPlanModel.js");
const PlanHistory = require("../models/planHistoryModel.js");
const Task = require("../models/taskModel.js");
const Memo = require("../models/memoModel.js");
const {
    validCategories,
    isValidTimeFormat,
    timeToMinutes,
    minutesToTime,
    splitOverMidnight,
    overwriteExistingPlans,
    getNextDay
} = require("../utils/helpers.js");

// --------------------------- CREATE PLAN FOR A GIVEN DATE ---------------------------
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

        // ---------- VALIDATIONS ---------
        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            return res.status(400).json({ message: "Invalid Time Format. Use HH:mm " });
        }

        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid Category" });
        }

        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);

        // Split into chunks (1 or 2)
        const chunks = splitOverMidnight(startMin, endMin);

        // ------------------ PROCESS EVERY CHUNK ------------------
        for (const chunk of chunks) {
            const chunkDate = chunk.isNextDay ? getNextDay(date) : date;

            // Step A: Find or create document for this day
            let doc = await DailyPlan.findOne({ userId, date: chunkDate });
            if (!doc) {
                doc = await DailyPlan.create({
                    userId,
                    date: chunkDate,
                    dailyPlan: []
                });
            }

            // Step B: Overwrite overlaps on chunkDate before inserting new block
            doc.dailyPlan = overwriteExistingPlans(
                doc.dailyPlan,
                chunk.start,
                chunk.end
            );

            // Step C: Prepare new plan object
            const newPlan = {
                title,
                description,
                startTime: minutesToTime(chunk.start),
                endTime: minutesToTime(chunk.end),
                duration: chunk.end - chunk.start,
                category,
                containerColor
            };

            // Step D: Insert order rule:
            //   - first chunk of original day → append (push)
            //   - second chunk of next day → prepend (unshift)
            if (chunk.isNextDay) {
                doc.dailyPlan.unshift(newPlan); // first item of next day
            } else {
                doc.dailyPlan.push(newPlan);    // last item of current day
            }

            await doc.save();
        }

        // Save To PlanHistory
        await PlanHistory.create({
            userId,
            title,
            description,
            startTime,
            endTime,
            category,
            containerColor
        });

        // add and sync task logic
        if (addToTask) {
            await Task.create({
                userId,
                title,
                description,
                deadline: date,            // match daily plan date
                category,
                containerColor
            });
        }

        // add and sync memo logic
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

// --------------------------- GET DAILY PLAN (SORTED) ---------------------------
exports.getDailyPlan = async (req, res) => {
    try {
        const { date } = req.params;
        const userId = req.user._id;

        const doc = await DailyPlan.findOne({ userId, date });

        if (!doc) {
            return res.status(200).json({ dailyPlan: [], message: "No Plans Yet" });
        }

        // Sort by startTime (converted to minutes)
        const sorted = doc.dailyPlan.sort((a, b) =>
            timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        );

        return res.status(200).json({ dailyPlan: sorted });

    } catch (err) {
        return res.status(500).json({ message: "Error Fetching Plans", error: err.message });
    }
};

// --------------------------- EDIT DAILY PLAN (SPLIT CHUNKS + OVERWRITE) ---------------------------
exports.editDailyPlan = async (req, res) => {
    try {
        const { date, planId } = req.params;   // YYYY-MM-DD
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

        // --------------------------- VALIDATION ---------------------------
        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            return res.status(400).json({ message: "Invalid Time Format. Use HH:mm" });
        }
        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: "Invalid Category" });
        }

        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);
        const newChunks = splitOverMidnight(startMin, endMin); // Break the NEW times into daily chunks

        // --------------------------- STEP 1: FETCH THE CURRENT DAY DOCUMENT ---------------------------
        let currentDoc = await DailyPlan.findOne({ userId, date });
        if (!currentDoc) return res.status(404).json({ message: "Day not found" });

        const oldPlan = currentDoc.dailyPlan.id(planId);
        if (!oldPlan) return res.status(404).json({ message: "Plan not found" });

        // Keep linked references
        const linkedTaskId = oldPlan.linkedTaskId || null;
        const linkedMemoId = oldPlan.linkedMemoId || null;

        // --------------------------- STEP 2: REMOVE ONLY THE OLD PLAN FROM THIS DAY ---------------------------
        currentDoc.dailyPlan = currentDoc.dailyPlan.filter(p => p._id.toString() !== planId);
        await currentDoc.save();

        // --------------------------- STEP 3: INSERT UPDATED CHUNKS ---------------------------
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

            // remove overlaps
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

        // ---------- SYNC TASK ----------
        if (addToTask && linkedTaskId) {
            await Task.findByIdAndUpdate(linkedTaskId, {
                title,
                description,
                category,
                containerColor
            });
        }

        // ---------- SYNC MEMO ----------
        if (addToMemo && linkedMemoId) {
            await Memo.findByIdAndUpdate(linkedMemoId, {
                title,
                content: description,
                category,
                containerColor
            });
        }

        // ---------- HISTORY ----------
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


// --------------------------- DRAG AND DROP UPDATE (POSITION AND TIME CHANGE) ---------------------------
exports.updatePlanTime = async (req, res) => {
    try {
        const { date, planId } = req.params;
        const { startTime, endTime } = req.body;
        const userId = req.user._id;

        // ---------- VALIDATION ----------
        if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
            return res.status(400).json({ message: "Invalid Time Format" });
        }

        const startMin = timeToMinutes(startTime);
        const endMin = timeToMinutes(endTime);
        const newChunks = splitOverMidnight(startMin, endMin);


        // ---------- FETCH CURRENT DAY ----------
        let currentDoc = await DailyPlan.findOne({ userId, date });
        if (!currentDoc) return res.status(404).json({ message: "Day Not Found" });

        const oldPlan = currentDoc.dailyPlan.id(planId);
        if (!oldPlan) return res.status(404).json({ message: "Plan Not Found" });

        // Preserve linked items
        const linkedTaskId = oldPlan.linkedTaskId || null;
        const linkedMemoId = oldPlan.linkedMemoId || null;

        // Remove from today's doc only
        currentDoc.dailyPlan = currentDoc.dailyPlan.filter(p => p._id.toString() !== planId);
        await currentDoc.save();


        // ---------- INSERT NEW CHUNKS ----------
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

            // Remove overlaps
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

// --------------------------- DELETE A SINGLE PLAN (ONLY THIS DAY) ---------------------------
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

// --------------------------- COPY A WHOLE DAILYPLAN OF THE DAY TO ANOTHER DAY ---------------------------
exports.copyDailyPlan = async (req, res) => {
    try {
        const { fromDate, toDates, range } = req.body;
        const userId = req.user._id;

        // ------------------------------------------------------------------
        // 1) Validate source day
        // ------------------------------------------------------------------
        const from = await DailyPlan.findOne({ userId, date: fromDate });
        if (!from) return res.status(404).json({ message: "Source Day Not Found" });

        // ------------------------------------------------------------------
        // 2) Build full list of target dates
        // ------------------------------------------------------------------
        let targetDays = [];

        // Option A: direct array
        if (Array.isArray(toDates) && toDates.length > 0) {
            targetDays.push(...toDates);
        }

        // Option B: date range
        if (range?.start && range?.end) {
            let current = new Date(range.start);
            const end = new Date(range.end);

            while (current <= end) {
                targetDays.push(current.toISOString().split("T")[0]);
                current.setDate(current.getDate() + 1);
            }
        }

        // If no targets at all
        if (targetDays.length === 0) {
            return res.status(400).json({
                message: "No valid target dates provided"
            });
        }

        // Remove duplicates
        targetDays = [...new Set(targetDays)];

        // Prevent copying into the same day
        targetDays = targetDays.filter(d => d !== fromDate);

        if (targetDays.length === 0) {
            return res.status(400).json({
                message: "Cannot copy to the same day"
            });
        }

        // ------------------------------------------------------------------
        // 3) Perform copy for each day
        // ------------------------------------------------------------------
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

            // overwrite day
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

// --------------------------- MARK DAY AS COMPLETE ---------------------------
exports.markDayComplete = async (req, res) => {
    try {
        const { date } = req.body;
        const userId = req.user._id;

        const doc = await DailyPlan.findOne({ userId, date });
        if (!doc) return res.status(404).json({ message: "Day Not Found" });

        doc.isCompleted = true;
        doc.updatedAt = new Date();

        await doc.save();

        res.json({ message: "Day Marked as Completed" });

    } catch (err) {
        res.status(500).json({ message: "Error Completing Day", error: err.message });
    }
};

