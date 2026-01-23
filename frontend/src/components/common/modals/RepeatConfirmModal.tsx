// RepeatConfirmModal.tsx
import React, { useState } from "react";
import { useTodo } from "../../../context/TodoContext";
import { repeatTaskApi } from "../../../api/taskApi";
import { modalOverlayStyle, modalCardBaseStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";

import "./RepeatConfirmModal.css";

// ------------------------------ TYPES ------------------------------
type RepeatConfirmMode = "repeatAll" | "confirmSelected";

// ------------------------------ COMPONENT ------------------------------
const RepeatConfirmModal: React.FC = () => {
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
        ? "Are you sure you want to repeat all completed and failed tasks?\n\nRepeated tasks can be manually deleted later if needed."
        : "Are you sure you want to repeat only the selected tasks?\n\nUnselected tasks will be permanently deleted.";

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

            await repeatTaskApi(repeatIds);

            await fetchTasks();

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
                style={modalCardBaseStyle}
                className="repeat-confirm-card"
                onMouseDown={(e) => e.stopPropagation()} // ❗ disable outside click close
            >
                {/* ================= HEADER ================= */}
                <div className="repeat-confirm-header">
                    <Icons.Warning />
                    <h3>{title}</h3>
                </div>

                {/* ================= MESSAGE ================= */}
                <p className="repeat-confirm-message">
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
                        className="btn-cancel"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className="btn-primary"
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