import { useState, useEffect, useRef, useCallback } from "react";
import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "../../styles/iconLibrary";

import { type QuoteCategory } from "../../utils/quoteUtils";
import {
    getFailedTasksYesterdayPreview,
    REPEAT_REVIEW_REFRESH_EVENT,
    type FailedYesterdayItem
} from "../../utils/repeatReview";

import { useAuthContext } from "../../context/AuthContext";
import { getMe } from "../../api/userApi";

import ThemeToggle from "../common/themeToggle/ThemeToggle";
import {
    getRandomQuoteApi,
    getQuotesByCategoryApi,
} from "../../api/quoteApi";
import { getBookmarkTheme } from "../../utils/bookmarkStyles";
import anahawImage from "../../assets/anahaw.webp";

import UserSettingsModal from "../common/modals/UserSettingsModal";
import { useTodo } from "../../context/TodoContext";

const getProfilePictureSrc = (profilePicture?: string) => {
    if (!profilePicture) return "/default-profile.webp";
    if (profilePicture.startsWith("http")) return profilePicture;
    return `http://localhost:3500${profilePicture}`;
};

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);
    const [username, setUsername] = useState("Username");
    const [currentQuote, setCurrentQuote] = useState<string>("Loading quote...");
    const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
    const [sidebarMetrics, setSidebarMetrics] = useState<React.CSSProperties>({});
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { logout, theme, toggleTheme, user } = useAuthContext();
    const { openModal } = useTodo();
    const bookmarkTheme = getBookmarkTheme(user?.preference?.bookmarkStyle);

    const [failedTasksYesterday, setFailedTasksYesterday] = useState<FailedYesterdayItem[]>([]);

    const hoverCollapseTimeout = useRef<number | null>(null);
    const sidebarRef = useRef<HTMLElement | null>(null);
    const dragStateRef = useRef<{
        startX: number;
        startOffset: number;
        minOffset: number;
        maxOffset: number;
    } | null>(null);
    const dragBoundsRef = useRef({
        minOffset: -64,
        maxOffset: 0,
    });

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
        }, 1150);
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                const user = await getMe();

                if (user?.username) {
                    setUsername(user.username);
                }

                if (Array.isArray(user?.preference?.quoteCategory)) {
                    const preferred = user.preference.quoteCategory[0];
                    const selected = preferred ? preferred : "Random";
                    fetchQuote(selected as QuoteCategory);
                }

                const failedPreview = await getFailedTasksYesterdayPreview();
                setFailedTasksYesterday(failedPreview);
            } catch (err) {
                console.error("Sidebar load failed:", err);
            }
        };

        loadUser();

        const handleRepeatReviewRefresh = () => {
            loadUser();
        };

        window.addEventListener(REPEAT_REVIEW_REFRESH_EVENT, handleRepeatReviewRefresh);

        return () => {
            window.removeEventListener(REPEAT_REVIEW_REFRESH_EVENT, handleRepeatReviewRefresh);
        };
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

    const measureSidebarBounds = useCallback(() => {
        const shell = sidebarRef.current?.closest(".book-shell") as HTMLElement | null;
        const dashboardContainer = document.querySelector(".dashboard-container") as HTMLElement | null;
        const notebookSheet = document.querySelector(".notebook-sheet") as HTMLElement | null;
        const targetSource = dashboardContainer ?? notebookSheet;
        const railAnchorSource = notebookSheet ?? targetSource;

        if (!shell || !targetSource || !railAnchorSource) return;

        const shellRect = shell.getBoundingClientRect();
        const targetRect = targetSource.getBoundingClientRect();
        const railAnchorRect = railAnchorSource.getBoundingClientRect();
        const computedSidebar = sidebarRef.current ? window.getComputedStyle(sidebarRef.current) : null;
        const railWidth = computedSidebar ? Number.parseFloat(computedSidebar.getPropertyValue("--rail-width")) || 58 : 58;
        const railEdgeOverlap = computedSidebar ? Number.parseFloat(computedSidebar.getPropertyValue("--rail-edge-overlap")) || 1 : 1;
        const panelWidth = computedSidebar ? Number.parseFloat(computedSidebar.getPropertyValue("--panel-width")) || 264 : 264;
        const topPx = Math.max(0, targetRect.top - shellRect.top);
        const heightPx = Math.max(0, targetRect.height);
        const baseLeft = railAnchorRect.left - shellRect.left - railWidth - railEdgeOverlap;
        const minLeft = targetRect.left - shellRect.left - railWidth - Math.min(Math.max(railWidth * 0.9, 44), railWidth + 18);
        const maxLeft = Math.max(
            baseLeft,
            targetRect.right - shellRect.left - railWidth - panelWidth - 6
        );
        const minOffset = minLeft - baseLeft;
        const maxOffset = maxLeft - baseLeft;

        dragBoundsRef.current = {
            minOffset,
            maxOffset,
        };

        setSidebarMetrics({
            ["--sidebar-top" as string]: `${topPx}px`,
            ["--sidebar-height" as string]: `${heightPx}px`,
            ["--sidebar-base-left" as string]: `${baseLeft}px`,
            ["--sidebar-min-offset" as string]: `${minOffset}px`,
            ["--sidebar-max-offset" as string]: `${maxOffset}px`,
        });

        setDragOffset((currentOffset) => Math.min(maxOffset, Math.max(minOffset, currentOffset)));
    }, []);

    useEffect(() => {
        measureSidebarBounds();

        const shell = sidebarRef.current?.closest(".book-shell") as HTMLElement | null;
        const dashboardContainer = document.querySelector(".dashboard-container") as HTMLElement | null;
        const notebookSheet = document.querySelector(".notebook-sheet") as HTMLElement | null;
        const observedNodes = [shell, dashboardContainer, notebookSheet].filter(Boolean) as HTMLElement[];

        if (observedNodes.length === 0) return;

        const resizeObserver = new ResizeObserver(() => {
            measureSidebarBounds();
        });

        observedNodes.forEach((node) => resizeObserver.observe(node));
        window.addEventListener("resize", measureSidebarBounds);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", measureSidebarBounds);
        };
    }, [measureSidebarBounds, location.pathname]);

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (event: PointerEvent) => {
            const dragState = dragStateRef.current;
            if (!dragState) return;

            const nextOffset = dragState.startOffset + (event.clientX - dragState.startX);
            setDragOffset(Math.min(dragState.maxOffset, Math.max(dragState.minOffset, nextOffset)));
        };

        const handlePointerUp = () => {
            dragStateRef.current = null;
            setIsDragging(false);
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [isDragging]);

    const handleDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) return;

        dragStateRef.current = {
            startX: event.clientX,
            startOffset: dragOffset,
            minOffset: dragBoundsRef.current.minOffset,
            maxOffset: dragBoundsRef.current.maxOffset,
        };

        setIsDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
    };

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

    return (
        <>
            <aside
                ref={sidebarRef}
                className={`sidebar ${open ? "open" : "collapsed"} ${isDragging ? "dragging" : ""}`}
                style={{
                    ...sidebarMetrics,
                    ["--sidebar-drag-offset" as string]: `${dragOffset}px`,
                    ["--sidebar-bookmark-burger-icon" as string]: bookmarkTheme.burgerIcon,
                    ["--sidebar-bookmark-burger-hover" as string]: bookmarkTheme.burgerHover,
                    ["--sidebar-bookmark-drag-idle" as string]: bookmarkTheme.dragHandleIdle,
                    ["--sidebar-bookmark-drag-hover" as string]: bookmarkTheme.dragHandleHover,
                }}
            >
                <button
                    type="button"
                    className="sidebar-drag-handle"
                    aria-label="Drag sidebar bookmark horizontally"
                    onPointerDown={handleDragStart}
                />
                <div className="sidebar-tab sidebar-tab-top" aria-label="Sidebar quick actions">
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
                        className={`sidebar-rail-btn ${hoveredTab === "task-archive" ? "hover-stretch" : ""}`}
                        onClick={() => openModal("taskArchive")}
                        aria-label="Open Task Archive"
                        onMouseEnter={() => handleTabHoverStart("task-archive")}
                        onMouseLeave={handleTabHoverEnd}
                    >
                        <Icons.Archive />
                        <span className={`sidebar-rail-btn-label ${hoveredTab === "task-archive" ? "visible" : ""}`}>Task Archive</span>
                    </button>
                </div>

                <div className="sidebar-tab sidebar-tab-bottom-group" aria-label="Sidebar account quick actions">
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
                        className={`sidebar-rail-btn sidebar-rail-btn-logout ${hoveredTab === "logout" ? "hover-stretch" : ""}`}
                        onClick={logout}
                        aria-label="Logout"
                        onMouseEnter={() => handleTabHoverStart("logout")}
                        onMouseLeave={handleTabHoverEnd}
                    >
                        <Icons.Off />
                        <span className={`sidebar-rail-btn-label ${hoveredTab === "logout" ? "visible" : ""}`}>Logout</span>
                    </button>
                </div>

                <div
                    className="sidebar-panel"
                    style={{
                        ["--sidebar-bookmark-image" as string]: `url("${bookmarkTheme.image}")`,
                        ["--sidebar-bookmark-overlay-top" as string]: bookmarkTheme.overlayTop,
                        ["--sidebar-bookmark-overlay-bottom" as string]: bookmarkTheme.overlayBottom,
                        ["--sidebar-bookmark-ink" as string]: bookmarkTheme.ink,
                        ["--sidebar-bookmark-muted-ink" as string]: bookmarkTheme.mutedInk,
                        ["--sidebar-bookmark-border" as string]: bookmarkTheme.border,
                        ["--sidebar-bookmark-surface" as string]: bookmarkTheme.surface,
                        ["--sidebar-bookmark-surface-hover" as string]: bookmarkTheme.surfaceHover,
                        ["--sidebar-bookmark-soft-surface" as string]: bookmarkTheme.softSurface,
                        ["--sidebar-bookmark-surface-ink" as string]: bookmarkTheme.surfaceInk,
                        ["--sidebar-bookmark-surface-muted-ink" as string]: bookmarkTheme.surfaceMutedInk,
                        ["--sidebar-bookmark-surface-border" as string]: bookmarkTheme.surfaceBorder,
                        ["--sidebar-bookmark-divider" as string]: bookmarkTheme.divider,
                        ["--sidebar-bookmark-heading-border" as string]: bookmarkTheme.headingBorder,
                        ["--sidebar-bookmark-guide" as string]: bookmarkTheme.guide,
                        ["--sidebar-bookmark-guide-hover" as string]: bookmarkTheme.guideHover,
                        ["--sidebar-bookmark-logo-halo-inner" as string]: bookmarkTheme.logoHaloInner,
                        ["--sidebar-bookmark-logo-halo-outer" as string]: bookmarkTheme.logoHaloOuter,
                        ["--sidebar-bookmark-button-surface" as string]: bookmarkTheme.buttonSurface,
                        ["--sidebar-bookmark-button-surface-hover" as string]: bookmarkTheme.buttonSurfaceHover,
                        ["--sidebar-bookmark-profile-surface" as string]: bookmarkTheme.profileWrapperSurface,
                        ["--sidebar-bookmark-footer-ink" as string]: bookmarkTheme.footerInk,
                        ["--sidebar-bookmark-toggle-border" as string]: bookmarkTheme.toggleBorder,
                        ["--blue-dark" as string]: bookmarkTheme.surfaceBorder,
                        ["--text-main" as string]: bookmarkTheme.surfaceInk,
                        ["--white" as string]: bookmarkTheme.surface,
                        ["--blue-light" as string]: bookmarkTheme.softSurface,
                        ["--btn-primary-hover" as string]: bookmarkTheme.surfaceHover,
                        ["--paper-bg" as string]: bookmarkTheme.surface,
                        ["--guide-accent" as string]: bookmarkTheme.guide,
                        ["--guide-accent-hover" as string]: bookmarkTheme.guideHover,
                    }}
                >
                    <button
                        className="sidebar-panel-burger"
                        onClick={closeSidebar}
                        aria-label="Collapse sidebar"
                        title="Collapse sidebar"
                    >
                        <Icons.Menu />
                    </button>

                    <div className="sidebar-section logo-section">
                        <div className="sidebar-logo-wrapper" aria-hidden="true" />
                        <img src="/logo.webp" alt="ToDoHi Logo" className="sidebar-logo" />
                        <div className="sidebar-quote-shell">
                            <p className="sidebar-quote">"{currentQuote}"</p>
                        </div>
                    </div>

                    <div className="sidebar-divider" aria-hidden="true" />

                    <div className="sidebar-section">
                        <h4 className="section-title">Navigation</h4>
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

                    <div className="sidebar-divider" aria-hidden="true" />

                    <div className="sidebar-section sidebar-archive-section">
                        <button
                            className="sidebar-btn"
                            onClick={() => {
                                closeSidebar();
                                openModal("taskArchive");
                            }}
                        >
                            Task Archive
                        </button>
                    </div>

                    <div className="sidebar-divider" aria-hidden="true" />

                    <div className="sidebar-section failed-section">
                        <h4 className="section-title">Failed Tasks Yesterday</h4>
                        <div className="failed-task-container">
                            <ul className="failed-task-list">
                                {failedTasksYesterday.length === 0 && <li className="failed-task-empty">No Failed Tasks Yesterday... Congratz ^o^</li>}
                                {failedTasksYesterday.map((task) => (
                                    <li key={task._id} className="failed-task-item">
                                        {task.title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="sidebar-bottom">
                        <div className="sidebar-account-wrapper">
                            <button
                                type="button"
                                className="profile-row"
                                onClick={() => setShowUserSettingsModal(true)}
                                aria-label="Open user settings"
                            >
                                <img
                                    src={getProfilePictureSrc(user?.profilePicture)}
                                    alt="Profile"
                                    className="sidebar-profile-pic"
                                />
                                <p className="profile-name">{username}</p>
                                <img src={anahawImage} alt="" className="profile-anahaw-icon" aria-hidden="true" />
                            </button>

                            <button className="logout-btn" onClick={logout}>
                                <Icons.Off />
                                Logout
                            </button>
                        </div>

                        <div className="sidebar-footer-row">
                            <footer className="sidebar-footer">� 2025 ToDoHi</footer>
                            <span className="sidebar-footer-separator" aria-hidden="true">|</span>
                            <div className="sidebar-theme-toggle">
                                <ThemeToggle theme={theme} onToggle={toggleTheme} />
                            </div>
                        </div>
                    </div>
                </div>

            </aside>

            {showUserSettingsModal && <UserSettingsModal onClose={() => setShowUserSettingsModal(false)} />}
        </>
    );
};

export default Sidebar;




