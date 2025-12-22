import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/masterStuController.js";
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect(["EXCGS", "SUV", "EXA", "CGSADM"]), getAllStudents);
router.get("/:master_id", protect(["EXCGS", "SUV", "EXA", "CGSADM"]), getStudentById);
router.post("/", protect(["CGSADM"]), createStudent);
router.put("/:master_id", protect(["CGSADM"]), updateStudent);
router.delete("/:master_id", protect(["CGSADM"]), deleteStudent);
export default router;