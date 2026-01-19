import { sendError } from "../utils/responseHandler.js";

// middleware/rbacMiddleware.js
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Unauthorized: not logged in", 401);
    }

    if (!allowedRoles.includes(req.user.role_id)) {
      return sendError(res, "Forbidden: insufficient permissions", 403, {
        required_roles: allowedRoles,
        current_role: req.user.role_id
      });
    }

    next();
  };
};