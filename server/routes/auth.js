const express = require("express");
const router = express.Router();
const User = require("../models/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//Bcrypt is a password hashing library used in Express.js applications to securely store
// user passwords by converting them into irreversible hash strings, protecting them from unauthorized access even
// if the database is compromised
router.get("/", (req, res) => res.send("hello auth router yyy"));

// signing up usersss
router.post("/register", async (req, res) => {
  const { userName, emailId, phoneNo, password, gender, dob } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
      userName,
      emailId,
      phoneNo,
      password: hashedPassword,
      gender,
      dob,
    });
    console.log("new user created");
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// router login

router.post("/login", async (req, res) => {
  const { emailId } = req.body;
  try {
    const user = await User.findOne({ emailId });
    !user && res.status(200).json({ message: "User not found", status: false });

    if (user) {
      const ValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (ValidPassword) {
        const token = jwt.sign(
          { userId: user._id, emailId: user.emailId },
          process.env.SECRET
        );
        const userResponse = user.toObject();
        delete userResponse.password;

        userResponse.token = token;

        res.status(200).json({
          message: "Login Sucessfully",
          status: true,
          token,
          data: userResponse,
        });
      } else {
        res.status(200).json({ message: "Invalid password", status: false });
      }
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
