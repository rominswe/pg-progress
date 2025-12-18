// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, replace } from "react-router-dom";
import { useState, useEffect } from "react";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// UI utilities (Toaster, Sonner, Tooltip)
import { Toaster } from "../../shared/ui/toaster";
import { Toaster as Sonner } from "../../shared/ui/sonner";
import { TooltipProvider } from "../../shared/ui/tooltip";
import { isTokenExpired } from "../../shared/services/jwt";
import ProtectedRoute from "../../shared/auth/ProtectedRoute";
import { authService } from "../../shared/services/api";

// Login Components
import AdminLogin from "./components/auth/AdminLogin";

// CGS Admin pages
import CGSLayout from "./components/cgs/CGSLayout";
import CGSDashboard from "./pages/CGSDashboard";
import CGSRegisterUsers from "./pages/CGSRegisterUsers";
import CGSMonitoring from "./pages/CGSMonitoring";
import CGSVerifyDocuments from "./pages/CGSVerifyDocuments";
// import CGSIndex from "./pages/Index";
import { set } from "date-fns";

// QueryClient
const queryClient = new QueryClient();

function AppWrapper() {
  const navigate = useNavigate();
  const location = useLocation();


  // Persistent login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Persistent login check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authService.me();
        if (data.user) {
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

  // useEffect(() => {
  //   authService.me()
  //     .then((data) => {
  //       if (data.user) {
  //         setIsAuthenticated(true);
  //       } else {
  //         setIsAuthenticated(false);
  //       }
  //     })
  //     .catch(() => setIsAuthenticated(false))
  //     .finally(() => setLoading(false));
  // }, []);

  // useEffect(() => {
  //   // const publicRoutes = ["/index", "/login"];
  //   if (!loading && !isAuthenticated && location.pathname !== "/login" ) {
  //   navigate("/index", { replace: true });
  // }
  // }, [loading, isAuthenticated, location.pathname, navigate]);
  
  // Callback from Login.jsx
  const handleLogin = async (role, credentials) => {
    try {
      await authService.login(role, credentials); // API call logs in and sets cookie
      setIsAuthenticated(true);
      setUserRole(role);
      navigate("/cgs/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed", err);
      alert("Login failed. Please check your credentials.");
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await authService.logout();
      // api.defaults.headers['Authorization'] = ''; // clears server cookie
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setIsAuthenticated(false);
      setUserRole(null);
      navigate("/login", { replace: true });
    }
  };
  
  return (

      <Routes>
      ===== Landing Pages =====
      {/* <Route path="/index" element={<CGSIndex />} /> */}

      {/* ===== LOGIN PAGES ===== */}
      <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />

      {/* ===== CGS ===== */}
      <Route path="/cgs/*" element={
        <ProtectedRoute 
        isAuthenticated={isAuthenticated}
        loading={loading}
        userRole={userRole}
        allowedRole="cgs"
        >
          <CGSLayout onLogout = {handleLogout} />
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
    <Router>
      <AppWrapper />
    </Router>
    </QueryClientProvider>
  );
}