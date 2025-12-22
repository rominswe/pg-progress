import multer from "multer";
import fs from "fs";
import path from "path";

// Base uploads folder
const BASE_UPLOAD_DIR = "uploads/documents";

// File validation constants
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES_COUNT = 5;

// Ensure base folder exists
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

// Enhanced file filter with better validation
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
  }

  // Check file extension matches MIME type
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'application/zip': '.zip',
    'application/x-zip-compressed': '.zip'
  };

  if (allowedExtensions[file.mimetype] !== ext) {
    return cb(new Error(`File extension ${ext} does not match MIME type ${file.mimetype}`), false);
  }

  // Check for malicious file names
  if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
    return cb(new Error('Invalid file name'), false);
  }

  cb(null, true);
};

// Multer storage with dynamic folders: role_id/user_id/document_type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const user = req.user; // Must come from authMiddleware
      if (!user) {
        return cb(new Error('Authentication required'));
      }

      const roleFolder = user.role_id;
      const userFolder = user[user.constructor.primaryKeyAttributes[0]]; // dynamic ID
      const docType = (req.body.document_type || "Other").replace(/[^a-zA-Z0-9]/g, '_'); // Sanitize

      const uploadPath = path.join(BASE_UPLOAD_DIR, roleFolder, userFolder, docType);

      // Ensure directory exists
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Generate secure filename with timestamp and random component
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');

    cb(null, `${basename}_${timestamp}_${random}${ext}`);
  },
});

// Create multer upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_COUNT
  },
  fileFilter
});

// Error handling middleware for multer
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
        code: 'FILE_TOO_LARGE'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: `Maximum ${MAX_FILES_COUNT} files allowed per upload`,
        code: 'TOO_MANY_FILES'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        code: 'UNEXPECTED_FILE'
      });
    }
  }

  // Handle other errors
  if (error.message.includes('not allowed')) {
    return res.status(400).json({
      error: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  next(error);
};

export default upload;
export { MAX_FILE_SIZE, MAX_FILES_COUNT, ALLOWED_MIME_TYPES };