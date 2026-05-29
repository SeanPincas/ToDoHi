const rateLimit = require("express-rate-limit");

// -------------------------------------------------------------
// GLOBAL API LIMITER
// Applies to ALL routes unless overridden
// -------------------------------------------------------------

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many requests — slow down.",
    },
});

// -------------------------------------------------------------
// STRICT AUTH LIMITER
// Use for login / register routes
// -------------------------------------------------------------

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many authentication attempts. Try again later.",
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
};
