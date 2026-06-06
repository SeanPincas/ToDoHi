const TaskArchive = require("../models/taskArchiveModel");
const { archiveTypeList, archiveReasonList } = require("./taskArchiveConstants");

const DEFAULT_ARCHIVE_LIMIT = 50;
const MAX_ARCHIVE_LIMIT = 200;

function normalizeArchiveTypeFilter(value) {
    if (!value || value === "all") return null;
    return archiveTypeList.includes(value) ? value : null;
}

function normalizeArchiveReasonFilter(value) {
    if (!value || value === "all") return null;
    return archiveReasonList.includes(value) ? value : null;
}

function normalizeArchiveLimit(value) {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed) || parsed <= 0) {
        return DEFAULT_ARCHIVE_LIMIT;
    }

    return Math.min(parsed, MAX_ARCHIVE_LIMIT);
}

function buildTaskArchiveQuery({ userId, archiveType, archiveReason, cycleKey }) {
    const query = { userId };

    const normalizedType = normalizeArchiveTypeFilter(archiveType);
    const normalizedReason = normalizeArchiveReasonFilter(archiveReason);

    if (normalizedType) {
        query.archiveType = normalizedType;
    }

    if (normalizedReason) {
        query.archiveReason = normalizedReason;
    }

    if (cycleKey) {
        query.sourceCycleKey = cycleKey;
    }

    return query;
}

async function getTaskArchiveEntriesForUser({
    userId,
    archiveType = "failed",
    archiveReason,
    cycleKey,
    limit
}) {
    const normalizedLimit = normalizeArchiveLimit(limit);
    const query = buildTaskArchiveQuery({
        userId,
        archiveType,
        archiveReason,
        cycleKey
    });

    const entries = await TaskArchive.find(query)
        .sort({ archivedAt: -1, createdAt: -1, orderIndex: 1 })
        .limit(normalizedLimit);

    const totalCount = await TaskArchive.countDocuments(query);

    return {
        filters: {
            archiveType: normalizeArchiveTypeFilter(archiveType) ?? "all",
            archiveReason: normalizeArchiveReasonFilter(archiveReason) ?? "all",
            cycleKey: cycleKey ?? null,
            limit: normalizedLimit
        },
        totalCount,
        entries
    };
}

module.exports = {
    DEFAULT_ARCHIVE_LIMIT,
    MAX_ARCHIVE_LIMIT,
    normalizeArchiveTypeFilter,
    normalizeArchiveReasonFilter,
    normalizeArchiveLimit,
    buildTaskArchiveQuery,
    getTaskArchiveEntriesForUser
};
