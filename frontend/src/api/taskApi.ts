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
    createdAt: string;
    deadline?: string | null;
    orderIndex: number;
    isExpired: boolean;
    memoId?: string | null;
    containerColor: string;
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

// REORDER tasks  <-- FIXED (correct URL + correct body key)
export const reorderTaskPositions = async (orderIds: string[]): Promise<void> => {
    await axios.put(
        `${API_URL}/reorder`,
        { orderIds },
        authHeaders()
    );
};
