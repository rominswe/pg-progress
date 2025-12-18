import { Navigate } from "react-router-dom";

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
  children }) {
    
    if (loading) return null; 
    
    if (!isAuthenticated) {
      return <Navigate to="/login " replace />;
    }

    // Handle multiple allowed roles
  const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }
    
    // if (userRole !== allowedRole) {
    //   return <Navigate to="/login" replace />;
    // }
    
    return children;
}