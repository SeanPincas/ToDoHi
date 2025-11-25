// This context manages the global Authentication State of the frontend includes:
//   • Storing JWT token
//   • Providing login() and logout() functions
//   • Persisting login via localStorage
//   • Giving components access to auth status
// ====================================================================
import { createContext, useState} from "react";
import type { ReactNode } from "react";

// --------------------------- CONTEXT SHAPE ---------------------------
// What value will the entire app receive when it uses AuthContext?
interface AuthContextType {
    token: string | null;               // JWT token stored globally
    login: (token: string) => void;     // Called after login API
    logout: () => void;                 // Called when user logs out
}

// --------------------------- DEFAULT CONTEXT --------------------------
// These default values prevent React from crashing before Provider loads.
export const AuthContext = createContext<AuthContextType>({
    token: null,
    login: () => {},
    logout: () => {},
});

// --------------------------- PROVIDER WRAPPER -------------------------
// This component wraps the entire <App/> so all children can access auth.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // ------------------ STATE: TOKEN ------------------
    // Load token from localStorage if it exists (user stays logged in)
    const [token, setToken] = useState<string | null>(
        localStorage.getItem("token")
    );

    // --------------------------- LOGIN ---------------------------
    // Save token to localStorage
    const login = (newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    }

    // --------------------------- LOGOUT ---------------------------
    // Clear token and logs User out instantly
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    // --------------------------- CONTEXT PROVIDER ----------------------
    // Makes (token, login, logout) available to the whole application
    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};