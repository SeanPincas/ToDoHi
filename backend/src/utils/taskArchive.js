// ============================================================================
// File Name: taskArchive.js
// Purpose:
// - Builds and writes TaskArchive records from live Task documents.
// - Applies retention-day rules at archive time.
// - Keeps archive records self-sufficient after live tasks are removed.
// ============================================================================

const TaskArchive = require("../models/taskArchiveModel");
const { archiveTypeList, archiveReasonList } = require("./taskArchiveConstants");

const ALLOWED_RETENTION_DAYS = [3, 7, 15, 30];
const DEFAULT_RETENTION_DAYS = 30;

function normalizeArchiveRetentionDays(retentionDays) {
    const numericValue = Number(retentionDays);
    return ALLOWED_RETENTION_DAYS.includes(numericValue)
        ? numericValue
        : DEFAULT_RETENTION_DAYS;
}

function buildRetentionDeleteAt(archivedAt, retentionDays) {
    const retentionDeleteAt = new Date(archivedAt);
    retentionDeleteAt.setDate(retentionDeleteAt.getDate() + retentionDays);
    return retentionDeleteAt;
}

function buildArchiveRecord(task, options = {}) {
    if (!task) {
        throw new Error("A task document is required to build an archive record.");
    }

    const {
        archiveType,
        archiveReason,
        sourceCycleKey = null,
        repeatedIntoTaskId = null,
        archivedAt = new Date(),
        retentionDays,
        userPreference = null
    } = options;

    if (!archiveTypeList.includes(archiveType)) {
        throw new Error(`Invalid archiveType: ${archiveType}`);
    }

    if (!archiveReasonList.includes(archiveReason)) {
        throw new Error(`Invalid archiveReason: ${archiveReason}`);
    }

    const resolvedArchivedAt = new Date(archivedAt);
    const resolvedRetentionDays = normalizeArchiveRetentionDays(
        retentionDays ?? userPreference?.dayTaskDelete
    );
    // Retention is fixed at archive time.
    // Later preference changes should affect only newly archived tasks,
    // not retroactively rewrite older TaskArchive countdowns.

    return {
        userId: task.userId,
        originalTaskId: task._id,
        title: task.title,
        description: task.description ?? "",
        category: task.category ?? "others",
        status: task.status,
        completedAt: task.completedAt ?? null,
        failedAt: task.failedAt ?? null,
        createdAt: task.createdAt ?? new Date(),
        deadline: task.deadline ?? null,
        orderIndex: task.orderIndex ?? 0,
        isExpired: Boolean(task.isExpired),
        memoId: task.memoId ?? null,
        containerColor: task.containerColor ?? "#ffffff",
        archivedAt: resolvedArchivedAt,
        archiveType,
        archiveReason,
        sourceCycleKey,
        repeatedIntoTaskId,
        retentionDeleteAt: buildRetentionDeleteAt(resolvedArchivedAt, resolvedRetentionDays)
    };
}

async function archiveTask(task, options = {}) {
    const archiveRecord = buildArchiveRecord(task, options);
    return TaskArchive.create(archiveRecord);
}

async function archiveTasks(tasks, options = {}) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
        return [];
    }

    const sharedArchivedAt = options.archivedAt ?? new Date();
    const archiveRecords = tasks.map(task =>
        buildArchiveRecord(task, { ...options, archivedAt: sharedArchivedAt })
    );

    return TaskArchive.insertMany(archiveRecords);
}

module.exports = {
    ALLOWED_RETENTION_DAYS,
    DEFAULT_RETENTION_DAYS,
    normalizeArchiveRetentionDays,
    buildRetentionDeleteAt,
    buildArchiveRecord,
    archiveTask,
    archiveTasks
};
