// ============================================================================
// MemoBoardPage.tsx
// Memo Board layout with mode-aware toolbars
// ============================================================================

import React from "react";
import { useNavigate } from "react-router-dom";

import { useMemoContext } from "../context/MemoContext";
import { Icons } from "../styles/iconLibrary";

import "./MemoBoardPage.css";

// ----------------------------------------------------------------------------
// PAGE COMPONENT
// ----------------------------------------------------------------------------

const MemoBoardPage: React.FC = () => {
    const {
        memos,
        loading,
        boardMode,
        setBoardMode,
        addMemo
    } = useMemoContext();

    const navigate = useNavigate();

    // -------------------------------------------------------------------------
    // HANDLERS
    // -------------------------------------------------------------------------

    const handleAddMemo = async () => {
        await addMemo({
            title: "New Memo",
            content: "",
            containerColor: "#ffffff",
            pinColor: "#cc0000"
        });
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
                    <div className="memo-board-title">
                        Memo Board
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
                                    Add
                                </button>

                                <button
                                    className="btn-info-rect"
                                    onClick={() => setBoardMode("edit")}
                                >
                                    <Icons.Drag />
                                    Rearrange
                                </button>
                            </>
                        )}

                        {/* ---------------- EDIT MODE ---------------- */}
                        {boardMode === "edit" && (
                            <>
                                <span className="memo-edit-label">
                                    EDIT MODE
                                </span>

                                <button className="btn-secondary-rect">
                                    Send to Back
                                </button>

                                <button className="btn-secondary-rect">
                                    Bring to Front
                                </button>

                                <button
                                    className="btn-green-rect"
                                    onClick={() => setBoardMode("view")}
                                >
                                    Done
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* ======================= CORK BOARD ======================= */}
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

                    {/* MemoCardBaseOverlay will be rendered here next */}
                </div>
            </div>
        </div>
    );
};

export default MemoBoardPage;