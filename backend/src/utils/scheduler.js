const cron = require("node-cron");
const Task = require("../models/taskModel.js");
const User = require("../models/userModel.js");
const { runDailyStats } = require("./dailyStats.js");

// ============================================================================
// INTERNAL STATE (in-memory)
// Tracks last reset cycle PER USER
// NOTE: Resets on server restart — acceptable for now
// ============================================================================
const lastResetKeys = new Map();

// ============================================================================
// HELPER: Compute reset-cycle key for a user
//
// Example outputs:
//   "2025-01-15@9"
//   "2025-01-15@0"
//
// Meaning:
//   This uniquely identifies ONE reset window for ONE user
// ============================================================================
function getResetCycleKey(now, resetHour) {
    const boundary = new Date(now);
    boundary.setHours(resetHour, 0, 0, 0);

    // If resetHour not reached yet today → cycle started yesterday
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
        `[Scheduler] Task Expiry @ ${now.toISOString()} | Updated: ${res.modifiedCount ?? res.nModified
        }`
    );
}

// ============================================================================
// JOB #2: PER-USER DAILY RESET
// - Detects reset boundary crossing per user
// - Runs dailyStats ONLY once per cycle per user
// ============================================================================
async function handleDailyReset(now) {
    const users = await User.find({}, "_id preference.resetHour");

    for (const user of users) {
        const userId = user._id.toString();
        const resetHour = user.preference?.resetHour ?? 0;

        const currentResetKey = getResetCycleKey(now, resetHour);
        const lastKey = lastResetKeys.get(userId);

        // Already reset for this cycle → skip
        if (lastKey === currentResetKey) continue;

        console.log(
            `[Scheduler] Reset detected for user ${userId} → ${currentResetKey}`
        );

        // Run daily stats (already per-user internally)
        await runDailyStats();

        // Failed Tasks Snapshot Logic
        const failedTasks = await Task.find(
            {
                userId: user._id,
                status: "failed"
            },
            "title status" // projection: only fields we care about
        );

        if (failedTasks.length === 0) {
            // If no failed tasks: remove snapshot / "undefined"
            await User.findByIdAndUpdate(user._id, {
                $unset: { failedTaskSnapshot: "" }
            });

            console.log(
                `[Scheduler] No Failed Tasks for user ${userId} → snapshot cleared`
            );

        } else {
            // Failed Tasks found: get Title, Status
            const snapshotTasks = failedTasks.map(task => ({
                _id: task._id,
                title: task.title,
                status: task.status
            }));

            await User.findByIdAndUpdate(user._id, {
                failedTaskSnapshot: {
                    resetAt: now,
                    tasks: snapshotTasks
                }
            });

            console.log(
                `[Scheduler] Failed task snapshot created for user ${userId} | Count: ${snapshotTasks.length}`
            );
        }

        // Mark this reset cycle as processed for this user
        lastResetKeys.set(userId, currentResetKey);
    }
}

// ============================================================================
// MAIN SCHEDULER TICK
// ============================================================================
async function schedulerTick() {
    try {
        const now = new Date();

        // 1️⃣ Expire overdue tasks
        await expireTasks(now);

        // 2️⃣ Handle per-user daily reset
        await handleDailyReset(now);

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
        schedule = "*/5 * * * *" // every 5 minutes
    } = options;

    if (!enabled) {
        console.log("[Scheduler] Disabled.");
        return;
    }

    console.log("[Scheduler] Starting unified per-user scheduler...");

    // Run immediately on server start
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

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
    startScheduler
};
