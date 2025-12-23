import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/masterStuController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect, requireRole("EXCGS", "CGSADM"), getAllStudents);
router.get("/:master_id", protect, requireRole("EXCGS", "SUV", "EXA", "CGSADM"), getStudentById);
router.post("/", protect, requireRole("CGSADM"), createStudent);
router.put("/:master_id", protect, requireRole("CGSADM"), updateStudent);
router.delete("/:master_id", protect, requireRole("CGSADM"), deleteStudent);

export default router;