import express from "express";
import {
  getAuditLogsController,
  getAuditStatsController,
  getAuditLogById,
  getAuditConstants,
  cleanupAuditLogsController,
  exportAuditLogs
} from "../controllers/auditLogController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All audit routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/audit/logs
 * @desc Get audit logs with filtering and pagination
 * @access Private (Admin roles only)
 */
router.get('/logs', requireRole(['CGSADM', 'EXCGS']), getAuditLogsController);

/**
 * @route GET /api/audit/logs/:auditId
 * @desc Get specific audit log by ID
 * @access Private (Admin roles only)
 */
router.get('/logs/:auditId', requireRole(['CGSADM', 'EXCGS']), getAuditLogById);

/**
 * @route GET /api/audit/stats
 * @desc Get audit statistics
 * @access Private (Admin roles only)
 */
router.get('/stats', requireRole(['CGSADM', 'EXCGS']), getAuditStatsController);

/**
 * @route GET /api/audit/constants
 * @desc Get audit log constants for UI
 * @access Private (Admin roles only)
 */
router.get('/constants', requireRole(['CGSADM', 'EXCGS']), getAuditConstants);

/**
 * @route GET /api/audit/export
 * @desc Export audit logs for compliance/reporting
 * @access Private (Admin roles only)
 */
router.get('/export', requireRole(['CGSADM', 'EXCGS']), exportAuditLogs);

/**
 * @route POST /api/audit/cleanup
 * @desc Clean up old audit logs
 * @access Private (Senior Admin only)
 */
router.post('/cleanup', requireRole(['CGSADM']), cleanupAuditLogsController);

export default router;