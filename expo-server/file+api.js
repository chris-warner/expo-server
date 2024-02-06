import { Router } from 'express';
import multer from 'multer'; // Middleware for handling multipart/form-data, used for file uploads
import path from 'path';

const router = Router();

// Define the destination directory for file uploads
const destinationDirectory = path.join(__dirname, './build'); // Provide the absolute path to your static server directory

// Configure multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, destinationDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original filename
  }
});

const upload = multer({ storage: storage });

// POST endpoint for uploading files
router.post('/upload', upload.single('file'), (req, res) => {
  // Check if file was uploaded successfully
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // File uploaded successfully
  return res.status(200).json({ message: 'File uploaded successfully' });
});

export default router;
