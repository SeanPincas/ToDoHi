// ------------------------------ TASK API (CONNECTS FRONTEND ↔ BACKEND) ------------------------------
import axios from "axios";
import { authHeaders } from "../utils/authHeaders";

import type { TaskCategory, TaskStatus } from "../utils/taskUtils";

const API_URL = "http://localhost:3500/api/tasks";

// ------------------------------ TASK TYPE ------------------------------
export interface Task {
    _id: string;
    userId: string;
    title: string;
    description: string;
    category: TaskCategory | (string & {});
    status: TaskStatus | (string & {});
    completedAt?: string | null;
    failedAt?: string | null;
    createdAt: string;
    updatedAt: string;
    deadline?: string | null;
    orderIndex: number;
    isExpired: boolean;
    memoId?: string | null;
    containerColor: string;
}

export interface RepeatReviewSummary {
    total: number;
    completed: number;
    failed: number;
}

export interface RepeatReviewResponse {
    message: string;
    reviewRequired: boolean;
    cycleKey: string;
    retentionDays: number;
    archiveLabel: string;
    reviewSource?: "archive";
    summary: RepeatReviewSummary;
    tasks: Task[];
}

export interface TaskArchiveEntry {
    _id: string;
    source?: "archive";
    userId: string;
    originalTaskId?: string | null;
    title: string;
    description?: string;
    category: TaskCategory | (string & {});
    status: TaskStatus | (string & {});
    completedAt?: string | null;
    failedAt?: string | null;
    createdAt: string;
    deadline?: string | null;
    orderIndex: number;
    isExpired: boolean;
    memoId?: string | null;
    containerColor: string;
    archivedAt: string;
    archiveType: "failed" | "completed";
    archiveReason: string;
    sourceCycleKey?: string | null;
    repeatedAt?: string | null;
    repeatedIntoTaskId?: string | null;
    retentionDeleteAt?: string | null;
}

export interface TaskArchiveResponse {
    message: string;
    filters: {
        archiveType: string;
        archiveReason: string;
        cycleKey: string | null;
        limit: number;
    };
    totalCount: number;
    entries: TaskArchiveEntry[];
}

export interface TaskArchiveQueryParams {
    archiveType?: "failed" | "completed" | "all";
    archiveReason?: string;
    cycleKey?: string;
    limit?: number;
}

// ------------------------------ API CALLS ------------------------------

// GET all tasks
export const getAllTasks = async (): Promise<Task[]> => {
    const res = await axios.get(API_URL, authHeaders());
    return res.data;
};

// CREATE task  <-- FIXED
export const createTask = async (data: Partial<Task>): Promise<Task> => {
    const res = await axios.post(API_URL, data, authHeaders());
    return res.data.task;
};

// UPDATE task
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const res = await axios.put(`${API_URL}/${taskId}`, updates, authHeaders());
    return res.data.task;
};

// DELETE task
export const deleteTask = async (taskId: string): Promise<void> => {
    await axios.delete(`${API_URL}/${taskId}`, authHeaders());
};

// MARK COMPLETE
export const markTaskComplete = async (taskId: string): Promise<Task> => {
    const res = await axios.patch(`${API_URL}/${taskId}/complete`, {}, authHeaders());
    return res.data.task;
};

// REORDER
export const reorderTaskPositions = async (orderIds: string[]): Promise<void> => {
    await axios.put(
        `${API_URL}/reorder`,
        { orderIds },
        authHeaders()
    );
};

// REPEAT TASKS
export const repeatTaskApi = async (repeatTaskIds: string[]) => {
    const res = await axios.post(
        `${API_URL}/repeat`,
        { repeatTaskIds },
        authHeaders()
    );
    return res.data;
};

export const getRepeatReviewApi = async (limit?: number): Promise<RepeatReviewResponse> => {
    const res = await axios.get(`${API_URL}/review`, {
        ...authHeaders(),
        params: limit ? { limit } : undefined,
    });
    return res.data;
};

export const getTaskArchiveApi = async (
    params: TaskArchiveQueryParams = {}
): Promise<TaskArchiveResponse> => {
    const res = await axios.get(`${API_URL}/archive`, {
        ...authHeaders(),
        params,
    });
    return res.data;
};

export const repeatTaskArchiveEntryApi = async (archiveEntryId: string) => {
    const res = await axios.post(
        `${API_URL}/archive/${archiveEntryId}/repeat`,
        {},
        authHeaders()
    );
    return res.data;
};

export const deleteTaskArchiveEntryApi = async (archiveEntryId: string) => {
    const res = await axios.delete(
        `${API_URL}/archive/${archiveEntryId}`,
        authHeaders()
    );
    return res.data;
};
