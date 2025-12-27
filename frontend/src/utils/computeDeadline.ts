// ============================================================================
// computeDeadline.ts — FINAL FIX
// ResetHour is interpreted in USER LOCAL TIME (Asia/Manila)
// Browser already handles timezone correctly
// ============================================================================

export function computeDeadline(resetHour: number): string {
    const hour =
        typeof resetHour === "number" && resetHour >= 0 && resetHour <= 23
            ? resetHour
            : 0;

    // Local time (already Asia/Manila in browser)
    const now = new Date();

    // Build reset boundary in LOCAL time
    const deadline = new Date(now);
    deadline.setHours(hour, 0, 0, 0);

    // If reset hour already passed → move to next day
    if (deadline <= now) {
        deadline.setDate(deadline.getDate() + 1);
    }

    // Store as UTC ISO (MongoDB standard)
    return deadline.toISOString();
}
