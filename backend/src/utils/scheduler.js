const cron = require("node-cron");
const Task = require("../models/taskModel.js");
const { runDailyStats } = require("./dailyStats.js");

// --------------------------- EXPIRE TASKS (Every 5 mins) ---------------------------
// Marks overdue tasks as failed
async function markExpiredTasksNow() {
    try {
        const now = new Date();

        const res = await Task.updateMany(
            {
                status: { $in: ["pending"] },
                deadline: { $exists: true, $ne: null, $lte: now }
            },
            {
                $set: { status: "failed", isExpired: true }
            }
        );

        console.log(
            `[Scheduler] Expired Tasks Check @ ${now.toISOString()} — updated: ${
                res.modifiedCount ?? res.nModified
            }`
        );

        return res;
    } catch (err) {
        console.error("[Scheduler] Error in markExpiredTasksNow:", err);
    }
}

// --------------------------- START SCHEDULER ---------------------------
// Handles background jobs (task expiry + daily stats)
function startScheduler(options = {}) {
    const {
        enabled = true,

        // Task Expiration → Runs every 5 minutes
        expireSchedule = "*/5 * * * *",

        // Daily Stats → Runs exactly at 00:00 (Midnight)
        statsSchedule = "0 0 * * *"
    } = options;

    if (!enabled) {
        console.log("[Scheduler] Disabled.");
        return null;
    }

    console.log("[Scheduler] Starting Background Jobs...");

    // --------------------------- RUN EXPIRY ON SERVER START ---------------------------
    markExpiredTasksNow();

    // ❌ Do not run runDailyStats() on startup — incorrect streak logic
    // runDailyStats();   <-- removed

    // --------------------------- JOB #1: EXPIRE OLD TASKS ---------------------------
    cron.schedule(
        expireSchedule,
        async () => {
            try {
                await markExpiredTasksNow();
            } catch (err) {
                console.error("[Scheduler] Error running expire job:", err);
            }
        },
        {
            scheduled: true,
            timezone: "Asia/Manila" // <-- correct for PH
        }
    );

    console.log(`[Scheduler] Expire Job Running (${expireSchedule})`);

    // --------------------------- JOB #2: DAILY STATS (MIDNIGHT) ---------------------------
    cron.schedule(
        statsSchedule,
        async () => {
            try {
                console.log("[Scheduler] Running Daily Stats...");
                await runDailyStats();
            } catch (err) {
                console.error("[Scheduler] Error running daily stats:", err);
            }
        },
        {
            scheduled: true,
            timezone: "Asia/Manila" // <-- correct timezone
        }
    );

    console.log(`[Scheduler] Daily Stats Running (${statsSchedule})`);
}

// --------------------------- MANUAL TRIGGER ---------------------------
// Useful for debugging
async function manualTrigger() {
    await markExpiredTasksNow();
    await runDailyStats();
}

// --------------------------- EXPORTS ---------------------------
module.exports = {
    startScheduler,
    manualTrigger
};
