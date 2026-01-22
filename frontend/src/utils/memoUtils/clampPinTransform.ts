// ============================================================================
// clampPinTransform.ts
// Clamps live drag movement so the PIN never leaves the cork board
// FRONTEND-ONLY (DnD-kit transform clamp)
// ============================================================================

export interface ClampedTransform {
    transform: {
        x: number;
        y: number;
        scaleX: number;
        scaleY: number;
    };
    isClamped: boolean;
}

// ---------------- CONFIG ----------------
const EDGE_PADDING = 0; // keep pin strictly inside board

interface ClampPinTransformArgs {
    transformX: number;
    transformY: number;
    pinX: number;
    pinY: number;
    boardWidth: number;
    boardHeight: number;
}

export function clampPinTransform({
    transformX,
    transformY,
    pinX,
    pinY,
    boardWidth,
    boardHeight,
}: ClampPinTransformArgs): ClampedTransform {
    // --------------------------------------------------
    // Compute proposed pin position after movement
    // --------------------------------------------------
    const nextPinX = pinX + transformX;
    const nextPinY = pinY + transformY;

    // --------------------------------------------------
    // Clamp pin inside board bounds
    // --------------------------------------------------
    let clampedX = transformX;
    let clampedY = transformY;

    if (nextPinX < EDGE_PADDING) {
        clampedX = EDGE_PADDING - pinX;
    }

    if (nextPinX > boardWidth - EDGE_PADDING) {
        clampedX = boardWidth - EDGE_PADDING - pinX;
    }

    if (nextPinY < EDGE_PADDING) {
        clampedY = EDGE_PADDING - pinY;
    }

    if (nextPinY > boardHeight - EDGE_PADDING) {
        clampedY = boardHeight - EDGE_PADDING - pinY;
    }

    const isClamped =
        clampedX !== transformX ||
        clampedY !== transformY;

    return {
        transform: {
            x: clampedX,
            y: clampedY,
            scaleX: 1,
            scaleY: 1,
        },

        isClamped,
    };
}
