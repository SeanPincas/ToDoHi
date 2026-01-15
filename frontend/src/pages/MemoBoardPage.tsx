// ============================================================================
// MemoBoardPage.tsx
// Memo Board layout with mode-aware toolbars
// ============================================================================

import React from "react";
import { useNavigate } from "react-router-dom";

import { useMemoContext } from "../context/MemoContext";
import { Icons } from "../styles/iconLibrary";

import "./MemoBoardPage.css";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import DraggableMemoItem from "../components/memo/DraggableMemoItem";

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
        moveMemo
    } = useMemoContext();

    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    const handleAddMemo = async () => {
        openModal("add");
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;

        if (!active || !delta) return;

        const memoId = active.id as string;
        const memo = memos.find(m => m._id === memoId);

        if (!memo) return;

        const newX = memo.position.x + delta.x;
        const newY = memo.position.y + delta.y;

        moveMemo(memoId, newX, newY);
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="memo-board-page">
            <div className="memo-board-frame">

                {/* ======================= FRAME HEADER ======================= */}
                <div className="memo-board-topbar">

                    {/* -------- LEFT -------- */}
                    <button
                        className="memo-nav-btn"
                        onClick={() => navigate("/")}
                    >
                        ← Return to Dashboard
                    </button>

                    {/* -------- CENTER -------- */}
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

                    {/* -------- RIGHT -------- */}
                    <div className="memo-board-toolbar">

                        {/* ---------------- VIEW MODE ---------------- */}
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
                                    <span className="memo-toolbar-text">Rearrange</span>
                                </button>
                            </>
                        )}

                        {/* ---------------- EDIT MODE ---------------- */}
                        {boardMode === "edit" && (
                            <>
                                <button className="btn-secondary-rect memo-toolbar-btn">
                                    <Icons.DropdownArrow />
                                    <span className="memo-toolbar-text">Send to Back</span>
                                </button>
                                <button className="btn-secondary-rect memo-toolbar-btn">
                                    <Icons.ArrowUp />
                                    <span className="memo-toolbar-text">Bring to Front</span>
                                </button>

                                <button
                                    className="btn-green-rect memo-toolbar-btn"
                                    onClick={() => setBoardMode("view")}
                                >
                                    <Icons.Confirm />
                                    <span className="memo-toolbar-text">Done</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ======================= CORK BOARD ======================= */}
                <DndContext
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToParentElement]}
                >
                    <div className="memo-board-canvas">
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

                        {!loading && memos.map((memo) => (
                            <DraggableMemoItem
                                key={memo._id}
                                memo={memo}
                                isEditMode={boardMode === "edit"}
                            />
                        ))}
                    </div>
                </DndContext>
            </div>
        </div>
    );
};

export default MemoBoardPage;