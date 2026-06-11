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

export interface FailedYesterdayItem {
    _id: string;
    title: string;
    category: string;
    containerColor: string;
    status: "failed";
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
