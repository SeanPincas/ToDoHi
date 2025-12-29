// ============================================================================
//                         VIEW TASK MODAL (VIEW-ONLY)
// ============================================================================

import "./ViewTaskModal.css";
import { useTodo } from "../../context/TodoContext";

// Reusable icons + switch component + button styles
import { Icons } from "../../styles/iconLibrary";
import { Switch } from "../../styles/Switch";
import "../../styles/ButtonStyles.css";

// Utilities
import {
    formatDate,
    safeCategoryLabel,
    safeStatusLabel,
    toggleStatus,
    createStatusLock,
} from "../../utils/taskUtils";

const ViewTaskModal = () => {

    const { modal, closeModal, updateTask, openModal } = useTodo();

    // Only show when modal is open + type is "view"
    if (!modal.isOpen || modal.type !== "view") return null;

    const task = modal.data;
    if (!task) return null;

    // Anti-spam lock (prevents rapid status toggling)
    const lock = createStatusLock(300);

    const handleToggleStatus = async () => {
        if (lock()) return;

        const newStatus = toggleStatus(task.status);
        await updateTask(task._id, { status: newStatus });
    };

    // Border color uses the task's saved containerColor
    const borderColor = task.containerColor ?? "#000000";

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

                {/* CREATED AT + STATUS (LABEL ONLY) */}
                <div className="view-row">
                    <span className="view-created">
                        Created: {formatDate(task.createdAt)}
                    </span>

                    <span className={`view-status ${task.status}`}>
                        {safeStatusLabel(task.status)}
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

                    {/* STATUS SWITCH */}
                    <Switch
                        checked={task.status === "completed"}
                        disabled={task.status === "failed"}
                        onToggle={handleToggleStatus}
                    />

                    {/* EDIT BUTTON */}
                    <button
                        className="icon-btn-square"
                        onClick={() => openModal("edit", task)}
                    >
                        <Icons.Edit className="view-btn-icon" />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                        className="icon-btn-square delete"
                        onClick={() => openModal("deleteConfirm", {
                            taskIds: [task._id],
                        })}
                    >
                        <Icons.Delete className="view-btn-icon" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewTaskModal;

