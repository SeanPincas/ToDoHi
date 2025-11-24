const User = require("../models/userModel");

// --------------------------- GET USER STATS ---------------------------
exports.getStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }

        return res.status(200), json({
            message: "User Stats Fetched",
            stats: user.stats
        });
    } catch (err) {
        return res.status(500).json({ message: "Error Fetching Stats", error: err.message });
    }
};

// --------------------------- INTERNAL UTILITIES ---------------------------
            // -------------- INCREMENT STATS COUNTERS -------------
exports.incrementStats = async (userId, type, amount = 1) => {
    try {
        const update = {};
        update[`stats.${type}`] = amount;

        await User.findByIdAndUpdate(userId, {
            $inc: update
        })
    } catch (err) {
        console.error(`Error Incrementing Stat (${type}):`, err)
    }
};

// --------------------------- UPDATE STREAK WHEN USER MARKS DAY COMPLETE ---------------------------
exports.updateStreak = async (user) => {
    try {
        const today = new Date().toISOString().split("T")[0]; // yyy-mm-dd
        const yesterday = new Date(Date.now() = 86400000).toISOString().split("T")[0];

        const lastCompleted = user.stats.lastDayCompleted || null;

        let newStreak = user.statsdailyStreak;

        // If yesterday was completed → increase streak
        if (lastCompleted === yesterday) {
            newStreak += 1;
        } else {
            newStreak = 1;
        }

        // update longest streak
        const newLongest = Math.max(newStreak, user.stats.longestStreak);

        user.stats.dailyStreak = newStreak;
        user.stats.longestStreak = newLongest;
        user.stats.lastDayCompleted = today;

        await user.save;
    } catch (err) {
        console.error("Error Updating Streak:", err);
    }
};

// --------------------------- MARK DAILYPLAN COMPLETE STATS ---------------------------
exports.markDayCompleteStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // increment lifetime count
        user.stats.totalDailyPlanCompleted += 1;

        // update streak logic
        await exports.updateStreak(user);

        await user.save();
    } catch (err) {
        console.error("Error Updating Daily Plan Stats: ", err);
    }
};

// --------------------------- MIDNIGHT RESET - SCHEDULER USE ---------------------------
exports.resetDailyStats = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;
        
        // yesterday's failed tasks = count unfinished tasks
        user.stats.tasksFailedYesterday = user.stats.tasksCompletedToday > 0
            ? 0
            : user.stats.tasksFailedYesterday;

        // reset today's counters
        user.stats.tasksCompletedToday = 0;

        await user.save();
    } catch (err) {
        console.error("Error Resetting Daily Stats: ", err);
    }
};
