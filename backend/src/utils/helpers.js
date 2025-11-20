// --------------------------- VALID CATEGORY LIST ---------------------------
const validCategories = [
    'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
    'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
    'errands', 'pet-care', 'learning', 'creative', 'maintenance',
    'shopping', 'travel', 'others'
];

// --------------------------- HELPER #1: Validate HH:mm ---------------------------
function isValidTimeFormat(str) {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(str);
}

// --------------------------- HELPER #2: HH:mm → minutes ---------------------------
function timeToMinutes(str) {
    const [h, m] = str.split(":").map(Number);
    return h * 60 + m;
}

// --------------------------- HELPER #3: minutes → HH:mm ---------------------------
function minutesToTime(mins) {
    let h = Math.floor(mins / 60) % 24;
    let m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// --------------------------- HELPER #4: Handle Overnight Plans ---------------------------
function splitOverMidnight(startMin, endMin) {
    // Normal same-day plan (no wrap)
    if (endMin > startMin) {
        return [
            { start: startMin, end: endMin, isNextDay: false }
        ];
    }

    // Wraps across midnight → split into two
    return [
        { start: startMin, end: 1440, isNextDay: false }, // first half until midnight
        { start: 0, end: endMin, isNextDay: true }        // second half start of next day
    ];
}

// --------------------------- HELPER #5: Overwrite Logic ---------------------------
function overwriteExistingPlans(existingPlans, newStart, newEnd) {
    return existingPlans.map(plan => {
        const pStart = timeToMinutes(plan.startTime);
        const pEnd = timeToMinutes(plan.endTime);

        // No overlap
        if (pEnd <= newStart || pStart >= newEnd) return plan;

        // CASE A: new covers start part of old
        if (newStart <= pStart && newEnd < pEnd) {
            plan.startTime = minutesToTime(newEnd);
        }

        // CASE B: new covers end part of old
        else if (newStart > pStart && newEnd >= pEnd) {
            plan.endTime = minutesToTime(newStart);
        }

        // CASE C: new fully covers old
        else if (newStart <= pStart && newEnd >= pEnd) {
            plan._delete = true;
        }

        // CASE D: new in the middle
        else if (newStart > pStart && newEnd < pEnd) {
            plan.startTime = minutesToTime(newEnd);
        }

        return plan;
    }).filter(p => !p._delete);
}

// --------------------------- HELPER #6: Get Next Date ---------------------------
function getNextDay(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
}

// Export everything
module.exports = {
    validCategories,
    isValidTimeFormat,
    timeToMinutes,
    minutesToTime,
    splitOverMidnight,
    overwriteExistingPlans,
    getNextDay
};