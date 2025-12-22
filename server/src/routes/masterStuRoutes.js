import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/masterStuController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission, requireRole, requireOwnership, requireDepartmentAccess } from "../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = express.Router();

// All routes require authentication
router.use(protect());

// Student listing - accessible to academic staff and admins
router.get("/", requirePermission(PERMISSIONS.MANAGE_STUDENTS), getAllStudents);

// Individual student access - students can view their own, staff can view assigned
router.get("/:master_id",
  requireOwnership('master_id'), // Students can view themselves, admins can view anyone
  getStudentById
);

// Student creation - admin only
router.post("/", requirePermission(PERMISSIONS.CREATE_USER), createStudent);

// Student updates - ownership or admin
router.put("/:master_id",
  requireOwnership('master_id'), // Students can update themselves, admins can update anyone
  updateStudent
);

// Student deletion - admin only
router.delete("/:master_id", requirePermission(PERMISSIONS.DELETE_USER), deleteStudent);

export default router;