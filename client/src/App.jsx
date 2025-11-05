// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Login Page
import Login from "./components/login/Login";

// Student pages
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/student/Dashboard";
import Uploads from "./pages/student/Uploads";
import ThesisSubmission from "./pages/student/ThesisSubmission";
import ProgressUpdates from "./pages/student/ProgressUpdates";
import Feedback from "./pages/student/Feedback";
import Analytics from "./pages/student/Analytics";

// Supervisor pages
import SupervisorLayout from "./components/SupervisorLayout";
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import StudentList from "./pages/supervisor/StudentList";
import ReviewSubmissions from "./pages/supervisor/ReviewSubmissions";

function AppWrapper() {
  const navigate = useNavigate();

  // Persistent login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token && storedRole) {
      setIsAuthenticated(true);
      setRole(storedRole);
    } else {
      navigate("/login"); // redirect to login if not authenticated
    }
  }, [navigate]);

  // Callback from Login.jsx
  const handleLogin = (userRole) => {
    setIsAuthenticated(true);
    setRole(userRole);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setRole(null);
    navigate("/login"); // redirect after logout
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start">
      <h1 className="text-3xl font-bold my-4">AIU PG Progress System</h1>

      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              role === "supervisor" ? (
                <Navigate to="/supervisor/dashboard" />
              ) : (
                <Navigate to="/student/dashboard" />
              )
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            isAuthenticated && role === "student" ? (
              <DashboardLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="uploads" element={<Uploads />} />
          <Route path="thesis-submission" element={<ThesisSubmission />} />
          <Route path="progress-updates" element={<ProgressUpdates />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="analytics" element={<Analytics />} />
        
        </Route>

        {/* Supervisor Routes */}
        <Route
          path="/supervisor"
          element={
            isAuthenticated && role === "supervisor" ? (
              <SupervisorLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<SupervisorDashboard />} />
          <Route path="students" element={<StudentList />} />
          <Route path="review" element={<ReviewSubmissions />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

// Export wrapper
export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}