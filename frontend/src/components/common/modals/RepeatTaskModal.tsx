// ============================================================================
// RepeatTaskModal.tsx
// Blocking modal for repeating or deleting completed / failed tasks
// ============================================================================

import React, { useEffect, useMemo, useState } from "react";
import { useTodo } from "../../../context/TodoContext";

import { modalOverlayStyle } from "../../../styles/modalStyles";
import { Icons } from "../../../styles/iconLibrary";
import type { Task } from "../../../api/taskApi";
import DropdownMenu from "../dropdownMenu/DropdownMenu";
import { SegmentedSwitch } from "../switch/SegmentedSwitch";
import {
    TASK_CATEGORIES,
    CATEGORY_LABELS,
    TASK_CATEGORY_ICON_MAP,
    TASK_TABS,
    TASK_TAB_LABELS,
    TASK_COLORS,
    getContainerHex,
    resolveTaskContainerColorToHex,
    getTaskCategoryIconKey,
    getTaskStatusIconKey,
    safeCategoryLabel,
    safeStatusLabel,
    type TaskCategory,
    type TaskTab,
} from "../../../utils/taskUtils";

import "./modalBaseTheme.css";
import "./taskManagementModalTheme.css";
import "./RepeatTaskModal.css";

const TASK_REVIEW_MODAL_SNOOZE_KEY = "todohi_task_review_modal_snoozed_until";
const TASK_REVIEW_MODAL_SNOOZE_MS = 3 * 60 * 60 * 1000;

// ------------------------------ TYPES ------------------------------
// ------------------------------ COMPONENT ------------------------------
const RepeatTaskModal: React.FC = () => {
    // Extract Data
    const { modal, openModal, closeModal } = useTodo();

    // ------------------ LOCAL STATE ------------------
    const [activeTab, setActiveTab] = useState<TaskTab>("all");
    const [activeCategory, setActiveCategory] = useState<"all" | TaskCategory>("all");
    const [activeContainerColor, setActiveContainerColor] = useState<"all" | string>("all");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [snoozeReminder, setSnoozeReminder] = useState(false);

    const modalData = modal.type === "repeat" ? modal.data : null;
    const tasks = (modalData?.tasks ?? []) as Task[];
    const archiveLabel = modalData?.archiveLabel ?? "Task Archive";
    const retentionDays = modalData?.retentionDays ?? 30;
    const summary = modalData?.summary ?? {
        total: tasks.length,
        completed: tasks.filter((task) => task.status === "completed").length,
        failed: tasks.filter((task) => task.status === "failed").length,
    };

    const colorOptions = Object.entries(TASK_COLORS).flatMap(([colorName, shades]) => ([
        { value: `${colorName}-light`, label: `${colorName} light`, swatch: shades.light },
        { value: `${colorName}-normal`, label: `${colorName} normal`, swatch: shades.normal },
        { value: `${colorName}-dark`, label: `${colorName} dark`, swatch: shades.dark },
    ]));

    const categoryOptions = [
        { value: "all", label: "All", iconKey: "List" as const },
        ...TASK_CATEGORIES.map((cat) => ({
            value: cat,
            label: CATEGORY_LABELS[cat],
            iconKey: TASK_CATEGORY_ICON_MAP[cat],
        })),
    ];

    // ------------------ DERIVED STATE ------------------
    const visibleTasks = useMemo(() => {
        return tasks.filter((task) => {
            const statusMatch = activeTab === "all" ? true : task.status === activeTab;
            const categoryMatch = activeCategory === "all" ? true : task.category === activeCategory;
            const colorMatch = activeContainerColor === "all"
                ? true
                : resolveTaskContainerColorToHex(task.containerColor) === resolveTaskContainerColorToHex(activeContainerColor);
            return statusMatch && categoryMatch && colorMatch;
        });
    }, [tasks, activeTab, activeCategory, activeContainerColor]);

    useEffect(() => {
        if (modal.isOpen && modal.type === "repeat") {
            setSnoozeReminder(false);
        }
    }, [modal.isOpen, modal.type]);

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
        if (snoozeReminder) {
            localStorage.setItem(
                TASK_REVIEW_MODAL_SNOOZE_KEY,
                String(Date.now() + TASK_REVIEW_MODAL_SNOOZE_MS)
            );
        }
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
                        Choose which completed or failed tasks you want to bring into today as fresh tasks. Select past tasks you want to reuse as today’s tasks.
                    </p>

                    <p className="repeat-modal-sub-instruction">
                        Tasks you don&apos;t reuse today will be moved to the <strong>{archiveLabel}</strong> for up to <strong>{retentionDays} days</strong>.
                    </p>

                    <div className="repeat-modal-summary">
                        <span>Total: {summary.total}</span>
                        <span>Completed: {summary.completed}</span>
                        <span>Failed: {summary.failed}</span>
                    </div>

                    <div className="repeat-modal-archive-entry">
                        <button
                            type="button"
                            className="btn-secondary-rect repeat-modal-archive-btn"
                            onClick={() => openModal("taskArchive", {
                                returnTo: "repeat",
                                returnContext: modal.data,
                            })}
                        >
                            <Icons.Notebook />
                            <span>Open Task Archive</span>
                        </button>
                    </div>
                </div>

                {/* ================= FILTER TABS ================= */}
                <div className="todo-tabs repeat-modal-filters">
                    <SegmentedSwitch
                        value={activeTab}
                        options={TASK_TABS.map((tab) => ({
                            value: tab,
                            label: TASK_TAB_LABELS[tab],
                        }))}
                        onChange={setActiveTab}
                        className="todo-status-switch"
                    />

                    <div className="todo-category-menu repeat-modal-category-menu">
                        <DropdownMenu
                            label="Category"
                            value={activeCategory === "all" ? "All Categories" : CATEGORY_LABELS[activeCategory]}
                            selectedValue={activeCategory}
                            options={categoryOptions}
                            onChange={(value) => setActiveCategory(value as "all" | TaskCategory)}
                            maxHeight={235}
                            renderOption={(option) => {
                                const IconComp = option.iconKey ? Icons[option.iconKey] : null;
                                return (
                                    <span className="todo-category-option">
                                        {IconComp && <IconComp className="todo-category-option-icon" />}
                                        <span>{option.label}</span>
                                    </span>
                                );
                            }}
                        />
                    </div>

                    <div className="todo-color-menu repeat-modal-color-menu">
                        <DropdownMenu
                            label="Container Color"
                            value="Container Color"
                            selectedValue={activeContainerColor}
                            options={[
                                { value: "all", label: "All", swatch: "transparent" },
                                ...colorOptions,
                            ]}
                            onChange={(value) => setActiveContainerColor(value)}
                            maxHeight={260}
                            menuClassName="todo-color-grid-menu"
                            itemClassName="todo-color-grid-item"
                            renderValue={(selected) => {
                                const swatchColor = selected?.value === "all" ? "transparent" : selected?.swatch;
                                return (
                                    <span className="todo-color-trigger-value">
                                        <span
                                            className={`todo-color-trigger-swatch ${selected?.value === "all" ? "all" : ""}`}
                                            style={swatchColor ? { backgroundColor: swatchColor } : undefined}
                                        />
                                        <span className="todo-filter-text">
                                            {selected?.value === "all" || !selected ? "All Colors" : "Color"}
                                        </span>
                                    </span>
                                );
                            }}
                            renderOption={(option, isActive) => (
                                option.value === "all" ? (
                                    <span className={`todo-color-all-option ${isActive ? "active" : ""}`}>
                                        All
                                    </span>
                                ) : (
                                    <span
                                        className={`todo-color-option-fill ${isActive ? "active" : ""}`}
                                        style={{ backgroundColor: option.swatch }}
                                    />
                                )
                            )}
                        />
                    </div>
                </div>

                {/* ================= TASK LIST ================= */}
                <div className="repeat-task-list-wrapper task-management-modal-panel">
                    <div className="repeat-task-list">
                        {visibleTasks.map((task: Task) => {
                            const isSelected = selected.has(task._id);
                            const accentColor = task.containerColor?.startsWith("#")
                                ? task.containerColor
                                : getContainerHex(task.containerColor);
                            const CategoryIcon = Icons[getTaskCategoryIconKey(task.category)];
                            const StatusIcon = Icons[getTaskStatusIconKey(task.status)];

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

                                        <span
                                            className="repeat-task-color-line"
                                            style={{ backgroundColor: accentColor || "var(--text-main)" }}
                                            aria-hidden="true"
                                            title={`Task color: ${task.containerColor}`}
                                        />

                                        <div className="repeat-task-subinfo-right">
                                            <span className="repeat-task-meta-label">
                                                {safeCategoryLabel(task.category)}
                                            </span>
                                            <CategoryIcon className="repeat-task-meta-icon repeat-task-category-icon" />
                                            <span className={`repeat-task-meta-label repeat-task-status-label ${task.status}`}>
                                                {safeStatusLabel(task.status)}
                                            </span>
                                            <StatusIcon className={`repeat-task-meta-icon repeat-task-status-icon ${task.status}`} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <label className="repeat-snooze-option">
                    <input
                        type="checkbox"
                        checked={snoozeReminder}
                        onChange={(e) => setSnoozeReminder(e.target.checked)}
                    />
                    <span>Remind me again later (3hrs)</span>
                </label>

                {/* ================= ACTIONS ================= */}
                <div className="repeat-actions task-management-modal-actions">
                    <button
                        className="btn-secondary-rect repeat-action-btn repeat-action-btn-dismiss"
                        onClick={handleDismiss}
                    >
                        <Icons.Close />
                        <span>Dismiss</span>
                    </button>

                    <button
                        className="btn-danger-rect repeat-action-btn repeat-action-btn-delete"
                        onClick={handleDeleteAll}
                    >
                        <Icons.Delete />
                        <span>Delete All</span>
                    </button>

                    <button
                        className="btn-green-rect repeat-action-btn repeat-action-btn-repeat"
                        onClick={handleRepeatAll}
                    >
                        <Icons.Repeat />
                        <span>Repeat All</span>
                    </button>

                    <button
                        className="btn-primary-rect repeat-action-btn repeat-action-btn-confirm"
                        disabled={selected.size === 0}
                        onClick={handleConfirmSelected}
                    >
                        <Icons.Confirm />
                        <span>Confirm Selected</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RepeatTaskModal;
