// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
// import { useState, useEffect } from "react";

// // React Query
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// // UI utilities (Toaster, Sonner, Tooltip)
// import { isTokenExpired } from "../../shared/services/jwt";
// // import { refreshToken, logout } from "./services/api";
// import ProtectedRoute from "./components/auth/ProtectedRoute";

// // Login Components
// import UserLogin from "./components/auth/UserLogin";

// // Student pages
// import StudentLayout from "./components/student/StudentLayout";
// import Dashboard from "./pages/student/Dashboard";
// import Uploads from "./pages/student/Uploads";
// import ThesisSubmission from "./pages/student/ThesisSubmission";
// import ProgressUpdates from "./pages/student/ProgressUpdates";
// import Feedback from "./pages/student/Feedback";
// import Analytics from "./pages/student/Analytics";

// // Supervisor pages
// import SupervisorLayout from "./components/supervisor/SupervisorLayout";
// import SupervisorDashboard from "./pages/supervisor/Dashboard";
// import StudentList from "./pages/supervisor/StudentList";
// import ReviewSubmissions from "./pages/supervisor/ReviewSubmissions";

// // QueryClient
// const queryClient = new QueryClient();

// function AppWrapper() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Persistent login
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [role, setRole] = useState(null);
//   // const [loading, setLoading] = useState(true); // Block is render until check is done.

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const storedRole = localStorage.getItem("role");
    
//     if (token && storedRole) {
//       setIsAuthenticated(true);
//       setRole(storedRole);
//     } else {
//       setIsAuthenticated(false);
//       setRole(null);
//     }
//     setLoading(false);
//   }, []);

// //   useEffect(() => {
// //   if (!loading && !isAuthenticated && location.pathname !== "/login" ) {
// //     navigate("/login", { replace: true });
// //   }
// // }, [loading, isAuthenticated, navigate, location.pathname]);
  
//   // Callback from Login.jsx
//   const handleLogin = (userRole) => {
//     setIsAuthenticated(true);
//     setRole(userRole);
//     localStorage.setItem("role", userRole);

//     // Redirect based on role
//     switch (userRole){
//       case 'student':
//         navigate("/student/dashboard");
//         break;
//       case 'supervisor':
//         navigate("/supervisor/dashboard");
//         break;
//       case 'examiner':
//         navigate("/examiner/dashboard");
//         break;
//       default:
//         navigate("/login");
//     }
//   };

//   // Logout function
//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setRole(null);
//     navigate("/login", {replace: true}); // redirect after logout
//   };

//    if (loading)
//   return (
//     <div className="flex items-center justify-center h-screen text-lg font-semibold">
//       Loading...
//     </div>
//   );
  
//   return (

//       <Routes>
//       {/* ===== LOGIN PAGES ===== */}
//       <Route path="/login" element={<UserLogin onLogin={handleLogin} />} />


//       {/* ===== STUDENT ===== */}
//       <Route path="/student/*" element={
//         <ProtectedRoute 
//         isAuthenticated={isAuthenticated} 
//         userRole={role}
//         loading = {loading}
//         allowedRole="student">
//           <StudentLayout onLogout={handleLogout} />
//         </ProtectedRoute>
//       }>
//         <Route index element={<Navigate to="dashboard" replace />} />
//         <Route path="dashboard" element={<Dashboard />} />
//         <Route path="uploads" element={<Uploads />} />
//         <Route path="thesis-submission" element={<ThesisSubmission />} />
//         <Route path="progress-updates" element={<ProgressUpdates />} />
//         <Route path="feedback" element={<Feedback />} />
//         <Route path="analytics" element={<Analytics />} />
//       </Route>

//       {/* ===== SUPERVISOR ===== */}
//       <Route path="/supervisor/*" element={
//         <ProtectedRoute 
//         isAuthenticated={isAuthenticated} 
//         userRole={role}
//         loading = {loading}
//         allowedRole="supervisor">
//           <SupervisorLayout onLogout={handleLogout} />
//         </ProtectedRoute>
//       }>
//         <Route index element={<Navigate to="dashboard" replace />} />
//         <Route path="dashboard" element={<SupervisorDashboard />} />
//         <Route path="students" element={<StudentList />} />
//         <Route path="review" element={<ReviewSubmissions />} />
//       </Route>

//       {/* ===== FALLBACK ===== */}
//       <Route path="*" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// // Export wrapper
// export default function App() {
//   return (
//      <QueryClientProvider client={queryClient}>
//     <Router>
//       <AppWrapper />
//     </Router>
//     </QueryClientProvider>
//   );
// }

// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// UI utilities (Toaster, Sonner, Tooltip)
import { isTokenExpired } from "./services/jwt";
// import { refreshToken, logout } from "./services/api";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Login Components
import UserLogin from "./components/auth/UserLogin";
import AuthLayout from "./components/layouts/AuthLayout";

// Student pages
import StudentLayout from "./components/student/StudentLayout";
import Dashboard from "./pages/student/Dashboard";
import Uploads from "./pages/student/Uploads";
import ThesisSubmission from "./pages/student/ThesisSubmission";
import ProgressUpdates from "./pages/student/ProgressUpdates";
import Feedback from "./pages/student/Feedback";
import Analytics from "./pages/student/Analytics";
import ServiceRequest from "./pages/student/ServiceRequest";

// Supervisor pages
import SupervisorLayout from "./components/supervisor/SupervisorLayout";
import SupervisorDashboard from "./pages/supervisor/Dashboard";
import StudentList from "./pages/supervisor/StudentList";
import ReviewSubmissions from "./pages/supervisor/ReviewSubmissions";
import ReviewRequest from './pages/supervisor/ReviewRequest';
import ProgressEvaluation from "./pages/supervisor/ProgressEvaluation";


// QueryClient
const queryClient = new QueryClient();

function AppWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  // Persistent login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
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
      default:
        navigate("/login");
    }
  };

  // Logout function
  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(null);
    navigate("/login", {replace: true}); // redirect after logout
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
     import AuthLayout from "./components/layouts/AuthLayout";

<Route
  path="/login"
  element={
    <AuthLayout>
      <UserLogin onLogin={handleLogin} />
    </AuthLayout>
  }
/>



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
        <Route path="service-request" element={<ServiceRequest />} /> {/* ✅ NEW */}
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
        <Route path="review-request" element={<ReviewRequest />} />
        <Route path="evaluate" element={<ProgressEvaluation />} />
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