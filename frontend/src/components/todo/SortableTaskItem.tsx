import "./SortableTaskItem.css";
import type { Task } from "../../api/taskApi";

import { useSortable } from "@dnd-kit/sortable";
import { getTaskItemStyle } from "../../styles/taskStyles";
import {
    getContainerHex,
    getTaskCategoryIconKey,
    getTaskStatusIconKey,
    safeCategoryLabel,
    safeStatusLabel,
} from "../../utils/taskUtils";

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

export const SortableTaskItem = ({
    task,
    isRearrangeMode,
    isDeleteMode,
    selectedToDelete,
    toggleDeleteSelection,
    toggleCompletion,
    onOpenView,
}: SortableTaskProps) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id });

    const containerStyle = getTaskItemStyle(
        transform,
        transition,
        isDragging,
        task.containerColor,
        task.status,
    );

    const getTaskAccentColor = (containerColor: string) => {
        if (!containerColor) return "var(--text-main)";
        if (containerColor.startsWith("#")) return containerColor;

        const resolved = getContainerHex(containerColor);
        return resolved || "var(--text-main)";
    };

    const accentColor = getTaskAccentColor(task.containerColor);
    const CategoryIcon = Icons[getTaskCategoryIconKey(task.category)];
    const StatusIcon = Icons[getTaskStatusIconKey(task.status)];

    const rowStyle = {
        transform: containerStyle.transform,
        transition: containerStyle.transition,
        opacity: containerStyle.opacity,
        color: "var(--text-main)",
    };

    const isSelectedForDelete = selectedToDelete.includes(task._id);

    const handleContainerClick = () => {
        if (isRearrangeMode) return;

        if (isDeleteMode) {
            toggleDeleteSelection(task._id);
            return;
        }

        onOpenView();
    };

    return (
        <div
            ref={setNodeRef}
            style={rowStyle}
            className={`task-item-container ${isDragging ? "dragging" : ""} ${isRearrangeMode ? "rearrange-row" : ""}`}
            onClick={handleContainerClick}
        >
            <div className="task-left-section">
                {!isDeleteMode && !isRearrangeMode && (
                    <div
                        className="task-checkbox"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCompletion(task);
                        }}
                    >
                        {task.status === "completed" ? (
                            <Icons.Check className="checkbox-icon completed" />
                        ) : (
                            <Icons.Uncheck className="checkbox-icon" />
                        )}
                    </div>
                )}

                {isDeleteMode && (
                    <div
                        className={`delete-select-circle ${isSelectedForDelete ? "selected" : ""}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleDeleteSelection(task._id);
                        }}
                    >
                        {isSelectedForDelete ? (
                            <Icons.CheckboxDeleteTick className="delete-check-icon" />
                        ) : (
                            <Icons.Uncheck className="delete-check-icon" />
                        )}
                    </div>
                )}

                {isRearrangeMode && !isDeleteMode && (
                    <div className="task-drag-handle" {...attributes} {...listeners}>
                        <Icons.Drag />
                    </div>
                )}
            </div>

            <div className="task-body">
                <p className={`task-title ${task.status}`}>{task.title}</p>

                <span
                    className="task-color-line"
                    style={{ backgroundColor: accentColor }}
                    aria-hidden="true"
                    title={`Task color: ${task.containerColor}`}
                />

                <div className="task-subinfo-right">
                    <span className="task-meta-label task-category-label">
                        {safeCategoryLabel(task.category)}
                    </span>

                    <CategoryIcon className="task-meta-icon task-category-icon" />

                    <span className="task-meta-label task-status-label">
                        {safeStatusLabel(task.status)}
                    </span>

                    <StatusIcon className="task-meta-icon task-status-icon" />
                </div>
            </div>
        </div>
    );
};
