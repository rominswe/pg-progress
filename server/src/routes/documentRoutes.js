import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  uploadDocument,
  getMyDocuments,
  reviewDocument,
} from "../controllers/documentController.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// ✅ Upload document(s)
router.post("/upload", protect, requireRole("STU"), uploadDocument);

// ✅ Get logged-in user's documents
router.get("/me", protect, requireRole("STU"), getMyDocuments);

// ✅ Review document (restricted roles)
router.post("/review", protect, requireRole("SUV", "EXA", "EXCGS", "CGSADM"), reviewDocument);

export default router;