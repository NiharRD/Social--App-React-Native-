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
app.use(cors());

//middleWares

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/posts", PostsRouter);
app.use("/api/posts/comments", CommentsRouter);
connect(process.env.mongoLocalUrl);
//app.listen(8080, () => console.log("Server Has Started "));
module.exports = app;
