// ============================================================================
// DeleteConfirmMemoModal.tsx
// ============================================================================

import { useState } from "react";
import "./DeleteConfirmMemoModal.css";

import { useMemoContext } from "../../context/MemoContext";

// Shared modal base styles
import {
    modalOverlayStyle,
} from "../../styles/modalStyles";
import "../common/modals/modalBaseTheme.css";

// Icons + shared button styles
import { Icons } from "../../styles/iconLibrary";
import "../../styles/ButtonStyles.css";

const DeleteConfirmMemoModal = () => {

    const {
        memos,
        activeModal,
        activeMemoId,
        closeModal,
        removeMemo,
    } = useMemoContext();

    const memo = memos.find(m => m._id === activeMemoId) ?? null;

    const [isDeleting, setIsDeleting] = useState(false);

    // ---------------------------------------------------------------------
    // GUARD — ONLY RENDER WHEN ACTIVE
    // ---------------------------------------------------------------------
    if (activeModal !== "deleteConfirm" || !memo) return null;

    // ---------------------------------------------------------------------
    // CONFIRM HANDLER
    // ---------------------------------------------------------------------
    const handleConfirm = async () => {
        if (isDeleting) return;

        try {
            setIsDeleting(true);

            await removeMemo(memo._id);

            closeModal();
        } catch (err) {
            console.error("[DeleteConfirmMemoModal] Delete failed:", err);
            setIsDeleting(false);
        }
    };

    return (
        <div
            style={modalOverlayStyle}
            onMouseDown={closeModal}
        >
            <div
                className="modal-card-base delete-memo-modal-card"
                onMouseDown={(e) => e.stopPropagation()}
            >

                {/* ================= HEADER ================= */}
                <div className="delete-memo-header">
                    <h3>Delete Memo</h3>
                </div>

                {/* ================= BODY ================= */}
                <p className="delete-memo-text">
                    Are you sure you want to permanently delete this memo?
                </p>

                <p className="delete-memo-title-preview">
                    “{memo.title}”
                </p>

                {/* ================= ACTIONS ================= */}
                <div className="delete-memo-actions">

                    <button
                        className="btn-secondary-rect"
                        onClick={closeModal}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn-danger-rect"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        <Icons.Delete />
                        Delete
                    </button>

                </div>

            </div>
        </div>
    );
};

export default DeleteConfirmMemoModal;
