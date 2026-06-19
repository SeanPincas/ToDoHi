// ============================================================================
// memoPosition.ts
// Pure math helpers for memo board positioning
// ============================================================================

// Converts a percentage value (0–100) into a pixel value based on a container dimension.
export function pctToPx(pct: number, totalPx: number): number {
    return (pct / 100) * totalPx;
}

// Computes the pixel position of a memo PIN relative to the cork board.
export function getPinPixelPosition(
    xPct: number,
    yPct: number,
    boardWidth: number,
    boardHeight: number
) {
    return {
        pinX: pctToPx(xPct, boardWidth),
        pinY: pctToPx(yPct, boardHeight),
    };
}

// Converts pin pixel position into memo wrapper position.
// So we must offset the memo so the pin aligns visually.
export function getMemoTopLeftFromPin (
    pinX: number,
    pinY: number,
    pinOffsetX: number,
    pinOffsetY: number
) {
    return {
        left: pinX - pinOffsetX,
        top: pinY - pinOffsetY,
    };
}

// ============================================================================
//                            Drag End Helpers
// ============================================================================

// Clamps a value between min and max.
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

// Converts a pixel value into a percentage (0–100) relative to a container dimension.
export function pxToPct(px: number, totalPx: number): number {
    return (px / totalPx) * 100;
}

// ============================================================================
//                       Drag End Computation Helper
// ============================================================================

export function computeNewPinPct({
    xPct,
    yPct,
    deltaX,
    deltaY,
    boardWidth,
    boardHeight,
    boundaryPadding,
}: {
    xPct: number;
    yPct: number;
    deltaX: number;
    deltaY: number;
    boardWidth: number;
    boardHeight: number;
    boundaryPadding: number;
}) {
    // ---------------------------------------------------------------------
    // STEP 1: Convert stored percentages → pixel position of the PIN
    // ---------------------------------------------------------------------
    const pinX = (xPct / 100) * boardWidth;
    const pinY = (yPct / 100) * boardHeight;

    // ---------------------------------------------------------------------
    // STEP 2: Apply drag delta (still in pixels)
    // ---------------------------------------------------------------------
    const movedPinX = pinX + deltaX;
    const movedPinY = pinY + deltaY;

    // ---------------------------------------------------------------------
    // STEP 3: Clamp PIN CENTER inside board bounds
    // NOTE:
    // - The memo card may overflow
    // - The pin must never leave the board
    // ---------------------------------------------------------------------
    const clampedPinX = clamp(movedPinX, boundaryPadding, boardWidth - boundaryPadding);
    const clampedPinY = clamp(movedPinY, boundaryPadding, boardHeight - boundaryPadding);

    // ---------------------------------------------------------------------
    // STEP 4: Convert clamped pixel position → percentages
    // These values are safe to persist in DB
    // ---------------------------------------------------------------------
    return {
        xPct: pxToPct(clampedPinX, boardWidth),
        yPct: pxToPct(clampedPinY, boardHeight),
    };
}
