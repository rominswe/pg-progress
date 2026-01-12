import express from "express";
import { uploadDocument, getMyDocuments, reviewDocument, getSupervisorDocuments, downloadDocument, getStudentDashboardStats, deleteDocument } from "../controllers/documentController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";
import upload from "../middleware/upload.js"; // 1. Import the upload middleware

const router = express.Router();

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
router.get("/:id/download", protect, downloadDocument);
router.delete("/:id", protect, requireRole("STU"), deleteDocument);

// Supervisors / Examiners review documents
router.post("/review", protect, requireRole("SUV", "EXA", "CGSS", "CGSADM"), reviewDocument);

// Supervisor views department documents
router.get("/supervisor/list", protect, requireRole("SUV", "CGSADM", "CGSS"), getSupervisorDocuments);

export default router;