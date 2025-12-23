import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";
import {
  getAllAuditLogs,
  getAuditLogById
} from "../controllers/auditLogController.js";

const router = express.Router();

// Admin-only access
router.get("/", protect, requireRole("CGSADM"), getAllAuditLogs);
router.get("/:audit_id", protect, requireRole("CGSADM"), getAuditLogById);

export default router;