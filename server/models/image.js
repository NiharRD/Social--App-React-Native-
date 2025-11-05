const mongoose = require("mongoose");
const imageProcessingSchema = mongoose.Schema(
  {
    originalFileName: {
      type: String,
      required: true,
    },
    originalSize: {
      type: Number,
      required: true,
    },
    processedImages: [
      {
        preset: {
          type: String, // 'instagram', 'story', 'twitter', or 'custom'
          required: true,
        },
        dimensions: {
          width: Number,
          height: Number,
        },
        quality: {
          type: Number, // 60-100
          required: true,
        },
        newSize: {
          type: Number,
          required: true,
        },
        filePath: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
    userSession: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Image = mongoose.model("Image", imageProcessingSchema);
module.exports = Image;
