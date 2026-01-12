// ============================================================================
// memoBoard/zIndex.js
// Domain rules for memo stacking (z-index authority)
// ============================================================================

const Memo = require("../../models/memoModel");

/** Get the next highest zIndex for a user's memo board. */
async function getNextZIndex(userId) {
    // Find the memo with the highest z Index for this user
    const topMemo = await Memo.findOne({ userId })
        .sort({ "position.z": -1 })
        .select("position.z");

    // If no memos exist yet, start at 1
    if (!topMemo) {
        return 1;
    }

    // Otherwise, increment the current highest zIndex
    return topMemo.position.z +1;
}

/* Bring a memo to the front of the board. */
async function bringMemoToFront(memoId, userId) {
    const nextZ = await getNextZIndex(userId);

    const updatedMemo = await Memo.findOneAndUpdate(
        { _id: memoId, userId },
        { "position.z": nextZ },
        { new: true }
    );

    return updatedMemo;
}

/* Send a memo to the back of the board. */
async function sendMemoToBack(memoId, userId) {
    const bottomMemo = await memo.findOne({ userId })
        .sort({ " position.z": 1 })
        .select("position.z");

    const nextZ = bottomMemo ? bottomMemo.position.z -1 : 0;

    const updatedMemo = await Memo.findOneAndUpdate(
        { _id: memoId. userId },
        {  "position.z": nextZ },
        { new: true }
    );

    return updatedMemo;
}

module.exports = {
    getNextZIndex,
    bringMemoToFront,
    sendMemoToBack
};