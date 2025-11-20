// src/utils/scheduler.js
const cron = require('node-cron');                // Cron job scheduler
const Task = require('../models/taskModel.js');   // Your Task Mongoose model

/**
 * markExpiredTasksNow
 * - Checks all tasks whose deadline has passed and marks them as 'failed'
 * - Only affects tasks that are still 'pending' or 'in-progress'
 */
async function markExpiredTasksNow() {
    try {
        const now = new Date();

        // Update all tasks that are past deadline and not completed/failed
        const res = await Task.updateMany(
            {
                status: { $in: ['pending', 'in-progress'] },
                deadline: { $exists: true, $ne: null, $lte: now }
            },
            {
                $set: { status: 'failed', isExpired: true }
            }
        );

        // Log how many tasks were updated
        console.log(
            `[Scheduler] markExpiredTasksNow: checked at ${now.toISOString()} — modified: ${res.modifiedCount ?? res.nModified}`
        );

        return res;
    } catch (err) {
        console.error('[Scheduler] markExpiredTasksNow error:', err);
        throw err;
    }
}

function startScheduler(options = {}) {
    const { enabled = true, schedule = '*/5 * * * *' } = options;

    if (!enabled) {
        console.log('[Scheduler] Disabled by configuration.');
        return null;
    }

    console.log(`[Scheduler] Starting cron job (schedule="${schedule}")`);

    // Debug: Check if Task model is loaded correctly
    console.log('Task object:', Task);
    console.log('Task.updateMany:', Task.updateMany);

    // Run immediately once at startup
    markExpiredTasksNow().catch((e) => {
        console.error('[Scheduler] Initial run failed:', e);
    });

    // Schedule cron job
    const job = cron.schedule(
        schedule,
        async () => {
            try {
                await markExpiredTasksNow();
            } catch (err) {
                console.error('[Scheduler] Cron job error:', err);
            }
        },
        {
            scheduled: true,
            timezone: 'UTC', // Use UTC for consistent deadline checks
        }
    );

    return job;
}

/**
 * manualTrigger
 * - Exported helper to manually trigger task expiration check
 */
async function manualTrigger() {
    return await markExpiredTasksNow();
}

// CommonJS exports
module.exports = {
    startScheduler,
    manualTrigger,
};
