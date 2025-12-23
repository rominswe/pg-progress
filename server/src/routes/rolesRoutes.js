import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/rolesController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect, requireRole("CGSADM"), getAllRoles);
router.get("/:role_id", protect, requireRole("CGSADM", "EXCGS"), getRoleById);
router.post("/", protect, requireRole("CGSADM"), createRole);
router.put("/:role_id", protect, requireRole("CGSADM"), updateRole);
router.delete("/:role_id", protect, requireRole("CGSADM"), deleteRole);
export default router;
