const mongoose = require("mongoose");
const { categoryList, hexColorPattern } = require("../utils/taskConstants");

// Define the Task schema
const taskSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
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
        default: ''
    },
    // Category is now purely text-based
    category: {
        type: String,
        enum: categoryList,
        default: 'others'
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    completedAt: {
        type: Date,
        default: null
    },
    completedOnce: {
        type: Boolean,
        default: false
    },
    failedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        default: null
    },
    orderIndex: {
        type: Number, // Useful for drag-and-drop UI ordering
        default: 0
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    // Optional: link between a Task and a Memo entry
    memoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Memo",
        default: null
    },
    // Visual customization (color theme for frontend display)
    containerColor: {
        type: String,
        default: '#ffffff',
        match: hexColorPattern
    }
});

// Ensure virtuals are included when converting documents to JSON
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
