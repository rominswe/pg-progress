import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  loading,
  isAuthenticated,
  userRole,
  allowedRole,
  children,
}) {
  const location = useLocation();

  // 🔑 NEVER redirect while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Authenticating...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (roles.length && !roles.includes(userRole)) {
    return (
      <div className="p-8 text-center">
        Unauthorized: You do not have access to this portal.
      </div>
    );
  }

  return children;
}