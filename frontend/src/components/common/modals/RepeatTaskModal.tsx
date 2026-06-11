// ============================================================================
// RepeatTaskModal.tsx
// Blocking modal for repeating or deleting completed / failed tasks
// ============================================================================

import React, { useMemo, useState } from "react";
import { useTodo } from "../../../context/TodoContext";

import { modalOverlayStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";
import type { Task } from "../../../api/taskApi";

import "./RepeatTaskModal.css";
import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";

// ------------------------------ TYPES ------------------------------
type FilterType = "all" | "completed" | "failed";

// ------------------------------ COMPONENT ------------------------------
const RepeatTaskModal: React.FC = () => {
    // Extract Data
    const { modal, openModal, closeModal } = useTodo();

    // ------------------ LOCAL STATE ------------------
    const [filter, setFilter] = useState<FilterType>("all");
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const modalData = modal.type === "repeat" ? modal.data : null;
    const tasks = (modalData?.tasks ?? []) as Task[];
    const archiveLabel = modalData?.archiveLabel ?? "Failed Task Archive";
    const retentionDays = modalData?.retentionDays ?? 30;
    const summary = modalData?.summary ?? {
        total: tasks.length,
        completed: tasks.filter((task) => task.status === "completed").length,
        failed: tasks.filter((task) => task.status === "failed").length,
    };

    // ------------------ DERIVED STATE ------------------
    const visibleTasks = useMemo(() => {
        if (filter === "all") return tasks;
        return tasks.filter(t => t.status === filter);
    }, [tasks, filter]);

    // ------------------ GUARD ------------------
    if (!modal.isOpen || modal.type !== "repeat") return null;

    // ------------------ TOGGLES -----------------
    const toggleTask = (taskId: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(taskId) ? next.delete(taskId) : next.add(taskId);
            return next;
        });
    };

    // ------------------ VIEW TASK ------------------
    const handleViewTask = (task: Task) => {
        openModal("view", {
            task,
            returnTo: "repeat",
            returnContext: modal.data
        });
    };

    // ------------------ ACTION HANDLERS (UI ONLY) ------------------

    const handleDeleteAll = () => {
        openModal("deleteConfirm", {
            taskIds: tasks.map(t => t._id),
            returnContext: modal.data
        });
        console.log("[RepeatTaskModal] Delete All clicked");
    };

    const handleRepeatAll = () => {
        openModal("repeatConfirm", {
            mode: "repeatAll",
            allTaskIds: tasks.map(t => t._id),
            returnContext: modal.data
        });
        console.log("[RepeatTaskModal] Repeat All clicked");
    };

    const handleConfirmSelected = () => {
        if (selected.size === 0) return;

        openModal("repeatConfirm", {
            mode: "confirmSelected",
            selectedIds: Array.from(selected),
            allTaskIds: tasks.map(t => t._id),
            returnContext: modal.data
        });
        console.log(
            "[RepeatTaskModal] Confirm Selected:",
            Array.from(selected)
        );
    };

    const handleDismiss = () => {
        closeModal();
    };

    return (
        <div
            style={modalOverlayStyle}
            className="repeat-modal-overlay"
            onMouseDown={handleDismiss}
        >
            <div
                className="modal-card-base repeat-modal-card task-management-modal paper-sheet-lines"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* ================= TITLE ================= */}
                <div className="repeat-modal-header task-management-modal-header">
                    <div className="task-management-modal-title-group">
                        <Icons.Repeat />
                        <h3>Review Yesterday&apos;s Tasks</h3>
                    </div>
                    <button
                        type="button"
                        className="icon-btn-square repeat-modal-close-btn"
                        onClick={handleDismiss}
                        aria-label="Close review task modal"
                    >
                        <Icons.Close />
                    </button>
                </div>

                {/* ================= DESCRIPTION ================= */}
                <div className="repeat-modal-copy-block">
                    <p className="repeat-modal-description task-management-modal-subtitle">
                        Choose which completed or failed tasks you want to bring into today as fresh tasks.
                    </p>

                    <p className="repeat-modal-sub-instruction">
                        <strong>Unselected Failed/Completed tasks</strong> move to <strong>{archiveLabel}</strong> and stay there for up to <strong>{retentionDays} days</strong>.
                    </p>

                    <div className="repeat-modal-summary">
                        <span>Total: {summary.total}</span>
                        <span>Completed: {summary.completed}</span>
                        <span>Failed: {summary.failed}</span>
                    </div>
                </div>

                {/* ================= FILTER TABS ================= */}
                <div className="repeat-filter-tabs">
                    {["all", "completed", "failed"].map(f => (
                        <button
                            key={f}
                            className={`repeat-filter-btn ${filter === f ? "active" : ""
                                }`}
                            onClick={() => setFilter(f as FilterType)}
                        >
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* ================= TASK LIST ================= */}
                <div className="repeat-task-list-wrapper task-management-modal-panel">
                    <div className="repeat-task-list">
                        {visibleTasks.map((task: Task) => {
                            const isSelected = selected.has(task._id);

                            return (
                                <div
                                    key={task._id}
                                    className={`repeat-task-item ${task.status}`}
                                    onClick={() => handleViewTask(task)}
                                >
                                    {/* CHECKBOX — selection only */}
                                    <div
                                        className="repeat-task-checkbox"
                                        onClick={(e) => {
                                            e.stopPropagation(); // ❗ stops view modal
                                            toggleTask(task._id);
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                        />
                                    </div>

                                    <div className="repeat-task-body">
                                        <span className="repeat-task-title">
                                            {task.title}
                                        </span>
                                        <div className="repeat-task-subinfo-right">
                                            <span className="repeat-task-meta-label">
                                                {task.category}
                                            </span>
                                            <span className="repeat-task-meta-separator">&bull;</span>
                                            <span className="repeat-task-meta-label">
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="repeat-actions task-management-modal-actions">
                    <button
                        className="btn-secondary-rect"
                        onClick={handleDismiss}
                    >
                        Dismiss
                    </button>

                    <button
                        className="btn-danger-rect" onClick={handleDeleteAll}>
                        Delete All
                    </button>

                    <button
                        className="btn-green-rect" onClick={handleRepeatAll}>
                        Repeat All
                    </button>

                    <button
                        className="btn-primary-rect"
                        disabled={selected.size === 0}
                        onClick={handleConfirmSelected}
                    >
                        Confirm Selected
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepeatTaskModal;

