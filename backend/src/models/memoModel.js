const mongoose = require("mongoose");

const categoryList = [
    'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
    'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
    'errands', 'pet-care', 'learning', 'creative', 'maintenance',
    'shopping', 'travel', 'others'
];

const memoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // Task Related Memo
    taskSourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: null
    },
    title: {
        type: String,
        trim: true,
        default: "Untitled Memo"
    },
    content: {
        type: String,
        trim: true,
        default: ""
    },
    category: {
        type: String,
        enum: categoryList,
        default: "others"
    },
    containerColor: {
        type: String,
        default: '#ffffff', // fallback color
        match: /^#([0-9A-F]{3}){1,2}$/i
    },
    pinColor: {
        type: String,
        default: "#d32f2f",
        match: /^#([0-9A-F]{3}){1,2}$/i
    },
    position: {
        xPct: {
            type: Number,
            require: true,
            default: 50,  // Center of Board Horizontally
            min: 0,
            max: 100,
        },
        yPct: {
            type: Number,
            required: true,
            default: 50, // Center of Board Vertically
            min: 0,
            max: 100
        },
        z: {
            type: Number,
            required: true,
            default: 1
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Memo", memoSchema);