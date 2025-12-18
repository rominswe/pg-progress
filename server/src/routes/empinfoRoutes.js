import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/empinfoController.js";
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect, getAllEmployees);
router.get("/:emp_id", protect, getEmployeeById);
router.post("/", protect, createEmployee);
router.put("/:emp_id", protect, updateEmployee);
router.delete("/:emp_id", protect, deleteEmployee);
export default router;