const mongoose = require("mongoose");
const planSchema = require("./planModel.js");

const dailyPlanSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: "User",
        required: true
    },
    date: {
        type: String,           // YYYY - MM - DD
        required: true
    },

    // Array of embedded plans for that date
    dailyPlan: [planSchema],

    status: {
        type: String,
        enum: ["pending","completed","expired"],
        default: "pending"
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ensures only 1 daily planner per ( user + day)
dailyPlanSchema.index({ userId: 1, date: 1}, {unique: true });

module.exports = mongoose.model("DailyPlan", dailyPlanSchema);