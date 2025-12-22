import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import { requirePermission, requireRole, requireRoleAccess, requireOwnership, requireDepartmentAccess, requireAccess } from "../middleware/rbacMiddleware.js";
import { PERMISSIONS, ROLES, hasPermission, canAccessRole, getAllPermissions, getRoleInfo } from "../config/rbac.js";

const router = express.Router();

// All routes require authentication
router.use(protect());

/**
 * GET /rbac/test
 * Test endpoint to verify RBAC configuration
 */
router.get("/test", (req, res) => {
  res.json({
    message: "RBAC system is active",
    user: {
      id: req.user[req.user.constructor.primaryKeyAttribute],
      role: req.user.role_id,
      department: req.user.Dep_Code,
      table: req.session.user.table
    },
    permissions: getAllPermissions(req.user.role_id),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /rbac/permissions
 * Get all permissions for current user
 */
router.get("/permissions", (req, res) => {
  const permissions = getAllPermissions(req.user.role_id);

  res.json({
    role: req.user.role_id,
    permissions: permissions,
    count: permissions.length
  });
});

/**
 * GET /rbac/check-permission/:permission
 * Check if current user has specific permission
 */
router.get("/check-permission/:permission", (req, res) => {
  const { permission } = req.params;
  const hasPerm = hasPermission(req.user.role_id, permission);

  res.json({
    role: req.user.role_id,
    permission: permission,
    hasPermission: hasPerm,
    permissions: getAllPermissions(req.user.role_id)
  });
});

/**
 * GET /rbac/check-role-access/:targetRole
 * Check if current user can access target role data
 */
router.get("/check-role-access/:targetRole", (req, res) => {
  const { targetRole } = req.params;
  const canAccess = canAccessRole(req.user.role_id, targetRole);

  res.json({
    userRole: req.user.role_id,
    targetRole: targetRole,
    canAccess: canAccess,
    hierarchy: canAccess ? "Accessible" : "Not accessible"
  });
});

/**
 * GET /rbac/roles
 * Get all available roles and their information
 */
router.get("/roles", async (req, res) => {
  try {
    const rolesList = Object.keys(ROLES).map(roleId => ({
      id: roleId,
      name: ROLES[roleId]
    }));

    res.json({
      roles: rolesList,
      count: rolesList.length
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve roles" });
  }
});

/**
 * GET /rbac/role-info/:roleId
 * Get detailed information about a specific role
 */
router.get("/role-info/:roleId", async (req, res) => {
  try {
    const { roleId } = req.params;
    const roleInfo = await getRoleInfo(roleId);

    if (!roleInfo) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({
      role: roleInfo,
      permissions: getAllPermissions(roleId)
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve role information" });
  }
});

/**
 * Test endpoints for different permission levels
 */

// Admin only
router.get("/admin-only", requireRole("CGSADM"), (req, res) => {
  res.json({ message: "Admin access granted", user: req.user.role_id });
});

// Permission-based access
router.get("/manage-students", requirePermission(PERMISSIONS.MANAGE_STUDENTS), (req, res) => {
  res.json({ message: "Student management access granted", user: req.user.role_id });
});

router.get("/view-progress", requirePermission(PERMISSIONS.VIEW_STUDENT_PROGRESS), (req, res) => {
  res.json({ message: "Progress viewing access granted", user: req.user.role_id });
});

router.get("/upload-docs", requirePermission(PERMISSIONS.UPLOAD_DOCUMENTS), (req, res) => {
  res.json({ message: "Document upload access granted", user: req.user.role_id });
});

// Role hierarchy access
router.get("/access-supervisors", requireRoleAccess("SUV"), (req, res) => {
  res.json({ message: "Supervisor data access granted", user: req.user.role_id });
});

// Ownership test
router.get("/ownership-test/:userId", requireOwnership('userId'), (req, res) => {
  res.json({
    message: "Ownership or admin access granted",
    requestedUser: req.params.userId,
    currentUser: req.user[req.user.constructor.primaryKeyAttribute]
  });
});

// Department access test
router.get("/department-test/:depCode", requireDepartmentAccess(false), (req, res) => {
  res.json({
    message: "Department access granted",
    requestedDepartment: req.params.depCode,
    userDepartment: req.user.Dep_Code
  });
});

// Combined access test
router.get("/combined-test",
  requireAccess({
    permissions: [PERMISSIONS.READ_USER],
    roles: ["STU", "SUV", "EXA"]
  }),
  (req, res) => {
    res.json({
      message: "Combined access requirements met",
      user: req.user.role_id,
      permissions: getAllPermissions(req.user.role_id)
    });
  }
);

export default router;