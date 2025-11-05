import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  LogOut,
  Menu,
  X,
  Bell,
  User
} from "lucide-react";
import { useState } from "react";

const SupervisorLayout = ({ onLogout }) =>{
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/supervisor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/supervisor/students', icon: Users, label: 'Student List' },
    { path: '/supervisor/review', icon: CheckSquare, label: 'Review Submissions' },
  ];

   const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    onLogout();
    navigate("/login", { replace: true });
  };

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 bg-green-600 text-white`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          {/* Logo Section */}
          <div className="flex items-center justify-between mb-8 px-2">
            <span className="text-xl font-bold">Supervisor Portal</span>
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
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-green-700' : 'hover:bg-green-500'
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
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-800">Supervisor Dashboard</h1>

            {/* User section */}
            <div className="flex items-center gap-4">
              <button
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-9 h-9 bg-green-800 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">Jane Supervisor</p>
                  <p className="text-xs text-gray-200">Supervisor ID: SUP001</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default SupervisorLayout
