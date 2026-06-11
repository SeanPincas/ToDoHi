// ============================================================================
// File Name: scheduler.js
// Purpose:
// - Orchestrates scheduled backend jobs.
// - Owns task expiry, per-user reset-cycle handling, and archive cleanup.
// - Should coordinate time-based jobs, not become the single home of every
//   date utility used elsewhere in the repeat/archive domain.
// ============================================================================

const cron = require("node-cron");
const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");
const { runDailyStats } = require("./dailyStats.js");
const { cleanupExpiredTaskArchives } = require("./taskArchiveCleanup.js");

// ============================================================================
// HELPER: Compute reset-cycle key for a user
//
// Example outputs:
//   "2025-01-15@9"
//   "2025-01-15@0"
//
// Meaning:
//   This uniquely identifies ONE reset window for ONE user
//
// Improvement note:
//   This reset-cycle math is also mirrored in repeatTasks.js and frontend
//   resetCycle helpers. A shared reset-cycle utility would be cleaner later.
// ============================================================================
function getResetCycleKey(now, resetHour) {
    const boundary = new Date(now);
    boundary.setHours(resetHour, 0, 0, 0);

    // If resetHour not reached yet today -> cycle started yesterday
    if (now < boundary) {
        boundary.setDate(boundary.getDate() - 1);
    }

    const yyyy = boundary.getFullYear();
    const mm = String(boundary.getMonth() + 1).padStart(2, "0");
    const dd = String(boundary.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}@${resetHour}`;
}

// ============================================================================
// JOB #1: EXPIRE TASKS
// Rule:
//   - status === "pending"
//   - deadline exists
//   - deadline <= now
// ============================================================================
async function expireTasks(now) {
    const res = await Task.updateMany(
        {
            status: "pending",
            deadline: { $exists: true, $ne: null, $lte: now }
        },
        {
            $set: { status: "failed", isExpired: true }
        }
    );

    console.log(
        `[Scheduler] Task Expiry @ ${now.toISOString()} | Updated: ${res.modifiedCount ?? res.nModified}`
    );
}

// ============================================================================
// JOB #2: PER-USER DAILY RESET
// - Detects reset boundary crossing per user
// - Runs dailyStats ONLY once per cycle per user
// ============================================================================
async function handleDailyReset(now) {
    const users = await User.find({}, "_id preference.resetHour lastResetCycleKey");

    for (const user of users) {
        const userId = user._id.toString();
        const resetHour = user.preference?.resetHour ?? 0;

        const currentResetKey = getResetCycleKey(now, resetHour);
        const lastKey = user.lastResetCycleKey ?? null;

        // Already reset for this cycle -> skip
        if (lastKey === currentResetKey) continue;

        console.log(
            `[Scheduler] Reset detected for user ${userId} -> ${currentResetKey}`
        );

        // New reset cycle detected for this user
        await User.findByIdAndUpdate(user._id, {
            lastResetCycleKey: currentResetKey
        });

        // Run daily stats (already per-user internally)
        await runDailyStats();
    }
}

// ============================================================================
// JOB #3: CLEAN EXPIRED TASK ARCHIVES
// Rule:
//   - retentionDeleteAt exists
//   - retentionDeleteAt <= now
// ============================================================================
async function cleanupTaskArchives(now) {
    const { deletedCount } = await cleanupExpiredTaskArchives(now);

    console.log(
        `[Scheduler] Task Archive Cleanup @ ${now.toISOString()} | Deleted: ${deletedCount}`
    );
}

// ============================================================================
// MAIN SCHEDULER TICK
// ============================================================================
async function schedulerTick() {
    try {
        const now = new Date();

        // 1. Expire overdue tasks
        await expireTasks(now);

        // 2. Handle per-user daily reset
        await handleDailyReset(now);

        // 3. Clean expired task archives
        await cleanupTaskArchives(now);

    } catch (err) {
        console.error("[Scheduler] Error:", err);
    }
}

// ============================================================================
// START SCHEDULER
// ============================================================================
function startScheduler(options = {}) {
    const {
        enabled = true,
        schedule = "*/5 * * * *"
    } = options;

    if (!enabled) {
        console.log("[Scheduler] Disabled.");
        return;
    }

    console.log("[Scheduler] Starting unified per-user scheduler...");

    schedulerTick();

    cron.schedule(
        schedule,
        schedulerTick,
        {
            scheduled: true,
            timezone: "Asia/Manila"
        }
    );

    console.log(`[Scheduler] Running every ${schedule}`);
}

module.exports = {
    startScheduler,
    schedulerTick
};
