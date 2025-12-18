import express from "express";
import {
  getAllExaminers,
  getExaminerById,
  createExaminer,
  updateExaminer,
  deleteExaminer,
} from "../controllers/examinerController.js";
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect(['examiner']), getAllExaminers);
router.get("/:examiner_id", protect(['examiner']), getExaminerById);
router.post("/", protect(['examiner']), createExaminer);
router.put("/:examiner_id", protect(['examiner']), updateExaminer);
router.delete("/:examiner_id", protect(['examiner']), deleteExaminer);
export default router;