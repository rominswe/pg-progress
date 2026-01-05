// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// UI utilities
import { Toaster } from "../../shared/ui/toaster";
import { Toaster as Sonner } from "../../shared/ui/sonner";
import { TooltipProvider } from "../../shared/ui/tooltip";

// Auth
import ProtectedRoute from "../../shared/auth/ProtectedRoute";
import { useAuth, AuthProvider } from "../../shared/auth/AuthContext";
import AdminLogin from "./components/auth/AdminLogin";

// Pages
import CGSLayout from "./components/cgs/CGSLayout";
import CGSDashboard from "./pages/CGSDashboard";
import CGSRegisterUsers from "./pages/CGSRegisterUsers";
import CGSMonitoring from "./pages/CGSMonitoring";
import CGSVerifyDocuments from "./pages/CGSVerifyDocuments";
import FormBuilder from "./pages/FormBuilder";

// Query client
const queryClient = new QueryClient();

function AppWrapper() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Authenticating AIU PG Progress Portal...
      </div>
    );
  }

  return (
    <Routes>
      {/* ===== LOGIN ===== */}
      <Route 
      path="/login" 
      element={user ? <Navigate to="/cgs/dashboard" replace /> : <AdminLogin />} />

      {/* ===== CGS ===== */}
      <Route
        path="/cgs/*"
        element={
          <ProtectedRoute
            isAuthenticated={!!user}
            loading={loading}
            userRole={user?.role_id}
            allowedRole={["CGSADM", "CGSS"]}
          >
            <CGSLayout onLogout={logout} />
          </ProtectedRoute>
        }
      >
        {/* Sub-routes */}
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
      <AuthProvider>
        <Router>
        <TooltipProvider>
          <AppWrapper />
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}