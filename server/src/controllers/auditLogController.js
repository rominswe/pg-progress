import { getAuditLogs, getAuditStats, cleanupAuditLogs, AUDIT_ACTIONS, ENTITY_TYPES, AUDIT_STATUS } from "../utils/audit.js";
import { requireRole } from "../middleware/auth.js";

/**
 * Get audit logs with filtering and pagination
 */
export const getAuditLogsController = async (req, res) => {
  try {
    const {
      userId,
      action,
      entityType,
      entityId,
      status,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const filters = {
      userId,
      action,
      entityType,
      entityId,
      status,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder
    };

    const result = await getAuditLogs(filters);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs',
      error: error.message
    });
  }
};

/**
 * Get audit statistics
 */
export const getAuditStatsController = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const filters = {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      userId
    };

    const stats = await getAuditStats(filters);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit statistics',
      error: error.message
    });
  }
};

/**
 * Get audit log by ID
 */
export const getAuditLogById = async (req, res) => {
  try {
    const { auditId } = req.params;

    const result = await getAuditLogs({
      limit: 1,
      offset: 0
    });

    const log = result.logs.find(log => log.audit_id.toString() === auditId);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });

  } catch (error) {
    console.error('Get audit log by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit log',
      error: error.message
    });
  }
};

/**
 * Get audit log constants (for frontend dropdowns)
 */
export const getAuditConstants = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        actions: AUDIT_ACTIONS,
        entityTypes: ENTITY_TYPES,
        statuses: AUDIT_STATUS
      }
    });

  } catch (error) {
    console.error('Get audit constants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit constants',
      error: error.message
    });
  }
};

/**
 * Clean up old audit logs (admin only)
 */
export const cleanupAuditLogsController = async (req, res) => {
  try {
    const { daysOld = 365 } = req.body;

    // Validate daysOld
    if (daysOld < 30 || daysOld > 3650) {
      return res.status(400).json({
        success: false,
        message: 'Days old must be between 30 and 3650'
      });
    }

    const deletedCount = await cleanupAuditLogs(parseInt(daysOld));

    // Audit the cleanup action
    const { userId, role } = req.user;
    await require('../utils/audit.js').auditLog({
      userId,
      action: AUDIT_ACTIONS.SYSTEM_MAINTENANCE,
      userRole: role,
      entityType: ENTITY_TYPES.SYSTEM,
      details: `Cleaned up ${deletedCount} audit log entries older than ${daysOld} days`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id
    });

    res.json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} audit log entries`,
      data: { deletedCount }
    });

  } catch (error) {
    console.error('Cleanup audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup audit logs',
      error: error.message
    });
  }
};

/**
 * Export audit logs (for compliance/reporting)
 */
export const exportAuditLogs = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      userId,
      action,
      format = 'json'
    } = req.query;

    const filters = {
      userId,
      action,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      limit: 10000, // Large limit for export
      offset: 0
    };

    const result = await getAuditLogs(filters);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Audit ID',
        'User ID',
        'User Role',
        'Action',
        'Entity Type',
        'Entity ID',
        'Details',
        'Status',
        'IP Address',
        'Created At'
      ];

      const csvRows = result.logs.map(log => [
        log.audit_id,
        log.user_id,
        log.user_role,
        log.action,
        log.entity_type || '',
        log.entity_id || '',
        `"${(log.details || '').replace(/"/g, '""')}"`,
        log.status,
        log.ip_address,
        log.created_at
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
      res.send(csvContent);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.json"');
      res.json(result.logs);
    }

  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs',
      error: error.message
    });
  }
};
