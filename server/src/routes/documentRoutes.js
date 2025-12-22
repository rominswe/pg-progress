import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  uploadDocument,
  getMyDocuments,
  reviewDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// ✅ Upload document(s)
router.post("/upload", protect(["STU"]), uploadDocument);

// ✅ Get logged-in user's documents
router.get("/me", protect(["STU"]), getMyDocuments);

// ✅ Review document (restricted roles)
router.post("/review", protect(["SUV", "EXA", "EXEB"]), reviewDocument);

export default router;