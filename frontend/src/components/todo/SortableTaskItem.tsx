// =====================================================================================================
//                                     SORTABLE TASK ITEM (DND ITEM)
// =====================================================================================================
import "./TodoItems.css";
import type { Task } from "../../api/taskApi";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { RiDragMove2Fill } from "react-icons/ri";
import { RiCheckboxCircleFill, RiCheckboxBlankCircleLine } from "react-icons/ri";
import { RiCheckboxFill } from "react-icons/ri";

interface SortableTaskProps {
    task: Task;
    isRearrangeMode: boolean;
    isDeleteMode: boolean;
    selectedToDelete: string[];

    toggleDeleteSelection: (taskId: string) => void;
    toggleCompletion: (task: Task) => void;
}

// ------------------------------ COMPONENT START -----------------------------------
export const SortableTaskItem = ({
    task,
    isRearrangeMode,
    isDeleteMode,
    selectedToDelete,
    toggleDeleteSelection,
    toggleCompletion,
}: SortableTaskProps) => {

    // =================================================================================================
    //                                 DND-KIT SORTABLE HOOK
    // =================================================================================================
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id });

    // Transform for animation
    const dndStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // =================================================================================================
    //                                 DELETE MODE CHECK
    // =================================================================================================
    const isSelectedForDelete = selectedToDelete.includes(task._id);

    // =================================================================================================
    //                                    COMBINED STYLE (NEW)
    // =================================================================================================
    const containerStyle: React.CSSProperties = {
        ...dndStyle,

        // ⭐ Apply task color here
        backgroundColor: task.containerColor || "var(--white)",

        // Notebook border theme
        border: "2px solid var(--blue-dark)",
        borderRadius: "10px",

        padding: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",

        boxShadow: "0px 2px 4px rgba(0,0,0,0.15)",
        cursor: isRearrangeMode ? "grab" : "default",
    };

    // =================================================================================================
    //                                              UI RENDER
    // =================================================================================================
    return (
        <div
            ref={setNodeRef}
            style={containerStyle}
            className={`task-item-container ${isDragging ? "dragging" : ""}`}
        >

            {/* ---------- LEFT SIDE: CHECKBOX / DELETE SELECTOR ---------- */}
            <div className="task-left-section">

                {/* COMPLETION CHECKBOX */}
                {!isDeleteMode && (
                    <div
                        className="task-checkbox"
                        onClick={() => toggleCompletion(task)}
                    >
                        {task.status === "completed" ? (
                            <RiCheckboxCircleFill className="checkbox-icon completed" />
                        ) : (
                            <RiCheckboxBlankCircleLine className="checkbox-icon" />
                        )}
                    </div>
                )}

                {/* DELETE MODE SELECTOR */}
                {isDeleteMode && (
                    <div
                        className={`delete-select-circle ${isSelectedForDelete ? "selected" : ""}`}
                        onClick={() => toggleDeleteSelection(task._id)}
                    >
                        {isSelectedForDelete ? (
                            <RiCheckboxFill className="delete-check-icon" />
                        ) : (
                            <RiCheckboxBlankCircleLine className="delete-check-icon" />
                        )}
                    </div>
                )}
            </div>

            {/* ---------- MIDDLE: TASK BODY (TITLE + INFO) ---------- */}
            <div className="task-body">
                <p className={`task-title ${task.status}`}>
                    {task.title}
                </p>

                <span className="task-subinfo">
                    {task.category} • {task.status}
                </span>
            </div>

            {/* ---------- RIGHT SIDE: DRAG HANDLE ---------- */}
            {isRearrangeMode && (
                <div
                    className="task-drag-handle"
                    {...attributes}
                    {...listeners}
                >
                    <RiDragMove2Fill />
                </div>
            )}

        </div>
    );
};
