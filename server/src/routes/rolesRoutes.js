import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/rolesController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requirePermission } from "../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../config/rbac.js";

const router = express.Router();

// All routes require authentication
router.use(protect());

// CRUD endpoints - role management requires system admin permissions
router.get("/", requirePermission(PERMISSIONS.MANAGE_SYSTEM), getAllRoles);
router.get("/:role_id", requirePermission(PERMISSIONS.MANAGE_SYSTEM), getRoleById);
router.post("/", requirePermission(PERMISSIONS.MANAGE_SYSTEM), createRole);
router.put("/:role_id", requirePermission(PERMISSIONS.MANAGE_SYSTEM), updateRole);
router.delete("/:role_id", requirePermission(PERMISSIONS.MANAGE_SYSTEM), deleteRole);
export default router;
