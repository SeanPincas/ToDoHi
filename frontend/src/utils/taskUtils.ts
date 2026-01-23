// ============================================================================
// taskUtils.ts — ORGANIZED & CLEAN VERSION
// ============================================================================

/* ============================================================================
   1. TASK DOMAIN CONSTANTS
============================================================================ */

// ---------------- TASK CATEGORIES ----------------
export const TASK_CATEGORIES = [
    "cleaning", "work", "study", "fitness", "health", "cooking",
    "relax", "praying", "hobby", "social", "self-care", "finance",
    "errands", "pet-care", "learning", "creative", "maintenance",
    "shopping", "travel", "others"
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

// ---------------- TASK STATUSES ----------------
export const TASK_STATUSES = ["pending", "completed", "failed"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/* ============================================================================
   2. LABELS & SAFE LOOKUPS
============================================================================ */

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
    cleaning: "Cleaning",
    work: "Work",
    study: "Study",
    fitness: "Fitness",
    health: "Health",
    cooking: "Cooking",
    relax: "Relax",
    praying: "Praying",
    hobby: "Hobby",
    social: "Social",
    "self-care": "Self Care",
    finance: "Finance",
    errands: "Errands",
    "pet-care": "Pet Care",
    learning: "Learning",
    creative: "Creative",
    maintenance: "Maintenance",
    shopping: "Shopping",
    travel: "Travel",
    others: "Others"
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
    pending: "Pending",
    completed: "Completed",
    failed: "Failed"
};

// ---------------- TYPE GUARDS ----------------
export const isTaskCategory = (v: string): v is TaskCategory =>
    TASK_CATEGORIES.includes(v as TaskCategory);

export const isTaskStatus = (v: string): v is TaskStatus =>
    TASK_STATUSES.includes(v as TaskStatus);

// ---------------- SAFE LABEL HELPERS ----------------
export const safeCategoryLabel = (c: string) =>
    isTaskCategory(c) ? CATEGORY_LABELS[c] : c;

export const safeStatusLabel = (s: string) =>
    isTaskStatus(s) ? STATUS_LABELS[s] : s;

/* ============================================================================
   3. TABS & FILTERING
============================================================================ */

export const TASK_TABS = ["all", ...TASK_STATUSES] as const;
export type TaskTab = (typeof TASK_TABS)[number];

export const TASK_TAB_LABELS: Record<TaskTab, string> = {
    all: "All",
    pending: "Ongoing",
    completed: "Completed",
    failed: "Failed"
};

/* ============================================================================
   4. DATE & VALIDATION HELPERS
============================================================================ */

export const formatDate = (date: Date | string | null): string => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export const validateTaskPayload = (payload: any): string | null => {
    if (!payload.title || payload.title.trim() === "") {
        return "Task title is required.";
    }
    return null;
};

/* ============================================================================
   5. COLOR SYSTEM (ORGANIZED)
============================================================================ */

// ---------------- RAW PALETTE ----------------
export const TASK_COLORS = {
    blue: { light: "#cfe7ff", normal: "#4a90e2", dark: "#1f5fa1" },
    red: { light: "#ffdad6", normal: "#ff6b6b", dark: "#c73838" },
    yellow: { light: "#fff2b3", normal: "#ffd93b", dark: "#c9a41c" },
    green: { light: "#d3f8df", normal: "#4cd964", dark: "#2f9e45" },
    orange: { light: "#ffe1c4", normal: "#ff9f43", dark: "#cc6b14" },
    purple: { light: "#e4d6ff", normal: "#9c6bff", dark: "#6e3acb" },
    pink: { light: "#ffd6ec", normal: "#ff6fb5", dark: "#d14a87" },
    teal: { light: "#c8f7f4", normal: "#32d1c6", dark: "#1a938c" },
    beige: { light: "#fff3e0", normal: "#ffd7a0", dark: "#cfa272" },
    white: { light: "#ffffff", normal: "#f7f7f7", dark: "#e6e6e6" },
    black: { light: "#4a4a4a", normal: "#1f1f1f", dark: "#000000" },
    grey: { light: "#e0e0e0", normal: "#a6a6a6", dark: "#5a5a5a" },
} as const;

// ---------------- FLATTENED OPTIONS ----------------
export const TASK_COLOR_OPTIONS = Object.entries(TASK_COLORS).flatMap(
    ([name, shades]) => [
        { name: `${name}-light`, hex: shades.light },
        { name: `${name}-normal`, hex: shades.normal },
        { name: `${name}-dark`, hex: shades.dark },
    ]
);

// ---------------- COLOR HELPERS ----------------
export const getContainerColors = () => TASK_COLOR_OPTIONS;

export const safeContainerColor = (color: string): string => {
    const valid = TASK_COLOR_OPTIONS.some(c => c.hex === color);
    return valid ? color : "#ffffff";
};

export const getColorNameFromHex = (hex: string): string => {
    const found = TASK_COLOR_OPTIONS.find(c => c.hex === hex);
    return found ? found.name : "white-light";
};
// ---------------- COLOR CONTRASTING FOR FONT COLOR ----------------
export const getContainerHex = (colorName: string): string => {
    const found = TASK_COLOR_OPTIONS.find(c => c.name === colorName);
    return found ? found.hex : TASK_COLORS.white.light
}

export const getTaskTextColor = (containerColor: string): string => {
    const [base, shade] = containerColor.split("-");

    if (base === "black") return "#ffffff";
    if (base === "white") return "#000000";
    if (base === "grey") return shade === "dark" ? "#ffffff" : "#000000";
    if (shade === "dark") return "#ffffff";

    return "#000000";
}

// ------------------ TASK TITLE FAILED FONT COLOR ------------------------
export const getFailedTextColor = (containerColorName: string): string => {
    const [base, shade] = containerColorName.split("-");

    if (base === "red") return shade === "dark" ? "#440101ff" : "#7a1c1c";

    if (shade === "dark" || base === "black") return "#f32323ff";

    return "#b60000"
}

/* ============================================================================
   6. SELECT OPTIONS (DROPDOWNS)
============================================================================ */

export const getCategoryOptions = () =>
    TASK_CATEGORIES.map(c => ({ value: c, label: CATEGORY_LABELS[c] }));

export const getStatusOptions = () =>
    TASK_STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] }));

/* ============================================================================
   7. STATUS HELPERS
============================================================================ */

export const toggleStatus = (status: TaskStatus): TaskStatus => {
    if (status === "pending") return "completed";
    if (status === "completed") return "pending";
    return "failed";
};

/* ============================================================================
   8. UX UTILITIES
============================================================================ */

export const createStatusLock = (ms: number) => {
    let locked = false;
    return () => {
        if (locked) return false;
        locked = true;
        setTimeout(() => (locked = false), ms);
        return true;
    };
};





