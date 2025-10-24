const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Comment = require("../models/comment");
const User = require("../models/user");
const verifyToken = require("../middleware/auth");
//add comment

router.post("/add/:postId", verifyToken, async (req, res) => {
  const { postId } = req.params;
  const { comment } = req.body;

  try {
    const user = await User.findById(req.userId);
    const post = await Post.findById(postId);
    if (!user || !post) {
      return res
        .status(404)
        .json({ message: "User or post not found", status: false });
    }
    if (post.userId.toString() === user._id.toString()) {
      return res.status(403).json({
        message: "You cannot comment on your own post",
        status: false,
      });
    }
    const newComment = await Comment.create({
      comment,
      userId: user._id,
      userName: user.userName,
      postId: post._id,
    });
    await Post.findOneAndUpdate(
      { _id: post._id },
      { $push: { comments: newComment._id } },
      { new: true }
    );
    res.status(201).json({
      message: "Comment added successfully",
      status: true,
      data: newComment,
    });
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
    await Post.findOneAndUpdate(
      { _id: comment.postId },
      { $pull: { comments: comment._id } },
      { new: true }
    );
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

  try {
    const comment = await Comment.findById(id);
    const user = await User.findById(req.userId);
    if (!user || !comment) {
      return res
        .status(404)
        .json({ message: "User or comment not found", status: false });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only update your own comments" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({
      message: "Comment updated successfully",
      status: true,
      data: updatedComment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
