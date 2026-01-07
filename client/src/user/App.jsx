// // src/App.jsx
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
import UserLogin from "@/components/auth/UserLogin";

// Student pages
import StudentLayout from "@/components/layout/StudentLayout";
import Dashboard from "@/pages/student/Dashboard";
import Uploads from "@/pages/student/Uploads";
import ThesisSubmission from "@/pages/student/ThesisSubmission";
import ProgressUpdates from "@/pages/student/ProgressUpdates";
import Feedback from "@/pages/student/Feedback";
import Analytics from "@/pages/student/Analytics";
import ServiceRequest from "@/pages/student/ServiceRequest";

// Supervisor pages
import SupervisorLayout from "@/components/layout/SupervisorLayout";
import SupervisorDashboard from "@/pages/supervisor/Dashboard";
import StudentList from "@/pages/supervisor/StudentList";
import ReviewSubmissions from "@/pages/supervisor/ReviewSubmissions";
import ReviewRequest from '@/pages/supervisor/ReviewRequest';
import ProgressEvaluation from "@/pages/supervisor/ProgressEvaluation";

// QueryClient
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
      {/* ===== LOGIN PAGES ===== */}
     <Route
        path="/login"
        element={
          user && ["STU", "SUV", "EXM"].includes(user.role_id) ? (
            <Navigate 
              to={user.role_id === "STU" ? "/student/dashboard" : user.role_id === "SUV" ? "/supervisor/dashboard" : "/examiner/dashboard"} 
              replace 
            />
          ) : (
            <UserLogin />
          )
        }
      />

      {/* ===== STUDENT ===== */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute 
            isAuthenticated={!!user} 
            loading={loading}
            userRole={user?.role_id} 
            allowedRole="STU"
          >
            <StudentLayout onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="uploads" element={<Uploads />} />
        <Route path="thesis-submission" element={<ThesisSubmission />} />
        <Route path="progress-updates" element={<ProgressUpdates />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="service-request" element={<ServiceRequest />} /> {/* ✅ NEW */}
      </Route>

      {/* ===== SUPERVISOR ===== */}
      <Route
        path="/supervisor/*"
        element={
          <ProtectedRoute 
            isAuthenticated={!!user} 
            loading={loading}
            userRole={user?.role_id} 
            allowedRole="SUV"
          >
            <SupervisorLayout onLogout={logout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SupervisorDashboard />} />
        <Route path="students" element={<StudentList />} />
        <Route path="review" element={<ReviewSubmissions />} />
        <Route path="review-request" element={<ReviewRequest />} />
        <Route path="evaluate" element={<ProgressEvaluation />} />
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