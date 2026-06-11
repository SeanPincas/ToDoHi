// RepeatConfirmModal.tsx
import React, { useState } from "react";
import { useAuthContext } from "../../../context/AuthContext";
import { useTodo } from "../../../context/TodoContext";
import { repeatTaskApi } from "../../../api/taskApi";
import { modalOverlayStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";

import "./RepeatConfirmModal.css";
import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";

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
        returnContext,
    } = modal.data as {
        mode: RepeatConfirmMode;
        selectedIds?: string[];
        allTaskIds?: string[];
        returnContext?: any;
    };

    // ------------------ COPY BASED ON MODE ------------------
    const isRepeatAll = mode === "repeatAll";

    const title = isRepeatAll
        ? "Repeat All Tasks?"
        : "Repeat Selected Tasks?";

    const message = isRepeatAll
        ? "This will create fresh active copies of all completed and failed tasks in the review list.\n\nSource items will move out of the active list after processing."
        : "This will create fresh active copies of the selected tasks only.\n\nUnselected failed tasks will move to Failed Task Archive instead of being deleted immediately.";

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

            const response = await repeatTaskApi(repeatIds)

            console.log("[RepeatConfirmModal] repeatTaskApi response:", response);

            await fetchTasks();
            await refreshUser();

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
        >
            <div
                className="modal-card-base repeat-confirm-card task-management-modal"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* ================= HEADER ================= */}
                <div className="repeat-confirm-header task-management-modal-header">
                    <div className="task-management-modal-title-group">
                        <Icons.Warning />
                        <h3>{title}</h3>
                    </div>
                </div>

                {/* ================= MESSAGE ================= */}
                <p className="repeat-confirm-message task-management-modal-subtitle">
                    {message.split("\n").map((line, idx) => (
                        <span key={idx}>
                            {line}
                            <br />
                        </span>
                    ))}
                </p>

                {/* ================= ACTIONS ================= */}
                <div className="repeat-confirm-actions">
                    <button
                        className="btn-secondary-rect"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn-primary-rect"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : "Yes, Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepeatConfirmModal;
