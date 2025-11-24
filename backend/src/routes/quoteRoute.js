const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware.js");

const {
    getQuotesByCategory,
    getQuoteCategories,
    updatePreferences,
    getRandomQuote
} = require("../controllers/quoteController.js");

// Get all categories
router.get("/categories", auth, getQuoteCategories);

// Get quotes under category
router.get("/category/:category", auth, getQuotesByCategory);

// Update user preferences
router.put("/preferences", auth, updatePreferences);

// Random quote (based on user preferences)
router.get("/random", auth, getRandomQuote);

module.exports = router;