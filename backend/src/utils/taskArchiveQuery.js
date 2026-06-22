// ============================================================================
// File Name: taskArchiveQuery.js
// Purpose:
// - Provides filtered retrieval logic for TaskArchive entries.
// - Normalizes archive filters and limit controls for archive APIs.
// ============================================================================

const TaskArchive = require("../models/taskArchiveModel");
const { archiveTypeList, archiveReasonList } = require("./taskArchiveConstants");
const User = require("../models/userModel");
const { syncPreviousCycleTasksToArchiveForUser } = require("./taskArchiveSync");

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
    } else {
        query.repeatedAt = null;
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
    const user = await User.findById(userId, "preference.resetHour preference.dayTaskDelete");
    const resetHour = user?.preference?.resetHour ?? 0;

    await syncPreviousCycleTasksToArchiveForUser({
        userId,
        resetHour,
        userPreference: user?.preference ?? null
    });

    const query = buildTaskArchiveQuery({
        userId,
        archiveType,
        archiveReason,
        cycleKey
    });

    const archivedEntries = await TaskArchive.find(query)
        .sort({ archivedAt: -1, createdAt: -1, orderIndex: 1 })
        .limit(normalizedLimit);

    const totalArchivedCount = await TaskArchive.countDocuments(query);

    return {
        filters: {
            archiveType: normalizeArchiveTypeFilter(archiveType) ?? "all",
            archiveReason: normalizeArchiveReasonFilter(archiveReason) ?? "all",
            cycleKey: cycleKey ?? null,
            limit: normalizedLimit
        },
        totalCount: totalArchivedCount,
        entries: archivedEntries.map((entry) => ({
            ...entry.toObject(),
            source: "archive"
        }))
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
