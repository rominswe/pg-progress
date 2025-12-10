// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// UI utilities
import { Toaster } from "../../shared/ui/toaster";
import { Toaster as Sonner } from "../../shared/ui/sonner";
import { TooltipProvider } from "../../shared/ui/tooltip";

// Auth
import ProtectedRoute from "../../shared/auth/ProtectedRoute";
import { authService } from "../../shared/services/api";

// Pages
import AdminLogin from "./components/auth/AdminLogin";
import CGSLayout from "./components/cgs/CGSLayout";
import CGSDashboard from "./pages/CGSDashboard";
import CGSRegisterUsers from "./pages/CGSRegisterUsers";
import CGSMonitoring from "./pages/CGSMonitoring";
import CGSVerifyDocuments from "./pages/CGSVerifyDocuments";
import FormBuilder from "./pages/FormBuilder";

// Query client
const queryClient = new QueryClient();

function AppWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Persistent auth check (cookie-based)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authService.me();
        if (data?.user) {
          setIsAuthenticated(true);
          setUserRole(data.user.role);
        } else {
          setIsAuthenticated(false);
          setUserRole(null);
        }
      } catch {
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 🚦 Route guard
  useEffect(() => {
    const publicRoutes = ["/login"];
    if (!loading && !isAuthenticated && !publicRoutes.includes(location.pathname)) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);

  // 🔑 Login callback
  const handleLogin = async (role, credentials) => {
    try {
      await authService.login(role, credentials);
      setIsAuthenticated(true);
      setUserRole(role);
      navigate("/cgs/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed. Please check your credentials.");
    }
  };

  // 🚪 Logout
  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      setIsAuthenticated(false);
      setUserRole(null);
      navigate("/login", { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* ===== LOGIN ===== */}
      <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />

      {/* ===== CGS ===== */}
      <Route
        path="/cgs/*"
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
            loading={loading}
            userRole={userRole}
            allowedRole="cgs"
          >
            <CGSLayout onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CGSDashboard />} />
        <Route path="register" element={<CGSRegisterUsers />} />
        <Route path="monitoring" element={<CGSMonitoring />} />
        <Route path="documents" element={<CGSVerifyDocuments />} />
        <Route path="forms" element={<FormBuilder />} />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <TooltipProvider>
          <AppWrapper />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </Router>
    </QueryClientProvider>
  );
}