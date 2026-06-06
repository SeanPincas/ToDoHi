import { useState, useEffect, useRef } from "react";
import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "../../styles/iconLibrary";

import DropdownMenu from "../common/dropdownMenu/DropdownMenu";
import type { DropdownOption } from "../common/dropdownMenu/DropdownMenu";

import { QUOTE_CATEGORIES, type QuoteCategory } from "../../utils/quoteUtils";

import { useAuthContext } from "../../context/AuthContext";
import { getMe, updateUserPreferences } from "../../api/userApi";

import ThemeToggle from "../common/themeToggle/ThemeToggle";
import {
    updateQuotePreferencesApi,
    getRandomQuoteApi,
    getQuotesByCategoryApi,
} from "../../api/quoteApi";

import ResetHourHelpIcon from "../common/icons/ResetHourHelpIcon";
import ResetHourGuideModal from "../common/modals/ResetHourGuideModal";
import UserSettingsModal from "../common/modals/UserSettingsModal";

const RESET_HOUR_OPTIONS: DropdownOption[] = Array.from({ length: 24 }).map((_, i) => ({
    value: String(i),
    label: `${i}:00`,
}));

const QUOTE_OPTIONS: DropdownOption[] = QUOTE_CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
}));

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [username, setUsername] = useState("Username");
    const [resetHour, setResetHour] = useState("0");
    const [quotePref, setQuotePref] = useState<QuoteCategory>("Motivation");
    const [currentQuote, setCurrentQuote] = useState<string>("Loading quote...");
    const [showResetHourGuide, setShowResetHourGuide] = useState(false);
    const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { logout, theme, toggleTheme } = useAuthContext();

    const [failedTaskSnapshot, setFailedTaskSnapshot] = useState<{
        tasks: { _id: string; title: string; status: string }[];
    } | null>(null);

    const saveTimeout = useRef<number | null>(null);
    const hoverCollapseTimeout = useRef<number | null>(null);

    const toggleSidebar = () => setOpen((prev) => !prev);
    const closeSidebar = () => setOpen(false);

    const clearHoverTimeout = () => {
        if (hoverCollapseTimeout.current) {
            clearTimeout(hoverCollapseTimeout.current);
            hoverCollapseTimeout.current = null;
        }
    };

    const handleTabHoverStart = (tabId: string) => {
        if (open) return;
        clearHoverTimeout();
        setHoveredTab(tabId);
    };

    const handleTabHoverEnd = () => {
        if (open) return;
        clearHoverTimeout();
        hoverCollapseTimeout.current = window.setTimeout(() => {
            setHoveredTab(null);
        }, 1500);
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await getMe();

                if (user?.username) {
                    setUsername(user.username);
                }

                if (typeof user?.preference?.resetHour === "number") {
                    setResetHour(String(user.preference.resetHour));
                }

                if (Array.isArray(user?.quoteCategoryPreferences)) {
                    const preferred = user.quoteCategoryPreferences[0];
                    const selected = preferred ? preferred : "Random";
                    setQuotePref(selected as QuoteCategory);
                    fetchQuote(selected as QuoteCategory);
                }

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

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (open) {
            clearHoverTimeout();
            setHoveredTab(null);
        }
    }, [open]);

    useEffect(() => {
        return () => {
            clearHoverTimeout();
        };
    }, []);

    const fetchQuote = async (category: QuoteCategory) => {
        try {
            if (category === "Random") {
                const res = await getRandomQuoteApi();
                setCurrentQuote(res.quote.text);
                return;
            }

            const res = await getQuotesByCategoryApi(category);
            if (res.quotes.length > 0) {
                const randomIndex = Math.floor(Math.random() * res.quotes.length);
                setCurrentQuote(res.quotes[randomIndex].text);
            }
        } catch (err) {
            console.error("Failed fetching quote:", err);
            setCurrentQuote("Stay productive today.");
        }
    };

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
        const selected = val as QuoteCategory;

        setQuotePref(selected);
        fetchQuote(selected);

        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }

        saveTimeout.current = window.setTimeout(async () => {
            if (selected === "Random") {
                updateQuotePreferencesApi([]).catch(console.error);
                return;
            }

            updateQuotePreferencesApi([selected]).catch(console.error);
        }, 600);
    };

    return (
        <>
            <aside className={`sidebar ${open ? "open" : "collapsed"}`}>
                <div className="sidebar-tab" aria-label="Sidebar quick actions">
                    <button
                        className={`sidebar-rail-btn sidebar-rail-toggle ${hoveredTab === "settings" ? "hover-stretch" : ""}`}
                        onClick={toggleSidebar}
                        aria-expanded={open}
                        aria-label={open ? "Collapse sidebar settings" : "Open sidebar settings"}
                        onMouseEnter={() => handleTabHoverStart("settings")}
                        onMouseLeave={handleTabHoverEnd}
                    >
                        <span className="sidebar-rail-btn-icons">
                            <Icons.Menu />
                        </span>
                        <span className={`sidebar-rail-btn-label ${hoveredTab === "settings" ? "visible" : ""}`}>Menu</span>
                    </button>
                    <button
                        className={`sidebar-rail-btn ${hoveredTab === "dashboard" ? "hover-stretch" : ""}`}
                        onClick={() => navigate("/")}
                        aria-label="Go to Dashboard"
                        onMouseEnter={() => handleTabHoverStart("dashboard")}
                        onMouseLeave={handleTabHoverEnd}
                    >
                        <Icons.Home />
                        <span className={`sidebar-rail-btn-label ${hoveredTab === "dashboard" ? "visible" : ""}`}>Dashboard</span>
                    </button>
                    <button
                        className={`sidebar-rail-btn ${hoveredTab === "memo" ? "hover-stretch" : ""}`}
                        onClick={() => navigate("/memoboard")}
                        aria-label="Go to Memo Board"
                        onMouseEnter={() => handleTabHoverStart("memo")}
                        onMouseLeave={handleTabHoverEnd}
                    >
                        <Icons.Memo />
                        <span className={`sidebar-rail-btn-label ${hoveredTab === "memo" ? "visible" : ""}`}>Memo Board</span>
                    </button>
                    <button
                        className={`sidebar-rail-btn ${hoveredTab === "user-settings" ? "hover-stretch" : ""}`}
                        onClick={() => setShowUserSettingsModal(true)}
                        aria-label="Open user settings"
                        onMouseEnter={() => handleTabHoverStart("user-settings")}
                        onMouseLeave={handleTabHoverEnd}
                    >
                        <Icons.User />
                        <span className={`sidebar-rail-btn-label ${hoveredTab === "user-settings" ? "visible" : ""}`}>User Settings</span>
                    </button>
                    <button
                        className={`sidebar-rail-btn sidebar-rail-btn-bottom ${hoveredTab === "logout" ? "hover-stretch" : ""}`}
                        onClick={logout}
                        aria-label="Logout"
                        onMouseEnter={() => handleTabHoverStart("logout")}
                        onMouseLeave={handleTabHoverEnd}
                    >
                        <Icons.Off />
                        <span className={`sidebar-rail-btn-label ${hoveredTab === "logout" ? "visible" : ""}`}>Logout</span>
                    </button>
                </div>

                <div className="sidebar-panel">

                    <div className="sidebar-section logo-section">
                        <img src="/logo.webp" alt="ToDoHi Logo" className="sidebar-logo" />
                        <p className="sidebar-quote">"{currentQuote}"</p>
                    </div>

                    <div className="sidebar-section">
                        <p className="sidebar-panel-section-label">Navigation</p>
                        <button
                            className="sidebar-btn"
                            onClick={() => {
                                closeSidebar();
                                navigate("/");
                            }}
                        >
                            Dashboard
                        </button>
                        <button
                            className="sidebar-btn"
                            onClick={() => {
                                closeSidebar();
                                navigate("/memoboard");
                            }}
                        >
                            Memo Board
                        </button>
                    </div>

                    <div className="sidebar-section">
                        <p className="sidebar-panel-section-label">Settings</p>
                        <div className="reset-hour-wrapper">
                            <DropdownMenu
                                label="Reset Hour"
                                value={`${resetHour}:00`}
                                options={RESET_HOUR_OPTIONS}
                                onChange={handleResetHourChange}
                                maxHeight={180}
                            />

                            <div className="reset-hour-help">
                                <ResetHourHelpIcon onClick={() => setShowResetHourGuide(true)} />
                            </div>
                        </div>

                        <DropdownMenu
                            label="Quote Preferences"
                            value={quotePref}
                            options={QUOTE_OPTIONS}
                            onChange={handleQuotePrefChange}
                            maxHeight={240}
                        />
                    </div>

                    <div className="sidebar-section failed-section">
                        <p className="sidebar-panel-section-label">Status</p>
                        <h4 className="section-title">Failed Tasks Yesterday</h4>
                        <div className="failed-task-container">
                            <ul className="failed-task-list">
                                {!failedTaskSnapshot && <li className="failed-task-empty">No Failed Tasks Yesterday... Congratz ^o^</li>}
                                {failedTaskSnapshot?.tasks.map((task) => (
                                    <li key={task._id} className="failed-task-item">
                                        {task.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="sidebar-bottom">
                        <div className="profile-row">
                            <img src="/default-profile.webp" alt="Profile" className="sidebar-profile-pic" />
                            <p className="profile-name">{username}</p>
                        </div>

                        <button className="logout-btn" onClick={logout}>
                            Logout
                        </button>

                        <div className="sidebar-footer-row">
                            <footer className="sidebar-footer">© 2025 ToDoHi</footer>
                            <div className="sidebar-theme-toggle">
                                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    className="sidebar-close-notch"
                    onClick={closeSidebar}
                    aria-label="Collapse sidebar"
                    title="Collapse sidebar"
                >
                    <Icons.Menu />
                </button>
            </aside>

            {showResetHourGuide && <ResetHourGuideModal onClose={() => setShowResetHourGuide(false)} />}
            {showUserSettingsModal && <UserSettingsModal onClose={() => setShowUserSettingsModal(false)} />}
        </>
    );
};

export default Sidebar;



