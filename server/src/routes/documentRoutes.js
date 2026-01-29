import express from "express";
import { uploadDocument, getMyDocuments, reviewDocument, getSupervisorDocuments, downloadDocument, viewDocument, getStudentDashboardStats, deleteDocument } from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";
import upload from "../middleware/upload.js"; // 1. Import the upload middleware

const router = express.Router();

// Supervisors / Examiners review documents - MOVED TO TOP to avoid overlap with /:id
router.post("/review", protect, requireRole("SUV", "EXA", "CGSS", "CGSADM"), reviewDocument);

// 2. ADD upload.array("files") into the route chain here
router.post(
    "/upload",
    protect,
    requireRole("STU"),
    upload.array("files"),
    uploadDocument
);

// Student views own documents
router.get("/my-documents", protect, requireRole("STU"), getMyDocuments);
router.get("/student/stats", protect, requireRole("STU"), getStudentDashboardStats);
router.get("/:id/download", protect, (req, res, next) => {
    if (req.user.role_id === 'EXA') return res.status(403).json({ error: "Download restricted for Examiners" });
    next();
}, downloadDocument);
router.get("/:id/view", protect, viewDocument);
router.delete("/:id", protect, requireRole("STU"), deleteDocument);

// Supervisors / Examiners review documents - MOVED TO TOP to avoid overlap with /:id

// Supervisor views department documents
router.get("/supervisor/list", protect, requireRole("SUV", "CGSADM", "CGSS"), getSupervisorDocuments);

export default router;