import { Outlet, Link, useLocation } from "react-router-dom";

export default function SupervisorLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-green-600 text-white flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6 text-center">Supervisor Portal</h2>
        <nav className="flex flex-col gap-2">
          <Link
            to="/supervisor/dashboard"
            className={`px-3 py-2 rounded-lg hover:bg-green-700 ${
              location.pathname === "/supervisor/dashboard" ? "bg-green-700" : ""
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/supervisor/students"
            className={`px-3 py-2 rounded-lg hover:bg-green-700 ${
              location.pathname === "/supervisor/students" ? "bg-green-700" : ""
            }`}
          >
            Student List
          </Link>
          <Link
            to="/supervisor/feedback"
            className={`px-3 py-2 rounded-lg hover:bg-green-700 ${
              location.pathname === "/supervisor/feedback" ? "bg-green-700" : ""
            }`}
          >
            Feedback
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
