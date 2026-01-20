import { notifications, pgstudinfo, pgstaffinfo } from "../config/config.js";
import { getIO } from "../server.js";
import emailService from "./emailService.js";

class NotificationService {
    /**
     * Create a notification and broadcast it via socket
     */
    async createNotification({ userId, roleId, title, message, type, link }) {
        const notification = await notifications.create({
            user_id: userId,
            role_id: roleId,
            title,
            message,
            type,
            link,
            is_read: false
        });

        // Broadcast to user's private room
        const io = getIO();
        if (io) {
            io.to(`user:${userId}`).emit("NEW_NOTIFICATION", notification);
        }

        // --- Automatic Email Sending ---
        // We trigger emails for high-importance administrative actions or custom notices
        const criticalTypes = ['SYSTEM_ALERT', 'ADMIN_ALERT', 'DEADLINE_ADJUSTED', 'MILESTONE_COMPLETED', 'EVALUATION_SUBMITTED'];

        if (criticalTypes.includes(type)) {
            try {
                // Fetch user email if not provided (userId is pgstud_id or pgstaff_id)
                let user;
                if (roleId === 'STU') {
                    user = await pgstudinfo.findByPk(userId);
                } else {
                    user = await pgstaffinfo.findByPk(userId);
                }

                if (user && user.EmailId) {
                    await emailService.sendAdministrativeNotice(user, title, message);
                }
            } catch (err) {
                console.error("Failed to send automatic email notification:", err);
                // We don't throw here to avoid failing the in-app notification creation
            }
        }

        return notification;
    }

    async getUserNotifications(userId) {
        return notifications.findAll({
            where: { user_id: userId, is_dismissed: false },
            order: [["created_at", "DESC"]],
            limit: 50
        });
    }

    async getUnreadCount(userId) {
        return notifications.count({
            where: { user_id: userId, is_read: false, is_dismissed: false }
        });
    }

    async markAsRead(id, userId) {
        return notifications.update(
            { is_read: true },
            { where: { id, user_id: userId } }
        );
    }

    async markAllAsRead(userId) {
        return notifications.update(
            { is_read: true },
            { where: { user_id: userId, is_read: false, is_dismissed: false } }
        );
    }

    async dismiss(id, userId) {
        return notifications.update(
            { is_dismissed: true, is_read: true }, // Dismissing also implies read
            { where: { id, user_id: userId } }
        );
    }

    async dismissAll(userId) {
        return notifications.update(
            { is_dismissed: true, is_read: true },
            { where: { user_id: userId, is_dismissed: false } }
        );
    }
}

export default new NotificationService();
