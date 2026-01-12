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
// 2. MEMO CONTAINER COLOR (LIGHT SHADE ONLY)
// ============================================================================

/**
 * Converts a task container color into a memo-friendly light shade.
 * Memo cards should ALWAYS be light for readability.
 */
export function getMemoContainerColor(taskColor?: string): string {
    if (!taskColor || !/^#([0-9A-F]{3}){1,2}$/i.test(taskColor)) {
        return "#ffffff"; // default memo paper
    }

    const hex = taskColor.replace("#", "");
    const fullHex =
        hex.length === 3
            ? hex.split("").map(c => c + c).join("")
            : hex;

    const num = parseInt(fullHex, 16);

    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;

    // Lighten the color significantly
    r = Math.min(255, Math.floor(r + (255 - r) * 0.6));
    g = Math.min(255, Math.floor(g + (255 - g) * 0.6));
    b = Math.min(255, Math.floor(b + (255 - b) * 0.6));

    return `rgb(${r}, ${g}, ${b})`;
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

export function getRandomMemoPinColor(): MemoPinColor {
    const index = Math.floor(Math.random() * memoPinColors.length);
    return memoPinColors[index];
}
