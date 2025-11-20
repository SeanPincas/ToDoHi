// src/config/db.js (or wherever you keep it)
const mongoose = require("mongoose")

const connectDB = async () => {
  try {
    // modern connection (no deprecated options)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // stop the server if DB fails
  }
};

module.exports = connectDB;
