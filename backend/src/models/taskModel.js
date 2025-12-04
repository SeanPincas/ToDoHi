const mongoose = require("mongoose");

// Define categories as plain text (no emojis)
const categoryList = [
    'cleaning', 'work', 'study', 'fitness', 'health', 'cooking',
    'relax', 'praying', 'hobby', 'social', 'self-care', 'finance',
    'errands', 'pet-care', 'learning', 'creative', 'maintenance',
    'shopping', 'travel', 'others'
];

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
        match: /^#([0-9A-F]{3}){1,2}$/i
    }
});

// Ensure virtuals are included when converting documents to JSON
taskSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Task", taskSchema);
