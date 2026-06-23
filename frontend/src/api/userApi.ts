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
    dayTaskDelete?: 3 | 7 | 15 | 30;
    quoteDelay?: 5 | 10 | 30 | 45 | 60;
    theme?: "light" | "dark";
    bookmarkStyle?: string;
    wallpaperStyle?: string;
    frameStyle?: string;
    quoteCategory?: string[];
}) => {
    const res = await axios.patch(
        `${USER_API_URL}/preference`,
        data,
        authHeaders()
    );
    return res.data;
};

export const updateUserProfile = async (data: { username: string }) => {
    const res = await axios.patch(
        `${USER_API_URL}/profile`,
        data,
        authHeaders()
    );
    return res.data;
};

export const changeUserPassword = async (data: {
    currentPassword: string;
    newPassword: string;
}) => {
    const res = await axios.patch(
        `${USER_API_URL}/change-password`,
        data,
        authHeaders()
    );
    return res.data;
};

export const uploadUserProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const res = await axios.patch(
        `${USER_API_URL}/upload-profile`,
        formData,
        {
            headers: {
                ...authHeaders().headers,
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data;
};
