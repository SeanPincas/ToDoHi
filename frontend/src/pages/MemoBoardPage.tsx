// ============================================================================
// MemoBoardPage.tsx
// Memo Board layout with mode-aware toolbars
//
// RESPONSIBILITIES:
// - Measure cork board size
// - Handle drag end math (delta → %)
// - Frontend-only movement (no backend calls)
// ============================================================================

import React, { useRef, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { updateMemoLayout } from "../api/memoApi";
import { useMemoContext } from "../context/MemoContext";
import { Icons } from "../styles/iconLibrary";

import "./MemoBoardPage.css";

import { DndContext, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core";
import DraggableMemoItem from "../components/memo/DraggableMemoItem";
import { computeNewPinPct } from "../utils/memoPosition";

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

        bringMemoForward,
        sendMemoBackward,
        bringMemoToTop,

        activeMemoId,

        buildLayoutPayload,
    } = useMemoContext();

    const navigate = useNavigate();

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

        const rect = boardRef.current.getBoundingClientRect();

        setBoardSize({
            width: rect.width,
            height: rect.height,
        });
    }, []);

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

            console.log("[FINAL LAYOUT PAYLOAD]",payload);

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
                        ← Return to Dashboard
                    </button>

                    {/* CENTER */}
                    <div className="memo-title-group">
                        <div className="memo-board-title">
                            Memo Board
                        </div>
                        {boardMode === "edit" && (
                            <div className="memo-board-edit-label">
                                EDIT MODE
                            </div>
                        )}
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
                                    <span className="memo-toolbar-text">Add</span>
                                </button>

                                <button
                                    className="btn-info-rect"
                                    onClick={() => setBoardMode("edit")}
                                >
                                    <Icons.Drag />
                                    <span className="memo-toolbar-text">
                                        Rearrange
                                    </span>
                                </button>
                            </>
                        )}

                        {boardMode === "edit" && (
                            <>
                                {/* Z controls will be FRONTEND-ONLY later */}
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
                                        Send Backward
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
                                        Bring Forward
                                    </span>
                                </button>

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
