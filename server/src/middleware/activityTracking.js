import { auditLog as auditLogger, AUDIT_ACTIONS, AUDIT_STATUS, ENTITY_TYPES } from "../utils/audit.js";

/**
 * Activity Tracking Middleware
 * Automatically logs API access and user activities
 */

/**
 * Log API access for authenticated requests
 */
export const logApiAccess = (req, res, next) => {
  // Only log for authenticated requests
  if (req.user) {
    const startTime = Date.now();

    // Log when response is finished
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;

        // Determine action based on HTTP method and path
        let action = AUDIT_ACTIONS.API_ACCESS;
        let entityType = null;
        let entityId = null;

        // Extract entity information from path
        const pathParts = req.path.split('/').filter(p => p);
        if (pathParts.length >= 2) {
          const resource = pathParts[1]; // e.g., 'progress', 'documents', 'notifications'
          const id = pathParts[2]; // e.g., progress_id, document_id

          switch (resource) {
            case 'progress':
              entityType = ENTITY_TYPES.PROGRESS;
              if (id && req.method !== 'GET') entityId = id;
              break;
            case 'documents':
              entityType = ENTITY_TYPES.DOCUMENT;
              if (id) entityId = id;
              break;
            case 'notifications':
              entityType = ENTITY_TYPES.NOTIFICATION;
              if (id) entityId = id;
              break;
            case 'audit':
              // Don't log audit API access to avoid recursion
              return;
          }
        }

        // Determine status based on response code
        let auditStatus = AUDIT_STATUS.SUCCESS;
        if (statusCode >= 400 && statusCode < 500) {
          auditStatus = AUDIT_STATUS.WARNING;
        } else if (statusCode >= 500) {
          auditStatus = AUDIT_STATUS.FAILURE;
        }

        await auditLogger({
          userId: req.user.email || req.user.userId,
          action,
          userRole: req.user.role_id || req.user.role,
          entityType,
          entityId,
          details: `${req.method} ${req.path} - ${statusCode} (${duration}ms)`,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          sessionId: req.session?.id,
          status: auditStatus
        });

      } catch (error) {
        console.error('API access logging failed:', error);
        // Don't block the response
      }
    });
  }

  next();
};

/**
 * Log security events
 */
export const logSecurityEvent = async (eventType, details, req = null, userId = null, status = AUDIT_STATUS.WARNING) => {
  try {
    await auditLogger({
      userId: userId || req?.user?.email || req?.user?.userId || 'system',
      action: AUDIT_ACTIONS.SECURITY_ALERT,
      userRole: req?.user?.role_id || req?.user?.role || 'SYSTEM',
      entityType: ENTITY_TYPES.SYSTEM,
      details: `${eventType}: ${details}`,
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.get('User-Agent') || null,
      sessionId: req?.session?.id || null,
      status
    });
  } catch (error) {
    console.error('Security event logging failed:', error);
  }
};

/**
 * Log rate limiting events
 */
export const logRateLimit = async (req, res) => {
  try {
    await auditLogger({
      userId: req.user?.email || req.user?.userId || req.ip,
      action: AUDIT_ACTIONS.RATE_LIMIT_EXCEEDED,
      userRole: req.user?.role_id || req.user?.role || 'UNKNOWN',
      entityType: ENTITY_TYPES.SYSTEM,
      details: `Rate limit exceeded for ${req.method} ${req.path}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id,
      status: AUDIT_STATUS.WARNING
    });
  } catch (error) {
    console.error('Rate limit logging failed:', error);
  }
};

/**
 * Log suspicious activities
 */
export const logSuspiciousActivity = async (activity, details, req = null, userId = null) => {
  try {
    await auditLogger({
      userId: userId || req?.user?.email || req?.user?.userId || req?.ip || 'unknown',
      action: AUDIT_ACTIONS.SUSPICIOUS_ACTIVITY,
      userRole: req?.user?.role_id || req?.user?.role || 'UNKNOWN',
      entityType: ENTITY_TYPES.SYSTEM,
      details: `${activity}: ${details}`,
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.get('User-Agent') || null,
      sessionId: req?.session?.id || null,
      status: AUDIT_STATUS.WARNING
    });
  } catch (error) {
    console.error('Suspicious activity logging failed:', error);
  }
};

/**
 * Log access denied events
 */
export const logAccessDenied = async (resource, reason, req) => {
  try {
    await auditLogger({
      userId: req.user?.email || req.user?.userId || req.ip,
      action: AUDIT_ACTIONS.ACCESS_DENIED,
      userRole: req.user?.role_id || req.user?.role || 'UNKNOWN',
      entityType: ENTITY_TYPES.SYSTEM,
      details: `Access denied to ${resource}: ${reason}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id,
      status: AUDIT_STATUS.FAILURE
    });
  } catch (error) {
    console.error('Access denied logging failed:', error);
  }
};

/**
 * Log session events
 */
export const logSessionEvent = async (eventType, req, userId = null, details = null) => {
  try {
    const sessionDetails = details || `${eventType} session`;
    if (req?.session?.id) {
      sessionDetails += ` (Session: ${req.session.id})`;
    }

    await auditLogger({
      userId: userId || req?.user?.email || req?.user?.userId || req?.ip || 'unknown',
      action: eventType,
      userRole: req?.user?.role_id || req?.user?.role || 'UNKNOWN',
      entityType: ENTITY_TYPES.SESSION,
      entityId: req?.session?.id || null,
      details: sessionDetails,
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.get('User-Agent') || null,
      sessionId: req?.session?.id || null,
      status: AUDIT_STATUS.SUCCESS
    });
  } catch (error) {
    console.error('Session event logging failed:', error);
  }
};

/**
 * Log file operations
 */
export const logFileOperation = async (operation, filePath, details, req) => {
  try {
    await auditLogger({
      userId: req.user?.email || req.user?.userId,
      action: operation,
      userRole: req.user?.role_id || req.user?.role,
      entityType: ENTITY_TYPES.DOCUMENT,
      details: `${operation}: ${filePath} - ${details}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id,
      status: AUDIT_STATUS.SUCCESS
    });
  } catch (error) {
    console.error('File operation logging failed:', error);
  }
};

/**
 * Log bulk operations
 */
export const logBulkOperation = async (operation, count, details, req) => {
  try {
    await auditLogger({
      userId: req.user?.email || req.user?.userId,
      action: AUDIT_ACTIONS.BULK_OPERATION,
      userRole: req.user?.role_id || req.user?.role,
      entityType: ENTITY_TYPES.SYSTEM,
      details: `${operation}: ${count} items - ${details}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId: req.session?.id,
      status: AUDIT_STATUS.SUCCESS
    });
  } catch (error) {
    console.error('Bulk operation logging failed:', error);
  }
};