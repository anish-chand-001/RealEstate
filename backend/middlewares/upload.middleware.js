import multer from "multer";

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory for further processing

// Create a multer instance with the defined storage
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024, files: 10, fields: 30, parts: 45 },
  fileFilter: (req, file, callback) => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    return callback(null, true);
  },
});

export default upload;

