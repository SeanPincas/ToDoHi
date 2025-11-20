const mongoose = require("mongoose");

// Define categories as plain text (no emojis)
const categoryList = [
    'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
    'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
    'errands', 'pet-care', 'learning', 'creative', 'maintenance',
    'shopping', 'travel', 'others'
];

const planSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trime: true
    },
    description: {
        type: String,
        default: ""
    },
    // Time Info
    startTime: {
        type: String,
        required: true,
    },                          // HH : mm
    endTime: {
        type: String,
        required: true
    },                          // HH : mm
    duration: {
        type: Number,
        required: true
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

    // Optional auto-generated links
    linkedTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: null
    },

    linkedMemoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Memo",
        default: null
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

});