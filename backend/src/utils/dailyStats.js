// ============================================================================
// dailyStats.js
// Computes daily stats based on USER resetHour (NOT calendar midnight)
// Scheduler calls this at each reset cycle
// ============================================================================

const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");
const DailyPlan = require("../models/dailyPlanModel.js");

// ============================================================================
// HELPER: Get reset window for a user
// Returns { start, end, yesterdayStart }
// ============================================================================
function getResetWindow(resetHour) {
    const now = new Date();

    const start = new Date(now);
    start.setHours(resetHour, 0, 0, 0);

    // If resetHour not reached yet today → go back 1 day
    if (now < start) {
        start.setDate(start.getDate() - 1);
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const yesterdayStart = new Date(start);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    return { start, end, yesterdayStart };
}

// ============================================================================
// RUN DAILY STATS (CALLED BY SCHEDULER)
// ============================================================================
exports.runDailyStats = async () => {
    try {
        console.log("[DailyStats] Running resetHour-based stats...");

        const users = await User.find({});
        if (!users.length) {
            console.log("[DailyStats] No users found.");
            return;
        }

        for (const user of users) {
            const userId = user._id;
            const resetHour = user.preference?.resetHour ?? 0;

            const { start, end, yesterdayStart } = getResetWindow(resetHour);

            // ============================================================
            // 1. TASKS COMPLETED THIS RESET CYCLE
            // ============================================================
            const tasksCompletedToday = await Task.countDocuments({
                userId,
                status: "completed",
                updatedAt: { $gte: start, $lt: end }
            });

            // ============================================================
            // 2. DAILY PLAN STREAK LOGIC (RESET-HOUR AWARE)
            // ============================================================
            const yesterdayDateKey = yesterdayStart
                .toISOString()
                .split("T")[0];

            const yesterdayPlan = await DailyPlan.findOne({
                userId,
                date: yesterdayDateKey
            });

            let dailyStreak = user.stats.dailyStreak || 0;
            let longestStreak = user.stats.longestStreak || 0;

            if (yesterdayPlan && yesterdayPlan.status === "completed") {
                dailyStreak += 1;
                longestStreak = Math.max(longestStreak, dailyStreak);
            } else {
                dailyStreak = 0;
            }

            // ============================================================
            // 3. UPDATE USER STATS
            // ============================================================
            await User.findByIdAndUpdate(userId, {
                $set: {
                    "stats.tasksCompletedToday": tasksCompletedToday,
                    "stats.dailyStreak": dailyStreak,
                    "stats.longestStreak": longestStreak
                }
            });
        }

        console.log("[DailyStats] Reset-hour stats completed.");

    } catch (err) {
        console.error("[DailyStats] Error:", err);
    }
};
