// ============================================================================
// SIDEBAR COMPONENT
// Fixed sidebar on desktop, drawer sidebar on mobile
// Handles user preferences: Reset Hour, Quote Category, Theme Toggle
// ============================================================================

import { useState, useEffect, useRef } from "react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

import { DropdownMenu } from "../common/dropdownMenu";
import type { DropdownOption } from "../common/dropdownMenu";

import { QUOTE_CATEGORIES } from "../../utils/quoteUtils";
import { useAuthContext } from "../../context/AuthContext";
import { getMe, updateUserPreferences } from "../../api/userApi";

import ThemeToggle from "../common/themeToggle/ThemeToggle";

// --------------------------- OPTIONS ---------------------------

// Reset Hour options (00:00 → 23:00)
const RESET_HOUR_OPTIONS: DropdownOption[] = Array.from({ length: 24 }).map(
    (_, i) => ({
        value: String(i),
        label: `${i}:00`,
    })
);

// Quote category options
const QUOTE_OPTIONS: DropdownOption[] = QUOTE_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
}));

// --------------------------- COMPONENT ---------------------------

export const Sidebar = () => {
    const [open, setOpen] = useState(false);

    // ---------------- USER IDENTITY STATE ----------------
    const [username, setUsername] = useState<string>("Username");

    // ---------------- USER PREFERENCE STATE ----------------
    const [resetHour, setResetHour] = useState("0");
    const [quotePref, setQuotePref] = useState("Motivation");

    const navigate = useNavigate();

    // 🔑 Auth context (SINGLE SOURCE OF TRUTH)
    const { logout, theme, toggleTheme } = useAuthContext();

    // Debounce timer (prevents API spam)
    const saveTimeout = useRef<number | null>(null);

    const toggleSidebar = () => setOpen(!open);

    // ---------------- LOAD USER DATA (NON-THEME) ----------------
    useEffect(() => {
        const loadUserPreferences = async () => {
            try {
                const user = await getMe();

                // ---------------- USERNAME ----------------
                if (user?.username) {
                    setUsername(user.username);
                }

                // Load reset hour
                if (user?.preference?.resetHour !== undefined) {
                    setResetHour(String(user.preference.resetHour));
                }

                // Load quote category (take first only for now)
                if (
                    Array.isArray(user?.quoteCategoryPreferences) &&
                    user.quoteCategoryPreferences.length > 0
                ) {
                    setQuotePref(user.quoteCategoryPreferences[0]);
                }

                // ⚠️ Theme is NOT handled here anymore
            } catch (err) {
                console.error("Failed to load user preferences:", err);
            }
        };

        loadUserPreferences();
    }, []);

    // ---------------- HANDLERS ----------------

    const handleResetHourChange = (val: string) => {
        setResetHour(val);

        if (saveTimeout.current !== null) {
            clearTimeout(saveTimeout.current);
        }

        saveTimeout.current = window.setTimeout(() => {
            updateUserPreferences({
                resetHour: Number(val),
            }).catch(console.error);
        }, 600);
    };

    const handleQuotePrefChange = (val: string) => {
        setQuotePref(val);

        if (saveTimeout.current !== null) {
            clearTimeout(saveTimeout.current);
        }

        saveTimeout.current = window.setTimeout(() => {
            updateUserPreferences({
                quoteCategoryPreferences: [val],
            }).catch(console.error);
        }, 600);
    };

    // ---------------- RENDER ----------------

    return (
        <>
            {/* ---------------- MOBILE TOGGLE ---------------- */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>

            {/* ---------------- SIDEBAR ---------------- */}
            <aside className={`sidebar ${open ? "open" : ""}`}>
                {/* ---------------- LOGO ---------------- */}
                <div className="sidebar-section logo-section">
                    <img
                        src="/logo.png"
                        alt="ToDoHi Logo"
                        className="sidebar-logo"
                    />
                    <p className="sidebar-quote">
                        "Stay Productive, one day at a Time."
                    </p>
                </div>

                {/* ---------------- NAV ---------------- */}
                <div className="sidebar-section">
                    <button
                        className="sidebar-btn"
                        onClick={() => navigate("/")}
                    >
                        Dashboard
                    </button>

                    <button
                        className="sidebar-btn"
                        onClick={() => navigate("/memos")}
                    >
                        Memo Board
                    </button>
                </div>

                {/* ---------------- USER PREFERENCES ---------------- */}
                <div className="sidebar-section">
                    <DropdownMenu
                        label="Reset Hour"
                        value={`${resetHour}:00`}
                        options={RESET_HOUR_OPTIONS}
                        onChange={handleResetHourChange}
                        maxHeight={200}
                    />

                    <DropdownMenu
                        label="Quote Preferences"
                        value={quotePref}
                        options={QUOTE_OPTIONS}
                        onChange={handleQuotePrefChange}
                        maxHeight={250}
                    />
                </div>

                {/* ---------------- FAILED TASKS ---------------- */}
                <div className="sidebar-section">
                    <h4 className="section-title">Failed Tasks Yesterday</h4>
                    <ul className="failed-task-list">
                        <li>No Data Loaded Yet...</li>
                    </ul>
                </div>

                {/* ---------------- PROFILE ---------------- */}
                <div className="sidebar-section">
                    <div className="profile-row">
                        <img
                            src="/default-profile.jpg"
                            alt="Profile"
                            className="sidebar-profile-pic"
                        />
                        <p className="profile-name">{username}</p>
                    </div>

                    <button className="logout-btn" onClick={logout}>
                        Logout
                    </button>

                    {/* ---------------- FOOTER + THEME TOGGLE ---------------- */}
                    <div className="sidebar-footer-row">
                        <footer className="sidebar-footer">
                            © 2025 ToDoHi
                        </footer>

                        <div className="sidebar-theme-toggle">
                            <ThemeToggle
                                theme={theme}
                                onToggle={toggleTheme}
                            />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
