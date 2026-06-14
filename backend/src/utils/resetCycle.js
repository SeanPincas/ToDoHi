// ============================================================================
// File Name: resetCycle.js
// Purpose:
// - Centralizes reset-cycle date math shared by repeat review, repeat actions,
//   and scheduler logic.
// - Defines the current cycle key plus the previous-cycle window boundaries
//   used to decide which tasks belong to "yesterday" for a given reset hour.
// ============================================================================

function computeRepeatDeadline(resetHour, now = new Date()) {
    const deadline = new Date(now);
    deadline.setHours(resetHour, 0, 0, 0);

    if (now >= deadline) {
        deadline.setDate(deadline.getDate() + 1);
    }

    return deadline;
}

function computeRepeatCycleKey(resetHour, now = new Date()) {
    const boundary = new Date(now);
    boundary.setHours(resetHour, 0, 0, 0);

    if (now < boundary) {
        boundary.setDate(boundary.getDate() - 1);
    }

    const yyyy = boundary.getFullYear();
    const mm = String(boundary.getMonth() + 1).padStart(2, "0");
    const dd = String(boundary.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}@${resetHour}`;
}

function getCycleWindow(resetHour, now = new Date()) {
    const currentCycleStart = new Date(now);
    currentCycleStart.setHours(resetHour, 0, 0, 0);

    if (now < currentCycleStart) {
        currentCycleStart.setDate(currentCycleStart.getDate() - 1);
    }

    const previousCycleStart = new Date(currentCycleStart);
    previousCycleStart.setDate(previousCycleStart.getDate() - 1);

    return {
        currentCycleKey: computeRepeatCycleKey(resetHour, now),
        currentCycleStart,
        previousCycleStart
    };
}

module.exports = {
    computeRepeatDeadline,
    computeRepeatCycleKey,
    getCycleWindow
};
