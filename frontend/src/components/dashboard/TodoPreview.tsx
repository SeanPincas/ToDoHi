// =================================================================================
//                            TODO PREVIEW (DASHBOARD)
// =================================================================================

import React, { useState } from "react";
import "./TodoPreview.css";

// dnd-kit imports
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
    restrictToVerticalAxis,
    restrictToParentElement,
} from "@dnd-kit/modifiers";

import { useTodo } from "../../context/TodoContext";
import type { Task } from "../../api/taskApi";
import { SortableTaskItem } from "../todo/SortableTaskItem";
import { Icons } from "../../styles/iconLibrary";
import DropdownMenu from "../common/dropdownMenu/DropdownMenu";
import { SegmentedSwitch } from "../common/switch/SegmentedSwitch";
import bougainvilleaImage from "../../assets/bougainvillea.webp";

// Task utilities
import {
    TASK_CATEGORIES,
    CATEGORY_LABELS,
    TASK_CATEGORY_ICON_MAP,
    TASK_TABS,
    TASK_TAB_LABELS,
    TASK_COLORS,
    type TaskTab,
    type TaskCategory,
} from "../../utils/taskUtils";

import "../../styles/buttonStyles.css"

// ------------------------------ COMPONENT START ------------------------------
const TodoPreview: React.FC = () => {
    const {
        filterAll,
        filterPending,
        filterCompleted,
        filterFailed,
        reorderTasks,
        updateTask,
        deleteTask,
        openModal,
        closeModal,
    } = useTodo();

    // =====================================================================
    //                              UI STATES
    // =====================================================================
    const [activeTab, setActiveTab] = useState<TaskTab>("all");
    const [activeCategory, setActiveCategory] = useState<"all" | TaskCategory>("all");
    const [activeContainerColor, setActiveContainerColor] = useState<"all" | string>("all");

    const [isRearrangeMode, setIsRearrangeMode] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [selectedToDelete, setSelectedToDelete] = useState<string[]>([]);

    // =====================================================================
    //                              FILTER LOGIC
    // =====================================================================
    const getActiveList = (): Task[] => {
        switch (activeTab) {
            case "all": return filterAll;
            case "pending": return filterPending;
            case "completed": return filterCompleted;
            case "failed": return filterFailed;
            default: return filterPending;
        }
    };

    const tasks = getActiveList().filter((task) => {
        const categoryMatch = activeCategory === "all" ? true : task.category === activeCategory;
        const colorMatch = activeContainerColor === "all" ? true : task.containerColor === activeContainerColor;
        return categoryMatch && colorMatch;
    });

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

    // =====================================================================
    //                            DND-KIT SETUP
    // =====================================================================
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: isRearrangeMode
                ? { distance: 2 }   // short drag threshold when rearranging
                : { distance: 9999 } // effectively disables drag in normal mode
        })
    );
    const handleDragEnd = (event: any) => {
        if (!isRearrangeMode) return;

        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = tasks.findIndex((t) => t._id === active.id);
        const newIndex = tasks.findIndex((t) => t._id === over.id);

        const newOrder = arrayMove(tasks, oldIndex, newIndex);
        reorderTasks(newOrder);
    };

    // =====================================================================
    //                        TOGGLE COMPLETION STATUS
    // =====================================================================
    const toggleCompletion = (task: Task) => {
        const newStatus = task.status === "completed" ? "pending" : "completed";
        updateTask(task._id, { status: newStatus });
    };

    // =====================================================================
    //                        DELETE SELECTION TOGGLE
    // =====================================================================
    const toggleDeleteSelection = (taskId: string) => {
        setSelectedToDelete(prev =>
            prev.includes(taskId)
                ? prev.filter((id) => id !== taskId)
                : [...prev, taskId]
        );
    };

    // =====================================================================
    //                        OPEN DELETE CONFIRM MODAL
    // =====================================================================
    const openDeleteConfirm = () => {
        if (selectedToDelete.length === 0) return;

        openModal("deleteConfirm", {
            taskIds: selectedToDelete,
            onConfirm: handleConfirmDelete,
        });
    };

    const handleConfirmDelete = async (taskIds: string[]) => {
        try {
            for (const id of taskIds) {
                await deleteTask(id)
            }

            // EXIT delete mode 
            setIsDeleteMode(false);

            closeModal();
        } catch (err) {
            console.error("Bulk delete Failed: ", err)
        }
    }

    // =====================================================================
    //                        OPEN VIEW TASK MODAL
    // =====================================================================
    const openViewTask = (task: Task) => {
        if (isRearrangeMode || isDeleteMode) return;
        openModal("view", { task });
    };

    // =====================================================================
    //                                 RENDER
    // =====================================================================
    return (
        <div
            className={`todo-preview-container
            ${isDeleteMode ? "delete-mode" : ""}
            ${isRearrangeMode ? "rearrange-mode" : ""}
            `}
        >
            {/* =============================================================== */}
            {/*                          HEADER                                 */}
            {/* =============================================================== */}
            <div className="todo-preview-header">
                <div className="todo-mode-label-slot">
                    {isDeleteMode && <span className="mode-label delete">Delete Mode</span>}
                    {isRearrangeMode && <span className="mode-label rearrange">Rearrange Mode</span>}
                </div>

                <div className="todo-preview-title-wrap">
                    <h2 className="todo-preview-title">To-Do List</h2>
                </div>

                <div
                    aria-hidden="true"
                    className="todo-preview-header-flower"
                    style={{ backgroundImage: `url(${bougainvilleaImage})` }}
                />

                <div className="todo-preview-actions">

                    {/* REARRANGE BUTTON */}
                    <button
                        className={`icon-btn-square ${isRearrangeMode ? "active" : ""}`}
                        aria-label={isRearrangeMode ? "Cancel rearrange mode" : "Enable rearrange mode"}
                        title={isRearrangeMode ? "Cancel rearrange mode" : "Enable rearrange mode"}
                        onClick={() => {
                            setIsRearrangeMode(prev => {
                                const next = !prev;

                                // If turning rearrange mode ON → force delete OFF
                                if (next) {
                                    setIsDeleteMode(false);
                                }

                                return next;
                            });

                            setSelectedToDelete([]);
                        }}
                    >
                        {isRearrangeMode ? <Icons.Close /> : <Icons.Drag />}
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                        className={`icon-btn-square delete ${isDeleteMode ? "active" : ""}`}
                        onClick={() => {
                            setIsDeleteMode(prev => {
                                const next = !prev;

                                // if Turning Delete Mode On > force Rearrange Off
                                if (next) {
                                    setIsRearrangeMode(false);
                                }

                                return next;
                            });

                            setSelectedToDelete([]);
                        }}
                    >
                        {isDeleteMode ? <Icons.Close /> : <Icons.Delete />}
                    </button>
                </div>
            </div>

            {/* =============================================================== */}
            {/*                           FILTER TABS                           */}
            {/* =============================================================== */}
            <div className="todo-tabs">
                <SegmentedSwitch
                    value={activeTab}
                    options={TASK_TABS.map((tab) => ({
                        value: tab,
                        label: TASK_TAB_LABELS[tab],
                    }))}
                    onChange={setActiveTab}
                    className="todo-status-switch"
                />

                <div className="todo-category-menu">
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

                <div className="todo-color-menu">
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
                                    <span className="todo-filter-text">{selected?.value === "all" || !selected ? "All Colors" : "Color"}</span>
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

            {/* =============================================================== */}
            {/*                     TASK LIST + DRAG & DROP                     */}
            {/* =============================================================== */}
            <div className="todo-list-container">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[
                        restrictToVerticalAxis,
                        restrictToParentElement,
                    ]}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={tasks.map((t) => t._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="todo-list">
                            {tasks.map(task => (
                                <SortableTaskItem
                                    key={task._id}
                                    task={task}
                                    isRearrangeMode={isRearrangeMode}
                                    isDeleteMode={isDeleteMode}
                                    selectedToDelete={selectedToDelete}
                                    toggleDeleteSelection={toggleDeleteSelection}
                                    toggleCompletion={toggleCompletion}
                                    onOpenView={() => openViewTask(task)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* ==================== ADD TASK ===================== */}
                {!isDeleteMode && !isRearrangeMode && (
                    <button
                        className="btn-primary-rect primary-btn todo-list-add-btn"
                        onClick={() => openModal("add")}
                    >
                        <Icons.Add /> <span className="todo-main-action-text">Add Task</span>
                    </button>
                )}

                {isDeleteMode && (
                    <button
                        className="btn-danger-rect primary-btn todo-list-add-btn todo-list-mode-btn"
                        disabled={selectedToDelete.length === 0}
                        onClick={openDeleteConfirm}
                    >
                        <Icons.Delete />
                        <span className="todo-main-action-text">Delete Selected ({selectedToDelete.length})</span>
                    </button>
                )}

                {!isDeleteMode && isRearrangeMode && (
                    <button
                        className="btn-info-rect primary-btn todo-list-add-btn todo-list-mode-btn"
                        onClick={() => {
                            setIsRearrangeMode(false)
                        }}
                    >
                        <Icons.Check />
                        <span className="todo-main-action-text">Confirm Arrangment</span>
                    </button>
                )}
            </div>

        </div >
    );
};

export default TodoPreview;
