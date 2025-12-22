import express from 'express';
import {
  getNotifications,
  getNotificationStatsController,
  markAsRead,
  markAllAsRead,
  archiveNotificationController,
  createNotificationController,
  sendBulkNotificationsController,
  getNotificationTypes
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';
import {
  validateNotificationCreate,
  validateUserId,
  validatePagination
} from '../utils/validation.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect());

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notifications, alerts, and communication management
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve notifications for the authenticated user with pagination and filtering options.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of notifications per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unread, read, archived]
 *         description: Filter by notification status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [system, academic, deadline, review, approval, general]
 *         description: Filter by notification type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by notification priority
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       notification_id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Document Review Required
 *                       message:
 *                         type: string
 *                         example: Your thesis proposal has been submitted and requires review.
 *                       type:
 *                         type: string
 *                         enum: [system, academic, deadline, review, approval, general]
 *                         example: review
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high, urgent]
 *                         example: high
 *                       status:
 *                         type: string
 *                         enum: [unread, read, archived]
 *                         example: unread
 *                       related_id:
 *                         type: integer
 *                         nullable: true
 *                         description: ID of related entity (document, progress, etc.)
 *                         example: 123
 *                       related_type:
 *                         type: string
 *                         nullable: true
 *                         enum: [document, progress, meeting, user]
 *                         example: document
 *                       action_url:
 *                         type: string
 *                         nullable: true
 *                         example: /documents/123
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-01-15T10:30:00Z
 *                       read_at:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         example: 2024-01-15T10:45:00Z
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/notifications/stats:
 *   get:
 *     summary: Get notification statistics
 *     description: Retrieve notification statistics for the authenticated user including counts by status and type.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Notification statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 45
 *                     unread:
 *                       type: integer
 *                       example: 12
 *                     read:
 *                       type: integer
 *                       example: 30
 *                     archived:
 *                       type: integer
 *                       example: 3
 *                     by_type:
 *                       type: object
 *                       properties:
 *                         system:
 *                           type: integer
 *                           example: 5
 *                         academic:
 *                           type: integer
 *                           example: 15
 *                         deadline:
 *                           type: integer
 *                           example: 8
 *                         review:
 *                           type: integer
 *                           example: 10
 *                         approval:
 *                           type: integer
 *                           example: 4
 *                         general:
 *                           type: integer
 *                           example: 3
 *                     by_priority:
 *                       type: object
 *                       properties:
 *                         low:
 *                           type: integer
 *                           example: 10
 *                         medium:
 *                           type: integer
 *                           example: 20
 *                         high:
 *                           type: integer
 *                           example: 12
 *                         urgent:
 *                           type: integer
 *                           example: 3
 *                     recent_activity:
 *                       type: object
 *                       properties:
 *                         last_24h:
 *                           type: integer
 *                           example: 5
 *                         last_7d:
 *                           type: integer
 *                           example: 18
 *                         last_30d:
 *                           type: integer
 *                           example: 42
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/notifications/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     notification_id:
 *                       type: integer
 *                       example: 1
 *                     read_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:45:00Z
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to access this notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Mark all unread notifications as read for the authenticated user.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: All notifications marked as read
 *                 data:
 *                   type: object
 *                   properties:
 *                     marked_read:
 *                       type: integer
 *                       example: 12
 *                     total_read:
 *                       type: integer
 *                       example: 42
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/notifications/{notificationId}/archive:
 *   put:
 *     summary: Archive notification
 *     description: Archive a notification for the authenticated user. Archived notifications are hidden from the main list but can be viewed separately.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Notification archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Notification archived successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Not authorized to access this notification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Notification not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/notifications:
 *   post:
 *     summary: Create notification
 *     description: Create a new notification. Requires MANAGE_SYSTEM permission (admin/staff only).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_id
 *               - title
 *               - message
 *               - type
 *             properties:
 *               recipient_id:
 *                 type: integer
 *                 description: User ID of the notification recipient
 *                 example: 12345
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Notification title
 *                 example: Document Review Required
 *               message:
 *                 type: string
 *                 description: Notification message content
 *                 example: Your thesis proposal has been submitted and requires review by your supervisor.
 *               type:
 *                 type: string
 *                 enum: [system, academic, deadline, review, approval, general]
 *                 description: Notification type
 *                 example: review
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 description: Notification priority
 *                 example: high
 *               related_id:
 *                 type: integer
 *                 description: ID of related entity (document, progress, etc.)
 *                 example: 456
 *               related_type:
 *                 type: string
 *                 enum: [document, progress, meeting, user]
 *                 description: Type of related entity
 *                 example: document
 *               action_url:
 *                 type: string
 *                 description: URL for notification action
 *                 example: /documents/456
 *               send_email:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to send email notification
 *                 example: true
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     notification_id:
 *                       type: integer
 *                       example: 1
 *                     recipient_id:
 *                       type: integer
 *                       example: 12345
 *                     title:
 *                       type: string
 *                       example: Document Review Required
 *                     type:
 *                       type: string
 *                       example: review
 *                     priority:
 *                       type: string
 *                       example: high
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: 2024-01-15T10:30:00Z
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/notifications/bulk:
 *   post:
 *     summary: Send bulk notifications
 *     description: Send notifications to multiple recipients. Requires MANAGE_SYSTEM permission (admin/staff only).
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient_ids
 *               - title
 *               - message
 *               - type
 *             properties:
 *               recipient_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 maxItems: 1000
 *                 description: Array of user IDs to receive the notification
 *                 example: [12345, 12346, 12347]
 *               title:
 *                 type: string
 *                 maxLength: 255
 *                 description: Notification title
 *                 example: System Maintenance Notice
 *               message:
 *                 type: string
 *                 description: Notification message content
 *                 example: The system will undergo maintenance on Sunday from 2-4 AM. Some services may be unavailable during this time.
 *               type:
 *                 type: string
 *                 enum: [system, academic, deadline, review, approval, general]
 *                 description: Notification type
 *                 example: system
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *                 description: Notification priority
 *                 example: medium
 *               related_id:
 *                 type: integer
 *                 description: ID of related entity (optional)
 *                 example: 789
 *               related_type:
 *                 type: string
 *                 enum: [document, progress, meeting, user]
 *                 description: Type of related entity (optional)
 *                 example: system
 *               action_url:
 *                 type: string
 *                 description: URL for notification action (optional)
 *                 example: /maintenance
 *               send_email:
 *                 type: boolean
 *                 default: true
 *                 description: Whether to send email notifications
 *                 example: true
 *     responses:
 *       200:
 *         description: Bulk notifications sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bulk notifications sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_recipients:
 *                       type: integer
 *                       example: 150
 *                     notifications_created:
 *                       type: integer
 *                       example: 150
 *                     emails_sent:
 *                       type: integer
 *                       example: 150
 *       400:
 *         description: Validation error or too many recipients
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/v1/notifications/types:
 *   get:
 *     summary: Get notification types
 *     description: Retrieve available notification types, priorities, and their configurations.
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Notification types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     types:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             enum: [system, academic, deadline, review, approval, general]
 *                             example: system
 *                           label:
 *                             type: string
 *                             example: System Notification
 *                           description:
 *                             type: string
 *                             example: System maintenance, updates, and technical notifications
 *                           default_priority:
 *                             type: string
 *                             enum: [low, medium, high, urgent]
 *                             example: medium
 *                     priorities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: string
 *                             enum: [low, medium, high, urgent]
 *                             example: high
 *                           label:
 *                             type: string
 *                             example: High Priority
 *                           color:
 *                             type: string
 *                             example: orange
 *                           description:
 *                             type: string
 *                             example: Requires attention within 24 hours
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get('/', validatePagination, getNotifications);
router.get('/stats', getNotificationStatsController);
router.put('/:notificationId/read', validateUserId, markAsRead);
router.put('/read-all', markAllAsRead);
router.put('/:notificationId/archive', validateUserId, archiveNotificationController);
router.post('/', validateNotificationCreate, requirePermission(PERMISSIONS.MANAGE_SYSTEM), createNotificationController);
router.post('/bulk', validateNotificationCreate, requirePermission(PERMISSIONS.MANAGE_SYSTEM), sendBulkNotificationsController);
router.get('/types', getNotificationTypes);

export default router;