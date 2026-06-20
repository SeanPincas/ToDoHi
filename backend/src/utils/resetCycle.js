// ============================================================================
// File Name: resetCycle.js
// Purpose:
// - Centralizes reset-cycle date math shared by repeat review, repeat actions,
//   scheduler logic, and reset-hour-based stats.
// - Keeps cycle calculations anchored to the app timezone rather than the
//   container/server local timezone so user resetHour stays trustworthy.
// ============================================================================

const DEFAULT_APP_TIME_ZONE = process.env.APP_TIME_ZONE || process.env.APP_TIMEZONE || "Asia/Manila";

function normalizeResetHour(resetHour) {
    const parsedHour = Number(resetHour);

    if (!Number.isFinite(parsedHour)) {
        return 0;
    }

    return Math.min(23, Math.max(0, Math.trunc(parsedHour)));
}

function getTimeZoneParts(date, timeZone = DEFAULT_APP_TIME_ZONE) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23"
    });

    const rawParts = formatter.formatToParts(date);
    const partsMap = {};

    for (const part of rawParts) {
        if (part.type !== "literal") {
            partsMap[part.type] = part.value;
        }
    }

    return {
        year: Number(partsMap.year),
        month: Number(partsMap.month),
        day: Number(partsMap.day),
        hour: Number(partsMap.hour),
        minute: Number(partsMap.minute),
        second: Number(partsMap.second)
    };
}

function buildWallClockStamp(parts) {
    return Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour ?? 0,
        parts.minute ?? 0,
        parts.second ?? 0,
        parts.millisecond ?? 0
    );
}

function shiftCalendarDate(parts, days) {
    const shifted = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    shifted.setUTCDate(shifted.getUTCDate() + days);

    return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth() + 1,
        day: shifted.getUTCDate()
    };
}

function zonedDateTimeToUtcDate(parts, timeZone = DEFAULT_APP_TIME_ZONE) {
    const targetStamp = buildWallClockStamp(parts);
    const guessDate = new Date(targetStamp);
    const guessParts = getTimeZoneParts(guessDate, timeZone);
    const guessStamp = buildWallClockStamp(guessParts);

    return new Date(guessDate.getTime() + (targetStamp - guessStamp));
}

function getCycleDateParts(resetHour, now = new Date(), timeZone = DEFAULT_APP_TIME_ZONE) {
    const hour = normalizeResetHour(resetHour);
    const nowParts = getTimeZoneParts(now, timeZone);
    const currentWallClockStamp = buildWallClockStamp(nowParts);
    const todayBoundaryStamp = buildWallClockStamp({
        year: nowParts.year,
        month: nowParts.month,
        day: nowParts.day,
        hour,
        minute: 0,
        second: 0,
        millisecond: 0
    });

    const cycleDateParts = currentWallClockStamp < todayBoundaryStamp
        ? shiftCalendarDate(nowParts, -1)
        : { year: nowParts.year, month: nowParts.month, day: nowParts.day };

    return {
        hour,
        timeZone,
        nowParts,
        cycleDateParts
    };
}

function formatCycleKey(cycleDateParts, resetHour) {
    const yyyy = cycleDateParts.year;
    const mm = String(cycleDateParts.month).padStart(2, "0");
    const dd = String(cycleDateParts.day).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}@${resetHour}`;
}

function computeRepeatDeadline(resetHour, now = new Date(), timeZone = DEFAULT_APP_TIME_ZONE) {
    const { hour, nowParts } = getCycleDateParts(resetHour, now, timeZone);
    const currentWallClockStamp = buildWallClockStamp(nowParts);
    const todayBoundaryStamp = buildWallClockStamp({
        year: nowParts.year,
        month: nowParts.month,
        day: nowParts.day,
        hour,
        minute: 0,
        second: 0,
        millisecond: 0
    });

    const deadlineDateParts = currentWallClockStamp >= todayBoundaryStamp
        ? shiftCalendarDate(nowParts, 1)
        : { year: nowParts.year, month: nowParts.month, day: nowParts.day };

    return zonedDateTimeToUtcDate({
        ...deadlineDateParts,
        hour,
        minute: 0,
        second: 0,
        millisecond: 0
    }, timeZone);
}

function computeRepeatCycleKey(resetHour, now = new Date(), timeZone = DEFAULT_APP_TIME_ZONE) {
    const { hour, cycleDateParts } = getCycleDateParts(resetHour, now, timeZone);
    return formatCycleKey(cycleDateParts, hour);
}

function getCycleWindow(resetHour, now = new Date(), timeZone = DEFAULT_APP_TIME_ZONE) {
    const { hour, cycleDateParts } = getCycleDateParts(resetHour, now, timeZone);
    const previousCycleDateParts = shiftCalendarDate(cycleDateParts, -1);
    const nextCycleDateParts = shiftCalendarDate(cycleDateParts, 1);

    const currentCycleStart = zonedDateTimeToUtcDate({
        ...cycleDateParts,
        hour,
        minute: 0,
        second: 0,
        millisecond: 0
    }, timeZone);

    const previousCycleStart = zonedDateTimeToUtcDate({
        ...previousCycleDateParts,
        hour,
        minute: 0,
        second: 0,
        millisecond: 0
    }, timeZone);

    const nextCycleStart = zonedDateTimeToUtcDate({
        ...nextCycleDateParts,
        hour,
        minute: 0,
        second: 0,
        millisecond: 0
    }, timeZone);

    return {
        currentCycleKey: formatCycleKey(cycleDateParts, hour),
        currentCycleStart,
        previousCycleStart,
        nextCycleStart,
        timeZone
    };
}

module.exports = {
    DEFAULT_APP_TIME_ZONE,
    normalizeResetHour,
    computeRepeatDeadline,
    computeRepeatCycleKey,
    getCycleWindow
};
