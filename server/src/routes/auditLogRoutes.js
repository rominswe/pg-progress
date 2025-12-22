import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  getAllAuditLogs,
  getAuditLogById
} from "../controllers/auditLogController.js";

const router = express.Router();

// Admin-only access
router.get("/", protect(["CGSADM"]), getAllAuditLogs);
router.get("/:audit_id", protect(["CGSADM"]), getAuditLogById);

export default router;