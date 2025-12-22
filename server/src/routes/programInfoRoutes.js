import express from "express";
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programInfoController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(protect());

// CRUD endpoints - program management permissions
router.get("/", requirePermission(PERMISSIONS.MANAGE_PROGRAMS), getAllPrograms);
router.get("/:Prog_Code", requirePermission(PERMISSIONS.READ_USER), getProgramById);
router.post("/", requirePermission(PERMISSIONS.MANAGE_PROGRAMS), createProgram);
router.put("/:Prog_Code", requirePermission(PERMISSIONS.MANAGE_PROGRAMS), updateProgram);
router.delete("/:Prog_Code", requirePermission(PERMISSIONS.MANAGE_PROGRAMS), deleteProgram);
export default router;