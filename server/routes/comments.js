const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");

//add comment

router.post("/add", async (req, res) => {
  const { comment, userId, userName, postId } = req.body;
  try {
    const newComment = await Comment.create({
      comment,
      userId,
      userName,
      postId,
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete comment

router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedComment = await Comment.findByIdAndDelete(id);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res
      .status(200)
      .json({ message: "Comment deleted successfully", data: deletedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all comments by  post id

router.get("/getByPost/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await Comment.find({ postId: postId });
    res
      .status(200)
      .json({ message: "Comments fetched successfully", data: comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update comment

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Comment updated successfully", data: updatedComment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
