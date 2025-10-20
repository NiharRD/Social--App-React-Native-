const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
// update
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    await User.findOneAndUpdate({ _id: id }, { $set: req.body }).then(() => {
      res
        .status(200)
        .json({ message: "User updated successfully", status: true });
      //The $set operator modifies only the specified fields without overwriting the entire document. In your code,
      // {$set: req.body} take   all the fields from the request body and updates only those fields in the user document,
      // leaving all other fields intact
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

//delete user

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  const UserExists = await User.findById(id);
  if (UserExists) {
    await User.findByIdAndDelete(id).then(() => {
      res.json({ message: "User Deleted Successfully ", status: true });
    });
  } else {
    res
      .status(404)
      .json({ message: "User not found with the id ", status: false });
  }
});

// get users

router.get("/get", async (req, res) => {
  await User.find()
    .then((users) => {
      res.status(200).json({
        message: "Users fetched successfully",
        status: true,
        data: users,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message, status: false });
    });
});

router.get("/getUser/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (user) {
    res.status(200).json({
      message: "User fetched successfully",
      status: true,
      data: user,
    });
  } else {
    res
      .status(404)
      .json({ message: "User not found with the id ", status: false });
  }
});

module.exports = router;
