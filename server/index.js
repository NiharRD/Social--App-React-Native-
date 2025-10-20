const express = require("express");
const app = express();
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const { connect } = require("./connectMonogo");
const UserRouter = require("./routes/users");
const AuthRouter = require("./routes/auth");
const PostsRouter = require("./routes/posts");
dotenv.config();

//middleWares

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/users", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/posts", PostsRouter);
connect(process.env.mongoLocalUrl);
app.listen(8080, () => console.log("Server Has Started "));
