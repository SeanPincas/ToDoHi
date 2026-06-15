// ============================================================================
// File Name: repeatReview.ts
// Purpose:
// - Provides frontend helpers for repeat-review and failed-yesterday data.
// - Bridges backend review/archive endpoints into lightweight UI payloads.
// ============================================================================

import {
    getRepeatReviewApi,
    getTaskArchiveApi,
    type Task,
    type TaskArchiveEntry,
} from "../api/taskApi";

export type YesterdayPreviewStatus = "hide" | "all" | "completed" | "failed";
export const REPEAT_REVIEW_REFRESH_EVENT = "todohi:repeat-review-refresh";

export interface FailedYesterdayItem {
    _id: string;
    title: string;
    category: string;
    containerColor: string;
    status: "failed";
}

export interface YesterdayPreviewTask extends Task {
    previewOrigin: "yesterday";
    previewSource: "review" | "archive";
}

const mapTaskToFailedYesterdayItem = (task: Task): FailedYesterdayItem => ({
    _id: task._id,
    title: task.title,
    category: String(task.category),
    containerColor: task.containerColor,
    status: "failed",
});

const mapArchiveEntryToFailedYesterdayItem = (entry: TaskArchiveEntry): FailedYesterdayItem => ({
    _id: entry._id,
    title: entry.title,
    category: String(entry.category),
    containerColor: entry.containerColor,
    status: "failed",
});

export const getFailedTasksYesterdayPreview = async (): Promise<FailedYesterdayItem[]> => {
    const review = await getRepeatReviewApi();

    const liveFailedTasks = review.tasks
        .filter((task) => task.status === "failed")
        .map(mapTaskToFailedYesterdayItem);

    if (liveFailedTasks.length > 0) {
        return liveFailedTasks;
    }

    const archive = await getTaskArchiveApi({
        archiveType: "failed",
        cycleKey: review.cycleKey,
        limit: 50,
    });

    return archive.entries.map(mapArchiveEntryToFailedYesterdayItem);
};

const mapTaskToYesterdayPreviewTask = (task: Task): YesterdayPreviewTask => ({
    ...task,
    previewOrigin: "yesterday",
    previewSource: "review",
});

const mapArchiveEntryToYesterdayPreviewTask = (entry: TaskArchiveEntry): YesterdayPreviewTask => ({
    _id: entry._id,
    userId: entry.userId,
    title: entry.title,
    description: entry.description ?? "",
    category: entry.category,
    status: entry.archiveType,
    completedAt: entry.completedAt ?? null,
    failedAt: entry.failedAt ?? null,
    createdAt: entry.createdAt,
    updatedAt: entry.archivedAt,
    deadline: entry.deadline ?? null,
    orderIndex: entry.orderIndex ?? 0,
    isExpired: entry.isExpired,
    memoId: entry.memoId ?? null,
    containerColor: entry.containerColor,
    previewOrigin: "yesterday",
    previewSource: "archive",
});

export const getYesterdayTasksPreview = async (
    filter: YesterdayPreviewStatus = "all"
): Promise<YesterdayPreviewTask[]> => {
    if (filter === "hide") {
        return [];
    }

    const review = await getRepeatReviewApi();

    const matchesFilter = (status: string) =>
        filter === "all" ? status === "completed" || status === "failed" : status === filter;

    const liveYesterdayTasks = review.tasks
        .filter((task) => matchesFilter(task.status))
        .map(mapTaskToYesterdayPreviewTask);

    if (liveYesterdayTasks.length > 0) {
        return liveYesterdayTasks;
    }

    const archive = await getTaskArchiveApi({
        archiveType: filter === "all" ? "all" : filter,
        cycleKey: review.cycleKey,
        limit: 50,
    });

    return archive.entries
        .filter((entry) => matchesFilter(entry.archiveType))
        .map(mapArchiveEntryToYesterdayPreviewTask);
};
