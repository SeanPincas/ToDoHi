// ============================================================================
// MemoBoardPage.tsx
// ============================================================================

import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { updateMemoLayout } from "../api/memoApi";
import { useMemoContext } from "../context/MemoContext";
import { useAuthContext } from "../context/AuthContext";
import { Icons } from "../styles/iconLibrary";
import { getWallpaperStyleAsset } from "../utils/wallpaperStyles";

import "./MemoBoardPage.css";

import { DndContext, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core";
import DraggableMemoItem from "../components/memo/DraggableMemoItem";
import { computeNewPinPct } from "../utils/memoUtils/memoPosition";
import { getMemoBoardMetrics } from "../utils/memoUtils/memoBoardMetrics";

// ----------------------------------------------------------------------------
// PAGE COMPONENT
// ----------------------------------------------------------------------------

const MemoBoardPage: React.FC = () => {
    const { user } = useAuthContext();
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

    const memoWallpaper = getWallpaperStyleAsset(user?.preference?.wallpaperStyle);

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

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    const handleAddMemo = () => {
        openModal("add");
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

    const activeMemoOrderLabel = activeMemoOrderIndex >= 0
        ? `${activeMemoOrderIndex + 1} / ${memos.length}`
        : "-- / --";

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
                ["--memo-page-wallpaper" as string]: `url("${memoWallpaper}")`,
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
                            className="memo-nav-btn"
                            onClick={() => navigate("/")}
                        >
                            <Icons.Home />
                            <span className="memo-nav-text">
                                Dashboard
                            </span>
                        </button>

                        <div
                            className={`memo-board-edit-label memo-board-edit-label-inline ${boardMode === "edit"
                                ? "visible"
                                : ""
                                }`}
                        >
                            ( EDIT MODE )
                        </div>
                    </div>

                    {/* CENTER */}
                    <div className="memo-board-title-group">
                        <div className="memo-board-title">
                            SeanPDev&apos;s Memo Board
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="memo-board-toolbar">

                        {boardMode === "view" && (
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
                                    onClick={() => {
                                        if (!activeMemoId) return;
                                        openModal("deleteConfirm", activeMemoId);
                                    }}
                                    disabled={!activeMemoId}
                                    aria-label="Delete selected memo"
                                    title="Delete selected memo"
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
                        )}

                        {boardMode === "edit" && (
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
                                        {activeMemoOrderLabel}
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
