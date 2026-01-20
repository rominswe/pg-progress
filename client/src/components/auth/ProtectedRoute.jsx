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
    // Smart redirect based on user role instead of showing "Unauthorized"
    const isStudentRelatedRole = ['STU', 'SUV', 'EXA'].includes(userRole);
    const isAdminRelatedRole = ['CGSADM', 'CGSS'].includes(userRole);

    // Student/Supervisor/Examiner trying to access admin portal → redirect to student dashboard
    if (isStudentRelatedRole && location.pathname.startsWith('/cgs')) {
      // Redirect to appropriate dashboard based on specific role
      if (userRole === 'STU') {
        return <Navigate to="/student/dashboard" replace />;
      } else if (userRole === 'SUV') {
        return <Navigate to="/supervisor/dashboard" replace />;
      } else if (userRole === 'EXA') {
        return <Navigate to="/examiner/dashboard" replace />;
      }
    }

    // Admin/Staff trying to access user portal → redirect to CGS dashboard
    if (isAdminRelatedRole && !location.pathname.startsWith('/cgs')) {
      return <Navigate to="/cgs/dashboard" replace />;
    }

    // Fallback: Show unauthorized message for edge cases
    return (
      <div className="p-8 text-center">
        Unauthorized: You do not have access to this portal.
      </div>
    );
  }

  return children;
}