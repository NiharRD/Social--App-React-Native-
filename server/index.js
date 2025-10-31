const express = require("express");
const app = express();
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const { connect } = require("./connectMonogo");
const UserRouter = require("./routes/users");
const AuthRouter = require("./routes/auth");
const PostsRouter = require("./routes/posts");
const CommentsRouter = require("./routes/comments");
dotenv.config();
app.use(
  cors({
    origin: "*", // Allow all origins, or specify your client URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight
app.options("*", cors());

//middleWares

app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("common"));
//app.use(express.static("uploads"));

// Database connection middleware - connect before handling requests
app.use(async (req, res, next) => {
  try {
    await connect(process.env.mongoLocalUrl);
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "API is running",
    status: true,
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/users", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/posts", PostsRouter);
app.use("/api/posts/comments", CommentsRouter);

//app.listen(8080, () => console.log("Server Has Started "));
module.exports = app;
