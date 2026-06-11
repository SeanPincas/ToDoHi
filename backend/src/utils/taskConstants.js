// ============================================================================
// File Name: taskConstants.js
// Purpose:
// - Central shared task-domain constants.
// - Used by models and utilities that validate categories or task colors.
// ============================================================================

const categoryList = [
    "cleaning", "work", "study", "fitness", "health", "cooking",
    "relax", "praying", "hobby", "social", "self-care", "finance",
    "errands", "pet-care", "learning", "creative", "maintenance",
    "shopping", "travel", "others"
];

const hexColorPattern = /^#([0-9A-F]{3}){1,2}$/i;

module.exports = {
    categoryList,
    hexColorPattern
};
