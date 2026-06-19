const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: String, default: "Unknown" },
    category: { type: String, required: true }
}, {
    timestamps: true
});

const quoteDbName = process.env.QUOTE_DB_NAME || process.env.MONGO_QUOTE_DB_NAME || "todohiDB";
const quoteConnection = mongoose.connection.useDb(quoteDbName, { useCache: true });

module.exports =
    quoteConnection.models.Quote ||
    quoteConnection.model("Quote", quoteSchema);
