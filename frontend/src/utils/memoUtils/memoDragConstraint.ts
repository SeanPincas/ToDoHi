// ============================================================================
// memoDragConstraint.ts
// HARD boundary enforcement DURING drag
// Memo CONTAINER is the boundary reference
// ============================================================================

import type { Modifier } from "@dnd-kit/core";

// These must match your memo card size
const CARD_WIDTH = 220;
const CARD_HEIGHT = 180;

// Small visual offsets so it feels natural
const RIGHT_OFFSET = 10;
const BOTTOM_OFFSET = 10;

export function createMemoClampModifier(
    boardWidth: number,
    boardHeight: number
): Modifier {
    return ({ transform }) => {
        let { x, y } = transform;

        // LEFT
        if (x < 0) x = 0;

        // TOP
        if (y < 0) y = 0;

        // RIGHT
        const maxX = boardWidth - CARD_WIDTH - RIGHT_OFFSET;
        if (x > maxX) x = maxX;

        // BOTTOM
        const maxY = boardHeight - CARD_HEIGHT - BOTTOM_OFFSET;
        if (y > maxY) y = maxY;

        return {
            ...transform,
            x,
            y,
        };
    };
}