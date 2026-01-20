import { createContext, useContext, useEffect, useState } from "react";
import { notificationService } from "@/services/api";
import { socket } from "@/services/socket";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await notificationService.getNotifications();
            if (res?.success) {
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.is_read).length);
            }
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Listen for real-time notifications
            socket.on("NEW_NOTIFICATION", (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Push notification Toast if suitable
                toast(notification.title, {
                    description: notification.message,
                    action: {
                        label: "View",
                        onClick: () => {
                            // Navigation logic can be handled in the notification component
                        },
                    },
                });
            });

            return () => {
                socket.off("NEW_NOTIFICATION");
            };
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const dismiss = async (id) => {
        try {
            await notificationService.dismiss(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Recalculate unread if necessary (or decrement if the dismissed one was unread)
            setUnreadCount(prev => {
                const dismissed = notifications.find(n => n.id === id);
                return (dismissed && !dismissed.is_read) ? Math.max(0, prev - 1) : prev;
            });
        } catch (err) {
            console.error("Failed to dismiss notification:", err);
        }
    };

    const dismissAll = async () => {
        try {
            await notificationService.dismissAll();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to dismiss all notifications:", err);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                dismiss,
                dismissAll,
                fetchNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
