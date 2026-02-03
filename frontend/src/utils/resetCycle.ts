// ============================================================================
// resetCycle.ts
// Frontend helper for computing reset-cycle keys
// Must mirror backend scheduler logic exactly
// ============================================================================

/**
 * Computes the reset-cycle key based on current time and resetHour.
 *
 * Example output:
 *   "2026-01-07@0"
 *
 * This key uniquely represents ONE reset window.
 */
export const getCurrentResetCycleKey = (resetHour: number): string => {

    // ------------------ SAFETY ------------------
    // Ensure resetHour is valid (0–23)
    const hour =
        typeof resetHour === "number" && resetHour >= 0 && resetHour <= 23
            ? resetHour
            : 0;

    // ------------------ CURRENT TIME ------------------
    // Browser time is already local (Asia/Manila)
    const now = new Date();

    // ------------------ RESET BOUNDARY ------------------
    // Build today's reset boundary at resetHour
    const boundary = new Date(now);
    boundary.setHours(hour, 0, 0, 0);

    /**
     * If we have NOT reached resetHour yet today,
     * then the active cycle actually started YESTERDAY.
     *
     * Example:
     *   resetHour = 10PM
     *   now = 9PM
     *   → still in yesterday's cycle
     */
    if (now < boundary) {
        boundary.setDate(boundary.getDate() - 1);
    }

    // ------------------ BUILD KEY ------------------
    const yyyy = boundary.getFullYear();
    const mm = String(boundary.getMonth() + 1).padStart(2, "0");
    const dd = String(boundary.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}@${hour}`;
};

// ============================================================================
// RESET WINDOW (FOR STATS COMPUTATION)
// Uses SAME boundary logic as getCurrentResetCycleKey()
// ============================================================================
export const getResetWindow = (resetHour: number) => {

    // ------------------ SAFETY ------------------
    const hour =
        typeof resetHour === "number" && resetHour >= 0 && resetHour <= 23
            ? resetHour
            : 0;

    const now = new Date();

    // ------------------ RESET BOUNDARY ------------------
    const start = new Date(now);
    start.setHours(hour, 0, 0, 0);

    if (now < start) {
        start.setDate(start.getDate() - 1);
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const yesterdayStart = new Date(start);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    return { start, end, yesterdayStart };
};
