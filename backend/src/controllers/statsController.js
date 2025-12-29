// ============================================================================
// statsController.js
// API-facing controller for USER STATS
// Scheduler owns ALL reset + streak logic
// ============================================================================

const User = require("../models/userModel");

// ============================================================================
// GET USER STATS (READ-ONLY)
// ============================================================================
exports.getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("stats");

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        return res.status(200).json({
            message: "User Stats Fetched",
            stats: user.stats
        });
    } catch (err) {
        return res.status(500).json({
            message: "Error Fetching Stats",
            error: err.message
        });
    }
};

// ============================================================================
// INTERNAL UTIL — INCREMENT SIMPLE COUNTERS (NO DATE LOGIC)
// ============================================================================
exports.incrementStats = async (userId, type, amount = 1) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $inc: { [`stats.${type}`]: amount }
        });
    } catch (err) {
        console.error(`Error Incrementing Stat (${type}):`, err);
    }
};

// ============================================================================
// MARK DAILY PLAN COMPLETE (EVENT-BASED ONLY)
// NOTE: streak is handled by scheduler, NOT here
// ============================================================================
exports.markDayCompleteStats = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            $inc: { "stats.totalDailyPlanCompleted": 1 }
        });
    } catch (err) {
        console.error("Error Updating Daily Plan Stats:", err);
    }
};
