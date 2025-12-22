import multer from "multer";
import fs from "fs";
import path from "path";

// Base uploads folder
const BASE_UPLOAD_DIR = "uploads/documents";

// Ensure base folder exists
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

// Multer storage with dynamic folders: role_id/user_id/document_type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const user = req.user; // Must come from authMiddleware
      const roleFolder = user.role_id;
      const userFolder = user[user.constructor.primaryKeyAttributes[0]]; // dynamic ID
      const docType = req.body.document_type || "Others";

      const uploadPath = path.join(BASE_UPLOAD_DIR, roleFolder, userFolder, docType);
      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) return cb(null, true);
    cb(new Error("Only PDF, DOC, DOCX files are allowed"));
  },
});

export default upload;