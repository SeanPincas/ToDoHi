// ============================================================================
// memoBoard/zIndex.js
// Domain rules for memo stacking (z-index authority)
// ============================================================================

const Memo = require("../../models/memoModel");

/** Get the next highest zIndex for a user's memo board. */
async function getNextZIndex(userId) {
    const count = await Memo.countDocuments({ userId });
    return count; // if N memos exist → new memo gets z = N
}

module.exports = {
    getNextZIndex,
};