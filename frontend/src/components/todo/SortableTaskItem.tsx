// =====================================================================================================
//                                     SORTABLE TASK ITEM (DND ITEM)
// =====================================================================================================

import "./SortableTaskItem.css";
import type { Task } from "../../api/taskApi";

import { useSortable } from "@dnd-kit/sortable";
import { getTaskItemStyle } from "../../styles/taskStyles";

import { Icons } from "../../styles/iconLibrary";

interface SortableTaskProps {
    task: Task;
    isRearrangeMode: boolean;
    isDeleteMode: boolean;
    selectedToDelete: string[];

    toggleDeleteSelection: (taskId: string) => void;
    toggleCompletion: (task: Task) => void;

    onOpenView: () => void;
}

// ------------------------------ COMPONENT START -----------------------------------
export const SortableTaskItem = ({
    task,
    isRearrangeMode,
    isDeleteMode,
    selectedToDelete,
    toggleDeleteSelection,
    toggleCompletion,
    onOpenView,
}: SortableTaskProps) => {

    // =================================================================================================
    //                                 DND-KIT HOOK
    // =================================================================================================
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id });

    // Generate item style from centralized style helper
    const containerStyle = getTaskItemStyle(
        transform,
        transition,
        isDragging,
        task.containerColor
    );

    const isSelectedForDelete = selectedToDelete.includes(task._id);

    // =================================================================================================
    //                                          RENDER
    // =================================================================================================
    return (
        <div
            ref={setNodeRef}
            style={containerStyle}
            className={`task-item-container ${isDragging ? "dragging" : ""}`}
            onClick={() => {
                // Prevent opening ViewModal while in rearrange or delete mode
                if (!isRearrangeMode && !isDeleteMode) {
                    onOpenView();
                }
            }}
        >
            {/* ---------- LEFT SIDE: CHECKBOXES / DELETE SELECTOR ---------- */}
            <div className="task-left-section">

                {/* COMPLETION CHECKBOX (normal mode) */}
                {!isDeleteMode && (
                    <div
                        className="task-checkbox"
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleCompletion(task)
                        }}
                    >
                        {task.status === "completed" ? (
                            <Icons.Check className="checkbox-icon completed" />
                        ) : (
                            <Icons.Uncheck className="checkbox-icon" />
                        )}
                    </div>
                )}

                {/* DELETE MODE SELECTOR */}
                {isDeleteMode && (
                    <div
                        className={`delete-select-circle ${isSelectedForDelete ? "selected" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleDeleteSelection(task._id)
                        }}
                    >
                        {isSelectedForDelete ? (
                            <Icons.CheckboxDeleteTick className="delete-check-icon" />
                        ) : (
                            <Icons.Uncheck className="delete-check-icon" />
                        )}
                    </div>
                )}
            </div>

            {/* ---------- MIDDLE: TASK BODY ---------- */}
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
                <div className="task-drag-handle" {...attributes} {...listeners}>
                    <Icons.Drag />
                </div>
            )}
        </div>
    );
};
