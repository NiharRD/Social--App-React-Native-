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

connect(process.env.mongoLocalUrl).catch((err) => {
  console.error("Initial MongoDB connection failed:", err);
});

app.use(
  cors({
    origin: "*", // Allow all origins, or specify your client URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight
// app.options("*", cors());

//middleWares

app.use(express.json());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("common"));
//app.use(express.static("uploads"));

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
