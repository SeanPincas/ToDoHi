// ============================================================================
// RepeatTaskModal.tsx
// Blocking modal for repeating or deleting completed / failed tasks
// ============================================================================

import React, { useMemo, useState } from "react";
import { useTodo } from "../../../context/TodoContext";

import { modalOverlayStyle, modalCardBaseStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";
import type { Task } from "../../../api/taskApi";

import "./RepeatTaskModal.css";

// ------------------------------ TYPES ------------------------------
type FilterType = "all" | "completed" | "failed";

// ------------------------------ COMPONENT ------------------------------
const RepeatTaskModal: React.FC = () => {
    // Extract Data
    const { modal, openModal } = useTodo();

    // ------------------ LOCAL STATE ------------------
    const [filter, setFilter] = useState<FilterType>("all");
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const modalData = modal.type === "repeat" ? modal.data : null;
    const tasks = (modalData?.tasks ?? []) as Task[];

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

    return (
        <div
            style={modalOverlayStyle}
            className="repeat-modal-overlay"
        >
            <div
                style={modalCardBaseStyle}
                className="repeat-modal-card"
                onMouseDown={(e) => e.stopPropagation}
            >
                {/* ================= TITLE ================= */}
                <div className="repeat-modal-header">
                    <Icons.Repeat />
                    <h3>Repeat Tasks</h3>
                </div>

                {/* ================= DESCRIPTION ================= */}
                <p className="repeat-modal-description">
                    These are your <strong>Completed </strong>and <strong>Failed </strong>tasks from the previous day.
                    <br />
                    Choose which task/s you would like to repeat for today.
                    <br />
                    The <strong>UNSELECTED </strong>tasks will be permanently deleted.
                </p>

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
                <div className="repeat-task-list-wrapper">
                    <div className="repeat-task-list">
                    {visibleTasks.map((task: Task) => {
                        const isSelected = selected.has(task._id);

                        return (
                            <div
                                key={task._id}
                                className={`repeat-task-item ${task.status}`}
                                onClick={() => toggleTask(task._id)}
                            >
                                <div className="repeat-task-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        readOnly
                                    />
                                </div>

                                <div className="task-info">
                                    <span className="task-title">
                                        {task.title}
                                    </span>
                                    <span className="repeat-task-meta">
                                        {task.category} * {task.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="repeat-actions">
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