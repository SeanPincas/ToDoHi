// ------------------------------ TASK API (CONNECTS FRONTEND ↔ BACKEND) ------------------------------
// This file contains ALL API calls related to the Task feature.
// We keep backend communication here so the Context stays clean.
import axios from "axios";
import { authHeaders } from "../utils/authHeaders";

// CHANGE this if backend URL changes
const API_URL = "http://localhost:3500/api/tasks";

// ------------------------------ TASK TYPE DEFINITION ------------------------------------------------
export interface Task {
    _id: string;
    useId: string;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    deadline?: string | null;
    orderIndex: number;
    isExpired: boolean;
    memoId?: string | null;
    containerColor: string
}

// ------------------------------ API CALLS ------------------------------------------------------------
// Each function talks directly to the backend server.
// TodoContext will use these functions to manage the Todo system.

// FETCH ALL TASKS of the logged-in user
export const getAllTasks = async (): Promise<Task[]> => {
    const res = await axios.get(`${API_URL}`, authHeaders());
    return res.data.task;
};

// CREATE a new task
export const createTask = async (data: Partial<Task>): Promise<Task> => {
    const res = await axios.post(`${API_URL}/create`, data, authHeaders());
    return res.data.task;
};

// UPDATE a task by ID
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const res = await axios.put(`${API_URL}/${taskId}`, updates, authHeaders());
    return res.data.task;
};

// DELETE a task by ID
export const deleteTask = async (taskId: string): Promise<void> => {
    await axios.delete(`${API_URL}/${taskId}`, authHeaders());
};

// REORDER tasks (drag and drop saves new orderIndex)
export const reorderTaskPositions = async (updatedTasks: Task[]): Promise<void> => {
    // backend expects array of { _id, orderIndex }
    const payload = updatedTasks.map(t => ({
        _id: t._id,
        orderIndex: t.orderIndex,
    }));

    await axios.put(`$(API_URL)/reorder`, { task: payload }, authHeaders());
}