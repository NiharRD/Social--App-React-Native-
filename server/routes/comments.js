const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");
const verifyToken = require("../middleware/auth");
//add comment

router.post("/add", verifyToken, async (req, res) => {
  const userId = req.userId;
  const { comment, userName, postId } = req.body;

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

router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) {
    res.status(404).json({ message: "Comment not found" });
  }
  if (comment.userId.toString() !== req.userId) {
    return res
      .status(403)
      .json({ message: "You can only delete your own comments" });
  }
  try {
    await Comment.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Comment deleted successfully", status: true });
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

router.put("/update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  if (req.userId !== id) {
    return res.status(401).json({ message: "unauthorized", status: false });
  }

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own comments" });
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
