import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/empinfoController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(protect());

// CRUD endpoints - admin level access for employee management
router.get("/", requirePermission(PERMISSIONS.MANAGE_SYSTEM), getAllEmployees);
router.get("/:emp_id", requirePermission(PERMISSIONS.READ_USER), getEmployeeById);
router.post("/", requirePermission(PERMISSIONS.CREATE_USER), createEmployee);
router.put("/:emp_id", requirePermission(PERMISSIONS.UPDATE_USER), updateEmployee);
router.delete("/:emp_id", requirePermission(PERMISSIONS.DELETE_USER), deleteEmployee);
export default router;