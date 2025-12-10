// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, replace } from "react-router-dom";
// import { useState, useEffect } from "react";

// // React Query
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// // UI utilities (Toaster, Sonner, Tooltip)
// import { Toaster } from "./components/ui/toaster";
// import { Toaster as Sonner } from "./components/ui/sonner";
// import { TooltipProvider } from "./components/ui/tooltip";
// import { isTokenExpired } from "./services/jwt";
// import ProtectedRoute from "./components/auth/ProtectedRoute";
// import { authService } from "./services/api";

// // Login Components
// import AdminLogin from "./components/auth/AdminLogin";

// // CGS Admin pages
// import CGSLayout from "./components/cgs/CGSLayout";
// import CGSDashboard from "./pages/CGSDashboard";
// import CGSRegisterUsers from "./pages/CGSRegisterUsers";
// import CGSMonitoring from "./pages/CGSMonitoring";
// import CGSVerifyDocuments from "./pages/CGSVerifyDocuments";
// import CGSIndex from "./pages/Index";

// // QueryClient
// const queryClient = new QueryClient();

// function AppWrapper() {
//   const navigate = useNavigate();
//   const location = useLocation();


//   // Persistent login
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true); // Block is render until check is done.

//   useEffect(() => {
//     authService.me()
//       .then((data) => {
//         if (data.user && data.user.role === "cgs") {
//           setIsAuthenticated(true);
//         } else {
//           setIsAuthenticated(false);
//         }
//       })
//       .catch(() => setIsAuthenticated(false))
//       .finally(() => setLoading(false));
//   }, []);
//   // useEffect(() => {
//   //   const token = localStorage.getItem("token");
//   //   const storedRole = localStorage.getItem("role");
    
//   //   if (token && storedRole === 'cgs' && !isTokenExpired(token)) {
//   //     setIsAuthenticated(true);
//   //     setRole(storedRole);
//   //   } else {
//   //     setIsAuthenticated(false);
//   //     setRole(null);
//   //   }
//   //   setLoading(false);
//   // }, []);

//   useEffect(() => {
//     const publicRoutes = ["/index", "/login"];
//     if (!loading) {
//       if (!isAuthenticated && !publicRoutes.includes(location.pathname.toLowerCase())) {
//         navigate("/index", { replace: true });
//       }

//       // if (isAuthenticated && location.pathname === "/login") {
//       //   navigate("/cgs/dashboard", { replace: true });
//       // }
//     }
//   }, [loading, isAuthenticated, navigate, location.pathname]);
  
//   // Callback from Login.jsx
//   const handleLogin = () => {
//     setIsAuthenticated(true);
//     navigate("/cgs/dashboard", { replace: true });
//   };

//   // Logout function
//   const handleLogout = async () => {
//     await authService.logout(); // Call backend to clear cookies
//     setIsAuthenticated(false);
//     navigate("/index", { replace: true });
//   };

//    if (loading)
//   return (
//     <div className="flex items-center justify-center h-screen text-lg font-semibold">
//       Loading...
//     </div>
//   );
  
//   return (

//       <Routes>
//       {/* ===== Landing Pages ===== */}
//       <Route path="/index" element={<CGSIndex />} />

//       {/* ===== LOGIN PAGES ===== */}
//       <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />

//       {/* ===== CGS ===== */}
//       <Route path="/cgs/*" element={
//         <ProtectedRoute isAuthenticated={isAuthenticated} >
//           <CGSLayout onLogout={handleLogout} />
//         </ProtectedRoute>
//       }>
//         <Route index element={<Navigate to="dashboard" replace />} />
//         <Route path="dashboard" element={<CGSDashboard />} />
//         <Route path="register" element={<CGSRegisterUsers />} />
//         <Route path="monitoring" element={<CGSMonitoring />} />
//         <Route path="documents" element={<CGSVerifyDocuments />} />
//       </Route>

//       {/* ===== FALLBACK ===== */}
//       <Route path="*" element={<Navigate to="/index" replace />} />
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

// UI utilities
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { authService } from "./services/api";

// Login Components
import AdminLogin from "./components/auth/AdminLogin";

// CGS Admin pages
import CGSLayout from "./components/cgs/CGSLayout";
import CGSDashboard from "./pages/CGSDashboard";
import CGSRegisterUsers from "./pages/CGSRegisterUsers";
import CGSMonitoring from "./pages/CGSMonitoring";
import CGSVerifyDocuments from "./pages/CGSVerifyDocuments";
import FormBuilder from "./pages/FormBuilder"; // ✅ Import FormBuilder page
import CGSIndex from "./pages/Index";

// QueryClient
const queryClient = new QueryClient();

function AppWrapper() {
  const navigate = useNavigate();
  const location = useLocation();

  // Persistent login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.me()
      .then((data) => {
        if (data.user && data.user.role === "cgs") {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const publicRoutes = ["/index", "/login"];
    if (!loading) {
      if (!isAuthenticated && !publicRoutes.includes(location.pathname.toLowerCase())) {
        navigate("/index", { replace: true });
      }
    }
  }, [loading, isAuthenticated, navigate, location.pathname]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/cgs/dashboard", { replace: true });
  };

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
    navigate("/index", { replace: true });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold">
        Loading...
      </div>
    );

  return (
    <Routes>
      {/* ===== Landing Pages ===== */}
      <Route path="/index" element={<CGSIndex />} />

      {/* ===== LOGIN PAGES ===== */}
      <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />

      {/* ===== CGS ===== */}
      <Route
        path="/cgs/*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <CGSLayout onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CGSDashboard />} />
        <Route path="register" element={<CGSRegisterUsers />} />
        <Route path="monitoring" element={<CGSMonitoring />} />
        <Route path="documents" element={<CGSVerifyDocuments />} />
        <Route path="forms" element={<FormBuilder />} /> {/* ✅ Add FormBuilder route */}
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<Navigate to="/index" replace />} />
    </Routes>
  );
}

// Export wrapper
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
