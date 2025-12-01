import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  FileText,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Bell
} from 'lucide-react';

const StudentLayout = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navItems = [
    { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/student/uploads', icon: Upload, label: 'Uploads' },
    { path: '/student/thesis-submission', icon: FileText, label: 'Thesis Submission' },
    { path: '/student/progress-updates', icon: TrendingUp, label: 'Progress Updates' },
    { path: '/student/feedback', icon: MessageSquare, label: 'Feedback' },
    { path: '/student/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  onLogout();
  navigate("/login", { replace: true });
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ====================== Sidebar ====================== */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-white border-r border-gray-200`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">PG Monitor</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname === item.path + '/';
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="absolute bottom-4 left-3 right-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ====================== Main Content ====================== */}
      <div className="lg:ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Title */}
              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl font-semibold text-gray-800">
                  Student Dashboard
                </h1>
              </div>

              {/* User section */}
              <div className="flex items-center gap-4">
                {/* Notifications */}
                <button
                  className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* User info */}
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-800">NPC 2</p>
                    <p className="text-xs text-gray-500">Student ID</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ===== Page Content ===== */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* 👇 Nested pages will render here */}
          <Outlet />
        </main>
      </div>

      {/* Overlay (for mobile sidebar) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default StudentLayout;