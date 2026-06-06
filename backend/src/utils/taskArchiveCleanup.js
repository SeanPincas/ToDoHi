const TaskArchive = require("../models/taskArchiveModel");

async function cleanupExpiredTaskArchives(now = new Date()) {
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
