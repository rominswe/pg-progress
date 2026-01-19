import { notifications } from "../config/config.js";
import { getIO } from "../server.js";

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

        return notification;
    }

    async getUserNotifications(userId) {
        return notifications.findAll({
            where: { user_id: userId },
            order: [["created_at", "DESC"]],
            limit: 50
        });
    }

    async getUnreadCount(userId) {
        return notifications.count({
            where: { user_id: userId, is_read: false }
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
            { where: { user_id: userId, is_read: false } }
        );
    }
}

export default new NotificationService();
