import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  getAllVisitingStaff,
  getVisitingStaffById,
  createVisitingStaff,
  updateVisitingStaff,
  deleteVisitingStaff
} from "../controllers/visitingStaffController.js";
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Admin access for external examiner management
router.get("/", protect, requireRole("CGSADM", "EXCGS"), getAllVisitingStaff);
router.get("/:staff_id", protect, requireRole("CGSADM", "EXCGS"), getVisitingStaffById);
router.post("/", protect, requireRole("CGSADM"), createVisitingStaff);
router.put("/:staff_id", protect, requireRole("CGSADM"), updateVisitingStaff);
router.delete("/:staff_id", protect, requireRole("CGSADM"), deleteVisitingStaff);

export default router;