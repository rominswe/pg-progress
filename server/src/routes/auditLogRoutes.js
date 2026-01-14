import express from "express";
import { getAuditLogsAdmin } from "../controllers/auditLogController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// Only CGS Admin can access audit logs
router.get("/", protect, requireRole("CGSADM"), getAuditLogsAdmin);

export default router;