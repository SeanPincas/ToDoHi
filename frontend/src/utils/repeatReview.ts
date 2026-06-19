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
import { getResetWindow } from "./resetCycle";

export type YesterdayPreviewStatus = "hide" | "all" | "completed" | "failed";
export const REPEAT_REVIEW_REFRESH_EVENT = "todohi:repeat-review-refresh";
export const TASK_REVIEW_MODAL_SNOOZE_KEY = "todohi_task_review_modal_snoozed_until";
export const TASK_REVIEW_HANDLED_CYCLE_KEY = "todohi_task_review_handled_cycle_key";

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

export function getTaskReviewSnoozedUntil(): number {
    const rawValue = localStorage.getItem(TASK_REVIEW_MODAL_SNOOZE_KEY);
    const parsedValue = rawValue ? Number(rawValue) : 0;

    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function clearExpiredTaskReviewSnooze(now = Date.now()) {
    const snoozedUntil = getTaskReviewSnoozedUntil();

    if (snoozedUntil > 0 && snoozedUntil <= now) {
        localStorage.removeItem(TASK_REVIEW_MODAL_SNOOZE_KEY);
    }
}

export function setTaskReviewSnooze(durationMs: number) {
    localStorage.setItem(
        TASK_REVIEW_MODAL_SNOOZE_KEY,
        String(Date.now() + durationMs)
    );
}

export function getHandledTaskReviewCycleKey(): string | null {
    return localStorage.getItem(TASK_REVIEW_HANDLED_CYCLE_KEY);
}

export function markTaskReviewCycleHandled(cycleKey?: string | null) {
    if (!cycleKey) return;
    localStorage.setItem(TASK_REVIEW_HANDLED_CYCLE_KEY, cycleKey);
}

export function isTaskReviewCycleHandled(cycleKey?: string | null): boolean {
    if (!cycleKey) return false;
    return getHandledTaskReviewCycleKey() === cycleKey;
}

function getTaskCycleEventAt(task: Pick<Task, "status" | "completedAt" | "failedAt" | "deadline" | "createdAt">): string | null {
    if (task.status === "completed") {
        return task.completedAt ?? task.createdAt ?? null;
    }

    if (task.status === "failed") {
        return task.deadline
            ?? task.failedAt
            ?? task.createdAt
            ?? null;
    }

    return task.createdAt ?? null;
}

export function isTaskFromPreviousCycle(
    task: Pick<Task, "status" | "completedAt" | "failedAt" | "deadline" | "createdAt">,
    resetHour: number
): boolean {
    if (task.status !== "completed" && task.status !== "failed") {
        return false;
    }

    const eventAtValue = getTaskCycleEventAt(task);

    if (!eventAtValue) {
        return false;
    }

    const eventAt = new Date(eventAtValue);

    if (Number.isNaN(eventAt.getTime())) {
        return false;
    }

    const { start, yesterdayStart } = getResetWindow(resetHour);

    // The reset boundary belongs to the cycle that just ended.
    // This mirrors backend review/archive logic so tasks that finish exactly
    // at resetHour still appear as "yesterday" items instead of disappearing.
    return eventAt >= yesterdayStart && eventAt <= start;
}

function dedupeByCompositeKey<T>(
    items: T[],
    buildKey: (item: T) => string
): T[] {
    const seen = new Set<string>();

    return items.filter((item) => {
        const key = buildKey(item);

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
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

    const archive = await getTaskArchiveApi({
        archiveType: "failed",
        cycleKey: review.cycleKey,
        limit: 50,
    });

    const archivedFailedTasks = archive.entries.map(mapArchiveEntryToFailedYesterdayItem);

    return dedupeByCompositeKey(
        [...liveFailedTasks, ...archivedFailedTasks],
        (task) => task._id
    );
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

    const archive = await getTaskArchiveApi({
        archiveType: filter === "all" ? "all" : filter,
        cycleKey: review.cycleKey,
        limit: 50,
    });

    const archivedYesterdayTasks = archive.entries
        .filter((entry) => matchesFilter(entry.archiveType))
        .map(mapArchiveEntryToYesterdayPreviewTask);

    return dedupeByCompositeKey(
        [...liveYesterdayTasks, ...archivedYesterdayTasks],
        (task) => task._id
    );
};
