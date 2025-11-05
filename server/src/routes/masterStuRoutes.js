import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/masterStuController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllStudents);
router.get("/:stu_id", getStudentById);
router.post("/", createStudent);
router.put("/:stu_id", updateStudent);
router.delete("/:stu_id", deleteStudent);

export default router;