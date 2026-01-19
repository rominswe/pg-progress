import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import notificationService from "../services/notificationService.js";

const router = express.Router();

// Get all notifications for current user
router.get("/", protect, async (req, res, next) => {
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
router.put("/:id/read", protect, async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        await notificationService.markAsRead(req.params.id, userId);
        res.json({ success: true, message: "Notification marked as read" });
    } catch (err) {
        next(err);
    }
});

// Mark all as read
router.put("/read-all", protect, async (req, res, next) => {
    try {
        const userId = req.session.user.id;
        await notificationService.markAllAsRead(userId);
        res.json({ success: true, message: "All notifications marked as read" });
    } catch (err) {
        next(err);
    }
});

export default router;
