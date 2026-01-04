import express from "express";
import { uploadDocument, getMyDocuments, reviewDocument } from "../controllers/documentController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// Student uploads documents
router.post("/upload", protect, requireRole("STU"), uploadDocument);

// Student views own documents
router.get("/my-documents", protect, requireRole("STU"), getMyDocuments);

// Supervisors / Examiners review documents
router.post("/review", protect, requireRole("SUV", "EXA", "CGSS", "CGSADM"), reviewDocument);

export default router;