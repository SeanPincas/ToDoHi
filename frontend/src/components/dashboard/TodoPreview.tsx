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

// Context + types
import { useTodo } from "../../context/TodoContext";
import type { Task } from "../../api/taskApi";

// Components
import { SortableTaskItem } from "../todo/SortableTaskItem";

// Icons
import { Icons } from "../../styles/iconLibrary";

// Task utilities
import {
    TASK_TABS,
    TASK_TAB_LABELS,
    type TaskTab,
} from "../../utils/taskUtils";

// NEW Shared Styles
import "../../styles/buttonStyles.css"; // <-- NEW BUTTON STYLE IMPORT

// ------------------------------ COMPONENT START ------------------------------
const TodoPreview: React.FC = () => {
    const {
        filterAll,
        filterPending,
        filterCompleted,
        filterFailed,
        reorderTasks,
        updateTask,
        openModal,
    } = useTodo();

    // =====================================================================
    //                              UI STATES
    // =====================================================================
    const [activeTab, setActiveTab] = useState<TaskTab>("pending");

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

    const tasks = getActiveList();

    // =====================================================================
    //                            DND-KIT SETUP
    // =====================================================================
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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
    //                        OPEN VIEW TASK MODAL
    // =====================================================================
    const openViewTask = (task: Task) => {
        if (isRearrangeMode || isDeleteMode) return;
        openModal("view", task);
    };

    // =====================================================================
    //                                 RENDER
    // =====================================================================
    return (
        <div className="todo-preview-container">

            {/* =============================================================== */}
            {/*                          HEADER                                 */}
            {/* =============================================================== */}
            <div className="todo-preview-header">
                <h2 className="todo-preview-title">To-Do List</h2>

                <div className="todo-preview-actions">
                    {/* REARRANGE BUTTON */}
                    <button
                        className={`icon-btn-square ${isRearrangeMode ? "active" : ""}`}
                        onClick={() => setIsRearrangeMode(prev => !prev)}
                    >
                        <Icons.Drag />
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                        className={`icon-btn-square delete ${isDeleteMode ? "active" : ""}`}
                        onClick={() => setIsDeleteMode(prev => !prev)}
                    >
                        <Icons.Delete />
                    </button>
                </div>
            </div>

            {/* =============================================================== */}
            {/*                           FILTER TABS                           */}
            {/* =============================================================== */}
            <div className="todo-tabs">
                {TASK_TABS.map(tab => (
                    <button
                        key={tab}
                        className={activeTab === tab ? "active" : ""}
                        onClick={() => setActiveTab(tab)}
                    >
                        {TASK_TAB_LABELS[tab].toUpperCase()}
                    </button>
                ))}
            </div>

            {/* =============================================================== */}
            {/*                     TASK LIST + DRAG & DROP                     */}
            {/* =============================================================== */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
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

            {/* =============================================================== */}
            {/*                      ADD TASK BUTTON (REFINED)                  */}
            {/* =============================================================== */}
            <button
                className="btn-primary-rect add-task-btn"
                onClick={() => openModal("add")}
            >
                <Icons.Add /> Add Task
            </button>

        </div>
    );
};

export default TodoPreview;
