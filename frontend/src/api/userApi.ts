// ============================================================================
// userApi.ts
// Handles authenticated user-related requests
// ============================================================================

import axios from "axios";
import { authHeaders } from "../utils/authHeaders";

const AUTH_API_URL = "http://localhost:3500/api/auth";
const USER_API_URL = "http://localhost:3500/api/user";

// --------------------------- GET CURRENT USER ---------------------------
export const getMe = async () => {
    const res = await axios.get(
        `${AUTH_API_URL}/me`,
        authHeaders()
    );
    return res.data;
};

// --------------------------- UPDATE USER PREFERENCES ---------------------------
export const updateUserPreferences = async (data: {
    resetHour?: number;
    theme?: "light" | "dark";
    quoteCategoryPreferences?: string[];
}) => {
    const res = await axios.patch(
        `${USER_API_URL}/preference`,
        data,
        authHeaders()
    );
    return res.data;
};
