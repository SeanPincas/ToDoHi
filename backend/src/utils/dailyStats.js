// ============================================================================
// File Name: dailyStats.js
// Purpose:
// - Computes backend reset-hour-based stats and streak values.
// - Called by the scheduler at each detected reset cycle.
// - Uses the shared reset-cycle utility so stats follow the same timezone-aware
//   boundary rules as repeat review and repeated-task deadlines.
// ============================================================================

const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");
const DailyPlan = require("../models/dailyPlanModel.js");
const { getCycleWindow } = require("./resetCycle.js");
const { reconcileUserCompletedTaskStat } = require("./completedTaskStats.js");
const { reconcileUserFailedTasksYesterdayStat } = require("./failedTaskYesterdayStats.js");

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
            const {
                currentCycleStart: start,
                nextCycleStart: end,
                previousCycleStart: yesterdayStart
            } = getCycleWindow(resetHour, new Date());

            const tasksCompletedToday = await Task.countDocuments({
                userId,
                status: "completed",
                updatedAt: { $gte: start, $lt: end }
            });

            const yesterdayDateKey = yesterdayStart.toISOString().split("T")[0];

            const yesterdayPlan = await DailyPlan.findOne({
                userId,
                date: yesterdayDateKey
            });

            let dailyStreak = user.stats.dailyStreak || 0;
            let longestStreak = user.stats.longestStreak || 0;
            const completedTaskStats = await reconcileUserCompletedTaskStat(
                userId,
                resetHour,
                new Date()
            );
            const tasksFailedYesterday = await reconcileUserFailedTasksYesterdayStat(
                userId,
                resetHour,
                new Date()
            );

            if (yesterdayPlan && yesterdayPlan.status === "completed") {
                dailyStreak += 1;
                longestStreak = Math.max(longestStreak, dailyStreak);
            } else {
                dailyStreak = 0;
            }

            await User.findByIdAndUpdate(userId, {
                $set: {
                    "stats.tasksFailedYesterday": tasksFailedYesterday,
                    "stats.totalTasksCompleted":
                        completedTaskStats?.totalTasksCompleted ?? user.stats.totalTasksCompleted ?? 0,
                    "stats.tasksCompletedToday":
                        completedTaskStats?.tasksCompletedToday ?? tasksCompletedToday,
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
