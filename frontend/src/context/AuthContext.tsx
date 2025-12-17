// This context manages the global Authentication State of the frontend includes:
//   • Storing JWT token
//   • Providing login() and logout() functions
//   • Persisting login via localStorage
//   • Giving components access to auth status
// ====================================================================
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import {
    loginApi,
    registerApi,
    getCurrentUserApi
} from "../api/authApi";

// --------------------------- TYPES ---------------------------
interface User {
    _id?: string;
    username?: string;
    email?: string;

    preference?: {
        resetHour: number;   // user's chosen reset hour
        theme: "light" | "dark";
    };

    stats?: {
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

// --------------------------- CONTEXT SHAPE ---------------------------
// What value will the entire app receive when it uses AuthContext?
interface AuthContextType {
    token: string | null;               // JWT token stored globally
    user: User | null;                        // Full user object from backend
    loading: boolean;                         // Loading state for app start

    // ------------- FUNCTIONS -------------
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;

    // ------------- BOOLEAN -------------
    isAuthenticated: boolean;
}

// --------------------------- DEFAULT CONTEXT --------------------------
// These default values prevent React from crashing before Provider loads.
const AuthContext = createContext<AuthContextType | null>(null);

// --------------------------- CUSTOM HOOK --------------------------
export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
    return ctx;
};

// --------------------------- PROVIDER WRAPPER -------------------------
// This component wraps the entire <App/> so all children can access auth.
export const AuthProvider = ({ children }: { children: ReactNode }) => {

    // ------------------ REACT STATES ------------------
    // Load token from localStorage if it exists (user stays logged in)
    const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    // ------------------ AUTO LOAD USER ON APP START (/auth/me) ------------------
    useEffect(() => {
        const init = async () => {

            // If no token → nothing to load 
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Fetch user from backend
                const current = await getCurrentUserApi();
                setUser(current);
            } catch (error) {
                // Token expired OR invalid → clear it
                localStorage.removeItem("token");
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);       // Runs only when the app loads fresh

    // =====================================================================
    //                                 LOGIN
    // =====================================================================
    // Save token to localStorage
    const login = async (email: string, password: string) => {
        // step 1: call backend
        const data = await loginApi(email, password);

        // step 2: save token AND username to localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);

        setToken(data.token);   // sets state → triggers rerender

        // step 3: load full user via /auth/me
        const currentUser = await getCurrentUserApi();
        setUser(currentUser);

        navigate("/", { replace: true });
    };

    // =====================================================================
    //                                  REGISTER
    // =====================================================================
    const register = async (username: string, email: string, password: string) => {
        // Backend does NOT return token → user must login manually later
        await registerApi(username, email, password);
        // we do MOT log the user in automatimally (matches backend)
    };

    // =====================================================================
    //                                   LOGOUT
    // =====================================================================
    // Clear token and logs User out instantly
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        setToken(null);
        setUser(null);
        navigate("/login", { replace: true });
    };

    // =====================================================================
    //                            CONTENT PROVIDER
    // =====================================================================
    // Makes (token, login, logout) available to the whole application
    const value: AuthContextType = {
        token,
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,    // logged in if user object exists
    };

    return  <AuthContext.Provider value={value}>
                {children}
            </AuthContext.Provider>
};