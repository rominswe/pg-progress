import { notifications, master_stu, supervisor, examiner, cgs, visiting_staff } from "../config/config.js";
import { sendEmail } from "./email.js";

/* ================= NOTIFICATION TYPES ================= */
export const NOTIFICATION_TYPES = {
  DEADLINE_REMINDER: 'DEADLINE_REMINDER',
  SUPERVISOR_COMMENT: 'SUPERVISOR_COMMENT',
  EXAM_SCHEDULE: 'EXAM_SCHEDULE',
  DOCUMENT_REVIEW: 'DOCUMENT_REVIEW',
  PROGRESS_UPDATE: 'PROGRESS_UPDATE',
  VERIFICATION_REMINDER: 'VERIFICATION_REMINDER',
  ACCOUNT_VERIFICATION: 'ACCOUNT_VERIFICATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
  SYSTEM_ALERT: 'SYSTEM_ALERT',
  MEETING_REMINDER: 'MEETING_REMINDER'
};

/* ================= NOTIFICATION PRIORITIES ================= */
export const NOTIFICATION_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
};

/* ================= USER MODEL MAPPER ================= */
const USER_MODEL_MAP = {
  STU: master_stu,
  SUV: supervisor,
  EXA: examiner,
  CGSADM: cgs,
  EXCGS: cgs,
  HRD: cgs,
  SCID: cgs,
  SBSSD: cgs,
  SEHSD: cgs,
  CFGSD: cgs,
  CFLD: cgs,
  EXEC: cgs,
  EXEB: cgs,
  EXES: cgs,
  SAD: cgs,
  ISU: cgs,
  SGH: cgs
};

/* ================= NOTIFICATION TEMPLATES ================= */
const NOTIFICATION_TEMPLATES = {
  [NOTIFICATION_TYPES.DEADLINE_REMINDER]: {
    title: 'Submission Deadline Reminder',
    emailSubject: 'Upcoming Submission Deadline',
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  [NOTIFICATION_TYPES.SUPERVISOR_COMMENT]: {
    title: 'New Supervisor Comment',
    emailSubject: 'Supervisor Feedback Received',
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  },
  [NOTIFICATION_TYPES.EXAM_SCHEDULE]: {
    title: 'Exam Schedule Update',
    emailSubject: 'Exam Schedule Information',
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  [NOTIFICATION_TYPES.DOCUMENT_REVIEW]: {
    title: 'Document Review Complete',
    emailSubject: 'Document Review Results',
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  },
  [NOTIFICATION_TYPES.PROGRESS_UPDATE]: {
    title: 'Progress Status Update',
    emailSubject: 'Progress Status Changed',
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  },
  [NOTIFICATION_TYPES.VERIFICATION_REMINDER]: {
    title: 'Account Verification Required',
    emailSubject: 'Please Verify Your Account',
    priority: NOTIFICATION_PRIORITIES.URGENT
  },
  [NOTIFICATION_TYPES.ACCOUNT_VERIFICATION]: {
    title: 'Account Verification',
    emailSubject: 'Verify Your Account',
    priority: NOTIFICATION_PRIORITIES.URGENT
  },
  [NOTIFICATION_TYPES.PASSWORD_RESET]: {
    title: 'Password Reset',
    emailSubject: 'Password Reset Request',
    priority: NOTIFICATION_PRIORITIES.HIGH
  },
  [NOTIFICATION_TYPES.SYSTEM_ALERT]: {
    title: 'System Alert',
    emailSubject: 'System Notification',
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  },
  [NOTIFICATION_TYPES.MEETING_REMINDER]: {
    title: 'Meeting Reminder',
    emailSubject: 'Upcoming Meeting',
    priority: NOTIFICATION_PRIORITIES.MEDIUM
  }
};

/* ================= NOTIFICATION PREFERENCES ================= */
const NOTIFICATION_PREFERENCES = {
  // Default preferences - can be made configurable per user later
  [NOTIFICATION_TYPES.DEADLINE_REMINDER]: { email: true, inApp: true },
  [NOTIFICATION_TYPES.SUPERVISOR_COMMENT]: { email: true, inApp: true },
  [NOTIFICATION_TYPES.EXAM_SCHEDULE]: { email: true, inApp: true },
  [NOTIFICATION_TYPES.DOCUMENT_REVIEW]: { email: false, inApp: true },
  [NOTIFICATION_TYPES.PROGRESS_UPDATE]: { email: false, inApp: true },
  [NOTIFICATION_TYPES.VERIFICATION_REMINDER]: { email: true, inApp: true },
  [NOTIFICATION_TYPES.ACCOUNT_VERIFICATION]: { email: true, inApp: false },
  [NOTIFICATION_TYPES.PASSWORD_RESET]: { email: true, inApp: false },
  [NOTIFICATION_TYPES.SYSTEM_ALERT]: { email: true, inApp: true },
  [NOTIFICATION_TYPES.MEETING_REMINDER]: { email: true, inApp: true }
};

/**
 * Create and send a notification
 * @param {Object} params - Notification parameters
 * @param {string} params.recipientId - User ID to receive notification
 * @param {string} params.recipientRole - User role
 * @param {string} params.type - Notification type
 * @param {string} params.title - Notification title (optional, uses template)
 * @param {string} params.message - Notification message
 * @param {string} params.senderId - Sender user ID (optional)
 * @param {string} params.senderRole - Sender role (optional)
 * @param {Object} params.relatedEntity - Related entity info (optional)
 * @param {string} params.actionUrl - Action URL (optional)
 * @param {Date} params.expiresAt - Expiration date (optional)
 * @param {boolean} params.forceEmail - Force email sending regardless of preferences
 */
export const createNotification = async (params) => {
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
      forceEmail = false
    } = params;

    // Get user to check verification status
    const UserModel = USER_MODEL_MAP[recipientRole];
    if (!UserModel) {
      throw new Error(`Invalid recipient role: ${recipientRole}`);
    }

    const user = await UserModel.findByPk(recipientId);
    if (!user) {
      throw new Error(`User not found: ${recipientId}`);
    }

    // Check if user is verified (skip verification notifications)
    if (type !== NOTIFICATION_TYPES.ACCOUNT_VERIFICATION &&
        type !== NOTIFICATION_TYPES.VERIFICATION_REMINDER &&
        user.IsVerified !== 1 && user.IsVerified !== true) {
      console.log(`Skipping notification for unverified user: ${recipientId}`);
      return null;
    }

    // Get template
    const template = NOTIFICATION_TEMPLATES[type];
    if (!template) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    // Create notification
    const notification = await notifications.create({
      recipient_id: recipientId,
      recipient_role: recipientRole,
      sender_id: senderId || null,
      sender_role: senderRole || null,
      notification_type: type,
      title: title || template.title,
      message: message,
      priority: template.priority,
      related_entity_type: relatedEntity?.type || null,
      related_entity_id: relatedEntity?.id || null,
      action_url: actionUrl || null,
      expires_at: expiresAt || null
    });

    // Send email if enabled
    const preferences = NOTIFICATION_PREFERENCES[type];
    if ((preferences.email || forceEmail) && user.EmailId) {
      try {
        await sendNotificationEmail(user, {
          subject: template.emailSubject,
          title: title || template.title,
          message: message,
          actionUrl: actionUrl,
          type: type
        });

        // Update notification with email sent status
        await notification.update({
          email_sent: true,
          email_sent_at: new Date()
        });

      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        // Don't fail the notification creation if email fails
      }
    }

    return notification;

  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

/**
 * Send notification email
 */
const sendNotificationEmail = async (user, notificationData) => {
  const { subject, title, message, actionUrl, type } = notificationData;

  // Determine frontend URL based on role
  let frontendUrl;
  switch (user.role_id || user.constructor.tableName) {
    case "cgs":
    case "CGSADM":
    case "EXCGS":
      frontendUrl = process.env.FRONTEND_ADMIN_URL || "http://localhost:5174";
      break;
    default:
      frontendUrl = process.env.FRONTEND_USER_URL || "http://localhost:5173";
  }

  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${title}</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        ${message.replace(/\n/g, '<br>')}
      </div>
  `;

  if (actionUrl) {
    const fullUrl = actionUrl.startsWith('http') ? actionUrl : `${frontendUrl}${actionUrl}`;
    htmlContent += `
      <div style="text-align: center; margin: 20px 0;">
        <a href="${fullUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Details
        </a>
      </div>
    `;
  }

  htmlContent += `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
        <p>This is an automated notification from the PG Progress System.</p>
        <p>If you have any questions, please contact your supervisor or administrator.</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: user.EmailId,
    subject: subject,
    html: htmlContent
  });
};

/**
 * Get user notifications
 */
export const getUserNotifications = async (userId, userRole, options = {}) => {
  try {
    const { status = 'UNREAD', limit = 50, offset = 0 } = options;

    const whereClause = {
      recipient_id: userId,
      recipient_role: userRole
    };

    if (status !== 'ALL') {
      whereClause.status = status;
    }

    const userNotifications = await notifications.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    // Get total count
    const totalCount = await notifications.count({
      where: whereClause
    });

    return {
      notifications: userNotifications,
      total: totalCount,
      limit,
      offset
    };

  } catch (error) {
    console.error('Get user notifications error:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (notificationId, userId, userRole) => {
  try {
    const notification = await notifications.findOne({
      where: {
        notification_id: notificationId,
        recipient_id: userId,
        recipient_role: userRole
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({ status: 'READ' });

    return notification;

  } catch (error) {
    console.error('Mark notification read error:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (userId, userRole) => {
  try {
    const result = await notifications.update(
      { status: 'READ' },
      {
        where: {
          recipient_id: userId,
          recipient_role: userRole,
          status: 'UNREAD'
        }
      }
    );

    return result[0]; // Number of affected rows

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    throw error;
  }
};

/**
 * Archive notification
 */
export const archiveNotification = async (notificationId, userId, userRole) => {
  try {
    const notification = await notifications.findOne({
      where: {
        notification_id: notificationId,
        recipient_id: userId,
        recipient_role: userRole
      }
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await notification.update({ status: 'ARCHIVED' });

    return notification;

  } catch (error) {
    console.error('Archive notification error:', error);
    throw error;
  }
};

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (recipients, notificationData) => {
  try {
    const results = [];

    for (const recipient of recipients) {
      try {
        const notification = await createNotification({
          ...notificationData,
          recipientId: recipient.id,
          recipientRole: recipient.role
        });
        results.push({ success: true, recipient: recipient.id, notification });
      } catch (error) {
        console.error(`Failed to send notification to ${recipient.id}:`, error);
        results.push({ success: false, recipient: recipient.id, error: error.message });
      }
    }

    return results;

  } catch (error) {
    console.error('Send bulk notifications error:', error);
    throw error;
  }
};

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = async () => {
  try {
    const result = await notifications.destroy({
      where: {
        expires_at: {
          [notifications.sequelize.Op.lt]: new Date()
        }
      }
    });

    console.log(`Cleaned up ${result} expired notifications`);
    return result;

  } catch (error) {
    console.error('Cleanup expired notifications error:', error);
    throw error;
  }
};

/**
 * Get notification statistics
 */
export const getNotificationStats = async (userId, userRole) => {
  try {
    const stats = await notifications.findAll({
      where: {
        recipient_id: userId,
        recipient_role: userRole
      },
      attributes: [
        'status',
        [notifications.sequelize.fn('COUNT', notifications.sequelize.col('notification_id')), 'count']
      ],
      group: ['status']
    });

    const result = {
      total: 0,
      unread: 0,
      read: 0,
      archived: 0
    };

    stats.forEach(stat => {
      const count = parseInt(stat.dataValues.count);
      result.total += count;

      switch (stat.status) {
        case 'UNREAD':
          result.unread = count;
          break;
        case 'READ':
          result.read = count;
          break;
        case 'ARCHIVED':
          result.archived = count;
          break;
      }
    });

    return result;

  } catch (error) {
    console.error('Get notification stats error:', error);
    throw error;
  }
};