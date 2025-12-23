import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/empinfoController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect, requireRole("CGSADM"), getAllEmployees);
router.get("/:emp_id", protect, requireRole("CGSADM"), getEmployeeById);
router.post("/", protect, requireRole("CGSADM"), createEmployee);
router.put("/:emp_id", protect, requireRole("CGSADM"), updateEmployee);
router.delete("/:emp_id", protect, requireRole("CGSADM"), deleteEmployee);
export default router;