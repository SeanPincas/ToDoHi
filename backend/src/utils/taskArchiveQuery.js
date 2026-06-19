// ============================================================================
// File Name: taskArchiveQuery.js
// Purpose:
// - Provides filtered retrieval logic for TaskArchive entries.
// - Normalizes archive filters and limit controls for archive APIs.
// ============================================================================

const TaskArchive = require("../models/taskArchiveModel");
const { archiveTypeList, archiveReasonList } = require("./taskArchiveConstants");
const { getCycleWindow } = require("./resetCycle");
const { getRepeatableTasksForUser, getTaskCycleEventAt } = require("./repeatReview");

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

function buildProjectedRetentionDeleteAt(cycleWindow, retentionDays = 30) {
    const projectedArchiveAt = new Date(cycleWindow.nextCycleStart);
    const retentionDeleteAt = new Date(projectedArchiveAt);
    retentionDeleteAt.setDate(retentionDeleteAt.getDate() + Number(retentionDays || 30));
    return retentionDeleteAt;
}

function mapLiveReviewTaskToArchiveEntry(task, { cycleWindow, retentionDays }) {
    return {
        _id: task._id,
        userId: task.userId,
        originalTaskId: task._id,
        title: task.title,
        description: task.description ?? "",
        category: task.category ?? "others",
        status: task.status,
        completedAt: task.completedAt ?? null,
        failedAt: task.failedAt ?? null,
        createdAt: task.createdAt,
        deadline: task.deadline ?? null,
        orderIndex: task.orderIndex ?? 0,
        isExpired: Boolean(task.isExpired),
        memoId: task.memoId ?? null,
        containerColor: task.containerColor ?? "#ffffff",
        archivedAt: getTaskCycleEventAt(task) ?? task.createdAt,
        archiveType: task.status,
        archiveReason: "review-pending",
        sourceCycleKey: cycleWindow.currentCycleKey,
        repeatedAt: null,
        repeatedIntoTaskId: null,
        retentionDeleteAt: buildProjectedRetentionDeleteAt(cycleWindow, retentionDays),
        source: "liveReview"
    };
}

async function getTaskArchiveEntriesForUser({
    userId,
    archiveType = "failed",
    archiveReason,
    cycleKey,
    limit,
    resetHour = 0,
    retentionDays = 30
}) {
    const normalizedLimit = normalizeArchiveLimit(limit);
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

    const cycleWindow = getCycleWindow(resetHour, new Date());
    const { tasks: liveReviewTasks } = await getRepeatableTasksForUser({
        userId,
        resetHour,
        limit: normalizedLimit
    });

    const liveEntries = liveReviewTasks.map((task) =>
        mapLiveReviewTaskToArchiveEntry(task, { cycleWindow, retentionDays })
    );

    const normalizedType = normalizeArchiveTypeFilter(archiveType);
    const mergedEntries = [...liveEntries, ...archivedEntries.map((entry) => ({
        ...entry.toObject(),
        source: "archive"
    }))];

    const filteredEntries = normalizedType
        ? mergedEntries.filter((entry) => entry.archiveType === normalizedType)
        : mergedEntries;

    const entries = filteredEntries
        .sort((a, b) => {
            const aTime = new Date(a.archivedAt ?? a.createdAt ?? 0).getTime();
            const bTime = new Date(b.archivedAt ?? b.createdAt ?? 0).getTime();

            if (aTime !== bTime) {
                return bTime - aTime;
            }

            return (a.orderIndex ?? 0) - (b.orderIndex ?? 0);
        })
        .slice(0, normalizedLimit);

    const totalCount = normalizedType
        ? entries.length
        : totalArchivedCount + liveEntries.length;

    return {
        filters: {
            archiveType: normalizedType ?? "all",
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
