// ============================================================================
// DeleteConfirmMemoModal.tsx
// ============================================================================

import { useEffect, useState } from "react";
import "./DeleteConfirmMemoModal.css";

import { useMemoContext } from "../../context/MemoContext";
import { modalOverlayStyle } from "../../styles/modalStyles";
import { Icons } from "../../styles/iconLibrary";

import "../common/modals/modalBaseTheme.css";
import "../common/modals/taskManagementModalTheme.css";
import "../common/modals/DeleteConfirmModal.css";
import "../../styles/ButtonStyles.css";

const DeleteConfirmMemoModal = () => {
    const {
        memos,
        activeModal,
        activeModalData,
        activeMemoId,
        closeModal,
        removeMemo,
    } = useMemoContext();

    const memoIds = activeModalData?.memoIds?.length
        ? activeModalData.memoIds
        : activeMemoId
            ? [activeMemoId]
            : [];
    const selectedMemos = memoIds
        .map((memoId) => memos.find((m) => m._id === memoId) ?? null)
        .filter(Boolean);
    const memo = memos.find((m) => m._id === activeMemoId) ?? selectedMemos[0] ?? null;
    const isBulkDelete = memoIds.length > 1;
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (activeModal !== "deleteConfirm") {
            setIsDeleting(false);
        }
    }, [activeModal, memoIds.length]);

    if (activeModal !== "deleteConfirm" || memoIds.length === 0) return null;

    const handleConfirm = async () => {
        if (isDeleting) return;

        try {
            setIsDeleting(true);
            for (const memoId of memoIds) {
                await removeMemo(memoId);
            }
            activeModalData?.onConfirmSuccess?.();
            closeModal();
        } catch (err) {
            console.error("[DeleteConfirmMemoModal] Delete failed:", err);
            setIsDeleting(false);
        }
    };

    return (
        <div
            style={modalOverlayStyle}
            className="delete-confirm-overlay"
            onMouseDown={closeModal}
        >
            <div
                className="modal-card-base delete-memo-modal-card delete-confirm-card task-management-modal paper-sheet-lines"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="delete-memo-header delete-confirm-header task-management-modal-header">
                    <div className="delete-memo-title-group delete-confirm-title-group task-management-modal-title-group">
                        <Icons.Warning className="warning-icon" />
                        <h3>Delete Memo</h3>
                    </div>
                    <button
                        type="button"
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={closeModal}
                        aria-label="Close delete memo modal"
                    >
                        <Icons.Close />
                    </button>
                </div>

                <div className="delete-memo-copy-block delete-confirm-copy-block">
                    <p className="delete-memo-text delete-confirm-message task-management-modal-subtitle">
                        {isBulkDelete
                            ? `Are you sure you want to permanently delete these ${memoIds.length} memos?`
                            : "Are you sure you want to permanently delete this memo?"}
                    </p>
                    {!isBulkDelete && memo && (
                        <p className="delete-memo-title-preview">
                            "{memo.title}"
                        </p>
                    )}
                    {isBulkDelete && (
                        <p className="delete-memo-title-preview">
                            {selectedMemos.length === memoIds.length
                                ? `${memoIds.length} memos selected`
                                : `${selectedMemos.length}/${memoIds.length} memos ready to delete`}
                        </p>
                    )}
                    <p className="delete-memo-note delete-confirm-note">
                        This action cannot be undone.
                    </p>
                </div>

                <div className="delete-memo-actions delete-confirm-actions">
                    <button
                        className="btn-secondary-rect delete-memo-action-btn delete-confirm-action-btn"
                        onClick={closeModal}
                        disabled={isDeleting}
                    >
                        <Icons.Close />
                        <span>Cancel</span>
                    </button>

                    <button
                        className="btn-danger-rect delete-memo-action-btn delete-confirm-action-btn"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                    >
                        <Icons.Delete />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmMemoModal;
