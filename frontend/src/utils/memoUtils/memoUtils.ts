// ============================================================================
// memoUtils.ts
// SINGLE SOURCE OF TRUTH for Memo visuals
// ============================================================================

/*
    Memo rules:
    - Memo containerColor is a LIGHT version of task containerColor
    - No text contrast logic here
    - Pin colors are finite and predefined
    - Category is visual metadata (icon)
*/

import { getTaskCategoryIconKey, TASK_CATEGORY_ICON_MAP, type TaskIconKey } from "../taskUtils";

// ============================================================================
// 1. CATEGORY -> ICON KEY
// ============================================================================

export const memoCategoryIconMap: Record<string, TaskIconKey> = TASK_CATEGORY_ICON_MAP;

export function getMemoCategoryIconKey(category?: string): TaskIconKey {
    if (!category) return memoCategoryIconMap.others;
    return memoCategoryIconMap[category] || getTaskCategoryIconKey(category);
}

// ============================================================================
// 2. MEMO CONTAINER COLORS (LIGHT SHADES ONLY)
// COPY-PASTE SNAPSHOT FROM TASK COLORS (DECOUPLED)
// ============================================================================

export const MEMO_CONTAINER_COLORS = {
    blue: "#cfe7ff",
    red: "#ffdad6",
    yellow: "#fff2b3",
    green: "#d3f8df",
    orange: "#ffe1c4",
    purple: "#e4d6ff",
    pink: "#ffd6ec",
    teal: "#c8f7f4",
    beige: "#fff3e0",
    white: "#ffffff",
    grey: "#e0e0e0",
    black: "#4a4a4a",
} as const;

export type MemoContainerColorKey = keyof typeof MEMO_CONTAINER_COLORS;

const TASK_COLOR_GROUPS: Record<MemoContainerColorKey, string[]> = {
    blue: ["#cfe7ff", "#4a90e2", "#1f5fa1"],
    red: ["#ffdad6", "#ff6b6b", "#c73838"],
    yellow: ["#fff2b3", "#ffd93b", "#c9a41c"],
    green: ["#d3f8df", "#4cd964", "#2f9e45"],
    orange: ["#ffe1c4", "#ff9f43", "#cc6b14"],
    purple: ["#e4d6ff", "#9c6bff", "#6e3acb"],
    pink: ["#ffd6ec", "#ff6fb5", "#d14a87"],
    teal: ["#c8f7f4", "#32d1c6", "#1a938c"],
    beige: ["#fff3e0", "#ffd7a0", "#cfa272"],
    white: ["#ffffff", "#f7f7f7", "#e6e6e6"],
    grey: ["#e0e0e0", "#a6a6a6", "#5a5a5a"],
    black: ["#4a4a4a", "#1f1f1f", "#000000"],
};

// ============================================================================
// RESOLVER: TASK HEX -> MEMO LIGHT COLOR
// ============================================================================

export function resolveMemoContainerColor(
    taskContainerColor?: string
): string {
    if (!taskContainerColor) {
        return MEMO_CONTAINER_COLORS.yellow;
    }

    const normalized = taskContainerColor.toLowerCase();

    for (const key in TASK_COLOR_GROUPS) {
        const shades = TASK_COLOR_GROUPS[key as MemoContainerColorKey];

        if (shades.includes(normalized)) {
            return MEMO_CONTAINER_COLORS[key as MemoContainerColorKey];
        }
    }

    return MEMO_CONTAINER_COLORS.yellow;
}

export function getMemoContainerColorByKey(
    taskColorKey?: MemoContainerColorKey
): string {
    if (!taskColorKey) {
        return MEMO_CONTAINER_COLORS.yellow;
    }

    return (
        MEMO_CONTAINER_COLORS[taskColorKey] ??
        MEMO_CONTAINER_COLORS.yellow
    );
}

// ============================================================================
// 3. MEMO PIN COLORS (ONE TRUTH)
// ============================================================================

/**
 * Physical push-pin colors.
 * These do NOT change with theme.
 */
export const memoPinColors = [
    "#d32f2f", // red
    "#1976d2", // blue
    "#388e3c", // green
    "#fbc02d", // yellow
    "#7b1fa2", // purple
    "#f57c00", // orange
    "#455a64", // dark gray
    "#5d4037", // brown
    "#c2185b", // pink
    "#00796b"  // teal
] as const;

export type MemoPinColor = typeof memoPinColors[number];

export function getDefaultMemoPinColor(): MemoPinColor {
    return "#d32f2f";
}

export const MEMO_TITLE_MAX_LENGTH = 24;
export const MEMO_CONTENT_MAX_LENGTH = 650;

// ============================================================================
// 4. PREVIEW TEXT WRAPPING
// ============================================================================

/**
 * Keeps natural sentence wrapping while only inserting manual dash-break
 * opportunities into very long unbroken tokens.
 */
export function formatMemoPreviewText(
    value?: string,
    chunkSize = 52
): string {
    if (!value) return "";

    return value.replace(/\S+/g, (token) => {
        if (token.length <= chunkSize) return token;

        const chunks = token.match(new RegExp(`.{1,${chunkSize}}`, "g"));
        return chunks ? chunks.join("-\u200b") : token;
    });
}

function measureMemoTextWidth(text: string, font: string): number {
    if (typeof document === "undefined") {
        return text.length * 8;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
        return text.length * 8;
    }

    context.font = font;
    return context.measureText(text).width;
}

function splitLongMemoTokenByWidth(
    token: string,
    maxWidthPx: number,
    font: string
): string[] {
    const parts: string[] = [];
    let remaining = token;

    while (remaining.length > 0) {
        let current = "";
        let index = 0;

        while (index < remaining.length) {
            const next = current + remaining[index];
            const test = index < remaining.length - 1 ? `${next}-` : next;

            if (measureMemoTextWidth(test, font) > maxWidthPx) {
                break;
            }

            current = next;
            index += 1;
        }

        if (!current) {
            current = remaining[0];
            index = 1;
        }

        remaining = remaining.slice(index);
        parts.push(remaining.length > 0 ? `${current}-` : current);
    }

    return parts;
}

export function formatMemoPreviewTextByWidth(
    value: string | undefined,
    maxWidthPx: number,
    font = '400 13.6px "Kalam", cursive'
): string {
    if (!value) return "";

    const paragraphs = value.split(/\r?\n/);

    return paragraphs
        .map((paragraph) => {
            const words = paragraph.trim().split(/\s+/).filter(Boolean);
            if (!words.length) return "";

            const lines: string[] = [];
            let currentLine = "";

            for (const word of words) {
                if (measureMemoTextWidth(word, font) > maxWidthPx) {
                    if (currentLine) {
                        lines.push(currentLine);
                        currentLine = "";
                    }

                    lines.push(...splitLongMemoTokenByWidth(word, maxWidthPx, font));
                    continue;
                }

                const candidate = currentLine ? `${currentLine} ${word}` : word;
                if (measureMemoTextWidth(candidate, font) <= maxWidthPx) {
                    currentLine = candidate;
                } else {
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    currentLine = word;
                }
            }

            if (currentLine) {
                lines.push(currentLine);
            }

            return lines.join("\n");
        })
        .join("\n");
}
