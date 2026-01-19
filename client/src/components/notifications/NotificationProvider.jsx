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
        // Backend doesn't have a specific markAllAsRead yet, 
        // but we can loop or just update frontend state if preferred.
        // For now, let's just update local state if we don't want to loop.
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                fetchNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
