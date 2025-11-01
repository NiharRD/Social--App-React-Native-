const mongoose = require("mongoose");

let isConnected = false;

async function connect(url) {
  // Set mongoose connection options for serverless
  mongoose.set("strictQuery", false);

  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Connection pooling for serverless
      minPoolSize: 1,
      maxIdleTimeMS: 10000, // Close idle connections quickly
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    isConnected = false;
    throw error;
  }
}

// Handle connection errors
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  isConnected = false;
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
  isConnected = false;
});

// Important for serverless: handle graceful shutdown
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected event");
  isConnected = true;
});

module.exports = { connect };
