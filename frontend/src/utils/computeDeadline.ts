// ============================================================================
// computeDeadline.ts — Calculates the correct expiration datetime for a task
// ============================================================================

export function computeDeadline(resetHour: number | null): string {
    const now = new Date();

    // ========================== CASE 1: USE MIDNIGHT ==========================
    if (resetHour === null || resetHour === undefined) {
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);         // next 00:00
        return midnight.toISOString();
    }

    // ========================== CASE 1: USE MIDNIGHT ==========================
    const deadline = new Date(now);
    deadline.setHours(resetHour, 0, 0, 0);      // set time today at resetHour

    // if resetHour already passed today => move to tomorrow
    if (deadline <= now) {
        deadline.setDate(deadline.getDate() + 1);
    }

    return deadline.toISOString();
}