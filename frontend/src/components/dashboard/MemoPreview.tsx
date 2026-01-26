// ============================================================================
// MemoPreview.tsx
// ============================================================================

import React from "react";
import { useNavigate } from "react-router-dom";

import { useMemoContext } from "../../context/MemoContext";
import { getMemoCategoryEmoji } from "../../utils/memoUtils/memoUtils";

import "./MemoPreview.css";

// ----------------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------------

const MemoPreview: React.FC = () => {
    const { memos, loading } = useMemoContext();
    const navigate = useNavigate();

    return (
        <div className="memo-preview-card">

            {/* ================= HEADER ================= */}
            <div className="memo-preview-header">
                <div className="memo-preview-title">Memos</div>

                <button
                    className="memo-preview-link"
                    onClick={() => navigate("/memoboard")}
                >
                    View Board →
                </button>
            </div>

            {/* ================= LIST WRAPPER (SCROLLS) ================= */}
            <div className="memo-preview-list-wrapper">

                {/* ---------- LOADING ---------- */}
                {loading && (
                    <div className="memo-preview-empty">
                        Loading memos…
                    </div>
                )}

                {/* ---------- EMPTY ---------- */}
                {!loading && memos.length === 0 && (
                    <div className="memo-preview-empty">
                        No memos yet.
                    </div>
                )}

                {/* ---------- LIST ---------- */}
                {!loading && memos.length > 0 && (
                    <div className="memo-preview-list">

                        {memos.map(memo => (
                            <div
                                key={memo._id}
                                className="memo-preview-item"
                                style={{ backgroundColor: memo.containerColor }}
                                onClick={() =>
                                    navigate("/memoboard", {
                                        state: {
                                            openMemoId: memo._id,
                                        },
                                    })
                                }
                            >
                                {/* PIN */}
                                <span
                                    className="memo-preview-pin"
                                    style={{ backgroundColor: memo.pinColor }}
                                />

                                {/* TEXT */}
                                <div className="memo-preview-text">

                                    <div className="memo-preview-item-title">
                                        {memo.title}
                                    </div>

                                    <div className="memo-preview-category">
                                        {getMemoCategoryEmoji(memo.category)}{" "}
                                        {memo.category}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemoPreview;
