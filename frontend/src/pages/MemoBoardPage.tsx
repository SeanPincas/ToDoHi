// ============================================================================
// MemoBoardPage.tsx
// ============================================================================

import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { updateMemoLayout } from "../api/memoApi";
import { updateUserPreferences } from "../api/userApi";
import { useMemoContext } from "../context/MemoContext";
import { useAuthContext } from "../context/AuthContext";
import DropdownMenu, { type DropdownOption } from "../components/common/dropdownMenu/DropdownMenu";
import { Icons } from "../styles/iconLibrary";
import {
    DEFAULT_FRAME_STYLE,
    FRAME_STYLE_LABELS,
    FRAME_STYLE_OPTIONS,
    loadFrameStyleAsset,
    normalizeFrameStyle,
} from "../utils/frameStyles";
import {
    getWallpaperTheme,
    WALLPAPER_STYLE_LABELS,
    WALLPAPER_STYLE_OPTIONS,
} from "../utils/wallpaperStyles";

import "./MemoBoardPage.css";

import { DndContext, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core";
import DraggableMemoItem from "../components/memo/DraggableMemoItem";
import { computeNewPinPct } from "../utils/memoUtils/memoPosition";
import { getMemoBoardMetrics } from "../utils/memoUtils/memoBoardMetrics";

// ----------------------------------------------------------------------------
// PAGE COMPONENT
// ----------------------------------------------------------------------------

const MemoBoardPage: React.FC = () => {
    const { user, refreshUser } = useAuthContext();
    const {
        memos,
        loading,
        boardMode,
        setBoardMode,
        openModal,
        moveMemo,
        setActiveMemoId,

        isMemoAtEdge,

        bringMemoForward,
        sendMemoBackward,
        bringMemoToTop,

        activeMemoId,

        buildLayoutPayload,
    } = useMemoContext();

    const navigate = useNavigate();
    const location = useLocation();

    // Memo id passed from MemoPreview via navigate("/memoboard", { state })
    const openMemoId = (location.state as any)?.openMemoId ?? null;
    const openAddMemo = Boolean((location.state as any)?.openAddMemo);

    // -------------------------------------------------------------------------
    // CORK BOARD REF + SIZE STATE (SOURCE OF TRUTH)
    // -------------------------------------------------------------------------
    const boardRef = useRef<HTMLDivElement | null>(null);

    const [boardSize, setBoardSize] = useState({
        width: 0,
        height: 0,
        boundaryPadding: 11,
    });
    const [isMultiDeleteMode, setIsMultiDeleteMode] = useState(false);
    const [selectedMemoIds, setSelectedMemoIds] = useState<Set<string>>(new Set());
    const [busyDelete] = useState(false);
    const [memoFrameImage, setMemoFrameImage] = useState("");
    const [showThemePanel, setShowThemePanel] = useState(false);
    const [themePanelPinned, setThemePanelPinned] = useState(false);
    const [selectedWallpaperStyle, setSelectedWallpaperStyle] = useState("wallpaper-1");
    const [selectedFrameStyle, setSelectedFrameStyle] = useState<string>(DEFAULT_FRAME_STYLE);
    const themePanelRef = useRef<HTMLDivElement | null>(null);

    const wallpaperOptions: DropdownOption[] = WALLPAPER_STYLE_OPTIONS.map((style) => ({
        value: style,
        label: WALLPAPER_STYLE_LABELS[style] ?? style,
    }));

    const frameOptions: DropdownOption[] = FRAME_STYLE_OPTIONS.map((style) => ({
        value: style,
        label: FRAME_STYLE_LABELS[style] ?? style,
    }));

    // -------------------------------------------------------------------------
    // MEASURE BOARD SIZE ON MOUNT
    // -------------------------------------------------------------------------
    useLayoutEffect(() => {
        if (!boardRef.current) return;

        const measureBoard = () => {
            if (!boardRef.current) return;

            const rect = boardRef.current.getBoundingClientRect();
            const metrics = getMemoBoardMetrics(boardRef.current);

            setBoardSize({
                width: rect.width,
                height: rect.height,
                boundaryPadding: metrics.boundaryPadding,
            });
        };

        measureBoard();
        const resizeObserver = new ResizeObserver(measureBoard);
        resizeObserver.observe(boardRef.current);
        window.addEventListener("resize", measureBoard);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", measureBoard);
        };
    }, []);

    // AUTO OPEN MEMO WHEN NAVIGATED FROM DASHBOARD PREVIEW
    useEffect(() => {
        if (!openMemoId) return;

        setActiveMemoId(openMemoId);
        openModal("view", openMemoId);
        navigate("/memoboard", { replace: true });
    }, [openMemoId, navigate, openModal, setActiveMemoId]);

    useEffect(() => {
        if (!openAddMemo) return;

        openModal("add");
        navigate("/memoboard", { replace: true });
    }, [navigate, openAddMemo, openModal]);

    useEffect(() => {
        setSelectedWallpaperStyle(user?.preference?.wallpaperStyle ?? "wallpaper-1");
        setSelectedFrameStyle(normalizeFrameStyle(user?.preference?.frameStyle));
    }, [user?.preference?.frameStyle, user?.preference?.wallpaperStyle]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                themePanelRef.current &&
                !themePanelRef.current.contains(event.target as Node)
            ) {
                setShowThemePanel(false);
                setThemePanelPinned(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const memoWallpaperTheme = getWallpaperTheme(user?.preference?.wallpaperStyle);

    useEffect(() => {
        let isActive = true;

        loadFrameStyleAsset(user?.preference?.frameStyle ?? DEFAULT_FRAME_STYLE)
            .then((image) => {
                if (isActive) {
                    setMemoFrameImage(image);
                }
            })
            .catch((error) => {
                console.error("[MemoBoardPage] Failed loading frame image:", error);
            });

        return () => {
            isActive = false;
        };
    }, [user?.preference?.frameStyle]);

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    const handleAddMemo = () => {
        openModal("add");
    };

    const handleThemePreferenceChange = async (
        field: "wallpaperStyle" | "frameStyle",
        value: string
    ) => {
        if (field === "wallpaperStyle") {
            setSelectedWallpaperStyle(value);
        } else {
            setSelectedFrameStyle(normalizeFrameStyle(value));
        }

        try {
            await updateUserPreferences({ [field]: value });
            await refreshUser();
        } catch (error) {
            console.error(`[MemoBoardPage] Failed updating ${field}:`, error);
        }
    };

    const toggleMemoDeleteSelection = (memoId: string) => {
        if (!isMultiDeleteMode) return;

        setSelectedMemoIds((prev) => {
            const next = new Set(prev);
            if (next.has(memoId)) {
                next.delete(memoId);
            } else {
                next.add(memoId);
            }
            return next;
        });
    };

    const handleEnterMultiDeleteMode = () => {
        setBoardMode("view");
        setActiveMemoId(null);
        setIsMultiDeleteMode(true);
        setSelectedMemoIds(new Set());
    };

    const handleCancelMultiDeleteMode = () => {
        setIsMultiDeleteMode(false);
        setSelectedMemoIds(new Set());
    };

    const handleDeleteSelectedMemos = () => {
        if (selectedMemoIds.size === 0 || busyDelete) return;

        openModal("deleteConfirm", {
            memoIds: Array.from(selectedMemoIds),
            onConfirmSuccess: () => {
                setSelectedMemoIds(new Set());
                setIsMultiDeleteMode(false);
            },
        });
    };


    const handleDragStart = (event: DragStartEvent) => {
        if (boardMode !== "edit") return;

        // DnD-kit allows string | number → we enforce string IDs in our app
        const memoId = event.active.id as string;
        // Selection source of truth
        setActiveMemoId(memoId);
        // Auto bring to top (frontend-only)
        bringMemoToTop(memoId);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;

        if (!active || !delta) return;

        const memoId = active.id as string;
        const memo = memos.find(m => m._id === memoId);
        if (!memo) return;

        // Board must be measured before math
        if (boardSize.width === 0 || boardSize.height === 0) return;

        // Convert delta pixels → new percentage pin position
        const { xPct, yPct } = computeNewPinPct({
            xPct: memo.position.xPct,
            yPct: memo.position.yPct,
            deltaX: delta.x,
            deltaY: delta.y,
            boardWidth: boardSize.width,
            boardHeight: boardSize.height,
            boundaryPadding: boardSize.boundaryPadding,
        });

        // Frontend-only state update
        moveMemo(memoId, xPct, yPct);
    };

    // DONE → COMMIT LAYOUT
    const handleDone = async () => {
        try {
            // Build final layout snapshot
            const payload = buildLayoutPayload();

            console.log("[FINAL LAYOUT PAYLOAD]", payload);

            // 2Persist once (no spam, no debounce)
            await updateMemoLayout(payload);

            // Exit edit mode
            setBoardMode("view");
            setActiveMemoId(null);
        } catch (err) {
            console.error("Failed to save memo layout", err);
        }
    };

    const activeMemoOrderIndex = activeMemoId
        ? memos.findIndex((memo) => memo._id === activeMemoId)
        : -1;

    const activeMemoOrderParts = activeMemoOrderIndex >= 0
        ? {
            current: `${activeMemoOrderIndex + 1}`,
            total: `${memos.length}`,
        }
        : {
            current: "--",
            total: "--",
        };

    const selectedDeleteCount = selectedMemoIds.size;

    const handleFrameMouseDownCapture = (event: React.MouseEvent<HTMLDivElement>) => {
        if (boardMode !== "edit") return;

        const target = event.target as HTMLElement | null;
        if (!target) return;

        if (
            target.closest(".memo-card-overlay") ||
            target.closest(".memo-zorder-panel") ||
            target.closest(".memo-toolbar-btn") ||
            target.closest(".memo-toolbar-icon-btn")
        ) {
            return;
        }

        setActiveMemoId(null);
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div
            className="memo-board-page"
            style={{
                ["--memo-page-bg-base" as string]: memoWallpaperTheme.pageBase,
                ["--memo-page-title-ink" as string]: memoWallpaperTheme.titleInk,
                ["--memo-page-bg-layer-1" as string]: memoWallpaperTheme.pageLayers[0] ?? "none",
                ["--memo-page-bg-layer-2" as string]: memoWallpaperTheme.pageLayers[1] ?? "none",
                ["--memo-page-bg-layer-3" as string]: memoWallpaperTheme.pageLayers[2] ?? "none",
                ["--memo-page-bg-size-1" as string]: memoWallpaperTheme.pageSizes?.[0] ?? "cover",
                ["--memo-page-bg-size-2" as string]: memoWallpaperTheme.pageSizes?.[1] ?? "cover",
                ["--memo-page-bg-size-3" as string]: memoWallpaperTheme.pageSizes?.[2] ?? "cover",
                ["--memo-page-bg-position-1" as string]: memoWallpaperTheme.pagePositions?.[0] ?? "center",
                ["--memo-page-bg-position-2" as string]: memoWallpaperTheme.pagePositions?.[1] ?? "center",
                ["--memo-page-bg-position-3" as string]: memoWallpaperTheme.pagePositions?.[2] ?? "center",
                ["--memo-page-bg-repeat-1" as string]: memoWallpaperTheme.pageRepeats?.[0] ?? "no-repeat",
                ["--memo-page-bg-repeat-2" as string]: memoWallpaperTheme.pageRepeats?.[1] ?? "no-repeat",
                ["--memo-page-bg-repeat-3" as string]: memoWallpaperTheme.pageRepeats?.[2] ?? "no-repeat",
                ["--memo-frame-image" as string]: memoFrameImage ? `url("${memoFrameImage}")` : undefined,
            }}
        >
            <div
                className="memo-board-frame"
                onMouseDownCapture={handleFrameMouseDownCapture}
            >

                {/* ======================= HEADER ======================= */}
                <div className={`memo-board-topbar ${boardMode === "edit" ? "stack-mode" : ""}`}>

                    {/* LEFT */}
                    <div className="memo-board-topbar-left">
                        <button
                            className="memo-nav-btn memo-nav-btn-dashboard"
                            onClick={() => navigate("/")}
                        >
                            <Icons.Home />
                            <span className="memo-nav-text">
                                Dashboard
                            </span>
                        </button>
                    </div>

                    {/* CENTER */}
                    <div className="memo-board-title-group">
                        <div className="memo-board-title">
                            SeanPDev&apos;s Memo Board
                        </div>
                    </div>

                    {/* RIGHT / CONTROLS */}
                    <div className="memo-board-topbar-controls">
                        <div
                            className="memo-theme-panel-wrapper"
                            ref={themePanelRef}
                            onMouseEnter={() => setShowThemePanel(true)}
                            onMouseLeave={() => {
                                if (!themePanelPinned) {
                                    setShowThemePanel(false);
                                }
                            }}
                        >
                            <button
                                type="button"
                                className={`icon-btn-square memo-toolbar-icon-btn memo-nav-theme-btn ${showThemePanel ? "active" : ""}`}
                                onClick={() => {
                                    setThemePanelPinned((prev) => {
                                        const next = !prev;
                                        setShowThemePanel(next);
                                        return next;
                                    });
                                }}
                                aria-label="Open theme settings"
                                title="Theme settings"
                            >
                                <Icons.Shirt />
                            </button>

                            {showThemePanel ? (
                                <div className="memo-theme-panel">
                                    <DropdownMenu
                                        label="Frame Style"
                                        value={frameOptions.find((option) => option.value === selectedFrameStyle)?.label ?? FRAME_STYLE_LABELS[DEFAULT_FRAME_STYLE]}
                                        selectedValue={selectedFrameStyle}
                                        options={frameOptions}
                                        onChange={(value) => handleThemePreferenceChange("frameStyle", value)}
                                        maxHeight={180}
                                    />

                                    <DropdownMenu
                                        label="Wallpaper Style"
                                        value={wallpaperOptions.find((option) => option.value === selectedWallpaperStyle)?.label ?? "Warm Cream Paper"}
                                        selectedValue={selectedWallpaperStyle}
                                        options={wallpaperOptions}
                                        onChange={(value) => handleThemePreferenceChange("wallpaperStyle", value)}
                                        maxHeight={180}
                                    />
                                </div>
                            ) : null}
                        </div>

                        <div
                            className={`memo-board-edit-label memo-board-edit-label-inline memo-board-edit-label-controls ${boardMode === "edit"
                                ? "visible"
                                : ""
                                }`}
                        >
                            ( EDIT MODE )
                        </div>

                        <div className="memo-board-toolbar">
                            {boardMode === "view" && (
                                <>
                                    {!isMultiDeleteMode ? (
                                        <>
                                            <button
                                                className="icon-btn-square memo-toolbar-icon-btn"
                                                onClick={() => setBoardMode("edit")}
                                                aria-label="Stack memos"
                                                title="Stack memos"
                                            >
                                                <Icons.Drag />
                                            </button>

                                            <button
                                                className="icon-btn-square delete memo-toolbar-icon-btn"
                                                onClick={handleEnterMultiDeleteMode}
                                                disabled={memos.length === 0}
                                                aria-label="Enable multi delete mode"
                                                title="Enable multi delete mode"
                                            >
                                                <Icons.Delete />
                                            </button>

                                            <button
                                                className="icon-btn-square memo-toolbar-icon-btn memo-toolbar-icon-btn-add"
                                                onClick={handleAddMemo}
                                                aria-label="Add memo"
                                                title="Add memo"
                                            >
                                                <Icons.Add />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="btn-secondary-rect memo-toolbar-btn memo-toolbar-btn-cancel"
                                                onClick={handleCancelMultiDeleteMode}
                                                disabled={busyDelete}
                                                aria-label="Cancel multi delete mode"
                                                title="Cancel"
                                            >
                                                <Icons.Close />
                                                <span className="memo-toolbar-text">
                                                    Cancel
                                                </span>
                                            </button>

                                            <button
                                                className="btn-danger-rect memo-toolbar-btn memo-toolbar-btn-delete-selected"
                                                onClick={handleDeleteSelectedMemos}
                                                disabled={selectedDeleteCount === 0 || busyDelete}
                                                aria-label="Delete selected memos"
                                                title="Delete selected memos"
                                            >
                                                <Icons.Delete />
                                                <span className="memo-toolbar-text">
                                                    {busyDelete ? "Deleting..." : `Delete Selected (${selectedDeleteCount})`}
                                                </span>
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {boardMode === "edit" && !isMultiDeleteMode && (
                                <>
                                    <div className="memo-zorder-panel">
                                        <button
                                            className="icon-btn-square memo-toolbar-icon-btn memo-zorder-arrow-btn"
                                            disabled={!activeMemoId}
                                            onClick={() => {
                                                if (!activeMemoId) return;
                                                bringMemoForward(activeMemoId);
                                            }}
                                            aria-label="Bring memo forward"
                                        >
                                            <Icons.DropdownArrow className="memo-zorder-arrow-up" />
                                        </button>

                                        <div className="memo-zorder-index">
                                            <span className="memo-zorder-current">
                                                {activeMemoOrderParts.current}
                                            </span>
                                            <span className="memo-zorder-separator">
                                                {" / "}
                                            </span>
                                            <span className="memo-zorder-total">
                                                {activeMemoOrderParts.total}
                                            </span>
                                        </div>

                                        <button
                                            className="icon-btn-square memo-toolbar-icon-btn memo-zorder-arrow-btn"
                                            disabled={!activeMemoId}
                                            onClick={() => {
                                                if (!activeMemoId) return;
                                                sendMemoBackward(activeMemoId);
                                            }}
                                            aria-label="Send memo backward"
                                        >
                                            <Icons.DropdownArrow className="memo-zorder-arrow-down" />
                                        </button>
                                    </div>

                                    <button
                                        className="btn-green-rect memo-toolbar-btn memo-toolbar-btn-done"
                                        onClick={handleDone}
                                        aria-label="Done arranging memos"
                                        title="Done"
                                    >
                                        <Icons.Confirm />
                                        <span className="memo-toolbar-text">
                                            Done
                                        </span>
                                    </button>

                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ======================= CORK BOARD ======================= */}
                <DndContext
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div
                        className="memo-board-canvas"
                        ref={boardRef}
                    >
                        {isMemoAtEdge && (
                            <div className="memo-board-boundary-shield" />
                        )}

                        {loading && (
                            <div className="memo-board-loading">
                                Loading memos…
                            </div>
                        )}

                        {!loading && memos.length === 0 && (
                            <div className="memo-board-empty">
                                No memos yet. Click “Add” to get started.
                            </div>
                        )}

                        {!loading && memos.map((memo, index) => (
                            <DraggableMemoItem
                                key={memo._id}
                                memo={memo}
                                zIndex={index}
                                isEditMode={boardMode === "edit"}
                                isDeleteMode={isMultiDeleteMode}
                                isDeleteSelected={selectedMemoIds.has(memo._id)}
                                onDeleteModeSelect={toggleMemoDeleteSelection}
                                boardWidth={boardSize.width}
                                boardHeight={boardSize.height}
                                boundaryPadding={boardSize.boundaryPadding}
                            />
                        ))}
                    </div>
                </DndContext>
            </div>
        </div>
    );
};

export default MemoBoardPage;
