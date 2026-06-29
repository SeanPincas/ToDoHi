import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import "./DashboardPage.css";

import DashboardStats from "../components/dashboard/DashboardStats";
import TodoPreview from "../components/dashboard/TodoPreview";
import MemoPreview from "../components/dashboard/MemoPreview";
import DailyPlanPreview from "../components/dashboard/DailyPlanPreview";
import strawhatIcon from "../assets/strawhat.webp";
import UserSettingsModal from "../components/common/modals/UserSettingsModal";
import { Icons } from "../styles/iconLibrary";

import { useTodo } from '../context/TodoContext';
import { useAuthContext } from '../context/AuthContext';
import { useQuote } from '../context/QuoteContext';
import { getRepeatReviewApi } from "../api/taskApi";
import {
    clearExpiredTaskReviewSnooze,
    getTaskReviewSnoozedUntil,
    isTaskReviewCycleHandled,
} from "../utils/repeatReview";

const MOBILE_BOOK_MODE_QUERY = "(max-width: 1023px)";
const MOBILE_BOOK_EDGE_SWIPE_ZONE_PX = 42;
const MOBILE_BOOK_SWIPE_DISTANCE_PX = 54;
const MOBILE_BOOK_VERTICAL_TOLERANCE_PX = 28;
const MOBILE_BOTTOM_NAV_SWIPE_DISTANCE_PX = 34;

const MOBILE_DASHBOARD_PAGE_IDS = ["overview", "planner-memos", "insights"] as const;
type MobileDashboardPageId = (typeof MOBILE_DASHBOARD_PAGE_IDS)[number];

type MobileDashboardPage = {
    id: MobileDashboardPageId;
    index: 0 | 1 | 2;
    label: string;
};

const Dashboard: React.FC = () => {
    const { openModal } = useTodo();
    const { user, logout } = useAuthContext();
    const { currentQuote } = useQuote();
    const navigate = useNavigate();

    const [time12, setTime12] = useState("");
    const [time24, setTime24] = useState("");
    const [currentDate, setCurrentDate] = useState("");
    const [repeatChecked, setRepeatChecked] = useState(false);
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
    const [isMobileBottomNavExpanded, setIsMobileBottomNavExpanded] = useState(true);
    const [isMobileBookMode, setIsMobileBookMode] = useState(() => (
        typeof window !== "undefined"
            ? window.matchMedia(MOBILE_BOOK_MODE_QUERY).matches
            : false
    ));
    const [activeMobilePageIndex, setActiveMobilePageIndex] = useState<0 | 1 | 2>(0);
    const dashboardPageRef = useRef<HTMLDivElement | null>(null);
    const mobileBookStageRef = useRef<HTMLDivElement | null>(null);
    const settingsMenuRef = useRef<HTMLDivElement | null>(null);
    const swipeStateRef = useRef<{
        active: boolean;
        startX: number;
        startY: number;
        lock: "pending" | "horizontal" | "vertical";
        edge: "left" | "right" | null;
        pointerId: number;
    } | null>(null);
    const bottomNavSwipeStateRef = useRef<{
        active: boolean;
        startX: number;
        startY: number;
        pointerId: number;
    } | null>(null);
    const mobileShellTapStateRef = useRef<{
        pointerId: number;
        startX: number;
        startY: number;
    } | null>(null);

    const mobileDashboardPages = useMemo<MobileDashboardPage[]>(() => ([
        {
            id: "overview",
            index: 0,
            label: "Overview",
        },
        {
            id: "planner-memos",
            index: 1,
            label: "Planner and Memos",
        },
        {
            id: "insights",
            index: 2,
            label: "Insights",
        },
    ]), []);

    const activeMobilePage = mobileDashboardPages[activeMobilePageIndex] ?? mobileDashboardPages[0];

    const goToMobilePage = (pageIndex: number) => {
        const clampedIndex = Math.max(0, Math.min(mobileDashboardPages.length - 1, pageIndex)) as 0 | 1 | 2;
        setActiveMobilePageIndex(clampedIndex);
    };

    const goToNextMobilePage = () => {
        setActiveMobilePageIndex((currentIndex) => (
            Math.min(mobileDashboardPages.length - 1, currentIndex + 1) as 0 | 1 | 2
        ));
    };

    const goToPreviousMobilePage = () => {
        setActiveMobilePageIndex((currentIndex) => (
            Math.max(0, currentIndex - 1) as 0 | 1 | 2
        ));
    };

    const closeMobileBottomMenus = () => {
        setIsSettingsMenuOpen(false);
    };

    const resetBottomNavSwipeState = () => {
        bottomNavSwipeStateRef.current = null;
    };

    const handleMobileMemoBoardOpen = () => {
        closeMobileBottomMenus();
        navigate("/memoboard");
    };

    const handleMobileTodoOpen = () => {
        closeMobileBottomMenus();
        goToMobilePage(0);
    };

    const handleMobilePlannerOpen = () => {
        closeMobileBottomMenus();
        goToMobilePage(1);
    };

    const handleMobileSidebarOpen = () => {
        closeMobileBottomMenus();
        setIsMobileBottomNavExpanded(false);
        window.dispatchEvent(new CustomEvent("todohi:open-sidebar-bookmark"));
    };

    const handleMobileUserSettingsOpen = () => {
        closeMobileBottomMenus();
        setShowUserSettingsModal(true);
    };

    const handleMobileLogout = () => {
        closeMobileBottomMenus();
        logout();
    };

    const isMobileEmptySpaceInteractiveTarget = (target: HTMLElement | null) => {
        if (!target) return true;

        return Boolean(target.closest(
            [
                "button",
                "input",
                "select",
                "textarea",
                "a",
                "[role='button']",
                "[role='tab']",
                ".dropdown-menu",
                ".dropdown-trigger",
                ".mobile-book-bottom-nav",
                ".dashboard-greeting-bar",
                ".mobile-book-card-shell",
                ".dashboard-stats-wrapper",
                ".right-page-chart-stack",
                ".mobile-book-pagination-row",
                ".mobile-book-page-nav",
                ".mobile-book-indicators",
                ".mobile-book-indicator",
            ].join(", ")
        ));
    };

    const handleMobileEmptySpacePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isMobileBookMode) return;

        const target = event.target as HTMLElement | null;
        if (isMobileEmptySpaceInteractiveTarget(target)) {
            mobileShellTapStateRef.current = null;
            return;
        }

        mobileShellTapStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
        };
    };

    const handleMobileEmptySpacePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!isMobileBookMode) return;

        const tapState = mobileShellTapStateRef.current;
        mobileShellTapStateRef.current = null;

        if (!tapState || tapState.pointerId !== event.pointerId) return;

        const target = event.target as HTMLElement | null;
        if (isMobileEmptySpaceInteractiveTarget(target)) return;

        const deltaX = Math.abs(event.clientX - tapState.startX);
        const deltaY = Math.abs(event.clientY - tapState.startY);

        if (deltaX > 10 || deltaY > 10) return;

        setIsMobileBottomNavExpanded((current) => {
            const next = !current;
            if (!next) {
                closeMobileBottomMenus();
            }
            return next;
        });
    };

    const handleMobileEmptySpacePointerCancel = () => {
        mobileShellTapStateRef.current = null;
    };

    const resetSwipeState = () => {
        swipeStateRef.current = null;
    };

    const handleMobileBookTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobileBookMode || event.touches.length !== 1) {
            resetSwipeState();
            return;
        }

        const stage = mobileBookStageRef.current;
        const touch = event.touches[0];
        if (!stage || !touch) {
            resetSwipeState();
            return;
        }

        const rect = stage.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const isLeftEdge = offsetX <= MOBILE_BOOK_EDGE_SWIPE_ZONE_PX;
        const isRightEdge = offsetX >= rect.width - MOBILE_BOOK_EDGE_SWIPE_ZONE_PX;

        if (!isLeftEdge && !isRightEdge) {
            resetSwipeState();
            return;
        }

        const target = event.target as HTMLElement | null;
        const interactiveTarget = target?.closest(
            "button, input, select, textarea, a, [role='button'], [role='tab'], .dropdown-menu, .dropdown-trigger"
        );

        if (interactiveTarget) {
            resetSwipeState();
            return;
        }

        swipeStateRef.current = {
            active: true,
            startX: touch.clientX,
            startY: touch.clientY,
            lock: "pending",
            edge: isLeftEdge ? "left" : "right",
            pointerId: touch.identifier,
        };
    };

    const handleMobileBookTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
        const swipeState = swipeStateRef.current;
        if (!swipeState?.active) return;

        const touch = Array.from(event.touches).find((entry) => entry.identifier === swipeState.pointerId);
        if (!touch) return;

        const deltaX = touch.clientX - swipeState.startX;
        const deltaY = touch.clientY - swipeState.startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (swipeState.lock === "pending") {
            if (absDeltaY > MOBILE_BOOK_VERTICAL_TOLERANCE_PX && absDeltaY > absDeltaX) {
                swipeStateRef.current = {
                    ...swipeState,
                    lock: "vertical",
                };
                return;
            }

            if (absDeltaX > 12 && absDeltaX > absDeltaY) {
                swipeStateRef.current = {
                    ...swipeState,
                    lock: "horizontal",
                };
            }
        }

        if (swipeStateRef.current?.lock === "horizontal") {
            event.preventDefault();
        }
    };

    const handleMobileBookTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        const swipeState = swipeStateRef.current;
        if (!swipeState?.active) {
            resetSwipeState();
            return;
        }

        const touch = Array.from(event.changedTouches).find((entry) => entry.identifier === swipeState.pointerId);
        if (!touch) {
            resetSwipeState();
            return;
        }

        const deltaX = touch.clientX - swipeState.startX;
        const deltaY = touch.clientY - swipeState.startY;
        const absDeltaY = Math.abs(deltaY);

        if (
            swipeState.lock === "horizontal" &&
            absDeltaY <= MOBILE_BOOK_VERTICAL_TOLERANCE_PX
        ) {
            if (deltaX <= -MOBILE_BOOK_SWIPE_DISTANCE_PX && activeMobilePageIndex < mobileDashboardPages.length - 1) {
                goToNextMobilePage();
            } else if (deltaX >= MOBILE_BOOK_SWIPE_DISTANCE_PX && activeMobilePageIndex > 0) {
                goToPreviousMobilePage();
            }
        }

        resetSwipeState();
    };

    const handleMobileBookTouchCancel = () => {
        resetSwipeState();
    };

    const handleMobileNavGestureStart = (event: React.TouchEvent<HTMLDivElement>) => {
        if (!isMobileBookMode || event.touches.length !== 1) {
            resetBottomNavSwipeState();
            return;
        }

        const touch = event.touches[0];
        if (!touch) {
            resetBottomNavSwipeState();
            return;
        }

        const target = event.target as HTMLElement | null;
        const interactiveTarget = target?.closest(
            "button, input, select, textarea, a, [role='button'], [role='tab'], .dropdown-menu, .dropdown-trigger, .mobile-book-bottom-nav"
        );

        if (interactiveTarget) {
            resetBottomNavSwipeState();
            return;
        }

        bottomNavSwipeStateRef.current = {
            active: true,
            startX: touch.clientX,
            startY: touch.clientY,
            pointerId: touch.identifier,
        };
    };

    const handleMobileNavGestureEnd = (event: React.TouchEvent<HTMLDivElement>) => {
        const swipeState = bottomNavSwipeStateRef.current;
        if (!swipeState?.active) {
            resetBottomNavSwipeState();
            return;
        }

        const touch = Array.from(event.changedTouches).find((entry) => entry.identifier === swipeState.pointerId);
        if (!touch) {
            resetBottomNavSwipeState();
            return;
        }

        const deltaX = touch.clientX - swipeState.startX;
        const deltaY = touch.clientY - swipeState.startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        if (absDeltaY >= MOBILE_BOTTOM_NAV_SWIPE_DISTANCE_PX && absDeltaY > absDeltaX) {
            if (deltaY < 0) {
                setIsMobileBottomNavExpanded(false);
                closeMobileBottomMenus();
            } else if (deltaY > 0) {
                setIsMobileBottomNavExpanded(true);
            }
        }

        resetBottomNavSwipeState();
    };

    useEffect(() => {
        if (!user) return;
        if (repeatChecked) return;

        const checkRepeatReview = async () => {
            try {
                clearExpiredTaskReviewSnooze();
                const snoozedUntil = getTaskReviewSnoozedUntil();

                if (Number.isFinite(snoozedUntil) && snoozedUntil > Date.now()) {
                    setRepeatChecked(true);
                    return;
                }

                const review = await getRepeatReviewApi();

                if (!review.reviewRequired || review.tasks.length === 0) {
                    setRepeatChecked(true);
                    return;
                }

                if (isTaskReviewCycleHandled(review.cycleKey)) {
                    setRepeatChecked(true);
                    return;
                }

                openModal("repeat", {
                    tasks: review.tasks,
                    cycleKey: review.cycleKey,
                    retentionDays: review.retentionDays,
                    archiveLabel: review.archiveLabel,
                    reviewSource: review.reviewSource ?? "live",
                    summary: review.summary,
                });
            } catch (err) {
                console.error("[DashboardPage] Failed loading repeat review:", err);
            } finally {
                setRepeatChecked(true);
            }
        };

        checkRepeatReview();
    }, [user, repeatChecked, openModal]);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();

            setTime12(now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }));

            setTime24(now.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }));

            setCurrentDate(now.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }));
        };

        updateClock();
        const timer = setInterval(updateClock, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mediaQuery = window.matchMedia(MOBILE_BOOK_MODE_QUERY);
        const handleModeChange = (event: MediaQueryListEvent | MediaQueryList) => {
            setIsMobileBookMode(event.matches);
        };

        handleModeChange(mediaQuery);

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", handleModeChange);
            return () => mediaQuery.removeEventListener("change", handleModeChange);
        }

        mediaQuery.addListener(handleModeChange);
        return () => mediaQuery.removeListener(handleModeChange);
    }, []);

    useEffect(() => {
        setActiveMobilePageIndex((currentIndex) => {
            if (currentIndex < 0) return 0;
            if (currentIndex > 2) return 2;
            return currentIndex;
        });
    }, [isMobileBookMode]);

    useEffect(() => {
        if (!isMobileBookMode) {
            closeMobileBottomMenus();
        }
    }, [isMobileBookMode]);

    useEffect(() => {
        if (!isMobileBookMode) {
            setIsMobileBottomNavExpanded(true);
        }
    }, [isMobileBookMode]);

    useEffect(() => {
        closeMobileBottomMenus();
    }, [activeMobilePageIndex]);

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) return;

            const clickedSettingsMenu = settingsMenuRef.current?.contains(target);

            if (!clickedSettingsMenu) {
                setIsSettingsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("touchstart", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("touchstart", handlePointerDown);
        };
    }, []);

    useEffect(() => {
        const layoutWrapper = dashboardPageRef.current?.closest(".layout-wrapper");
        if (!(layoutWrapper instanceof HTMLElement)) return;

        layoutWrapper.classList.toggle("mobile-dashboard-nav-mode", isMobileBookMode);

        return () => {
            layoutWrapper.classList.remove("mobile-dashboard-nav-mode");
        };
    }, [isMobileBookMode]);

    const renderGreetingBar = () => (
        <div className="dashboard-greeting-bar">
            <div className="dashboard-greeting-top">
                <div className="greeting-left">
                    <h2>Welcome Back!</h2>
                    <p className="greeting-user-row">
                        <span>Hello, {user?.username || "User"}</span>
                        <img
                            src={strawhatIcon}
                            alt=""
                            aria-hidden="true"
                            className="greeting-user-icon"
                        />
                    </p>
                </div>

                <img
                    src="/logo.webp"
                    alt=""
                    aria-hidden="true"
                    className="dashboard-header-logo"
                />

                <div className="greeting-right">
                    <div className="time-row">
                        <span className="time-text">{time12}</span>
                        <span className="time-divider">||</span>
                        <span className="time-text">{time24}</span>
                    </div>

                    <span className="date-text">{currentDate}</span>
                </div>
            </div>

            <div className="dashboard-quote-row">
                <p className="dashboard-quote-text">"{currentQuote}"</p>
            </div>
        </div>
    );

    const renderChartStack = () => (
        <div className="right-page-chart-stack">
            <div className="dashboard-charts right-page-charts">
                <div className="chart-card">Chart #1</div>
                <div className="chart-card">Chart #2</div>
                <div className="chart-card">Chart #3</div>
            </div>
        </div>
    );

    const renderMobileBottomNav = () => (
        <nav
            className={`mobile-book-bottom-nav ${isMobileBottomNavExpanded ? "is-expanded" : "is-minimized"}`}
            aria-label="Mobile dashboard navigation"
        >
            <div className="mobile-book-bottom-nav-inner">
                <button
                    type="button"
                    className="mobile-book-bottom-nav-btn"
                    aria-label="Open sidebar bookmark"
                    onClick={handleMobileSidebarOpen}
                >
                    <Icons.Sidebar className="mobile-book-bottom-nav-icon" />
                    <span className="mobile-book-bottom-nav-label">Sidebar</span>
                </button>

                <button
                    type="button"
                    className="mobile-book-bottom-nav-btn"
                    aria-label="Open memo board"
                    onClick={handleMobileMemoBoardOpen}
                >
                    <Icons.Memo className="mobile-book-bottom-nav-icon" />
                    <span className="mobile-book-bottom-nav-label">Memo</span>
                </button>

                <button
                    type="button"
                    className="mobile-book-bottom-nav-btn mobile-book-bottom-nav-btn-home"
                    aria-label="Go to To-Do page"
                    onClick={handleMobileTodoOpen}
                >
                    <Icons.Todo className="mobile-book-bottom-nav-icon" />
                    <span className="mobile-book-bottom-nav-label">Todo</span>
                </button>

                <button
                    type="button"
                    className="mobile-book-bottom-nav-btn"
                    aria-label="Open planner page"
                    onClick={handleMobilePlannerOpen}
                >
                    <Icons.Planner className="mobile-book-bottom-nav-icon" />
                    <span className="mobile-book-bottom-nav-label">Planner</span>
                </button>

                <div
                    ref={settingsMenuRef}
                    className={`mobile-book-bottom-nav-item mobile-book-bottom-nav-menu-item ${isSettingsMenuOpen ? "is-open" : ""}`}
                >
                    <button
                        type="button"
                        className={`mobile-book-bottom-nav-btn ${isSettingsMenuOpen ? "is-active" : ""}`}
                        aria-haspopup="menu"
                        aria-expanded={isSettingsMenuOpen}
                        aria-label="Open more menu"
                        onClick={() => {
                            setIsSettingsMenuOpen((current) => !current);
                        }}
                    >
                        <Icons.Menu className="mobile-book-bottom-nav-icon" />
                        <span className="mobile-book-bottom-nav-label">More</span>
                    </button>

                    <div className="mobile-book-bottom-nav-menu mobile-book-bottom-nav-menu-settings" role="menu" aria-label="More actions">
                        <button
                            type="button"
                            className="mobile-book-bottom-nav-menu-btn"
                            role="menuitem"
                            onClick={handleMobileUserSettingsOpen}
                        >
                            <Icons.User className="mobile-book-bottom-nav-menu-icon" />
                            <span>User Settings</span>
                        </button>
                        <button
                            type="button"
                            className="mobile-book-bottom-nav-menu-btn mobile-book-bottom-nav-menu-btn-danger"
                            role="menuitem"
                            onClick={handleMobileLogout}
                        >
                            <Icons.Off className="mobile-book-bottom-nav-menu-icon" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );

    return (
        <div
            ref={dashboardPageRef}
            className={`dashboard-page ${isMobileBookMode ? "mobile-book-mode" : "desktop-book-mode"}`}
            data-dashboard-mode={isMobileBookMode ? "mobile-book" : "desktop-book"}
            data-active-mobile-page={activeMobilePage.id}
            data-active-mobile-page-index={activeMobilePageIndex + 1}
            data-mobile-page-count={mobileDashboardPages.length}
            onTouchStart={handleMobileNavGestureStart}
            onTouchEnd={handleMobileNavGestureEnd}
            onTouchCancel={resetBottomNavSwipeState}
        >
            <div className="dashboard-container">
                {!isMobileBookMode ? (
                    <div
                        className="opened-book-spread"
                        data-mobile-active-page={activeMobilePage.id}
                        data-mobile-active-page-label={activeMobilePage.label}
                    >
                        <section className="book-page left-book-page">
                            {renderGreetingBar()}

                            <div className="left-page-stack">
                                <div className="bento-box left-page-todo">
                                    <div className="bento-scroll todo-pane-scroll">
                                        <TodoPreview />
                                    </div>
                                </div>

                                <div className="bento-box left-page-memo">
                                    <div className="bento-scroll memo-pane-scroll">
                                        <MemoPreview />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="book-spine" aria-hidden="true" />

                        <section className="book-page right-book-page">
                            <div className="dashboard-stats-wrapper">
                                <DashboardStats />
                            </div>

                            <div className="bento-box right-page-planner">
                                <div className="bento-scroll">
                                    <DailyPlanPreview />
                                </div>
                            </div>

                            {renderChartStack()}
                        </section>
                    </div>
                ) : (
                    <div
                        className="mobile-book-shell"
                        onPointerDown={handleMobileEmptySpacePointerDown}
                        onPointerUp={handleMobileEmptySpacePointerUp}
                        onPointerCancel={handleMobileEmptySpacePointerCancel}
                    >
                        <div className="mobile-book-open-spread">
                            <div className="mobile-book-main-page">
                                <div
                                    ref={mobileBookStageRef}
                                    className="mobile-book-stage"
                                    data-mobile-active-page={activeMobilePage.id}
                                    data-mobile-active-page-label={activeMobilePage.label}
                                    onTouchStart={handleMobileBookTouchStart}
                                    onTouchMove={handleMobileBookTouchMove}
                                    onTouchEnd={handleMobileBookTouchEnd}
                                    onTouchCancel={handleMobileBookTouchCancel}
                                >
                                    <div
                                        className="mobile-book-track"
                                        style={{ transform: `translateX(-${activeMobilePageIndex * 100}%)` }}
                                    >
                                        <section
                                            className="mobile-book-page mobile-book-page-overview"
                                            data-mobile-page="overview"
                                            aria-label="Dashboard Overview"
                                        >
                                            {renderGreetingBar()}

                                            <div className="mobile-book-page-stack">
                                                <div className="bento-box left-page-todo mobile-book-card-shell">
                                                    <div className="bento-scroll todo-pane-scroll mobile-book-card-scroll">
                                                        <TodoPreview />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section
                                            className="mobile-book-page mobile-book-page-planner-memos"
                                            data-mobile-page="planner-memos"
                                            aria-label="Planner and Memos"
                                        >
                                            <div className="mobile-book-page-stack mobile-book-page-stack-secondary">
                                                <div className="bento-box right-page-planner mobile-book-card-shell">
                                                    <div className="bento-scroll mobile-book-card-scroll">
                                                        <DailyPlanPreview />
                                                    </div>
                                                </div>

                                                <div className="bento-box left-page-memo mobile-book-card-shell">
                                                    <div className="bento-scroll memo-pane-scroll mobile-book-card-scroll">
                                                        <MemoPreview />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section
                                            className="mobile-book-page mobile-book-page-insights"
                                            data-mobile-page="insights"
                                            aria-label="Insights"
                                        >
                                            <div className="mobile-book-page-stack mobile-book-page-stack-tertiary">
                                                <div className="dashboard-stats-wrapper mobile-book-stats-wrapper">
                                                    <DashboardStats />
                                                </div>

                                                {renderChartStack()}
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                <div className="mobile-book-pagination-row">
                                    <button
                                        type="button"
                                        className={`mobile-book-page-nav mobile-book-page-nav-prev ${activeMobilePageIndex <= 0 ? "is-disabled" : ""}`}
                                        aria-label={
                                            activeMobilePageIndex <= 0
                                                ? "First dashboard page"
                                                : `Go to ${mobileDashboardPages[activeMobilePageIndex - 1]?.label ?? "previous dashboard page"}`
                                        }
                                        disabled={activeMobilePageIndex <= 0}
                                        onClick={goToPreviousMobilePage}
                                    >
                                        <Icons.ArrowLeft />
                                    </button>

                                    <div
                                        className="mobile-book-indicators"
                                        role="tablist"
                                        aria-label="Dashboard mobile pages"
                                    >
                                        {mobileDashboardPages.map((page) => {
                                            const isActive = page.index === activeMobilePageIndex;
                                            return (
                                                <button
                                                    key={page.id}
                                                    type="button"
                                                    role="tab"
                                                    aria-selected={isActive}
                                                    aria-label={`Go to ${page.label}`}
                                                    className={`mobile-book-indicator ${isActive ? "active" : ""}`}
                                                    onClick={() => goToMobilePage(page.index)}
                                                >
                                                    <span className="mobile-book-indicator-bar" />
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        className={`mobile-book-page-nav mobile-book-page-nav-next ${activeMobilePageIndex >= mobileDashboardPages.length - 1 ? "is-disabled" : ""}`}
                                        aria-label={
                                            activeMobilePageIndex >= mobileDashboardPages.length - 1
                                                ? "Last dashboard page"
                                                : `Go to ${mobileDashboardPages[activeMobilePageIndex + 1]?.label ?? "next dashboard page"}`
                                        }
                                        disabled={activeMobilePageIndex >= mobileDashboardPages.length - 1}
                                        onClick={goToNextMobilePage}
                                    >
                                        <Icons.ArrowLeft />
                                    </button>
                                </div>
                            </div>

                            <div className="mobile-book-right-preview" aria-hidden="true">
                                <div className="mobile-book-right-preview-sheet">
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isMobileBookMode ? renderMobileBottomNav() : null}

            {showUserSettingsModal ? (
                <UserSettingsModal onClose={() => setShowUserSettingsModal(false)} />
            ) : null}
        </div>
    );
};

export default Dashboard;
