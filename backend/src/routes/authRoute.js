const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController.js");
const AuthMiddleware = require("../middleware/authMiddleware.js");

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected Route
router.get("/me", AuthMiddleware, AuthController.me);

module.exports = router;