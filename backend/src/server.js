// I Offer This Project For the Lord, My God Jesus Christ
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const { apiLimiter } = require("./middleware/rateLimiter.js");

// Import Scheduler (new)
const { startScheduler } = require("./utils/scheduler.js");

// Import Routes (use require instead of import)
const authRoutes = require("./routes/authRoute.js");
const userRoutes = require("./routes/userRoute.js");
const taskRoutes = require("./routes/taskRoute.js");
const memoRoutes = require("./routes/memoRoute.js");
const dailyPlanRoutes = require("./routes/dailyPlanRoute.js");
const quoteRoutes = require("./routes/quoteRoute.js");
const statsRoutes = require("./routes/statsRoute.js");

// Environment Setup
dotenv.config();

// Initialize Express App
const app = express();

app.use(apiLimiter);

// Enable CORS and JSON body parsing
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/memoboard", memoRoutes);
app.use("/api/daily-plans", dailyPlanRoutes);
app.use("/api/quotes", quoteRoutes);

app.use("/uploads", express.static("uploads")); // Serve uploaded files

// ---------------- BASE ROUTE ----------------
app.get("/", (req, res) => res.send("ToDoHi Backend Running . . ."));

// ---------------- START SERVER ----------------
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Start Scheduler after DB connection
    startScheduler({
      enabled: true,
      schedule: "*/5 * * * *", // Every 5 minutes
    });

    // Start listening
    const PORT = process.env.PORT || 3500;
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};

startServer();
