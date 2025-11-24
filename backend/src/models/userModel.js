// models/userModel.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Username must be at least 3 characters long"],
        validate: {
            validator: function (v) {
                // Only allow letters, numbers, underscores, and hyphens
                return /^[a-zA-Z0-9_-]+$/.test(v);
            },
            message: props => `${props.value} is not a valid username. Only letters, numbers, underscores, and hyphens are allowed.`,
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`
        }
    },
    password: {
        type: String,
        required: true
    },
    preference: {
        resetHour: { type: Number, default: 0 },
        theme: { type: String, enum: ['light', 'dark'], default: 'light' }
    },
    quoteCategoryPreferences: {
        type: [String],
        validate: {
            validator: arr => arr.length <= 3,
            message: "You can select up to 3 quote categories."
        },
        default: []
    },
    profilePicture: {
        type: String,
        default: ""
    },
    stats: {
        totalTasksCompleted: { type: Number, default: 0 },
        totalMemosCreated: { type: Number, default: 0 },
        totalDailyPlanCompleted: { type: Number, default: 0 },

        // streak tracking
        dailyStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },

        // optional helpful stats
        tasksCompletedToday: { type: Number, default: 0 },
        tasksFailedYesterday: { type: Number, default: 0 }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);


