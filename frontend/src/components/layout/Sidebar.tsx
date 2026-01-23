// ============================================================================
// SIDEBAR COMPONENT
// Stable version – preserves ALL existing features
// Adds Reset Hour guide icon + modal (educational only)
// FIX: Quote preference loading regression
// ============================================================================

import { useState, useEffect, useRef } from "react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";

import DropdownMenu from "../common/dropdownMenu/DropdownMenu";
import type { DropdownOption } from "../common/dropdownMenu/DropdownMenu";

import {
    QUOTE_CATEGORIES,
    type QuoteCategory
} from "../../utils/quoteUtils";

import { useAuthContext } from "../../context/AuthContext";
import { getMe, updateUserPreferences } from "../../api/userApi";

import ThemeToggle from "../common/themeToggle/ThemeToggle";

// ---------------- NEW (UI ONLY) ----------------
import ResetHourHelpIcon from "../common/icons/ResetHourHelpIcon";
import ResetHourGuideModal from "../common/modals/ResetHourGuideModal";

// ============================================================================
// OPTIONS
// ============================================================================

// Reset hour dropdown (00:00 → 23:00)
const RESET_HOUR_OPTIONS: DropdownOption[] = Array.from({ length: 24 }).map(
    (_, i) => ({
        value: String(i),
        label: `${i}:00`,
    })
);

// Quote categories
const QUOTE_OPTIONS: DropdownOption[] = QUOTE_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
}));

// ============================================================================
// COMPONENT
// ============================================================================

const Sidebar = () => {
    const [open, setOpen] = useState(false);

    // ---------------- USER STATE ----------------
    const [username, setUsername] = useState("Username");

    // ---------------- PREFERENCES ----------------
    const [resetHour, setResetHour] = useState("0");
    const [quotePref, setQuotePref] = useState<QuoteCategory>("Motivation");

    // ---------------- UI STATE ----------------
    const [showResetHourGuide, setShowResetHourGuide] = useState(false);

    const navigate = useNavigate();
    const { logout, theme, toggleTheme } = useAuthContext();

    const [failedTaskSnapshot, setFailedTaskSnapshot] = useState<{
        tasks: { _id: string; title: string; status: string }[];
    } | null>(null);

    // Debounce API saves
    const saveTimeout = useRef<number | null>(null);

    const toggleSidebar = () => setOpen(!open);

    // =====================================================================
    // LOAD USER (SAFE · NON-DESTRUCTIVE)
    // =====================================================================
    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await getMe();

                // Username
                if (user?.username) {
                    setUsername(user.username);
                }

                // Reset Hour
                if (typeof user?.preference?.resetHour === "number") {
                    setResetHour(String(user.preference.resetHour));
                }

                // ---------------- QUOTE PREFERENCE  ----------------
                if (Array.isArray(user?.quoteCategoryPreferences)) {
                    const preferred = user.quoteCategoryPreferences[0];
                    if (preferred) {
                        setQuotePref(preferred as QuoteCategory);
                    }
                }

                // Failed Task Snapshot
                if (user?.failedTaskSnapshot) {
                    setFailedTaskSnapshot(user.failedTaskSnapshot);
                } else {
                    setFailedTaskSnapshot(null);
                }

            } catch (err) {
                console.error("Sidebar load failed:", err);
            }
        };

        loadUser();
    }, []);

    // =====================================================================
    // HANDLERS (DEBOUNCED · SAFE)
    // =====================================================================

    const handleResetHourChange = (val: string) => {
        setResetHour(val);

        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }

        saveTimeout.current = window.setTimeout(() => {
            updateUserPreferences({
                resetHour: Number(val),
            }).catch(console.error);
        }, 600);
    };

    const handleQuotePrefChange = (val: string) => {
        setQuotePref(val as QuoteCategory);

        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }

        saveTimeout.current = window.setTimeout(() => {
            updateUserPreferences({
                // UI sets ONE preference, backend still allows up to 3
                quoteCategoryPreferences: [val],
            }).catch(console.error);
        }, 600);
    };

    // =====================================================================
    // RENDER
    // =====================================================================

    return (
        <>
            {/* ---------------- MOBILE TOGGLE ---------------- */}
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                ☰
            </button>

            {/* ---------------- SIDEBAR ---------------- */}
            <aside className={`sidebar ${open ? "open" : ""}`}>

                {/* LOGO */}
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

                {/* NAV */}
                <div className="sidebar-section">
                    <button
                        className="sidebar-btn"
                        onClick={() => navigate("/")}
                    >
                        Dashboard
                    </button>
                    <button
                        className="sidebar-btn"
                        onClick={() => navigate("/memoboard")}
                    >
                        Memo Board
                    </button>
                </div>

                {/* PREFERENCES */}
                <div className="sidebar-section">

                    {/* RESET HOUR (label from DropdownMenu, icon layered beside it) */}
                    <div className="reset-hour-wrapper">
                        <DropdownMenu
                            label="Reset Hour"
                            value={`${resetHour}:00`}
                            options={RESET_HOUR_OPTIONS}
                            onChange={handleResetHourChange}
                            maxHeight={180}
                        />

                        {/* Help icon aligned with label */}
                        <div className="reset-hour-help">
                            <ResetHourHelpIcon
                                onClick={() =>
                                    setShowResetHourGuide(true)
                                }
                            />
                        </div>
                    </div>

                    {/* QUOTE PREF */}
                    <DropdownMenu
                        label="Quote Preferences"
                        value={quotePref}
                        options={QUOTE_OPTIONS}
                        onChange={handleQuotePrefChange}
                        maxHeight={240}
                    />
                </div>

                {/* FAILED TASKS */}
                <div className="sidebar-section">
                    <h4 className="section-title">
                        Failed Tasks Yesterday
                    </h4>
                    <div className="failed-task-container">
                        <ul className="failed-task-list">
                            {/* If snapshot is NULL */}
                            {!failedTaskSnapshot && (
                                <li className="failed-task-empty">
                                    No Failed Tasks Yesterday... Congratz ^o^
                                </li>
                            )}

                            {/* Render Snapshot Tasks */}
                            {failedTaskSnapshot?.tasks.map((task) => (
                                <li key={task._id} className="failed-task-item">
                                    {task.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* PROFILE */}
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

                    {/* FOOTER + THEME */}
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

            {/* ---------------- RESET HOUR GUIDE MODAL ---------------- */}
            {showResetHourGuide && (
                <ResetHourGuideModal
                    onClose={() => setShowResetHourGuide(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
