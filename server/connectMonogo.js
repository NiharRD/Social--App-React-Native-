const mongoose = require("mongoose");

let isConnected = false;

async function connect(url) {
  if (isConnected) {
    console.log("Using existing MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
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

module.exports = { connect };
