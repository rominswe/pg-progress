import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ isAuthenticated, userRole, allowedRole, children }) {

  if (!isAuthenticated) {
    return <Navigate to={allowedRole === "cgs" ? "/cgs/login" : "/login"} replace />;
  }

  if (userRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}