import { Navigate, useLocation } from "react-router-dom";

/**
 * Protects routes based on authentication and allowed role.
 * @param {boolean} isAuthenticated - User login status
 * @param {boolean} loading - Auth check in progress
 * @param {string} userRole - Role of the logged-in user
 * @param {string | string[]} allowedRole - Role(s) allowed to access the route
 * @param {ReactNode} children - Component(s) to render
 */
export default function ProtectedRoute({
  isAuthenticated,
  loading,
  userRole,
  allowedRole,
  children
}) {
  const location = useLocation();

  if (loading) return <div className="flex justify-center items-center h-screen font-semibold">Verifying Secure Access...</div>;

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  const roles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (roles.length > 0 && !roles.includes(userRole)) {
    console.warn(`Access denied for role: ${userRole}. Required: ${roles.join(", ")}`);
    return <div className="p-8 text-center">Unauthorized: You do not have access to this portal.</div>;
  }

  return children;
}