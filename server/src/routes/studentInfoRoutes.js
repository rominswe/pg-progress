import express from "express";
import {
  getAllStudinfo,
  getStudinfoById,
  createStudinfo,
  updateStudinfo,
  deleteStudinfo,
} from "../controllers/studentInfoController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(protect());

// CRUD endpoints - admin level access for student info management
router.get("/", requirePermission(PERMISSIONS.MANAGE_SYSTEM), getAllStudinfo);
router.get("/:stu_id", requirePermission(PERMISSIONS.READ_USER), getStudinfoById);
router.post("/", requirePermission(PERMISSIONS.CREATE_USER), createStudinfo);
router.put("/:stu_id", requirePermission(PERMISSIONS.UPDATE_USER), updateStudinfo);
router.delete("/:stu_id", requirePermission(PERMISSIONS.DELETE_USER), deleteStudinfo);
export default router;