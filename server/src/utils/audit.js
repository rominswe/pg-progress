import { auditLog } from "../config/config.js";

/* ================= AUDIT ACTION TYPES ================= */
export const AUDIT_ACTIONS = {
  // Authentication & Session
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  ACCOUNT_VERIFICATION: 'ACCOUNT_VERIFICATION',

  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
  USER_VERIFIED: 'USER_VERIFIED',

  // Document Management
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  DOCUMENT_DOWNLOAD: 'DOCUMENT_DOWNLOAD',
  DOCUMENT_DELETE: 'DOCUMENT_DELETE',
  DOCUMENT_REVIEW: 'DOCUMENT_REVIEW',
  DOCUMENT_APPROVED: 'DOCUMENT_APPROVED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  DOCUMENT_VERSION_CREATED: 'DOCUMENT_VERSION_CREATED',

  // Progress Tracking
  PROGRESS_CREATED: 'PROGRESS_CREATED',
  PROGRESS_UPDATED: 'PROGRESS_UPDATED',
  PROGRESS_DELETED: 'PROGRESS_DELETED',
  PROGRESS_STAGE_CHANGED: 'PROGRESS_STAGE_CHANGED',
  PROGRESS_APPROVED: 'PROGRESS_APPROVED',

  // Notifications
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
  NOTIFICATION_READ: 'NOTIFICATION_READ',
  NOTIFICATION_ARCHIVED: 'NOTIFICATION_ARCHIVED',
  NOTIFICATION_BULK_SEND: 'NOTIFICATION_BULK_SEND',

  // System & Admin
  SYSTEM_BACKUP: 'SYSTEM_BACKUP',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  CONFIG_CHANGED: 'CONFIG_CHANGED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  PERMISSION_REVOKED: 'PERMISSION_REVOKED',

  // Security
  SECURITY_ALERT: 'SECURITY_ALERT',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  ACCESS_DENIED: 'ACCESS_DENIED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // API & Data
  API_ACCESS: 'API_ACCESS',
  DATA_EXPORT: 'DATA_EXPORT',
  DATA_IMPORT: 'DATA_IMPORT',
  BULK_OPERATION: 'BULK_OPERATION'
};

/* ================= ENTITY TYPES ================= */
export const ENTITY_TYPES = {
  USER: 'USER',
  DOCUMENT: 'DOCUMENT',
  PROGRESS: 'PROGRESS',
  NOTIFICATION: 'NOTIFICATION',
  SESSION: 'SESSION',
  SYSTEM: 'SYSTEM',
  ROLE: 'ROLE',
  PERMISSION: 'PERMISSION'
};

/* ================= AUDIT STATUS ================= */
export const AUDIT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  WARNING: 'WARNING'
};

/**
 * Comprehensive audit logging function
 * @param {Object} params - Audit log parameters
 * @param {string} params.userId - User identifier (email, ID, etc.)
 * @param {string} params.action - Action performed (use AUDIT_ACTIONS constants)
 * @param {string} params.userRole - User role at time of action
 * @param {string} [params.entityType] - Type of entity affected
 * @param {string} [params.entityId] - ID of affected entity
 * @param {string} [params.details] - Detailed description
 * @param {Object} [params.oldValues] - Previous values (for updates)
 * @param {Object} [params.newValues] - New values (for updates)
 * @param {string} [params.ipAddress] - Client IP address
 * @param {string} [params.userAgent] - Browser user agent
 * @param {string} [params.sessionId] - Session identifier
 * @param {string} [params.status] - Action status (SUCCESS/FAILURE/WARNING)
 * @param {string} [params.errorMessage] - Error details if failed
 */
export const auditLog = async (params) => {
  try {
    const {
      userId,
      action,
      userRole,
      entityType,
      entityId,
      details,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      sessionId,
      status = AUDIT_STATUS.SUCCESS,
      errorMessage
    } = params;

    // Validate required fields
    if (!userId || !action || !userRole) {
      console.error('Audit log missing required fields:', { userId, action, userRole });
      return;
    }

    // Create audit log entry
    const logEntry = await auditLog.create({
      user_id: userId,
      user_role: userRole,
      action: action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || null,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: ipAddress || 'unknown',
      user_agent: userAgent || null,
      session_id: sessionId || null,
      status: status,
      error_message: errorMessage || null,
      created_at: new Date()
    });

    // Log to console for development/debugging
    console.log(`[AUDIT] ${action} by ${userId} (${userRole}) - ${status}`);

    return logEntry;

  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw error to avoid breaking the main application flow
  }
};

/**
 * Log authentication events
 * @param {string} userId - User identifier
 * @param {string} userRole - User role
 * @param {string} action - Auth action (LOGIN, LOGOUT, etc.)
 * @param {Object} req - Express request object
 * @param {string} [status] - Action status
 * @param {string} [errorMessage] - Error message if failed
 */
export const logAuthEvent = async (userId, userRole, action, req = null, status = AUDIT_STATUS.SUCCESS, errorMessage = null) => {
  const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
  const userAgent = req?.get('User-Agent') || 'unknown';
  const sessionId = req?.session?.id || null;

  return await auditLog({
    userId,
    action,
    userRole,
    entityType: ENTITY_TYPES.SESSION,
    entityId: sessionId,
    details: `${action} event`,
    ipAddress,
    userAgent,
    sessionId,
    status,
    errorMessage
  });
};

/**
 * Log user management actions
 * @param {string} adminId - Admin performing the action
 * @param {string} adminRole - Admin role
 * @param {string} action - Action performed
 * @param {string} targetUserId - User being affected
 * @param {Object} [oldValues] - Previous user values
 * @param {Object} [newValues] - New user values
 * @param {Object} req - Express request object
 */
export const logUserAction = async (adminId, adminRole, action, targetUserId, oldValues = null, newValues = null, req = null) => {
  const ipAddress = req?.ip || 'unknown';
  const userAgent = req?.get('User-Agent') || 'unknown';
  const sessionId = req?.session?.id || null;

  let details = `User action: ${action}`;
  if (oldValues && newValues) {
    details += ` - Values changed`;
  }

  return await auditLog({
    userId: adminId,
    action,
    userRole: adminRole,
    entityType: ENTITY_TYPES.USER,
    entityId: targetUserId,
    details,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
    sessionId
  });
};

/**
 * Log document actions
 * @param {string} userId - User performing the action
 * @param {string} userRole - User role
 * @param {string} action - Document action
 * @param {string} documentId - Document identifier
 * @param {string} [details] - Additional details
 * @param {Object} req - Express request object
 */
export const logDocumentAction = async (userId, userRole, action, documentId, details = null, req = null) => {
  const ipAddress = req?.ip || 'unknown';
  const userAgent = req?.get('User-Agent') || 'unknown';
  const sessionId = req?.session?.id || null;

  return await auditLog({
    userId,
    action,
    userRole,
    entityType: ENTITY_TYPES.DOCUMENT,
    entityId: documentId,
    details: details || `${action} on document`,
    ipAddress,
    userAgent,
    sessionId
  });
};

/**
 * Log progress tracking actions
 * @param {string} userId - User performing the action
 * @param {string} userRole - User role
 * @param {string} action - Progress action
 * @param {string} progressId - Progress record identifier
 * @param {string} [studentId] - Student identifier
 * @param {Object} [oldValues] - Previous progress values
 * @param {Object} [newValues] - New progress values
 * @param {Object} req - Express request object
 */
export const logProgressAction = async (userId, userRole, action, progressId, studentId = null, oldValues = null, newValues = null, req = null) => {
  const ipAddress = req?.ip || 'unknown';
  const userAgent = req?.get('User-Agent') || 'unknown';
  const sessionId = req?.session?.id || null;

  let details = `${action} on progress`;
  if (studentId) {
    details += ` for student ${studentId}`;
  }

  return await auditLog({
    userId,
    action,
    userRole,
    entityType: ENTITY_TYPES.PROGRESS,
    entityId: progressId,
    details,
    oldValues,
    newValues,
    ipAddress,
    userAgent,
    sessionId
  });
};

/**
 * Log security events
 * @param {string} userId - User identifier (or 'system' for system events)
 * @param {string} action - Security action
 * @param {string} details - Security event details
 * @param {string} [ipAddress] - IP address
 * @param {string} [userAgent] - User agent
 * @param {string} [sessionId] - Session ID
 */
export const logSecurityEvent = async (userId, action, details, ipAddress = 'unknown', userAgent = null, sessionId = null) => {
  return await auditLog({
    userId,
    action,
    userRole: 'SYSTEM',
    entityType: ENTITY_TYPES.SYSTEM,
    details,
    ipAddress,
    userAgent,
    sessionId,
    status: AUDIT_STATUS.WARNING
  });
};

/**
 * Get audit logs with filtering and pagination
 * @param {Object} filters - Filter options
 * @param {string} [filters.userId] - Filter by user ID
 * @param {string} [filters.action] - Filter by action
 * @param {string} [filters.entityType] - Filter by entity type
 * @param {string} [filters.entityId] - Filter by entity ID
 * @param {string} [filters.status] - Filter by status
 * @param {Date} [filters.startDate] - Start date filter
 * @param {Date} [filters.endDate] - End date filter
 * @param {number} [filters.limit] - Number of records to return
 * @param {number} [filters.offset] - Offset for pagination
 * @param {string} [filters.sortBy] - Sort field (default: created_at)
 * @param {string} [filters.sortOrder] - Sort order (ASC/DESC, default: DESC)
 */
export const getAuditLogs = async (filters = {}) => {
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
    } = filters;

    const whereClause = {};

    if (userId) whereClause.user_id = userId;
    if (action) whereClause.action = action;
    if (entityType) whereClause.entity_type = entityType;
    if (entityId) whereClause.entity_id = entityId;
    if (status) whereClause.status = status;

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at[auditLog.sequelize.Op.gte] = startDate;
      if (endDate) whereClause.created_at[auditLog.sequelize.Op.lte] = endDate;
    }

    const logs = await auditLog.findAll({
      where: whereClause,
      order: [[sortBy, sortOrder]],
      limit,
      offset
    });

    const total = await auditLog.count({ where: whereClause });

    return {
      logs,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };

  } catch (error) {
    console.error('Error retrieving audit logs:', error);
    throw error;
  }
};

/**
 * Get audit statistics
 * @param {Object} filters - Filter options
 * @param {Date} [filters.startDate] - Start date
 * @param {Date} [filters.endDate] - End date
 * @param {string} [filters.userId] - Specific user
 */
export const getAuditStats = async (filters = {}) => {
  try {
    const { startDate, endDate, userId } = filters;

    const whereClause = {};
    if (userId) whereClause.user_id = userId;
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) whereClause.created_at[auditLog.sequelize.Op.gte] = startDate;
      if (endDate) whereClause.created_at[auditLog.sequelize.Op.lte] = endDate;
    }

    // Get action counts
    const actionStats = await auditLog.findAll({
      where: whereClause,
      attributes: [
        'action',
        [auditLog.sequelize.fn('COUNT', auditLog.sequelize.col('audit_id')), 'count']
      ],
      group: ['action'],
      order: [[auditLog.sequelize.fn('COUNT', auditLog.sequelize.col('audit_id')), 'DESC']]
    });

    // Get status counts
    const statusStats = await auditLog.findAll({
      where: whereClause,
      attributes: [
        'status',
        [auditLog.sequelize.fn('COUNT', auditLog.sequelize.col('audit_id')), 'count']
      ],
      group: ['status']
    });

    // Get user activity counts
    const userStats = await auditLog.findAll({
      where: whereClause,
      attributes: [
        'user_id',
        'user_role',
        [auditLog.sequelize.fn('COUNT', auditLog.sequelize.col('audit_id')), 'count']
      ],
      group: ['user_id', 'user_role'],
      order: [[auditLog.sequelize.fn('COUNT', auditLog.sequelize.col('audit_id')), 'DESC']],
      limit: 10
    });

    return {
      actionStats: actionStats.map(stat => ({
        action: stat.action,
        count: parseInt(stat.dataValues.count)
      })),
      statusStats: statusStats.map(stat => ({
        status: stat.status,
        count: parseInt(stat.dataValues.count)
      })),
      userStats: userStats.map(stat => ({
        userId: stat.user_id,
        userRole: stat.user_role,
        count: parseInt(stat.dataValues.count)
      }))
    };

  } catch (error) {
    console.error('Error retrieving audit statistics:', error);
    throw error;
  }
};

/**
 * Clean up old audit logs (for maintenance)
 * @param {number} daysOld - Remove logs older than this many days
 */
export const cleanupAuditLogs = async (daysOld = 365) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await auditLog.destroy({
      where: {
        created_at: {
          [auditLog.sequelize.Op.lt]: cutoffDate
        }
      }
    });

    console.log(`Cleaned up ${result} audit log entries older than ${daysOld} days`);
    return result;

  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    throw error;
  }
};