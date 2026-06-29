// models/userModel.js
const mongoose = require("mongoose");
const {
    USERNAME_MIN_LENGTH,
    USERNAME_MAX_LENGTH,
    USERNAME_REGEX,
    USERNAME_RULE_MESSAGE,
} = require("../utils/usernameValidation");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: [USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters long`],
        maxlength: [USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters long`],
        validate: {
            validator: function (v) {
                return USERNAME_REGEX.test(v);
            },
            message: () => USERNAME_RULE_MESSAGE,
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
        dayTaskDelete: { type: Number, enum: [3, 7, 15, 30], default: 30 },
        quoteDelay: { type: Number, enum: [5, 10, 30, 45, 60], default: 10 },
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        bookmarkStyle: { type: String, default: "bookmark-1" },
        wallpaperStyle: { type: String, default: "default" },
        frameStyle: { type: String, default: "frame-oak" },
        quoteCategory: {
            type: [String],
            validate: {
                validator: arr => arr.length <= 3,
                message: "You can select up to 3 quote categories."
            },
            default: []
        }
    },
    profilePicture: {
        type: String,
        default: ""
    },
    lastResetCycleKey: {
        type: String,
        default: null
    },
    stats: {
        totalTasksCreated: { type: Number, default: 0 },
        totalTasksCreatedToday: { type: Number, default: 0},
        totalTasksCompleted: { type: Number, default: 0 },
        tasksCompletedToday: { type: Number, default: 0 },
        tasksFailedYesterday: { type: Number, default: 0 },
        totalMemosCreated: { type: Number, default: 0 },
        totalDailyPlanCompleted: { type: Number, default: 0 },

        // streak tracking
        dailyStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("User", userSchema);


