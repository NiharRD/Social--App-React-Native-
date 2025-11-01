const mongoose = require("mongoose");

async function connect(url) {
  try {
    await mongoose.connect(url);
    console.log("Mongo DB has been connected");
  } catch (error) {
    console.error("Mongo DB connection error:", error);
  }
}

module.exports = { connect };
