// ====================================================================
// AuthContext.tsx
// Manages Authentication + User Preferences (Theme)
// ====================================================================

import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import {
    loginApi,
    registerApi,
    getCurrentUserApi
} from "../api/authApi";

import { updateUserPreferences } from "../api/userApi";

// --------------------------- TYPES ---------------------------
interface User {
    _id?: string;
    username?: string;
    email?: string;

    preference?: {
        resetHour: number;
        dayTaskDelete?: 3 | 7 | 15 | 30;
        theme: "light" | "dark";
        bookmarkStyle?: string;
        wallpaperStyle?: string;
        quoteCategory?: string[];
    };

    stats?: {
        totalTasksCreated: number;
        totalTasksCompleted: number;
        totalMemosCreated: number;
        totalDailyPlanCompleted: number;
        dailyStreak: number;
        longestStreak: number;
        tasksCompletedToday: number;
        tasksFailedYesterday: number;
    };

    profilePicture?: string;
}

type ThemeType = "light" | "dark";

// --------------------------- CONTEXT SHAPE ---------------------------
interface AuthContextType {
    token: string | null;
    user: User | null;
    loading: boolean;

    theme: ThemeType;
    toggleTheme: () => void;

    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;


    isAuthenticated: boolean;
}

// --------------------------- CONTEXT ---------------------------
const AuthContext = createContext<AuthContextType | null>(null);

// --------------------------- HOOK ---------------------------
export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
    return ctx;
};

// --------------------------- PROVIDER ---------------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [theme, setTheme] = useState<ThemeType>("light");

    const navigate = useNavigate();

    // ---------------- APPLY THEME TO BODY ----------------
    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    // ---------------- LOAD USER ON APP START ----------------
    useEffect(() => {
        const init = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const current = await getCurrentUserApi();
                setUser(current);

                if (current?.preference?.theme) {
                    setTheme(current.preference.theme);
                }
            } catch {
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    // ---------------- TOGGLE THEME ----------------
    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);

        updateUserPreferences({ theme: next }).catch(console.error);
    };

    // ---------------- LOGIN ----------------
    const login = async (email: string, password: string) => {
        const data = await loginApi(email, password);

        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);

        setToken(data.token);

        const currentUser = await getCurrentUserApi();
        setUser(currentUser);

        if (currentUser?.preference?.theme) {
            setTheme(currentUser.preference.theme);
        }

        navigate("/", { replace: true });
    };

    // ---------------- REGISTER ----------------
    const register = async (username: string, email: string, password: string) => {
        await registerApi(username, email, password);
    };

    // ---------------- LOGOUT ----------------
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setToken(null);
        setUser(null);
        navigate("/login", { replace: true });
    };

    // ---------------- REFRESH USER (STATS / SNAPSHOTS) ----------------
    const refreshUser = async () => {
        try {
            const current = await getCurrentUserApi();
            setUser(current);

            if (current?.preference?.theme) {
                setTheme(current.preference.theme);
            }
        } catch (err) {
            console.error("[AuthContext] Failed refreshing user:", err);
        }
    };


    const value: AuthContextType = {
        token,
        user,
        loading,
        theme,
        toggleTheme,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
