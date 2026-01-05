// ============================================================================
// taskStyles.ts
// Centralized styling utilities for Task UI components.
// Used by SortableTaskItem, ViewTaskModal, EditTaskModal, etc.
// ============================================================================

import { CSS } from "@dnd-kit/utilities";
import type { Transform } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";

import {
    getContainerHex,
    getTaskTextColor,
    getColorNameFromHex,
    getFailedTextColor,
} from "../utils/taskUtils"

export const getTaskItemStyle = (
    transform: Transform | null,
    transition: string | undefined,
    isDragging: boolean,
    containerColor: string,
    status?: string,
): CSSProperties => {

    const colorName = containerColor.startsWith("#")
        ? getColorNameFromHex(containerColor)
        : containerColor;

    const backgroundColor = getContainerHex(colorName);
    let textColor = getTaskTextColor(colorName)

    // FAILED TASK STATE OVERRIDE
    if (status === "failed") {
        textColor = getFailedTextColor(colorName);
    }

    return {
        // DnD transform + animation
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,

        // ⭐ Task color (from AddTaskModal)
        backgroundColor,
        color: textColor,

        // Notebook theme
        border: "2px solid var(--blue-dark)",
        borderRadius: "10px",

        padding: "5px 8px",
        display: "flex",
        alignItems: "center",
        gap: "10px",

        boxShadow: "0px 2px 4px rgba(0,0,0,0.15)",
    };
};
