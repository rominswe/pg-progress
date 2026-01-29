// src/components/shared/Layout.jsx
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Bell, Menu, X, ChevronDown, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { useAuth } from '../../components/auth/AuthContext';
import { useNotifications } from '../../components/notifications/NotificationProvider';
import { API_BASE_URL } from '../../services/api';
import { extendSessionMeta, getSessionMeta, refreshSessionActivity, clearSessionMeta } from '../../lib/sessionTimeout';
import { toast } from 'sonner';

const SESSION_REMINDER_OFFSET = 15 * 60 * 1000;
const INACTIVITY_LIMIT = 15 * 60 * 1000;

/**
 * Props:
 * - navigation: Array<{ name, href, icon }>
 * - title: string (Portal title)
 * - logoIcon: React component for logo
 * - notifications: Array<{ id, label, link }> (optional)
 * - profileLinks: Array<{ label, action, destructive? }> (optional)
 */

/* ================= MODAL COMPONENT ================= */
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <LogOut className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Confirm Logout</h3>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to log out of the PG Progress Portal?
        </p>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ================= MAIN LAYOUT ================= */
export default function Layout({
  navigation,
  title,
  logoIcon: LogoIcon,
  notifications: notificationsProp = [],
  profileLinks: profileLinksProp = [],
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, dismiss, dismissAll } = useNotifications();
  const navigate = useNavigate();
  const [metaUpdateKey, setMetaUpdateKey] = useState(0);
  const [isSessionReminderVisible, setSessionReminderVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setMetaUpdateKey((prev) => prev + 1);
    } else {
      setSessionReminderVisible(false);
    }
  }, [user]);

  const sessionMeta = useMemo(() => getSessionMeta(), [metaUpdateKey]);
  const canExtendSession = sessionMeta ? sessionMeta.expiresAt < sessionMeta.maxExpiresAt : false;
  const minutesRemaining = sessionMeta ? Math.ceil(Math.max(sessionMeta.expiresAt - Date.now(), 0) / 60000) : 0;

  const handleExtendSession = () => {
    extendSessionMeta();
    setMetaUpdateKey((prev) => prev + 1);
    setSessionReminderVisible(false);
  };

  const handleForcedLogout = () => {
    setSessionReminderVisible(false);
    clearSessionMeta();
    logout();
  };

  const handleNotificationClick = async (n) => {
    try {
      await markAsRead(n.id);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleDismissAll = async () => {
    if (!notifications.length) return;
    try {
      await dismissAll();
      toast.success("All notifications dismissed.");
    } catch (err) {
      console.error("Failed to dismiss all notifications:", err);
      toast.error("Failed to dismiss notifications.");
    }
  };

  useEffect(() => {
    if (!user) return;
    const meta = getSessionMeta();
    if (!meta) return;

    const now = Date.now();
    const reminderDelay = Math.max(meta.expiresAt - now - SESSION_REMINDER_OFFSET, 0);
    const logoutDelay = Math.max(meta.expiresAt - now, 0);

    const reminderTimer = setTimeout(() => setSessionReminderVisible(true), reminderDelay);
    const logoutTimer = setTimeout(() => handleForcedLogout(), logoutDelay);

    return () => {
      clearTimeout(reminderTimer);
      clearTimeout(logoutTimer);
    };
  }, [user, metaUpdateKey, logout]);

  useEffect(() => {
    if (!user) return;
    let inactivityTimer;
    const resetInactivity = () => {
      refreshSessionActivity();
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => handleForcedLogout(), INACTIVITY_LIMIT);
    };

    const activityEvents = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    activityEvents.forEach((event) => window.addEventListener(event, resetInactivity));
    resetInactivity();

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetInactivity));
      clearTimeout(inactivityTimer);
    };
  }, [user, logout]);

  const handleLogoutConfirm = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const profileLinks = profileLinksProp.length
    ? profileLinksProp.map(link => link.destructive ? { ...link, action: () => setIsLogoutModalOpen(true) } : link)
    : [
      {
        label: 'Profile Settings',
        action: () => navigate('profile'),
      },
      {
        label: 'Logout',
        action: () => setIsLogoutModalOpen(true),
        destructive: true,
      },
    ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Modal at the top level */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-slate-200 text-slate-700 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
                {LogoIcon && <LogoIcon className="h-5 w-5 text-white" />}
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">{title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 translate-x-1'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-slate-100 p-4">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white px-4 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="hidden lg:block text-lg font-semibold text-foreground">{title}</h1>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                  <Bell className="h-5 w-5 group-hover:text-blue-600 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl border-slate-100 shadow-2xl bg-white">
                <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
                  {notifications.length > 0 && (
                    <DropdownMenuItem className="px-0 py-0">
                      <button
                        type="button"
                        onClick={handleDismissAll}
                        className="w-full text-left px-4 py-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Dismiss All
                      </button>
                    </DropdownMenuItem>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={cn(
                          "flex flex-col items-start gap-1 p-4 cursor-pointer hover:bg-slate-50 border-b border-slate-50 last:border-0 focus:bg-blue-50/50 group/item",
                          !n.is_read && "bg-blue-50/10"
                        )}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={cn("text-sm font-bold", n.is_read ? "text-slate-700" : "text-blue-700")}>
                            {n.title}
                          </span>
                          <div className="flex items-center gap-2">
                            {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-600" />}
                            <button
                              type="button"
                              aria-label="Dismiss notification"
                              onClick={(e) => {
                                e.stopPropagation();
                                dismiss(n.id);
                              }}
                              className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-slate-200 rounded-md transition-all"
                            >
                              <X className="h-3 w-3 text-slate-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] font-medium text-slate-400">
                          {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}
                        </span>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-white">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                        <Bell className="h-6 w-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">No new notifications</p>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 pr-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 overflow-hidden ring-2 ring-background ring-offset-2 ring-offset-slate-100">
                    {user?.Profile_Image ? (
                      <img
                        src={`${API_BASE_URL}${user.Profile_Image}`}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="hidden flex-col items-start md:flex">
                    <span className="text-sm font-bold leading-none text-slate-900">
                      {user?.FirstName} {user?.LastName}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">
                      {user?.role_id === 'STU' ? 'Student' : user?.role_id === 'SUV' ? 'Supervisor' : user?.role_id}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-slate-100 shadow-xl rounded-xl">
                {profileLinks.map((link, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={link.action}
                    className={link.destructive ? 'text-destructive' : ''}
                  >
                    {link.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      {isSessionReminderVisible && sessionMeta && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-2 ring-blue-500/20 space-y-4 text-center">
            <h3 className="text-xl font-bold text-slate-900">Session expiring soon</h3>
            <p className="text-sm text-slate-600">
              Your session is going to expire in <span className="font-bold">{minutesRemaining} minute{minutesRemaining === 1 ? "" : "s"}</span> and you will be automatically logged out if no action is performed.
            </p>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              You can extend the session up to 12 hours in total.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <button
                type="button"
                onClick={handleExtendSession}
                disabled={!canExtendSession}
                className="flex-1 rounded-xl border border-blue-600 bg-white px-4 py-2 text-sm font-bold text-blue-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:border-blue-700 hover:text-blue-700"
              >
                Keep Session Active
              </button>
              <button
                type="button"
                onClick={handleForcedLogout}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
              >
                Ok
              </button>
            </div>
            {!canExtendSession && (
              <p className="text-[11px] text-red-500">
                You have already reached the 12-hour extension limit; you will be logged out when the timer ends.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
