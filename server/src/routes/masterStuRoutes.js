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
router.get("/", protect(["cgs", "supervisor"]), getAllStudents);
router.get("/:master_id", protect(["cgs", "supervisor"]), getStudentById);
router.post("/", protect(["cgs"]), createStudent);
router.put("/:master_id", protect(["cgs"]), updateStudent);
router.delete("/:master_id", protect(["cgs"]), deleteStudent);
export default router;