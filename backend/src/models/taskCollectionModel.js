const mongoose = require("mongoose");
const { categoryList, hexColorPattern } = require("../utils/taskConstants");

const taskCollectionItemSchema = new mongoose.Schema({
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
        match: hexColorPattern
    },
    defaultOrderIndex: {
        type: Number,
        default: 0
    },
    memoTemplateText: {
        type: String,
        default: ""
    }
}, {
    _id: true
});

const taskCollectionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    colorTag: {
        type: String,
        default: "#ffffff",
        match: hexColorPattern
    },
    lastUsedAt: {
        type: Date,
        default: null
    },
    tasks: {
        type: [taskCollectionItemSchema],
        default: []
    }
}, {
    timestamps: true,
    versionKey: false
});

taskCollectionSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("TaskCollection", taskCollectionSchema);
