const express = require("express");
const router = express.Router();

const { getStats } = require("../controllers/statsController");
const protect = require("../middleware/authMiddleware");

// ------------------------------
// USER STATS (READ ONLY)
// ------------------------------

router.get("/", protect, getStats);

module.exports = router;