// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// UI utilities
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Auth
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth, AuthProvider } from "@/components/auth/AuthContext";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import AdminLogin from "@/components/auth/AdminLogin";

// Pages
import CGSLayout from "@/components/layout/StaffLayout";
import Profile from "@/components/layout/Profile";
import Dashboard from "@/pages/staff/Dashboard";
import UsersList from "@/pages/staff/UsersList";
import UserRegistration from "@/pages/staff/UserRegistration";
import Monitoring from "@/pages/staff/Monitoring";
import VerifyUserDetail from "@/pages/staff/VerifyUserDetail";
import AssignUser from "@/pages/staff/AssignUser";
import UserAssignmentApproval from "@/pages/staff/UserAssignmentApproval";
import UserAssignmentOverview from "@/pages/staff/UserAssignmentOverview";
import StudentDetailView from "@/pages/staff/StudentDetailView";

// Query client
const queryClient = new QueryClient();

function AppWrapper() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <Routes>
      {/* ===== LOGIN ===== */}
      <Route
        path="/login"
        element={(user && ["CGSADM", "CGSS"].includes(user.role_id))
          ? <Navigate to="/cgs/dashboard" replace />
          : <AdminLogin />} />

      {/* ===== CGS ===== */}
      <Route
        path="/cgs/*"
        element={
          <ProtectedRoute
            isAuthenticated={isAuthenticated}
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
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UsersList />} />
        <Route path="users/:id/verify" element={<VerifyUserDetail />} />
        <Route path="users/:id/assign" element={<AssignUser />} />
        <Route path="approvals" element={<UserAssignmentApproval />} />
        <Route path="register" element={<UserRegistration />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="monitoring/student/:id" element={<StudentDetailView />} />
        <Route path="assignment-overview" element={<UserAssignmentOverview />} />
        <Route path="profile" element={<Profile />} />
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
        <NotificationProvider>
          <Router>
            <TooltipProvider>
              <AppWrapper />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
