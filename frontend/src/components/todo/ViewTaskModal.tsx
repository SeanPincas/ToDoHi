// ============================================================================
//                         VIEW TASK MODAL (VIEW-ONLY)
// ============================================================================
import { useEffect, useState } from "react";
import "./ViewTaskModal.css";
import { useTodo } from "../../context/TodoContext";

// Reusable icons + switch component + button styles
import { Icons } from "../../styles/iconLibrary";
import { Switch } from "../common/switch/Switch";
import "../../styles/ButtonStyles.css";

// Utilities
import {
    formatDate,
    safeCategoryLabel,
    safeStatusLabel,
    toggleStatus,
    createStatusLock,
    type TaskStatus,
} from "../../utils/taskUtils";


const ViewTaskModal = () => {

    const { modal, closeModal, updateTask, openModal } = useTodo();
    // ====================== 1️⃣ EXTRACT DATA (NO RETURNS) ======================
    const task = modal?.data ?? null;
    // ====================== 2️⃣ HOOKS (SAFE DEFAULTS) ==========================
    const [localStatus, setLocalStatus] = useState<TaskStatus>("pending");

    // Anti-spam lock (prevents rapid status toggling)
    const lock = createStatusLock(300);

    // ====================== 3️⃣ SYNC EFFECT ===================================
    useEffect(() => {
        if (!task) return;
        setLocalStatus(task.status);
    }, [task?.status])

    // ====================== 4️⃣ GUARD (RETURNS ALLOWED HERE) ====================
    if (!modal.isOpen || modal.type !== "view" || !task) return null;

    const isFailed = localStatus === "failed";
    const failedReason = "Failed tasks are locked.";

    // Border color uses the task's saved containerColor
    const borderColor = task.containerColor ?? "#000000";

    // ====================== HANDLERS ==========================================
    const handleToggleStatus = async () => {
        if (!lock()) return;

        const newStatus = toggleStatus(localStatus);

        setLocalStatus(newStatus);

        await updateTask(task._id, { status: newStatus });
    };

    return (
        <div
            className="view-modal-overlay"
            onMouseDown={closeModal} // click outside = close
        >
            <div
                className="view-modal-card"
                style={{ borderColor }}
                onMouseDown={(e) => e.stopPropagation()} // prevent close when clicking inside
            >
                {/* HEADER + CLOSE BUTTON (TOP RIGHT) */}
                <div className="view-header">
                    <h2 className="view-title">{task.title}</h2>

                    <button
                        className="icon-btn-square"
                        onClick={closeModal}
                    >
                        <Icons.Close className="view-btn-icon" />
                    </button>
                </div>

                {/* CATEGORY + COLOR TAG */}
                <div className="view-row">
                    <span className="view-category">
                        {safeCategoryLabel(task.category)}
                    </span>

                    <span
                        className="view-color-tag"
                        style={{ backgroundColor: task.containerColor }}
                    ></span>
                </div>

                {/* CREATED AT + EDITEDAT + STATUS (LABEL ONLY) */}
                <div className="view-row">
                    <span className="view-created">
                        Created: {formatDate(task.createdAt)}
                    </span>

                    {task.editedAt && (
                        <span className="view-edited">
                            Edited: {formatDate(task.editedAt)}
                        </span>
                    )}
                    {/* STATUS */}
                    <span className={`view-status ${localStatus}`}>
                        {safeStatusLabel(localStatus)}
                    </span>
                </div>

                {/* DESCRIPTION BOX */}
                <div
                    className="view-description-box"
                    style={{ borderColor }}
                >
                    {task.description?.trim() || "No Description Provided."}
                </div>

                {/* ACTIONS ROW (SWITCH + EDIT + DELETE) */}
                <div className="view-actions">

                    <div className="view-actions-left">
                        {/* STATUS SWITCH */}
                        <Switch
                            checked={localStatus === "completed"}
                            disabled={isFailed}
                            disabledReason={failedReason}
                            onToggle={handleToggleStatus}
                        />
                    </div>

                    <div className="view-actions-right">
                        {/* EDIT BUTTON */}
                        <button
                            className="icon-btn-square"
                            onClick={() =>
                                openModal("edit", {
                                    task,
                                    returnTo: "view",
                                })
                            }
                        >
                            <Icons.Edit className="view-btn-icon" />
                        </button>

                        {/* DELETE BUTTON */}
                        <button
                            className="icon-btn-square delete"
                            onClick={() => openModal("deleteConfirm", {
                                taskIds: [task._id]
                            })}
                        >
                            <Icons.Delete className="view-btn-icon" />
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ViewTaskModal;

