// ============================================================================
//                         VIEW TASK MODAL (VIEW-ONLY)
// ============================================================================
import { useEffect, useState } from "react";
import "./ViewTaskModal.css";
import { useTodo } from "../../context/TodoContext";
import { modalOverlayStyle } from "../../styles/modalStyles";

// Reusable icons + switch component + button styles
import { Icons } from "../../styles/iconLibrary";
import { Switch } from "../common/switch/Switch";
import "../../styles/ButtonStyles.css";
import "../common/modals/modalBaseTheme.css";
import "../common/modals/taskManagementModalTheme.css";

// Utilities
import {
    formatDate,
    getTaskCategoryIconKey,
    getTaskStatusIconKey,
    safeCategoryLabel,
    safeStatusLabel,
    toggleStatus,
    createStatusLock,
    type TaskStatus,
} from "../../utils/taskUtils";


const ViewTaskModal = () => {

    const { modal, closeModal, updateTask, openModal } = useTodo();
    // ====================== 1️⃣ EXTRACT DATA (NO RETURNS) ======================
    const task = modal?.data?.task ?? null;
    const returnTo = modal?.data?.returnTo ?? null;
    const returnContext = modal?.data?.returnContext ?? null;
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
    const isFromRepeat = returnTo === "repeat";
    const isLiveTaskView = !isFromRepeat && returnTo !== "taskArchive";
    const shouldShowRepeatedAt = returnTo === "repeat" || returnTo === "taskArchive";
    const failedReason = "Failed tasks are locked.";

    // Border color uses the task's saved containerColor
    const borderColor = task.containerColor ?? "#000000";
    const repeatedAtValue = task.repeatedAt ?? null;
    const CategoryIcon = Icons[getTaskCategoryIconKey(task.category)];
    const StatusIcon = Icons[getTaskStatusIconKey(localStatus)];

    // ====================== HANDLERS ==========================================
    const handleToggleStatus = async () => {
        if (!lock()) return;

        const newStatus = toggleStatus(localStatus);

        setLocalStatus(newStatus);

        await updateTask(task._id, { status: newStatus });
    };

    const handleClose = () => {
        if (returnTo === "repeat") {
            openModal("repeat", returnContext);
        } else if (returnTo === "taskArchive") {
            openModal("taskArchive", returnContext);
        } else {
            closeModal();
        }
    };

    return (
        <div
            style={modalOverlayStyle}
            className="view-modal-overlay"
            onMouseDown={handleClose} // click outside = close
        >
            <div
                className="modal-card-base view-modal-card task-management-modal paper-sheet-lines"
                style={{ ["--view-task-accent" as string]: borderColor }}
                onMouseDown={(e) => e.stopPropagation()} // prevent close when clicking inside
            >
                {/* HEADER + CLOSE BUTTON (TOP RIGHT) */}
                <div className="view-header task-management-modal-header">
                    <div className="task-management-modal-title-group view-title-group">
                        <Icons.CheckboxOffset />
                        <h3>{task.title}</h3>
                    </div>

                    <button
                        className="icon-btn-square task-management-modal-close-btn"
                        onClick={handleClose}
                        aria-label="Close task preview"
                    >
                        <Icons.Close className="view-btn-icon" />
                    </button>
                </div>

                <span
                    className="view-title-accent-line"
                    style={{ backgroundColor: task.containerColor || borderColor }}
                    aria-hidden="true"
                />

                <div className="view-content-lines">
                    <div className="view-info-row">
                        <span className="view-info-item">
                            <strong>Category:</strong> {safeCategoryLabel(task.category)}
                        </span>
                        <CategoryIcon className="view-inline-icon" />
                        <span
                            className="view-color-tag"
                            style={{ backgroundColor: task.containerColor }}
                            aria-label={`Task color ${task.containerColor}`}
                        />
                    </div>

                    <div className="view-info-row">
                        <span className="view-info-item">
                            <strong>Status:</strong> {safeStatusLabel(localStatus)}
                        </span>
                        <StatusIcon className={`view-inline-icon view-inline-status-icon ${localStatus}`} />
                    </div>

                    <div className="view-info-row">
                        <span className="view-info-item">
                            <strong>Created At:</strong> {formatDate(task.createdAt)}
                        </span>
                    </div>

                    <div className="view-info-row">
                        <span className="view-info-item">
                            <strong>Completed At:</strong> {formatDate(task.completedAt ?? null)}
                        </span>
                    </div>

                    <div className="view-info-row">
                        <span className="view-info-item">
                            <strong>Failed At:</strong> {formatDate(task.failedAt ?? null)}
                        </span>
                    </div>

                    {shouldShowRepeatedAt && (
                        <div className="view-info-row">
                            <span className="view-info-item">
                                <strong>Repeated At:</strong> {formatDate(repeatedAtValue)}
                            </span>
                        </div>
                    )}
                </div>

                {/* DESCRIPTION BOX */}
                <div
                    className="view-description-box task-management-modal-panel"
                >
                    <p className="view-description-label">Task Notes</p>
                    <div className="view-description-content">
                        {task.description?.trim() || "No Description Provided."}
                    </div>
                </div>

                {/* ACTIONS ROW (SWITCH + EDIT + DELETE) */}
                {isLiveTaskView && (
                    <div className="view-actions">

                        <div className="view-actions-left">
                            {/* STATUS SWITCH */}
                            <Switch
                                checked={localStatus === "completed"}
                                disabled={isFailed}
                                disabledReason={failedReason}
                                onToggle={handleToggleStatus}
                            />
                            <span className={`task-management-modal-chip view-chip view-status-action ${localStatus}`}>
                                {safeStatusLabel(localStatus)}
                            </span>
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
                )}
            </div>
        </div>
    );
};

export default ViewTaskModal;

