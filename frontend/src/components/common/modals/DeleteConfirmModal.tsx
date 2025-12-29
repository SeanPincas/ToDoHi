import React from "react";
import { useTodo } from "../../../context/TodoContext";
import { modalOverlayStyle, modalCardBaseStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";

import "./DeleteConfirmModal.css";

// ------------------------------ COMPONENT ------------------------------
const DeleteConfirmModal: React.FC = () => {
    const { modal, closeModal } = useTodo();

    // ------------------ GUARD ------------------
    if (!modal.isOpen || modal.type !== "deleteConfirm") return null;

    const { taskIds = [], onConfirm } = modal.data || {};
    const count = taskIds.length;

    // ------------------ CONFIRM DELETE ------------------
    const handleConfirmDelete = async () => {
        if (count === 0) return;

        onConfirm?.(taskIds);
    };

    // ------------------ RENDER  ------------------
    return (
        <div
            // Clicking outside closes the modal
            style={modalOverlayStyle}
            className="delete-confirm-overlay"
            onMouseDown={closeModal}
        >
            <div
                // Stop click from closing modal when clicking inside
                style={modalCardBaseStyle}
                className="delete-confirm-card"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* ================= HEADER ================= */}
                <div className="delete-confirm-header">
                    <Icons.Warning className="warning-icon" />
                    <h3>Confirm Delete</h3>
                </div>

                {/* ================= MESSAGE ================= */}
                <p className="delete-confirm-message">
                    {count === 1
                        ? "Are you sure you want to delete this task?"
                        : `Are you sure you want to delete these ${count} tasks?`
                    }
                    <br />
                    <strong>This action cannot be undone.</strong>
                </p>

                {/* ================= ACTION BUTTONS ================= */}
                <div className="delete-confirm-actions">

                    {/* Cancel = just close modal */}
                    <button
                        className="btn-cancel"
                        onClick={closeModal}
                    >
                        Cancel
                    </button>

                    {/* Delete = execute deletion */}
                    <button
                        className="btn-danger"
                        onClick={handleConfirmDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;