const mongoose = require("mongoose");

// Define categories as plain text (no emojis)
const categoryList = [
    'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
    'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
    'errands', 'pet-care', 'learning', 'creative', 'maintenance',
    'shopping', 'travel', 'others'
];

const planHistorySchema = new mongoose.Schema({

    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        enum: categoryList,
        default: "others"
    },

    containerColor: {
        type: String,
        default: "#ffffff",
        match: /^#([0-9A-F]{3}){1,2}$/i 
    },

    // default starting duration when dragged in the future
    defaultStartTime: { type: String, default: "07:00"}, // HH:mm
    defaultEndTime: { type: String, default: "08:00"},
    defaultDuration: { type: String, default: 60 }, //minutes

    // User can "favorite" plan templates to pin them
    isFavorite: { type: Boolean, default: false},

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PlanHistory", planHistorySchema);