// ============================================================================
// MemoBoardPage.tsx
// ============================================================================

import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { updateMemoLayout } from "../api/memoApi";
import { useMemoContext } from "../context/MemoContext";
import { Icons } from "../styles/iconLibrary";

import "./MemoBoardPage.css";

import { DndContext, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core";
import DraggableMemoItem from "../components/memo/DraggableMemoItem";
import { computeNewPinPct } from "../utils/memoUtils/memoPosition";

// ----------------------------------------------------------------------------
// PAGE COMPONENT
// ----------------------------------------------------------------------------

const MemoBoardPage: React.FC = () => {
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

    // -------------------------------------------------------------------------
    // CORK BOARD REF + SIZE STATE (SOURCE OF TRUTH)
    // -------------------------------------------------------------------------
    const boardRef = useRef<HTMLDivElement | null>(null);

    const [boardSize, setBoardSize] = useState({
        width: 0,
        height: 0,
    });

    // -------------------------------------------------------------------------
    // MEASURE BOARD SIZE ON MOUNT
    // -------------------------------------------------------------------------
    useLayoutEffect(() => {
        if (!boardRef.current) return;

        // ------------------------------
        // Measure board size
        // ------------------------------
        const measureBoard = () => {
            if (!boardRef.current) return;

            const rect = boardRef.current.getBoundingClientRect();

            setBoardSize({
                width: rect.width,
                height: rect.height,
            });
        };

        // Initial measurement (on mount)
        measureBoard();

        // Re-measure on window resize
        window.addEventListener("resize", measureBoard);

        // Cleanup on unmount
        return () => {
            window.removeEventListener("resize", measureBoard);
        };
    }, []);

    // AUTO OPEN MEMO WHEN NAVIGATED FROM DASHBOARD PREVIEW
    useEffect(() => {

    if (!openMemoId) return;

    // Open modal
    setActiveMemoId(openMemoId);
    openModal("view", openMemoId);

    // Clear navigation state so it doesn't reopen
    navigate("/memoboard", { replace: true });

}, [openMemoId, navigate, openModal, setActiveMemoId]);

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

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="memo-board-page">
            <div className="memo-board-frame">

                {/* ======================= HEADER ======================= */}
                <div className="memo-board-topbar">

                    {/* LEFT */}
                    <button
                        className="memo-nav-btn"
                        onClick={() => navigate("/")}
                    >
                        <Icons.ArrowLeft />
                        <span className="memo-nav-text">
                            Return to Dashboard
                        </span>
                    </button>

                    {/* CENTER */}
                    <div className="memo-board-title-group">
                        <div className="memo-board-title">
                            Memo Board
                        </div>
                        <div
                            className={`memo-board-edit-label ${boardMode === "edit"
                                ? "visible"
                                : ""
                                }`}
                        >
                            ( EDIT MODE )
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="memo-board-toolbar">

                        {boardMode === "view" && (
                            <>
                                <button
                                    className="btn-primary-rect"
                                    onClick={handleAddMemo}
                                >
                                    <Icons.Add />
                                    <span className="memo-toolbar-text">
                                        Add
                                    </span>
                                </button>

                                <button
                                    className="btn-info-rect"
                                    onClick={() => setBoardMode("edit")}
                                >
                                    <Icons.Drag />
                                    <span className="memo-toolbar-text">
                                        Edit
                                    </span>
                                </button>
                            </>
                        )}

                        {boardMode === "edit" && (
                            <>
                                {/* Z controls will be FRONTEND-ONLY later */}
                                <div className="memo-zorder-controls">
                                    <button
                                        className="btn-secondary-rect memo-toolbar-btn"
                                        disabled={!activeMemoId}
                                        onClick={() => {
                                            if (!activeMemoId) return;
                                            sendMemoBackward(activeMemoId);
                                        }}
                                    >
                                        <Icons.DropdownArrow />
                                        <span className="memo-toolbar-text">
                                            Backward
                                        </span>
                                    </button>

                                    <button
                                        className="btn-secondary-rect memo-toolbar-btn"
                                        disabled={!activeMemoId}
                                        onClick={() => {
                                            if (!activeMemoId) return;
                                            bringMemoForward(activeMemoId);
                                        }}
                                    >
                                        <Icons.ArrowUp />
                                        <span className="memo-toolbar-text">
                                            Forward
                                        </span>
                                    </button>
                                </div>

                                <button
                                    className="btn-green-rect memo-toolbar-btn"
                                    onClick={handleDone}
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
                            />
                        ))}
                    </div>
                </DndContext>
            </div>
        </div>
    );
};

export default MemoBoardPage;