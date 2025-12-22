import express from "express";
import {
  getAllSupervisors,
  getSupervisorById,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
} from "../controllers/supervisorController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requirePermission, requireRole, requireRoleAccess, requireDepartmentAccess } from "../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = express.Router();

// All routes require authentication
router.use(protect());

// CRUD endpoints with different permission levels
router.get("/", requirePermission(PERMISSIONS.MANAGE_SUPERVISORS), getAllSupervisors);
router.get("/:sup_id", requireRoleAccess("SUV"), getSupervisorById);

// Creation and modification require higher permissions
router.post("/", requirePermission(PERMISSIONS.MANAGE_SUPERVISORS), createSupervisor);
router.put("/:sup_id", requireRoleAccess("SUV"), updateSupervisor);
router.delete("/:sup_id", requirePermission(PERMISSIONS.DELETE_USER), deleteSupervisor);

export default router;