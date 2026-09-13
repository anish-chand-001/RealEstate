import multer from "multer";

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory for further processing

// Create a multer instance with the defined storage
const upload = multer({ storage });

export default upload;

