const express = require("express");
const router = express.Router();
const {
  uploadOriginals,
  uploadProcessedImage,
  validateQuality,
  validatePreset,
  getProcessedStorage,
} = require("../middleware/imageUpload");
const archiver = require("archiver");
const axios = require("axios");

// Route 1: Upload and process images with preset and quality
// FormData: images (multiple files) , preset -> instagram ,twitter as string
router.post(
  "/process",
  uploadOriginals,
  validateQuality,
  validatePreset,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      const { preset = "instagram" } = req.body;
      const quality = req.processQuality; // qualiy from client side process by valdation middle waree

      const processedResults = [];

      // prcoessing orignal  images uploaded   for be processed /transformed  from the request

      for (const file of req.files) {
        const originalSize = file.size;

        // storing in buffer each of the uploaded orignal imagww to process
        const response = await axios.get(file.path, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data);

        // Upload processed version
        const processed = await uploadProcessedImage(
          buffer,
          preset,
          quality,
          file.originalname
        );
        // after processing storing the results in the processedResults array
        processedResults.push({
          originalFileName: file.originalname,
          originalSize: originalSize,
          newSize: processed.bytes,
          compressionRatio:
            ((1 - processed.bytes / originalSize) * 100).toFixed(2) + "%",
          preset: preset,
          quality: quality,
          dimensions: {
            width: processed.width,
            height: processed.height,
          },
          url: processed.url,
          publicId: processed.publicId,
          format: processed.format,
        });
      }
      // client side to  save data in order to provide urls for further downloads
      res.json({
        success: true,
        message: `${processedResults.length} images processed successfully`,
        images: processedResults,
        summary: {
          totalOriginalSize: processedResults.reduce(
            (sum, img) => sum + img.originalSize,
            0
          ),
          totalNewSize: processedResults.reduce(
            (sum, img) => sum + img.newSize,
            0
          ),
          preset: preset,
          quality: quality,
        },
      });
    } catch (error) {
      console.error("Image processing error:", error);
      res.status(500).json({
        error: "Failed to process images",
        details: error.message,
      });
    }
  }
);

// Route 2: Download processed images as ZIP  using  archive  module
// Body: { urls: [array of cloudinary URLs] }
router.post("/download-zip", async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "No image URLs provided" });
    }

    // Setting response headers so that dowload can be done after calling the api as ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=processed-images-${Date.now()}.zip`
    );

    // Create ZIP archive
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw err;
    });

    // Pipe archive to response  - GPT kiya hu
    archive.pipe(res);

    // Download each image and add to ZIP
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const response = await axios.get(url, { responseType: "arraybuffer" }); // downloading each image from the url and storing in buffer
      const buffer = Buffer.from(response.data);

      // Extract filename from URL or create one
      const filename =
        url.split("/").pop().split("?")[0] || `image-${i + 1}.jpg`;

      archive.append(buffer, { name: filename }); // appededing thorgh looping in the archive
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error) {
    console.error("ZIP download error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Failed to create ZIP file",
        details: error.message,
      });
    }
  }
});

module.exports = router;
