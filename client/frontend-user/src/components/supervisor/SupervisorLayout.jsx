// // src/layouts/SupervisorLayout.jsx

// import { useState } from 'react';
// import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//   LayoutDashboard,
//   Users,
//   FileText,
//   Menu,
//   X,
//   LogOut,
//   User,
//   Bell,
// } from 'lucide-react';

// const SupervisorLayout = ({ onLogout }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const navItems = [
//     { path: '/supervisor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
//     { path: '/supervisor/students', icon: Users, label: 'My Students' },
//     { path: '/supervisor/reviews', icon: FileText, label: 'Reviews' },
//   ];


//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     onLogout?.();
//     navigate('/login', { replace: true });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* ====================== Sidebar ====================== */}
//       <aside
//         className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         } lg:translate-x-0 bg-white border-r border-gray-200`}
//       >
//         <div className="h-full px-3 py-4 overflow-y-auto">
//           {/* Logo Section */}
//           <div className="flex items-center justify-between mb-8 px-2">
//             <div className="flex items-center gap-2">
//               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
//                 <FileText className="w-5 h-5 text-white" />
//               </div>
//               <span className="text-xl font-bold text-gray-800">PG Monitor</span>
//             </div>
//             <button
//               onClick={() => setSidebarOpen(false)}
//               className="lg:hidden"
//               aria-label="Close sidebar"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Navigation */}
//           <nav className="space-y-1">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const isActive =
//                 location.pathname === item.path || location.pathname === item.path + '/';
//               return (
//                 <Link
//                   key={item.path}
//                   to={item.path}
//                   onClick={() => setSidebarOpen(false)}
//                   className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
//                     isActive
//                       ? 'bg-blue-50 text-blue-600'
//                       : 'text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span className="font-medium">{item.label}</span>
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Logout Button */}
//           <div className="absolute bottom-4 left-3 right-3">
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
//             >
//               <LogOut className="w-5 h-5" />
//               <span className="font-medium">Logout</span>
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* ====================== Main Content ====================== */}
//       <div className="lg:ml-64">
//         {/* ===== Header ===== */}
//         <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
//           <div className="px-4 sm:px-6 lg:px-8 py-4">
//             <div className="flex items-center justify-between">
//               {/* Mobile menu button */}
//               <button
//                 onClick={() => setSidebarOpen(true)}
//                 className="lg:hidden"
//                 aria-label="Open sidebar"
//               >
//                 <Menu className="w-6 h-6" />
//               </button>

//               {/* Title */}
//               <div className="flex-1 lg:flex-none">
//                 <h1 className="text-xl font-semibold text-gray-800">
//                   Supervisor Dashboard
//                 </h1>
//               </div>

//               {/* User section */}
//               <div className="flex items-center gap-4">
//                 {/* Notifications */}
//                 <button
//                   className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
//                   aria-label="Notifications"
//                 >
//                   <Bell className="w-5 h-5" />
//                   <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//                 </button>

//                 {/* User info */}
//                 <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
//                   <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
//                     <User className="w-5 h-5 text-white" />
//                   </div>
//                   <div className="hidden sm:block">
//                     <p className="text-sm font-medium text-gray-800">Dr NPC</p>
//                     <p className="text-xs text-gray-500">Supervisor</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* ===== Page Content ===== */}
//         <main className="p-4 sm:p-6 lg:p-8">
//           {/* 👇 Nested pages will render here (e.g., My Students, Reviews, Analytics) */}
//           <Outlet />
//         </main>
//       </div>

//       {/* Overlay for mobile sidebar */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         ></div>
//       )}
//     </div>
//   );
// };

// export default SupervisorLayout;

// src/layouts/SupervisorLayout.jsx

// src/layouts/SupervisorLayout.jsx

// src/layouts/SupervisorLayout.jsx

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  FilePlus, // <--- Added this import
  Menu,
  X,
  LogOut,
  User,
  Bell,
} from 'lucide-react';

/* ============================================================
   Logout Modal
   ============================================================ */
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <LogOut className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to log out of PG Monitor?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

/* ============================================================
   Supervisor Layout
   ============================================================ */
const SupervisorLayout = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { path: '/supervisor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/supervisor/students', icon: Users, label: 'My Students' },
    { path: '/supervisor/reviews', icon: FileText, label: 'Past Reviews' },
    { path: '/supervisor/review-request', icon: FilePlus, label: 'Review Requests' },
  ];

  const handleLogoutClick = () => setShowLogoutModal(true);

  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    onLogout?.();
    setShowLogoutModal(false);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ====================== Sidebar ====================== */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 bg-white border-r border-gray-200`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto relative">
          {/* Logo */}
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
              const isActive =
                location.pathname === item.path ||
                location.pathname === item.path + '/';

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

          {/* Logout */}
          <div className="absolute bottom-4 left-3 right-3">
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-3 px-3 py-2.5 w-full
              rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ====================== Main Content ====================== */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h1 className="text-xl font-semibold text-gray-800">
              Supervisor Portal
            </h1>

            {/* User section */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-800">Dr. John Smith</p>
                  <p className="text-xs text-gray-500">Academic Supervisor</p>
                </div>
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
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

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

export default SupervisorLayout;