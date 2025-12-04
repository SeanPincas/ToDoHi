// ============================================================================
// taskUtils.ts — COMPLETE VERSION (NO DUPLICATION + ALL HELPERS INCLUDED)
// ============================================================================

// ============================================================================
// 🟦 TASK CATEGORIES
// ============================================================================
export const TASK_CATEGORIES = [
  "cleaning", "work", "study", "fitness", "health", "cooking",
  "relax", "praying", "hobby", "social", "self-care", "finance",
  "errands", "pet-care", "learning", "creative", "maintenance",
  "shopping", "travel", "others"
] as const;

// Literal type
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

// ============================================================================
// 🟩 TASK STATUSES — SINGLE SOURCE OF TRUTH
// ============================================================================
export const TASK_STATUSES = ["pending", "completed", "failed"] as const;

// Literal type
export type TaskStatus = (typeof TASK_STATUSES)[number];

// ============================================================================
// 🟨 LABELS (AUTO-MAPPED)
// ============================================================================
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

// ============================================================================
// 🟦 TASK TABS (ALL + STATUSES)
// ============================================================================
export const TASK_TABS = ["all", ...TASK_STATUSES] as const;

// Literal type
export type TaskTab = (typeof TASK_TABS)[number];

export const TASK_TAB_LABELS: Record<TaskTab, string> = {
  all: "All",
  pending: "Ongoing",
  completed: "Completed",
  failed: "Failed"
};

// ============================================================================
// 🟫 HELPER: Format Date (used by ViewTaskModal, EditTaskModal, etc.)
// ============================================================================
export const formatDate = (date: Date | string | null): string => {
  if (!date) return "No deadline";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
};

// ============================================================================
// 🟪 HELPER: Validate required fields
// ============================================================================
export const validateTaskPayload = (payload: any): string | null => {
  if (!payload.title || payload.title.trim().length === 0) {
    return "Task title is required.";
  }
  return null;
};

// ============================================================================
// 🎨 COLOR PALETTE
// ============================================================================
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
  grey: { light: "#f1f1f1", normal: "#cfcfcf", dark: "#8c8c8c" }
};

// ============================================================================
// 🎨 FLATTENED COLOR OPTIONS (Used in AddTaskModal, EditTaskModal)
// ============================================================================
export const TASK_COLOR_OPTIONS = Object.entries(TASK_COLORS).flatMap(
  ([colorName, shades]) => [
    { name: `${colorName}-light`, hex: shades.light },
    { name: `${colorName}-normal`, hex: shades.normal },
    { name: `${colorName}-dark`, hex: shades.dark }
  ]
);

// ============================================================================
// 🟦 SELECT OPTION HELPERS
// ============================================================================
export const getCategoryOptions = () =>
  TASK_CATEGORIES.map((c) => ({
    value: c,
    label: CATEGORY_LABELS[c]
  }));

export const getStatusOptions = () =>
  TASK_STATUSES.map((s) => ({
    value: s,
    label: STATUS_LABELS[s]
  }));
