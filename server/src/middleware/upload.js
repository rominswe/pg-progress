import multer from "multer";
import fs from "node:fs";
import path from "node:path";

// Base uploads folder
const BASE_UPLOAD_DIR = "./uploads/documents";

// Ensure base folder exists
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

// Multer storage with dynamic folders: role_id/user_id/document_type
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const user = req.user; // Must come from authMiddleware

      if (!user) {
        return cb(new Error("User not found in request. Authentication failed."));
      }

      // === FIX IS HERE ===
      // We check for common ID names (id, student_id, admin_id) and convert to String safely
      // This works whether 'user' is a plain object or a Sequelize instance.
      const userFolder = String(user.id || user.student_id || user.admin_id || "unknown_id");
      const roleFolder = String(user.role_id || "unknown_role");
      // ===================

      const docType = req.body.document_type || "Others";

      // Construct path: ./uploads/documents/student/123/Thesis
      const uploadPath = path.join(BASE_UPLOAD_DIR, roleFolder, userFolder, docType);

      // Recursively create the folder if it doesn't exist
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    } catch (err) {
      console.error("Upload Error:", err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Sanitize filename to remove spaces or weird characters
    const sanitizedName = file.originalname.replace(/\s+/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB max
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX, and common Images (JPG, PNG) if needed
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1); // remove dot

    if (allowedTypes.test(ext)) {
      return cb(null, true);
    }

    cb(new Error(`File type not allowed. Got: ${ext}`));
  },
});

export default upload;