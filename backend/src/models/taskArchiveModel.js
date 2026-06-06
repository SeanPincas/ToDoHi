const mongoose = require("mongoose");
const { categoryList, hexColorPattern } = require("../utils/taskConstants");
const { archiveTypeList, archiveReasonList } = require("../utils/taskArchiveConstants");

const taskArchiveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    originalTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
        index: true
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
    status: {
        type: String,
        enum: archiveTypeList,
        required: true
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
        type: Number,
        default: 0
    },
    isExpired: {
        type: Boolean,
        default: false
    },
    memoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Memo",
        default: null
    },
    containerColor: {
        type: String,
        default: "#ffffff",
        match: hexColorPattern
    },
    archivedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    archiveType: {
        type: String,
        enum: archiveTypeList,
        required: true
    },
    archiveReason: {
        type: String,
        enum: archiveReasonList,
        required: true
    },
    sourceCycleKey: {
        type: String,
        default: null
    },
    repeatedIntoTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        default: null
    },
    retentionDeleteAt: {
        type: Date,
        default: null,
        index: true
    }
}, {
    versionKey: false
});

taskArchiveSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("TaskArchive", taskArchiveSchema);
