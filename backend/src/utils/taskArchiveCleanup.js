// ============================================================================
// File Name: taskArchiveCleanup.js
// Purpose:
// - Deletes expired TaskArchive records whose retention window has ended.
// - Used by the scheduler as the retention cleanup job.
// ============================================================================

const TaskArchive = require("../models/taskArchiveModel");

async function cleanupExpiredTaskArchives(now = new Date()) {
    // Cleanup only follows each archive record's stored retentionDeleteAt.
    // It does not recalculate retention from the user's current preference.
    const result = await TaskArchive.deleteMany({
        retentionDeleteAt: {
            $exists: true,
            $ne: null,
            $lte: now
        }
    });

    return {
        deletedCount: result.deletedCount ?? result.nDeleted ?? 0
    };
}

module.exports = {
    cleanupExpiredTaskArchives
};
