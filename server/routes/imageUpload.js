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
const streamifier = require("streamifier");

// Route 1: Upload and process images with preset and quality
// POST /api/images/process
// Body: { preset: 'instagram'|'story'|'twitter', quality: 60-100 }
// FormData: images (multiple files)
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
      const quality = req.processQuality; // Set by validateQuality middleware

      const processedResults = [];

      // Process each uploaded image
      for (const file of req.files) {
        const originalSize = file.size;

        // Download the original from Cloudinary to get buffer
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

// Route 2: Download processed images as ZIP
// POST /api/images/download-zip
// Body: { urls: [array of cloudinary URLs] }
router.post("/download-zip", async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "No image URLs provided" });
    }

    // Set response headers for ZIP download
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

    // Pipe archive to response
    archive.pipe(res);

    // Download each image and add to ZIP
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const response = await axios.get(url, { responseType: "arraybuffer" });
      const buffer = Buffer.from(response.data);

      // Extract filename from URL or create one
      const filename =
        url.split("/").pop().split("?")[0] || `image-${i + 1}.jpg`;

      archive.append(buffer, { name: filename });
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

// Route 3: Process multiple images with different presets
// POST /api/images/batch-process
// Body: { quality: 60-100, presets: ['instagram', 'story', 'twitter'] }
// FormData: images (multiple files)
router.post(
  "/batch-process",
  uploadOriginals,
  validateQuality,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      const { presets = ["instagram"] } = req.body;
      const presetsArray = Array.isArray(presets) ? presets : [presets];
      const quality = req.processQuality;

      const allProcessedResults = [];

      // Process each image with each preset
      for (const file of req.files) {
        const originalSize = file.size;

        // Download the original
        const response = await axios.get(file.path, {
          responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data);

        const fileResults = {
          originalFileName: file.originalname,
          originalSize: originalSize,
          processedVersions: [],
        };

        // Process with each preset
        for (const preset of presetsArray) {
          const processed = await uploadProcessedImage(
            buffer,
            preset,
            quality,
            file.originalname
          );

          fileResults.processedVersions.push({
            preset: preset,
            newSize: processed.bytes,
            dimensions: { width: processed.width, height: processed.height },
            url: processed.url,
            publicId: processed.publicId,
            format: processed.format,
          });
        }

        allProcessedResults.push(fileResults);
      }

      res.json({
        success: true,
        message: `${allProcessedResults.length} images processed with ${presetsArray.length} preset(s) each`,
        results: allProcessedResults,
        quality: quality,
        presets: presetsArray,
      });
    } catch (error) {
      console.error("Batch processing error:", error);
      res.status(500).json({
        error: "Failed to batch process images",
        details: error.message,
      });
    }
  }
);

// Route 4: Get image metrics (without re-processing)
// POST /api/images/metrics
// Body: { originalUrl, processedUrl }
router.post("/metrics", async (req, res) => {
  try {
    const { originalUrl, processedUrl } = req.body;

    if (!originalUrl || !processedUrl) {
      return res
        .status(400)
        .json({ error: "Both originalUrl and processedUrl are required" });
    }

    // Get file sizes
    const [originalRes, processedRes] = await Promise.all([
      axios.head(originalUrl),
      axios.head(processedUrl),
    ]);

    const originalSize = parseInt(originalRes.headers["content-length"]);
    const newSize = parseInt(processedRes.headers["content-length"]);
    const savings = originalSize - newSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(2);

    res.json({
      originalSize,
      newSize,
      savings,
      savingsPercent: savingsPercent + "%",
      compressionRatio: ((newSize / originalSize) * 100).toFixed(2) + "%",
    });
  } catch (error) {
    console.error("Metrics error:", error);
    res.status(500).json({
      error: "Failed to get image metrics",
      details: error.message,
    });
  }
});

module.exports = router;
