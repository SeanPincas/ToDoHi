// ============================================================================
// memoUtils.ts
// SINGLE SOURCE OF TRUTH for Memo visuals
// ============================================================================

/*
    Memo rules:
    - Memo containerColor is a LIGHT version of task containerColor
    - No text contrast logic here
    - Pin colors are finite and predefined
    - Category is visual metadata (emoji)
*/

// ============================================================================
// 1. CATEGORY → EMOJI (STICKER STYLE)
// ============================================================================

export const memoCategoryEmojiMap: Record<string, string> = {
    cleaning: "🧹",
    work: "💼",
    study: "📚",
    fitness: "🏋️",
    health: "🩺",
    cooking: "🍳",
    relax: "🛋️",
    praying: "🙏",
    hobby: "🎨",
    social: "🧑‍🤝‍🧑",
    "self-care": "🧘",
    finance: "💰",
    errands: "🧾",
    "pet-care": "🐾",
    learning: "🧠",
    creative: "✏️",
    maintenance: "🛠️",
    shopping: "🛒",
    travel: "✈️",
    others: "📌"
};

export function getMemoCategoryEmoji(category?: string): string {
    if (!category) return memoCategoryEmojiMap.others;
    return memoCategoryEmojiMap[category] || memoCategoryEmojiMap.others;
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
// RESOLVER: TASK HEX → MEMO LIGHT COLOR
// ============================================================================

export function resolveMemoContainerColor (
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