import express from "express";
import {
  getAllMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
} from "../controllers/supervisoryMeetingController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission, requireRole, requireOwnership } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(protect());

// CRUD endpoints - meetings accessible to supervisors, students, and admins
router.get("/", requirePermission(PERMISSIONS.VIEW_ALL_PROGRESS), getAllMeetings);
router.get("/:meeting_id", requireOwnership('meeting_id'), getMeetingById);
router.post("/", requirePermission(PERMISSIONS.APPROVE_STUDENT_ACTIONS), createMeeting);
router.put("/:meeting_id", requireOwnership('meeting_id'), updateMeeting);
router.delete("/:meeting_id", requirePermission(PERMISSIONS.APPROVE_STUDENT_ACTIONS), deleteMeeting);

export default router;