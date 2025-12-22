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
router.get("/", protect(["CGSADM", "EXCGS"]), getAllExaminers);
router.get("/:examiner_id", protect(["CGSADM", "EXCGS"]), getExaminerById);
router.post("/", protect(["CGSADM"]), createExaminer);
router.put("/:examiner_id", protect(["CGSADM"]), updateExaminer);
router.delete("/:examiner_id", protect(["CGSADM"]), deleteExaminer);
export default router;