// RepeatConfirmModal.tsx
import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useTodo } from "../../../context/TodoContext";
import { repeatTaskApi, repeatTaskArchiveEntryApi } from "../../../api/taskApi";
import { modalOverlayStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";
import {
    markTaskReviewCycleHandled,
    REPEAT_REVIEW_REFRESH_EVENT,
} from "../../../utils/repeatReview";

import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";
import "./RepeatConfirmModal.css";

// ------------------------------ TYPES ------------------------------
type RepeatConfirmMode = "repeatAll" | "confirmSelected";

// ------------------------------ COMPONENT ------------------------------
const RepeatConfirmModal: React.FC = () => {
    const { refreshUser } = useAuthContext();
    const { modal, openModal, closeModal, fetchTasks } = useTodo();
    const [loading, setLoading] = useState(false);

    // ------------------ GUARD ------------------
    if (!modal.isOpen || modal.type !== "repeatConfirm") return null;

    const {
        mode,
        selectedIds = [],
        allTaskIds = [],
        reviewSource = "live",
        returnContext,
    } = modal.data as {
        mode: RepeatConfirmMode;
        selectedIds?: string[];
        allTaskIds?: string[];
        reviewSource?: "live" | "archive";
        returnContext?: any;
    };

    // ------------------ COPY BASED ON MODE ------------------
    const isRepeatAll = mode === "repeatAll";

    const title = isRepeatAll
        ? "Repeat All Tasks?"
        : "Repeat Selected Tasks?";

    const message = isRepeatAll
        ? "This will create fresh active copies of all completed and failed tasks in the review list.\n\nSource items will move out of the active list after processing."
        : "This will create fresh active copies of the selected tasks only.";

    const archiveNote = "Rest Assured. Tasks you don’t reuse today will be moved to the archive for up to 30 days.";

    // ------------------ HANDLERS ------------------
    /* Cancel returns user back to RepeatTaskModal. We DO NOT close everything */
    const handleCancel = () => {
        openModal("repeat", returnContext);
    };

    /* Confirm only signals intent. Actual logic is executed by RepeatTaskModal */
    const handleConfirm = async () => {
        if (loading) return;

        try {
            setLoading(true);

            const repeatIds = isRepeatAll ? allTaskIds : selectedIds;

            const response = reviewSource === "archive"
                ? await Promise.all(repeatIds.map((archiveEntryId) => repeatTaskArchiveEntryApi(archiveEntryId)))
                : await repeatTaskApi(repeatIds);

            console.log("[RepeatConfirmModal] repeatTaskApi response:", response);

            await fetchTasks();
            await refreshUser();
            markTaskReviewCycleHandled(returnContext?.cycleKey);
            window.dispatchEvent(new CustomEvent(REPEAT_REVIEW_REFRESH_EVENT));

            // Close everything after success
            closeModal();
        } catch (err) {
            console.log("[RepeatConfirmModal] Execution failed", err)
        }
    };

    // ------------------ RENDER ------------------
    return (
        <div
            style={modalOverlayStyle}
            className="repeat-confirm-overlay"
            onMouseDown={handleCancel}
        >
            <div
                className="modal-card-base repeat-confirm-card task-management-modal paper-sheet-lines"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* ================= HEADER ================= */}
                <div className="repeat-confirm-header task-management-modal-header">
                    <div className="task-management-modal-title-group repeat-confirm-title-group">
                        <Icons.Warning />
                        <h3>{title}</h3>
                    </div>
                    <button
                        type="button"
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={handleCancel}
                        aria-label="Close repeat confirm modal"
                    >
                        <Icons.Close />
                    </button>
                </div>

                {/* ================= MESSAGE ================= */}
                <div className="repeat-confirm-copy-block">
                    <p className="repeat-confirm-message task-management-modal-subtitle">
                        {message.split("\n").map((line, idx) => (
                            <span key={idx}>
                                {line}
                                <br />
                            </span>
                        ))}
                    </p>
                    <p className="repeat-confirm-archive-note">
                        {archiveNote}
                    </p>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="repeat-confirm-actions">
                    <button
                        className="repeat-confirm-action-btn repeat-confirm-action-btn-cancel"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        <Icons.Close />
                        <span>Cancel</span>
                    </button>

                    <button
                        className="repeat-confirm-action-btn repeat-confirm-action-btn-confirm"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        <Icons.Repeat />
                        <span>{loading ? "Processing..." : "Yes, Continue"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepeatConfirmModal;
