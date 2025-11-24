const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, default: "Unknown" },
    category: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model("Quote", quoteSchema);
