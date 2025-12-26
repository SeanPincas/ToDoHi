// ============================================================================
// taskStyles.ts
// Centralized styling utilities for Task UI components.
// Used by SortableTaskItem, ViewTaskModal, EditTaskModal, etc.
// ============================================================================

import { CSS } from "@dnd-kit/utilities";
import type { Transform } from "@dnd-kit/utilities";

export const getTaskItemStyle = (
    transform: Transform | null,
    transition: string | undefined,
    isDragging: boolean,
    containerColor: string
): React.CSSProperties => {
    return {
        // DnD transform + animation
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,

        // ⭐ Task color (from AddTaskModal)
        backgroundColor: containerColor || "var(--white)",

        // Notebook theme
        border: "2px solid var(--blue-dark)",
        borderRadius: "10px",

        padding: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px",

        boxShadow: "0px 2px 4px rgba(0,0,0,0.15)",
    };
};
