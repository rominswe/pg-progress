// src/components/shared/Layout.jsx
import { useState } from 'react';
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
  const navigate = useNavigate();

  const notificationsCount = notificationsProp.length;

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
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationsCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                      {notificationsCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              {notificationsCount > 0 && (
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  {notificationsProp.map((n) => (
                    <DropdownMenuItem key={n.id} onClick={() => navigate(n.link)}>
                      {n.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden text-sm font-medium md:block">
                    {user?.firstName} {user?.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
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
    </div>
  );
}