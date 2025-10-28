const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const verifyToken = require("../middleware/auth");
// update
router.put("/update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (req.userId !== id) {
    return res.status(401).json({ message: "unauthorized", status: false });
  }

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

router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (req.userId !== id) {
    return res.status(401).json({ message: "unauthorized", status: false });
  }
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

// follow user

router.put("/follow/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    const currentUser = await User.findOne({ _id: req.userId });

    let isFollowed = false;
    user.followers.map((item) => {
      if (item.toString() === currentUser._id.toString()) isFollowed = true;
    });
    if (isFollowed) {
      const res1 = await User.findOneAndUpdate(
        { _id: id },
        { $pull: { followers: currentUser._id } },
        { new: true }
      );
      const res2 = await User.findOneAndUpdate(
        { _id: currentUser._id },
        { $pull: { following: user._id } },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "User unfollowed successfully", status: true });
    } else {
      const res1 = await User.findOneAndUpdate(
        { _id: id },
        { $push: { followers: currentUser._id } },
        { new: true }
      );
      const res2 = await User.findOneAndUpdate(
        { _id: currentUser._id },
        { $push: { following: user._id } },
        { new: true }
      );
      res.status(200).json({
        message: "User followed successfully",
        status: true,
        data: res1,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

// unfollow user

router.put("/unfollow/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    const currentUser = await User.findOne({ _id: req.userId });

    let isFollowing = false;
    user.followers.map((item) => {
      if (item.toString() === currentUser._id.toString()) isFollowing = true;
    });
    if (!isFollowing) {
      res.status(200).json({ message: "User not following", status: false });
    } else {
      const res1 = await User.findOneAndUpdate(
        { _id: id },
        { $pull: { followers: currentUser._id } },
        { new: true }
      );
      const res2 = await User.findOneAndUpdate(
        { _id: currentUser._id },
        { $pull: { following: user._id } },
        { new: true }
      );
      res.status(200).json({
        message: "User unfollowed successfully",
        status: true,
        data: res1,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

router.get("/getOwnProfile", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (user) {
      res.status(200).json({
        message: "User fetched successfully",
        status: true,
        data: user,
      });
    } else {
      res.status(404).json({ message: "User not found", status: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

module.exports = router;
