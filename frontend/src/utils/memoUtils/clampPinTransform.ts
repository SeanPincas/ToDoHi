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

interface ClampPinTransformArgs {
    transformX: number;
    transformY: number;
    pinX: number;
    pinY: number;
    boardWidth: number;
    boardHeight: number;
    boundaryPadding: number;
}

export function clampPinTransform({
    transformX,
    transformY,
    pinX,
    pinY,
    boardWidth,
    boardHeight,
    boundaryPadding,
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

    if (nextPinX < boundaryPadding) {
        clampedX = boundaryPadding - pinX;
    }

    if (nextPinX > boardWidth - boundaryPadding) {
        clampedX = boardWidth - boundaryPadding - pinX;
    }

    if (nextPinY < boundaryPadding) {
        clampedY = boundaryPadding - pinY;
    }

    if (nextPinY > boardHeight - boundaryPadding) {
        clampedY = boardHeight - boundaryPadding - pinY;
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
