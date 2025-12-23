import express from "express";
import {
  getAllExaminers,
  getExaminerById,
  createExaminer,
  updateExaminer,
  deleteExaminer,
} from "../controllers/examinerController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect, requireRole("CGSADM", "EXCGS"), getAllExaminers);
router.get("/:examiner_id", protect, requireRole("CGSADM", "EXCGS"), getExaminerById);
router.post("/", protect, requireRole("CGSADM"), createExaminer);
router.put("/:examiner_id", protect, requireRole("CGSADM"), updateExaminer);
router.delete("/:examiner_id", protect, requireRole("CGSADM"), deleteExaminer);
export default router;