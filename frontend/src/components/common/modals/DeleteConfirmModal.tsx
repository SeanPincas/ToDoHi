import React from "react";
import { useTodo } from "../../../context/TodoContext";
import { modalOverlayStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";

import "./DeleteConfirmModal.css";
import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";
import "../../../styles/ButtonStyles.css";

// ------------------------------ COMPONENT ------------------------------
const DeleteConfirmModal: React.FC = () => {
    const { modal, openModal, closeModal, deleteTask, fetchTasks } = useTodo();

    // ------------------ GUARD ------------------
    if (!modal.isOpen || modal.type !== "deleteConfirm") return null;

    const { taskIds = [], onAfterDelete } = modal.data || {};
    const count = taskIds.length;
    const handleCancel = () => {
        if (modal.data?.returnContext) {
            openModal("repeat", modal.data.returnContext);
        } else {
            closeModal();
        }
    };

    // ------------------ CONFIRM DELETE ------------------
    const handleConfirmDelete = async () => {
        if (count === 0) return;

        try {
            for (const id of taskIds) {
                await deleteTask(id);
            }

            await fetchTasks();

            if (typeof onAfterDelete === "function") {
                await onAfterDelete();
            }

            closeModal();
        } catch (err) {
            console.error("[DeleteConfirmModal] Failed to delete tasks:", err);
        }
    };

    // ------------------ RENDER  ------------------
    return (
        <div
            // Clicking outside closes the modal
            style={modalOverlayStyle}
            className="delete-confirm-overlay"
            onMouseDown={handleCancel}
        >
            <div
                className="modal-card-base delete-confirm-card task-management-modal paper-sheet-lines"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* ================= HEADER ================= */}
                <div className="delete-confirm-header task-management-modal-header">
                    <div className="task-management-modal-title-group delete-confirm-title-group">
                        <Icons.Warning className="warning-icon" />
                        <h3>Confirm Delete</h3>
                    </div>
                    <button
                        type="button"
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={handleCancel}
                        aria-label="Close delete confirm modal"
                    >
                        <Icons.Close />
                    </button>
                </div>

                {/* ================= MESSAGE ================= */}
                <div className="delete-confirm-copy-block">
                    <p className="delete-confirm-message task-management-modal-subtitle">
                        {count === 1
                            ? "Are you sure you want to delete this task?"
                            : `Are you sure you want to delete these ${count} tasks?`
                        }
                    </p>
                    <p className="delete-confirm-note">
                        This action cannot be undone.
                    </p>
                </div>

                {/* ================= ACTION BUTTONS ================= */}
                <div className="delete-confirm-actions">

                    {/* Cancel = just close modal */}
                    <button
                        className="btn-secondary-rect delete-confirm-action-btn"
                        onClick={handleCancel}
                    >
                        <Icons.Close />
                        <span>Cancel</span>
                    </button>

                    {/* Delete = execute deletion */}
                    <button
                        className="btn-danger-rect delete-confirm-action-btn"
                        onClick={handleConfirmDelete}
                    >
                        <Icons.Delete />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
