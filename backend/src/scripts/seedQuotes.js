const Quote = require("../models/quoteModel.js");
const User = require("../models/userModel.js");

// --------------------------- GET QUOTES BY CATEGORY ---------------------------
exports.getQuotesByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        const quotes = await Quote.find({ category }).sort({ id: 1 });

        if (quotes.length === 0) {
            return res.status(404).json({ message: "No quotes found for this category." });
        }

        res.json({ quotes });

    } catch (err) {
        res.status(500).json({ message: "Error Fetching Quotes", error: err.message });
    }
};

// --------------------------- GET ALL UNIQUE CATEGORIES ---------------------------
exports.getQuoteCategories = async (req, res) => {
    try {
        const categories = await Quote.distinct("category");
        res.json({ categories });
    } catch (err) {
        res.status(500).json({ message: "Error Fetching Categories", error: err.message });
    }
};

// --------------------------- UPDATE USER QUOTE PREFERENCES (MAX 3) ---------------------------
exports.updatePreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        const userId = req.user._id;

        // Validate input type
        if (!Array.isArray(preferences) || preferences.length > 3) {
            return res.status(400).json({
                message: "Preferences must be an array with a maximum of 3 categories."
            });
        }

        // Validate categories exist
        const validCategories = await Quote.distinct("category");
        const invalid = preferences.filter(c => !validCategories.includes(c));

        if (invalid.length > 0) {
            return res.status(400).json({
                message: "One or more categories do not exist.",
                invalidCategories: invalid
            });
        }

        // Save preferences
        await User.findByIdAndUpdate(userId, {
            $set: { "preference.quoteCategory": preferences }
        });

        res.json({ message: "Quote preferences updated.", preferences });

    } catch (err) {
        res.status(500).json({ message: "Error Updating Preferences", error: err.message });
    }
};

// --------------------------- GET RANDOM QUOTE BASED ON USER PREFERENCES ---------------------------
exports.getRandomQuote = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        const chosenCategories = user.preference?.quoteCategory || [];

        // Filter by user pref if exists
        const filter = chosenCategories.length > 0
            ? { category: { $in: chosenCategories } }
            : {};

        const count = await Quote.countDocuments(filter);
        if (count === 0) {
            return res.status(404).json({ message: "No quotes found." });
        }

        const randomIndex = Math.floor(Math.random() * count);
        const quote = await Quote.findOne(filter).skip(randomIndex);

        res.json({ quote });

    } catch (err) {
        res.status(500).json({ message: "Error Getting Random Quote", error: err.message });
    }
};
