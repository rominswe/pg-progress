// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// UI utilities (Toaster, Sonner, Tooltip)
import { Toaster } from "././pages/cgs/ui/toaster";
import { Toaster as Sonner } from "././pages/cgs/ui/sonner";
import { TooltipProvider } from "././pages/cgs/ui/tooltip";
import { isTokenExpired } from "./utils/jwt";
import { refreshToken, logout } from "./services/authService";
import ProtectedRoute from "./components/login/ProtectedRoute";

// Login Components
import UserLogin from "./components/login/UserLogin";
import AdminLogin  from "./components/login/AdminLogin";


// Student pages
import StudentLayout from "./components/student/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import Uploads from "./pages/student/Uploads";
import ThesisSubmission from "./pages/student/ThesisSubmission";
import ProgressUpdates from "./pages/student/ProgressUpdates";
import Feedback from "./pages/student/Feedback";
import Analytics from "./pages/student/Analytics";

// Supervisor pages
import SupervisorLayout from "./components/supervisor/SupervisorLayout";
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import StudentList from "./pages/supervisor/StudentList";
import ReviewSubmissions from "./pages/supervisor/ReviewSubmissions";

// CGS Admin pages
import CGSLayout from "./components/cgs/CGSLayout";
import CGSDashboard from "./pages/cgs/CGSDashboard";
import CGSRegisterUsers from "./pages/cgs/CGSRegisterUsers";
import CGSMonitoring from "./pages/cgs/CGSMonitoring";
import CGSVerifyDocuments from "./pages/cgs/CGSVerifyDocuments";

// QueryClient
const queryClient = new QueryClient();

function AppWrapper() {
  const navigate = useNavigate();

  // Persistent login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true); // Block is render until check is done.

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    
    if (token && storedRole) {
      setIsAuthenticated(true);
      setRole(storedRole);
    } else {
      setIsAuthenticated(false);
      setRole(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
  if (!loading && !isAuthenticated && location.pathname !== "/login" ) {
    navigate("/login", { replace: true });
  }
}, [loading, isAuthenticated, navigate, location.pathname]);
  
  // Callback from Login.jsx
  const handleLogin = (userRole) => {
    setIsAuthenticated(true);
    setRole(userRole);
    localStorage.setItem("role", userRole);

    // Redirect based on role
    switch (userRole){
      case 'student':
        navigate("/student/dashboard");
        break;
      case 'supervisor':
        navigate("/supervisor/dashboard");
        break;
      case 'examiner':
        navigate("/examiner/dashboard");
        break;
      case 'cgs':
        navigate("/cgs/dashboard");
        break;
      default:
        navigate("/login");
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setRole(null);
    navigate("/login"); // redirect after logout
  };

   if (loading)
  return (
    <div className="flex items-center justify-center h-screen text-lg font-semibold">
      Loading...
    </div>
  );
  
  return (

      <Routes>
      {/* ===== LOGIN PAGES ===== */}
      <Route path="/login" element={<UserLogin onLogin={handleLogin} />} />
      <Route path="/adminlogin" element={<AdminLogin onLogin={handleLogin} />} />

      {/* ===== STUDENT ===== */}
      <Route path="/student/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} userRole={role} allowedRole="student">
          <StudentLayout onLogout={handleLogout} />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="uploads" element={<Uploads />} />
        <Route path="thesis-submission" element={<ThesisSubmission />} />
        <Route path="progress-updates" element={<ProgressUpdates />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      {/* ===== SUPERVISOR ===== */}
      <Route path="/supervisor/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} userRole={role} allowedRole="supervisor">
          <SupervisorLayout onLogout={handleLogout} />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SupervisorDashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="review" element={<ReviewSubmissions />} />
      </Route>

      {/* ===== CGS ===== */}
      <Route path="/cgs/*" element={
        <ProtectedRoute isAuthenticated={isAuthenticated} userRole={role} allowedRole="cgs">
          <CGSLayout onLogout={handleLogout} />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CGSDashboard />} />
        <Route path="register" element={<CGSRegisterUsers />} />
        <Route path="monitoring" element={<CGSMonitoring />} />
        <Route path="documents" element={<CGSVerifyDocuments />} />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// Export wrapper
export default function App() {
  return (
     <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Global Toasters (render once at app root) */}
        <Toaster />
        <Sonner />
    <Router>
      <AppWrapper />
    </Router>
    </TooltipProvider>
    </QueryClientProvider>
  );
}