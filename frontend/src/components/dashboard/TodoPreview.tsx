// =====================================================================================================
//                                           TODO PREVIEW (DASHBOARD)
// =====================================================================================================
import { useState } from "react";
import "./TodoPreview.css";

// dnd-kit imports
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core"

import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";


import { useTodo } from "../../context/TodoContext";
import type { Task } from "../../api/taskApi";

// Sortable Item Components
import { SortableTaskItem } from "../todo/SortableTaskItem";

// Icons (you can replace with your preferred icon library)
import { RiDragMove2Fill } from "react-icons/ri";   // rearrange icon
import { RiDeleteBin6Fill } from "react-icons/ri"   // delete mode icon
import { RiAddFill } from "react-icons/ri"          // add task button

// ------------------------------ COMPONENT START ------------------------
const TodoPreview = () => {
    const {
        filterAll,
        filterOngoing,
        filterCompleted,
        filterFailed,
        reorderTasks,
        updateTask,
    } = useTodo();

    // =================================================================================================
    //                                       LOCAL UI STATES
    // =================================================================================================

    // Sorting tabs: ALL / ONGOING / COMPLETED / FAILED
    const [activeTab, setActiveTab] = useState<"all" | "ongoing" | "completed" | "failed">("ongoing");


    // Rearrange Mode Toggle
    const [isRearrangeMode, setIsRearrangeMode] = useState(false);

    // Delete mode toggle
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    // Selected items to delete
    const [selectedToDelete, setSelectedToDelete] = useState<string[]>([]);

    // =================================================================================================
    //                                      GET TASK LIST BY ACTIVE TAB
    // =================================================================================================
    const getActiveList = (): Task[] => {
        switch (activeTab) {
            case "all": return filterAll;
            case "ongoing": return filterOngoing;
            case "completed": return filterCompleted;
            case "failed": return filterFailed;
            default: return filterOngoing;
        }
    };

    const tasks = getActiveList();

    // =================================================================================================
    //                                      DND-KIT SETUP
    // =================================================================================================
    // PointerSensor = allows dragging with mouse, touch, stylus
    // Sensors bundle all input methods together
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    // ------------------------------  WHERE DND LOGIC HAPPENS -------------------------------
    const handleDragEnd = (event: any) => {
        if (!isRearrangeMode) return;                   // drag disabled unless rearrange mode is ON

        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = tasks.findIndex((t) => t._id === active.id);
            const newIndex = tasks.findIndex((t) => t._id === over.id);

            const newOrder = arrayMove(tasks, oldIndex, newIndex);

            // Save to backend + update state via TodoContext
            reorderTasks(newOrder);
        }
    };

    // =================================================================================================
    //                                 HANDLE CHECKBOX COMPLETION
    // =================================================================================================
    const toggleCompletion = (task: Task) => {
        const newStatus = task.status === "completed" ? "ongoing" : "completed";
        updateTask(task._id, { status: newStatus });
    };

    // =================================================================================================
    //                             HANDLE DELETE MODE SELECTION
    // =================================================================================================
    const toggleDeleteSelection = (taskId: string) => {
        setSelectedToDelete(prev => 
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    // =================================================================================================
    //                                   UI COMPONENT RENDER
    // =================================================================================================

    return (
        <div className="todo-preview-container">

            {/* ------------- HEADER AREA ------------- */}
            <div className="todo-preview-header">

                {/* Sorting Tabs */}
                <div className="todo-tabs">
                    <button
                        className={activeTab === "all" ? "active" : ""}
                        onClick={() => setActiveTab("all")}>ALL</button>
                    <button
                        className={activeTab === "ongoing" ? "active" : ""}
                        onClick={() => setActiveTab("ongoing")}>ONGOING</button>
                    <button
                        className={activeTab === "completed" ? "active" : ""}
                        onClick={() => setActiveTab("completed")}>COMPLETED</button>
                    <button
                        className={activeTab === "failed" ? "active" : ""}
                        onClick={() => setActiveTab("failed")}>FAILED</button>
                </div>

                {/* Rearrange / Delete buttons */}
                <div className="todo-preview-action">
                    <button
                        className={`icon-btn ${isRearrangeMode ? "active" : ""}`}
                        onClick={() => setIsRearrangeMode(!isRearrangeMode)}
                    >
                        <RiDragMove2Fill />
                    </button>

                    <button
                        className={`icon-btn ${isDeleteMode ? "active" : ""}`}
                        onClick={() => setIsDeleteMode(!isDeleteMode)}
                    >
                        <RiDeleteBin6Fill />
                    </button>
                </div>
            </div>

            {/* ---------- TASK LIST WITH DND ---------- */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={tasks.map(t => t._id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="todo-list">
                        {tasks.map((task) => (
                            <SortableTaskItem
                                key={task._id}
                                task={task}
                                isRearrangeMode={isRearrangeMode}
                                isDeleteMode={isDeleteMode}
                                selectedToDelete={selectedToDelete}
                                toggleDeleteSelection={toggleDeleteSelection}
                                toggleCompletion={toggleCompletion}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* ---------- ADD TASK BUTTON ---------- */}
            <button className="add-task-btn">
                <RiAddFill /> Add Task
            </button>
        </div>
    );
};

export default TodoPreview;