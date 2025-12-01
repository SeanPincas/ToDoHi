// ------------------------------ AUTH API (FRONTEND ↔ BACKEND) ------------------------------
// Handles login / register / get current user
// Matches your backend responses:
// - POST /api/auth/login  -> { token, username }
// - POST /api/auth/register -> { message, user: { username, email } }
// - GET  /api/auth/me -> returns full user (requires Authorization header)

import axios from "axios";
import { authHeaders } from "../utils/authHeaders";

const BASE = "http://localhost:3500/api/auth";

export interface LoginResponse {
    token: string;
    username: string;
}

export interface RegisterResponse {
    message: string;
    user: { username: string, email: string };
}

// Login
export const loginApi = async (email: string, password: string): Promise<LoginResponse> => {
    const res = await axios.post(`${BASE}/login`, { email, password });
    return res.data;
};

// Register
export const registerApi = async (username: string, email: string, password: string): Promise<RegisterResponse> => {
    const res = await axios.post(`${BASE}/register`, { username, email, password });
    return res.data;
};

// Get current user ( user authHeaders())
export const getCurrentUserApi = async (): Promise<any> => {
    const res = await axios.get(`${BASE}/me`, authHeaders());
    return res.data;
};
