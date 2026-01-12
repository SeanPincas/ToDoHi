// ------------------------------ MEMO API (CONNECTS FRONTEND ↔ BACKEND) ------------------------------
import axios from "axios";
import { authHeaders } from "../utils/authHeaders";

const API_URL = "http://localhost:3500/api/memoboard";

// ------------------------------ TYPES ------------------------------
export interface MemoPosition {
    x: number;
    y: number;
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
    position?: { x: number; y: number };
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

// UPDATE MEMO POSITION (DRAGGING)
export const updateMemoPosition = async (
    memoId: string,
    position: { x: number; y: number }
): Promise<Memo> => {
    const res = await axios.put(`${API_URL}/${memoId}/position`, position, authHeaders());

    return res.data.memo;
};

// STACKING: bring to front
export const bringMemoToFront = async (memoId: string): Promise<Memo> => {
    const res = await axios.put(
        `${API_URL}/${memoId}/bring-to-front`,
        {},
        authHeaders()
    );

    return res.data.memo;
};

// STACKING: send to back
export const sendMemoToBack = async (memoId: string): Promise<Memo> => {
    const res = await axios.put(
        `${API_URL}/${memoId}/send-to-back`,
        {},
        authHeaders()
    );

    return res.data.memo;
};

// DELETE MEMO
export const deleteMemo = async (memoId: string): Promise<void> => {
    await axios.delete(`${API_URL}/${memoId}`, authHeaders());
};
