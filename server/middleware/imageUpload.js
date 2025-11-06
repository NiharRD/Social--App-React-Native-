const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Cloodinary storage for storing original buffer image  without transforming it
const originalStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "image-resizer/originals",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    public_id: (req, file) => {
      return `original-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    },

    resource_type: "auto",
  },
});

//  Cloudinary Storage for Storing processed images with dimensions and quality transformation
const getProcessedStorage = (preset) => {
  const presetDimensions = {
    instagram: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
    twitter: { width: 1200, height: 675 },
  };

  const dimensions = presetDimensions[preset] || { width: 1080, height: 1080 };

  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      // quality needed from client side
      const quality = req.processQuality || 80;

      return {
        folder: `image-resizer/${preset}`,
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        public_id: `${preset}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        transformation: [
          {
            width: dimensions.width,
            height: dimensions.height, // giving width and height as param for quality transformation
            crop: "fill",
            gravity: "auto",
          },
          { quality: quality }, // giving quality as a param for the transformation  to the quality object
          { fetch_format: "auto" },
        ],
      };
    },
  });
};

// main middle ware to upload orignasl image to cloudinary for them to be processed
const uploadOriginals = multer({
  storage: originalStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file  , recommended by GPT :(
    files: 20, // Max 20 files at once   - recommended by GPT :(
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
}).array("images", 20); // Accept multiple files with form  name images

// 2nd main function to process image based on quality and preset /resolution
const uploadProcessedImage = async (buffer, preset, quality, originalName) => {
  const presetDimensions = {
    instagram: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
    twitter: { width: 1200, height: 675 },
  };

  const dimensions = presetDimensions[preset] || { width: 1080, height: 1080 };

  return new Promise((resolve, reject) => {
    // upload stream is used for  directly uploading cloudinary images  again to cloundinay
    // without storing it to disk again
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `image-resizer/${preset}`,
        public_id: `${preset}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
        transformation: [
          {
            width: dimensions.width,
            height: dimensions.height,
            crop: "fill",
            gravity: "auto",
          },
          { quality: quality },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format,
            width: result.width,
            height: result.height,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// Middleware to validate quality parameter
const validateQuality = (req, res, next) => {
  const quality = parseInt(req.body.quality);

  if (quality && (quality < 60 || quality > 100)) {
    return res.status(400).json({
      error: "Quality must be between 60 and 100",
    });
  }

  req.processQuality = quality || 80; // Default to 80% if not provided
  next();
};

// Middleware to validate preset
const validatePreset = (req, res, next) => {
  const validPresets = ["instagram", "story", "twitter", "custom"];
  const preset = req.body.preset || req.query.preset;

  if (preset && !validPresets.includes(preset)) {
    return res.status(400).json({
      error: `Invalid preset. Must be one of: ${validPresets.join(", ")}`,
    });
  }

  next();
};

module.exports = {
  uploadOriginals,
  uploadProcessedImage,
  validateQuality,
  validatePreset,
  getProcessedStorage,
};
