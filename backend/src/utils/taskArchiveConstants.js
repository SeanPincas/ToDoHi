// ============================================================================
// File Name: taskArchiveConstants.js
// Purpose:
// - Central shared archive-domain constants.
// - Defines allowed archive types and archive reasons.
// ============================================================================

const archiveTypeList = ["failed", "completed"];

const archiveReasonList = [
    "repeat-unselected",
    "repeat-selected-source",
    "review-window-expired",
    "manual-clear"
];

module.exports = {
    archiveTypeList,
    archiveReasonList
};
