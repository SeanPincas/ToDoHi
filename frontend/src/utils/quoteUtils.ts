// ============================================================================
// quoteUtils.ts
// Centralized helpers for the QUOTE system in ToDoHi.
// Stores categories, labels, reusable utilities, and future extension points.
// ============================================================================

// ============================================================================
// 🟦 QUOTE CATEGORIES (Single Source of Truth)
// ============================================================================
export const QUOTE_CATEGORIES = [
  "Motivation",
  "Success",
  "Life Lessons",
  "Happiness",
  "Love",
  "Wisdom",
  "Courage",
  "Discipline",
  "Friendship",
  "Positive Thinking",
  "Faith",
  "Mindfulness",
  "Growth",
  "Health",
  "Patience"
] as const;

// Literal Type
export type QuoteCategory = (typeof QUOTE_CATEGORIES)[number];

// ============================================================================
// 🟨 CATEGORY LABELS (Display versions — customizable)
// ============================================================================
export const QUOTE_CATEGORY_LABELS: Record<QuoteCategory, string> = {
  Motivation: "Motivation",
  Success: "Success",
  "Life Lessons": "Life Lessons",
  Happiness: "Happiness",
  Love: "Love",
  Wisdom: "Wisdom",
  Courage: "Courage",
  Discipline: "Discipline",
  Friendship: "Friendship",
  "Positive Thinking": "Positive Thinking",
  Faith: "Faith",
  Mindfulness: "Mindfulness",
  Growth: "Growth",
  Health: "Health",
  Patience: "Patience"
};

// ============================================================================
// 🟩 HELPER — Convert to dropdown format
// ============================================================================
export const getQuoteCategoryOptions = () =>
  QUOTE_CATEGORIES.map((cat) => ({
    value: cat,
    label: QUOTE_CATEGORY_LABELS[cat]
  }));

// ============================================================================
// 🟪 HELPER — Validate user-selected quote preferences
// ============================================================================
export const validateQuotePreferences = (
  selections: string[]
): string | null => {
  if (!Array.isArray(selections)) return "Invalid preference type.";
  const invalid = selections.filter(
    (item) => !QUOTE_CATEGORIES.includes(item as QuoteCategory)
  );
  if (invalid.length > 0) {
    return `Invalid quote categories: ${invalid.join(", ")}`;
  }
  return null; // valid
};

// ============================================================================
// 🟫 HELPER — Pick a random category
// ============================================================================
export const getRandomQuoteCategory = (): QuoteCategory => {
  const index = Math.floor(Math.random() * QUOTE_CATEGORIES.length);
  return QUOTE_CATEGORIES[index];
};

// ============================================================================
// 🟥 FUTURE EXTENSION POINT (for API-based quotes)
// ============================================================================
export interface QuoteItem {
  text: string;
  author?: string;
  category: QuoteCategory;
}

// Example mock for testing UI
export const SAMPLE_QUOTES: QuoteItem[] = [
  { text: "Stay strong, keep going.", category: "Motivation" },
  { text: "Discipline beats motivation.", category: "Discipline" },
  { text: "Growth begins at the end of your comfort zone.", category: "Growth" },
];
