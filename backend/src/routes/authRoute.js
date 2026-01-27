const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController.js");
const AuthMiddleware = require("../middleware/authMiddleware.js");
const { authLimiter } = require("../middleware/rateLimiter.js");

router.post("/register", authLimiter, AuthController.register);
router.post("/login", authLimiter ,AuthController.login);

// Protected Route
router.get("/me", AuthMiddleware, AuthController.me);

module.exports = router;