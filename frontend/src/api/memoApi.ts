// ------------------------------ MEMO API (CONNECTS FRONTEND ↔ BACKEND) ------------------------------
import axios from "axios";
import { authHeaders } from "../utils/authHeaders";

const API_URL = "http://localhost:3500/api/memoboard";

// ------------------------------ TYPES ------------------------------
export interface MemoPosition {
    xPct: number;
    yPct: number;
    z: number;
}

export interface Memo {
    _id: string;
    userId: string;
    title: string;
    content: string;
    category: string;
    containerColor: string;
    pinColor: string;
    position: MemoPosition;
    createdAt: string;
    updatedAt: string;
    taskSourceId?: string | null;
}

// ------------------------------ API CALLS ------------------------------
export const getAllMemos = async (): Promise<Memo[]> => {
    const res = await axios.get(API_URL, authHeaders())

    return res.data;
};

// CREATE MEMO
export const createMemo = async (data: {
    title?: string;
    content?: string;
    category?: string;
    containerColor?: string;
    pinColor?: string;
    position?: {
        xPct: number;
        yPct: number;
    };
}): Promise<Memo> => {
    const res = await axios.post(API_URL, data, authHeaders());

    return res.data.memo;
};

// CREATE EMO FROM TASK
export const createMemoFromTask = async (data: {
    taskId: string;
    pinColor?: string;
}): Promise<Memo> => {
    const res = await axios.post(`${API_URL}/from-task`, data, authHeaders());

    return res.data.memo;
};

// UPDATE MEMO CONTENT
export const updateMemo = async (
    memoId: string,
    updates: {
        title?: string;
        content?: string;
        category?: string;
        containerColor?: string;
        pinColor?: string;
    }
): Promise<Memo> => {
    const res = await axios.put(`${API_URL}/${memoId}`, updates, authHeaders());

    return res.data.memo;
};

// UPDATE MEMO BOARD LAYOUT (BATCH) -------
export const updateMemoLayout = async (
    layout: {
        id: string;
        xPct: number;
        yPct: number;
        z: number;
    }[]
): Promise<void> => {
    await axios.patch(
        `${API_URL}/layout`,
        { layout },
        authHeaders()
    );
};

// DELETE MEMO
export const deleteMemo = async (memoId: string): Promise<void> => {
    await axios.delete(`${API_URL}/${memoId}`, authHeaders());
};
