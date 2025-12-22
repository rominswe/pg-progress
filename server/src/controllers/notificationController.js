import {
  createNotification,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  archiveNotification,
  getNotificationStats,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES
} from "../utils/notifications.js";
import { auditLog } from "../utils/audit.js";

/**
 * Get user notifications
 */
export const getNotifications = async (req, res) => {
  try {
    const { status = 'UNREAD', limit = 50, offset = 0 } = req.query;
    const { userId, role } = req.user;

    const result = await getUserNotifications(userId, role, {
      status: status.toUpperCase(),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: error.message
    });
  }
};

/**
 * Get notification statistics
 */
export const getNotificationStatsController = async (req, res) => {
  try {
    const { userId, role } = req.user;

    const stats = await getNotificationStats(userId, role);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification statistics',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, role } = req.user;

    const notification = await markNotificationRead(notificationId, userId, role);

    // Audit log
    await auditLog({
      userId,
      action: 'NOTIFICATION_READ',
      entityType: 'NOTIFICATION',
      entityId: notificationId,
      details: `Marked notification as read: ${notification.title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req, res) => {
  try {
    const { userId, role } = req.user;

    const count = await markAllNotificationsRead(userId, role);

    // Audit log
    await auditLog({
      userId,
      action: 'NOTIFICATION_BULK_READ',
      entityType: 'NOTIFICATION',
      entityId: null,
      details: `Marked ${count} notifications as read`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `${count} notifications marked as read`
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

/**
 * Archive notification
 */
export const archiveNotificationController = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, role } = req.user;

    const notification = await archiveNotification(notificationId, userId, role);

    // Audit log
    await auditLog({
      userId,
      action: 'NOTIFICATION_ARCHIVED',
      entityType: 'NOTIFICATION',
      entityId: notificationId,
      details: `Archived notification: ${notification.title}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Notification archived successfully',
      data: notification
    });

  } catch (error) {
    console.error('Archive notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive notification',
      error: error.message
    });
  }
};

/**
 * Create notification (admin/internal use)
 */
export const createNotificationController = async (req, res) => {
  try {
    const {
      recipientId,
      recipientRole,
      type,
      title,
      message,
      senderId,
      senderRole,
      relatedEntity,
      actionUrl,
      expiresAt,
      forceEmail
    } = req.body;

    const { userId, role } = req.user;

    // Validate notification type
    if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }

    const notification = await createNotification({
      recipientId,
      recipientRole,
      type,
      title,
      message,
      senderId: senderId || userId,
      senderRole: senderRole || role,
      relatedEntity,
      actionUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      forceEmail
    });

    // Audit log
    await auditLog({
      userId,
      action: 'NOTIFICATION_CREATED',
      entityType: 'NOTIFICATION',
      entityId: notification.notification_id,
      details: `Created notification: ${notification.title} for user ${recipientId}`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

/**
 * Send bulk notifications (admin use)
 */
export const sendBulkNotificationsController = async (req, res) => {
  try {
    const { recipients, notificationData } = req.body;
    const { userId, role } = req.user;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Recipients array is required and cannot be empty'
      });
    }

    const { sendBulkNotifications } = await import("../utils/notifications.js");
    const results = await sendBulkNotifications(recipients, notificationData);

    // Audit log
    await auditLog({
      userId,
      action: 'NOTIFICATION_BULK_SEND',
      entityType: 'NOTIFICATION',
      entityId: null,
      details: `Sent bulk notifications to ${recipients.length} recipients`,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Bulk notifications sent',
      data: {
        total: recipients.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
      }
    });

  } catch (error) {
    console.error('Send bulk notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications',
      error: error.message
    });
  }
};

/**
 * Get notification types and priorities (reference data)
 */
export const getNotificationTypes = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        types: NOTIFICATION_TYPES,
        priorities: NOTIFICATION_PRIORITIES
      }
    });

  } catch (error) {
    console.error('Get notification types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notification types',
      error: error.message
    });
  }
};