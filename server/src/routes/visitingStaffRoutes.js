import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import { requirePermission } from "../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../config/rbac.js";
import {
  getAllVisitingStaff,
  getVisitingStaffById,
  createVisitingStaff,
  updateVisitingStaff,
  deleteVisitingStaff
} from "../controllers/visitingStaffController.js";

const router = express.Router();

// All routes require authentication
router.use(protect());

// Admin access for external examiner management
router.get("/", requirePermission(PERMISSIONS.MANAGE_EXAMINERS), getAllVisitingStaff);
router.get("/:staff_id", requirePermission(PERMISSIONS.READ_USER), getVisitingStaffById);
router.post("/", requirePermission(PERMISSIONS.CREATE_USER), createVisitingStaff);
router.put("/:staff_id", requirePermission(PERMISSIONS.UPDATE_USER), updateVisitingStaff);
router.delete("/:staff_id", requirePermission(PERMISSIONS.DELETE_USER), deleteVisitingStaff);

export default router;