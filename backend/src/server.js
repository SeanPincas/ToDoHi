// I Offer This Project For the Lord, My God Jesus Christ
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db.js");
const rateLimit = require("express-rate-limit");

// Import Scheduler (new)
const { startScheduler } = require("./utils/scheduler.js");

// Import Routes (use require instead of import)
const authRoutes = require("./routes/authRoute.js");
const userRoutes = require("./routes/userRoute.js");
const taskRoutes = require("./routes/taskRoute.js");
const memoRoutes = require("./routes/memoRoute.js");
const dailyPlanRoutes = require("./routes/dailyPlanRoute.js");
const quoteRoutes = require("./routes/quoteRoute.js");

// Environment Setup
dotenv.config();

// Initialize Express App
const app = express();

// Enable CORS and JSON body parsing
app.use(cors({
  origin: "http://localhost:5173", // your React frontend
  credentials: true               // allow cookies/auth headers
}));
app.use(express.json());

// ---------------- RATE LIMITER ----------------
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100,
  message: {
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// ---------------- ROUTES ----------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/memos", memoRoutes);
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
