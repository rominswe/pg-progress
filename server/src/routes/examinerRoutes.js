import express from "express";
import {
  getAllExaminers,
  getExaminerById,
  createExaminer,
  updateExaminer,
  deleteExaminer,
} from "../controllers/examinerController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(protect());

// CRUD endpoints - admin level access for examiner management
router.get("/", requirePermission(PERMISSIONS.MANAGE_EXAMINERS), getAllExaminers);
router.get("/:examiner_id", requirePermission(PERMISSIONS.READ_USER), getExaminerById);
router.post("/", requirePermission(PERMISSIONS.CREATE_USER), createExaminer);
router.put("/:examiner_id", requirePermission(PERMISSIONS.UPDATE_USER), updateExaminer);
router.delete("/:examiner_id", requirePermission(PERMISSIONS.DELETE_USER), deleteExaminer);
export default router;