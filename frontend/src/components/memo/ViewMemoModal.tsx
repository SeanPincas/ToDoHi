// ============================================================================
// ViewMemoModal.tsx
// Zoomed-in memo viewer (square card, memo-styled — NOT dialog-styled)
// ============================================================================

import "./ViewMemoModal.css";

import { useMemoContext } from "../../context/MemoContext";

import { Icons } from "../../styles/iconLibrary";

import {
    getMemoCategoryEmoji,
} from "../../utils/memoUtils/memoUtils";

const ViewMemoModal = () => {

    const {
        memos,
        activeModal,
        activeMemoId,
        closeModal,
        openModal,
    } = useMemoContext();

    // ---------------------------------------------------------------------
    // LOOKUP MEMO
    // ---------------------------------------------------------------------
    const memo = memos.find(m => m._id === activeMemoId) ?? null;

    // ---------------------------------------------------------------------
    // GUARD
    // ---------------------------------------------------------------------
    if (activeModal !== "view" || !memo) return null;

    // ---------------------------------------------------------------------
    // CLOSE HANDLER (OVERLAY ONLY)
    // ---------------------------------------------------------------------
    const handleOverlayClick = () => {
        closeModal();
    };

    return (
        <div
            className="memo-zoom-overlay"
            onMouseDown={handleOverlayClick}
        >
            <div
                className="memo-zoom-wrapper"
                onMouseDown={(e) => e.stopPropagation()}
            >

                {/* ================= PIN ================= */}
                <div
                    className="memo-zoom-pin"
                    style={{ backgroundColor: memo.pinColor }}
                />

                {/* ================= CARD ================= */}
                <div
                    className="memo-zoom-card"
                    style={{ backgroundColor: memo.containerColor }}
                >

                    {/* ---------- TITLE ROW ---------- */}
                    <div className="memo-zoom-header">
                        <h2 className="memo-zoom-title">
                            {memo.title}
                        </h2>

                        <span className="memo-zoom-emoji">
                            {getMemoCategoryEmoji(memo.category)}
                        </span>
                    </div>

                    {/* ---------- CONTENT ---------- */}
                    <div className="memo-zoom-content">
                        {memo.content?.trim() || "No memo content."}
                    </div>

                </div>

                {/* ================= FOOTER ================= */}
                <div className="memo-zoom-footer">

                    <p className="memo-zoom-hint">
                        Click outside the memo to close
                    </p>

                    <div className="memo-zoom-actions">
                        <button
                            className="icon-btn-square"
                            onClick={() =>
                                openModal("edit", memo._id)
                            }
                        >
                            <Icons.Edit />
                        </button>

                        <button
                            className="icon-btn-square delete"
                            onClick={() =>
                                openModal("deleteConfirm", memo._id)
                            }
                        >
                            <Icons.Delete />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ViewMemoModal;
