// =================================================================================
//                            TODO PREVIEW (DASHBOARD)
// =================================================================================

import { useState } from "react";
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

import { useTodo } from "../../context/TodoContext";
import type { Task } from "../../api/taskApi";

// Sortable Item Component
import { SortableTaskItem } from "../todo/SortableTaskItem";

// Icons
import { RiDragMove2Fill } from "react-icons/ri";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { RiAddFill } from "react-icons/ri";

// ------------------------------ COMPONENT START ------------------------
const TodoPreview = () => {
  const {
    filterAll,
    filterOngoing,
    filterCompleted,
    filterFailed,
    reorderTasks,
    updateTask,
    openModal, // ← required for AddTaskModal
  } = useTodo();

  // =====================================================================
  //                              UI STATES
  // =====================================================================
  const [activeTab, setActiveTab] =
    useState<"all" | "ongoing" | "completed" | "failed">("ongoing");

  const [isRearrangeMode, setIsRearrangeMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<string[]>([]);

  // =====================================================================
  //                              FILTER LOGIC
  // =====================================================================
  const getActiveList = (): Task[] => {
    switch (activeTab) {
      case "all":
        return filterAll;
      case "ongoing":
        return filterOngoing;
      case "completed":
        return filterCompleted;
      case "failed":
        return filterFailed;
      default:
        return filterOngoing;
    }
  };

  const tasks = getActiveList();

  // =====================================================================
  //                            DND-KIT SETUP
  // =====================================================================
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
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
    const newStatus = task.status === "completed" ? "ongoing" : "completed";
    updateTask(task._id, { status: newStatus });
  };

  // =====================================================================
  //                        DELETE SELECTION TOGGLE
  // =====================================================================
  const toggleDeleteSelection = (taskId: string) => {
    setSelectedToDelete((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  // =====================================================================
  //                                 RENDER
  // =====================================================================
  return (
    <div className="todo-preview-container">

      {/* =============================================================== */}
      {/*                          HEADER: TITLE + BUTTONS                */}
      {/* =============================================================== */}
      <div className="todo-preview-header">
        <h2 className="todo-preview-title">To-Do List</h2>

        <div className="todo-preview-actions">
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

      {/* =============================================================== */}
      {/*                           FILTER TABS                           */}
      {/* =============================================================== */}
      <div className="todo-tabs">
        <button
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          ALL
        </button>

        <button
          className={activeTab === "ongoing" ? "active" : ""}
          onClick={() => setActiveTab("ongoing")}
        >
          ONGOING
        </button>

        <button
          className={activeTab === "completed" ? "active" : ""}
          onClick={() => setActiveTab("completed")}
        >
          COMPLETED
        </button>

        <button
          className={activeTab === "failed" ? "active" : ""}
          onClick={() => setActiveTab("failed")}
        >
          FAILED
        </button>
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

      {/* =============================================================== */}
      {/*                        ADD TASK BUTTON                          */}
      {/* =============================================================== */}
      <button className="add-task-btn" onClick={() => openModal("add")}>
        <RiAddFill /> Add Task
      </button>
    </div>
  );
};

export default TodoPreview;
