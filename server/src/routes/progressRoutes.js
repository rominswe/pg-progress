import express from "express";
import { createUpdate, getUpdates, getPendingEvaluations, reviewUpdate, getMyStudents } from "../controllers/progressController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configure multer for file uploads (50MB limit)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/progress-reports');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'progress-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt|zip/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, DOCX, TXT, and ZIP files are allowed'));
        }
    }
});

router.post("/", protect, requireRole("STU"), upload.single('document'), createUpdate);
router.get("/", protect, getUpdates);
router.get("/pending-evaluations", protect, requireRole("SUV", "CGSADM", "CGSS"), getPendingEvaluations);
router.get("/my-students", protect, requireRole("SUV", "CGSADM", "CGSS"), getMyStudents);
router.post("/review", protect, requireRole("SUV", "CGSADM", "CGSS"), reviewUpdate);

export default router;
