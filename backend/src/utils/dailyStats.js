const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");
const DailyPlan = require("../models/dailyPlanModel.js");

// --------------------------- CLEAN DATE (Normalize to YYYY-MM-DD) ---------------------------
const cleanDate = (d) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

// --------------------------- RUN DAILY STATS (Once per day) ---------------------------
exports.runDailyStats = async () => {
    try {
        const now = new Date();
        const today = cleanDate(now);
        const yesterday = cleanDate(new Date(today.getTime() - 86400000));

        console.log("[DailyStats] Running for:", today.toISOString());

        // ---------------- FETCH ALL USERS -------------------
        const users = await User.find({});
        if (!users || users.length === 0) {
            console.log("[DailyStats] No Users Found.");
            return;
        }

        // ---------------- PROCESS EACH USER -------------------
        for (const user of users) {
            const userId = user._id;

            // ========== 1. TASKS COMPLETED TODAY ==========
            const tasksCompletedToday = await Task.countDocuments({
                userId,
                status: "completed",
                updatedAt: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 86400000)
                }
            });

            // ========== 2. TASKS FAILED YESTERDAY ==========
            const tasksFailedYesterday = await Task.countDocuments({
                userId,
                status: "failed",
                updatedAt: {
                    $gte: yesterday,
                    $lt: today
                }
            });

            // ========== 3. DAILY ROUTINE STREAK LOGIC ==========
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            const yesterdayDoc = await DailyPlan.findOne({
                userId,
                date: yesterdayStr
            });

            let { dailyStreak, longestStreak } = user.stats;

            // CASE A: Yesterday completed → streak increases
            if (yesterdayDoc && yesterdayDoc.status === "completed") {
                dailyStreak += 1;
                if (dailyStreak > longestStreak) {
                    longestStreak = dailyStreak;
                }
            }
            // CASE B: Yesterday NOT completed → streak resets
            else {
                dailyStreak = 0;
            }

            // ========== 4. UPDATE USER STATS ==========
            await User.findByIdAndUpdate(userId, {
                $set: {
                    "stats.tasksCompletedToday": tasksCompletedToday,
                    "stats.tasksFailedYesterday": tasksFailedYesterday,
                    "stats.dailyStreak": dailyStreak,
                    "stats.longestStreak": longestStreak
                }
            });
        }

        console.log("[DailyStats] Completed successfully.");

    } catch (err) {
        console.error("[DailyStats] Error running daily stats:", err);
    }
};