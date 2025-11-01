const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const upload = require("../middleware/upload");
const verifyToken = require("../middleware/auth");
//add posts

// router.post(
//   "/add",
//   upload.single("imageUrl"),
//   verifyToken,
//   async (req, res) => {
//     try {
//       const imageUrl = req.file ? req.file.filename : "";
//       const { caption } = req.body;
//       const userId = req.userId;
//       const user = await User.findById(userId);
//       if (!user) {
//         return res
//           .status(404)
//           .json({ message: "User not found", status: false });
//       }
//       const userName = user.userName;

//       const newPost = await Post.create({
//         caption,
//         userId,
//         userName,
//         imageUrl,
//       });
//       res.status(201).json({
//         message: "Post added successfully",
//         status: true,
//         data: newPost,
//       });
//     } catch (error) {
//       res.status(500).json({ message: error.message, status: false });
//     }
//   }
// );

// cloudnaryt  update
router.post(
  "/add",
  upload.single("imageUrl"), // 'imageUrl' matches your FormData field name
  verifyToken,
  async (req, res) => {
    try {
      // Cloudinary automatically uploads and gives you the URL
      const imageUrl = req.file ? req.file.path : ""; // Cloudinary URL is in req.file.path
      const { caption } = req.body;
      const userId = req.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User not found",
        });
      }

      const newPost = new Post({
        userId,
        caption,
        imageUrl, // This is now the Cloudinary URL
        likes: [],
        comments: [],
        userName: user.userName,
      });

      await newPost.save();

      res.status(201).json({
        status: true,
        message: "Post created successfully",
        post: newPost,
      });
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({
        status: false,
        message: "Error creating post",
        error: error.message,
      });
    }
  }
);

// update post

router.put("/update/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(req.userId);
    const post = await Post.findById(id);
    if (!post || post.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "unauthorized", status: false });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({
      message: "Post updated successfully",
      status: true,
      data: updatedPost,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

// delete posts

router.delete("/delete/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ message: "Post not found", status: false });
  }
  try {
    const user = await User.findById(req.userId);
    const post = await Post.findById(id);
    if (!post || post.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: "unauthorized", status: false });
    }
    await Post.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Post deleted successfully", status: true });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

// get post by id

router.get("/getPost/:id", async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (post) {
    res
      .status(200)
      .json({ message: "Post fetched successfully", status: true, data: post });
  } else {
    res.status(404).json({ message: "Post not found", status: false });
  }
});

//get all posts

router.get("/get", async (req, res) => {
  await Post.find()
    .then((posts) => {
      res.status(200).json({
        message: "Posts fetched successfully",
        status: true,
        data: posts,
      });
    })
    .catch((err) => {
      res.status(500).json({ message: err.message, status: false, data: [] });
    });
});

// get post by user id

router.get("/getPostByUser/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const posts = await Post.find({ userId: userId });
    if (posts.length > 0) {
      res.status(200).json({
        message: "Posts fetched successfully",
        status: true,
        data: posts,
      });
    } else {
      res.status(404).json({
        message: "Posts not found with the user id",
        status: false,
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

// like post

router.put("/like/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    const currentUser = await User.findOne({ _id: req.userId });
    if (!post) {
      return res.status(404).json({ message: "Post not found", status: false });
    }
    let isLiked = false;
    post.likes.map((item) => {
      if (item.toString() === currentUser._id.toString()) isLiked = true;
    });
    if (isLiked) {
      res.status(200).json({ message: "Post already liked", status: false });
    } else {
      await Post.findOneAndUpdate(
        { _id: post._id },
        { $push: { likes: currentUser._id } },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "Post liked successfully", status: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});

// delete post

module.exports = router;
