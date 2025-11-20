const jwt = require('jsonwebtoken');        // For token signing
const bcrypt = require('bcryptjs');         // For password hashing and comparison
const User = require('../models/userModel'); // Mongoose User model

// --------------------------- REGISTER USER ---------------------------
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // ------------------- Input Validation -------------------
        // Check valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid Email Format" });
        }

        // Check password length
        if (password.length < 8 || password.length > 16) {
            return res.status(400).json({
                message: "Password must be between 8 and 16 characters",
            });
        }

        // ------------------- Check Existing email -------------------
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email Already Used" });
        }

        // ------------------- Hash Password -------------------
        const hashed = await bcrypt.hash(password, 10); // 10 salt rounds

        // ------------------- Create User -------------------
        const user = await User.create({
            username,
            email,
            password: hashed,
        });

        // ------------------- Return Response -------------------
        res.status(201).json({
            message: "User Created",
            user: { username, email }, // Do not return password
        });
    } catch (err) {
        res.status(500).json({
            message: "Error Creating User",
            error: err.message,
        });
    }
};

// --------------------------- LOGIN USER ---------------------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ------------------- Find User -------------------
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User Not Found" });

        // ------------------- Compare Password -------------------
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Invalid Password" });

        // ------------------- Generate JWT Token -------------------
        const token = jwt.sign(
            { id: user._id },         // payload
            process.env.JWT_SECRET,   // secret key
            { expiresIn: "7d" }       // expires in 7 days
        );

        // ------------------- Return Response -------------------
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ message: "Login Failed", error: err.message });
    }
};

// --------------------------- GET CURRENT USER ---------------------------
exports.me = async (req, res) => {
    try {
        // req.user is expected to be set by authMiddleware
        const user = await User.findById(req.user._id).select("-password"); // exclude password
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error Fetching User", error: err.message });
    }
};
