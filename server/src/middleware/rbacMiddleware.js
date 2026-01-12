export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if user exists (set by protect middleware)
    if (!req.user) {
      console.log("RBAC Error: No user found in request.");
      return res.status(401).json({ error: "Unauthorized: Please log in" });
    }

    // 2. Debugging Log (Check your terminal when upload fails!)
    console.log(`RBAC Check -> User Role: ${req.user.role_id}, Allowed: ${allowedRoles}`);

    // 3. Check if role is allowed
    if (!allowedRoles.includes(req.user.role_id)) {
      console.log("RBAC Error: Access Denied.");
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};