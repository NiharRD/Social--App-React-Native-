const express = require("express");
const router = express.Router();

//add posts

router.post("/add", async (req, res) => {
  try {
    const { caption, userId, userName, imageUrl } = req.body;
    const newPost = await Post.create({ caption, userId, userName, imageUrl });
    res
      .status(201)
      .json({
        message: "Post added successfully",
        status: true,
        data: newPost,
      });
  } catch (error) {
    res.status(500).json({ message: error.message, status: false });
  }
});
module.exports = router;
