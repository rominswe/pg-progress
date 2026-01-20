import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import notificationService from "../services/notificationService.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// Get all notifications for current user
router.get("/", protect, requireRole("STU", "SUV", "EXA", "CGSADM", "CGSS"), async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        const notifications = await notificationService.getUserNotifications(userId);
        const unreadCount = await notificationService.getUnreadCount(userId);

        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (err) {
        next(err);
    }
});

// Mark a single notification as read
router.put("/:id/read", protect, requireRole("STU", "SUV", "EXA", "CGSADM", "CGSS"), async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        await notificationService.markAsRead(req.params.id, userId);
        res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
        next(err);
    }
});

// Mark all as read
router.put("/read-all", protect, requireRole("STU", "SUV", "EXA", "CGSADM", "CGSS"), async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        await notificationService.markAllAsRead(userId);
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        next(err);
    }
});

// Dismiss a single notification (Hide from UI)
router.delete("/:id", protect, requireRole("STU", "SUV", "EXA", "CGSADM", "CGSS"), async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        await notificationService.dismiss(req.params.id, userId);
        res.json({ success: true, message: "Notification dismissed" });
    } catch (err) {
        next(err);
    }
});

// Dismiss all notifications
router.delete("/all", protect, requireRole("STU", "SUV", "EXA", "CGSADM", "CGSS"), async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        await notificationService.dismissAll(userId);
        res.json({ success: true, message: "All notifications dismissed" });
    } catch (err) {
        next(err);
    }
});

// Send custom notification (Staff -> Student)
router.post("/send", protect, requireRole("CGSADM", "CGSS"), async (req, res, next) => {
    try {
        const { userId, roleId, title, message, type, link } = req.body;
        if (!userId || !title || !message) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        const notification = await notificationService.createNotification({
            userId,
            roleId: roleId || 'STU',
            title,
            message,
            type: type || 'SYSTEM_ALERT',
            link: link || null
        });
        res.json({ success: true, data: notification });
    } catch (err) {
        next(err);
    }
});

export default router;
