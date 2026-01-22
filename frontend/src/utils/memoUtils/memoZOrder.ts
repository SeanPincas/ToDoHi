// ============================================================================
// memoZOrder.ts
// Pure frontend helpers for memo Z-order manipulation
// ============================================================================

import type { Memo } from "../../api/memoApi";

// Helper: find index of memo by id
function findIndex(memos: Memo[], memoId: string): number {
    return memos.findIndex(m => m._id === memoId)
}

// Bring Forward (step) - Swaps memo with the one directly above it
export function bringForward(
    memos: Memo[],
    memoId: string
): Memo[] {
    const index = findIndex(memos, memoId);

    // Guard: not found or already at top
    if (index === -1 || index === memos.length - 1) {
        return memos;
    }

    const newMemos = [...memos];
    [newMemos[index], newMemos[index + 1]] = [
        newMemos[index + 1],
        newMemos[index],
    ]

    return newMemos;
}

// Send Backward (step) - Swaps memo with the one directly below it
export function sendBackward(
    memos: Memo[],
    memoId: string
): Memo[] {
    const index = findIndex(memos, memoId);

    // Guard: not found or already at back
    if (index <= 0) {
        return memos;
    }

    const newMemos = [...memos];

    // Swap with previous item
    [newMemos[index], newMemos[index - 1]] = [
        newMemos[index - 1],
        newMemos[index],
    ];

    return newMemos;
}

// Bring To Top (absolute) - Removes memo and appends it to the end of array
export function bringToTop(
    memos: Memo[],
    memoId: string
): Memo[] {
    const index = findIndex(memos, memoId);

    // Guard: not found or already at top
    if (index === -1 || index === memos.length - 1) {
        return memos;
    }

    const newMemos = [...memos];
    const [memo] = newMemos.splice(index, 1);

    newMemos.push(memo);

    return newMemos;
}
