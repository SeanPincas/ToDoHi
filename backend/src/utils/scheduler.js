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
const { computeRepeatCycleKey } = require("./resetCycle.js");
const { archiveExpiredReviewWindowTasks } = require("./taskArchiveSync.js");

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
            $set: { status: "failed", isExpired: true, failedAt: now, completedAt: null }
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

        const currentResetKey = computeRepeatCycleKey(resetHour, now);
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
// JOB #4: ARCHIVE STALE REVIEW-WINDOW TASKS
// Rule:
//   - status === "completed" or "failed"
//   - task event time is older than the active "yesterday" review window
// ============================================================================
async function syncTaskArchives(now) {
    const { archivedCount } = await archiveExpiredReviewWindowTasks(now);

    console.log(
        `[Scheduler] Task Archive Sync @ ${now.toISOString()} | Archived: ${archivedCount}`
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

        // 3. Move stale completed/failed live tasks into archive
        await syncTaskArchives(now);

        // 4. Clean expired task archives
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
