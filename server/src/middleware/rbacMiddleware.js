import {
  hasPermission,
  canAccessRole,
  getAllPermissions,
  validateRole,
  ROLE_HIERARCHY,
  PERMISSIONS
} from "../config/rbac.js";

/**
 * Enhanced Role-Based Access Control Middleware
 * Integrates with database roles and provides fine-grained permission control
 */

/**
 * Require specific roles (basic RBAC)
 * @param {...string} allowedRoles - Array of role IDs that can access the route
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    if (!allowedRoles.includes(req.user.role_id)) {
      return res.status(403).json({
        error: "Forbidden: insufficient role permissions",
        code: "INSUFFICIENT_ROLE",
        required: allowedRoles,
        current: req.user.role_id
      });
    }

    next();
  };
};

/**
 * Require specific permissions (advanced RBAC)
 * @param {...string} requiredPermissions - Array of permission strings
 */
export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    const userPermissions = getAllPermissions(req.user.role_id);

    const hasAllPermissions = requiredPermissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        error: "Forbidden: insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        required: requiredPermissions,
        current: userPermissions
      });
    }

    next();
  };
};

/**
 * Require role hierarchy access (can access subordinate roles)
 * @param {...string} targetRoles - Array of role IDs that can be accessed
 */
export const requireRoleAccess = (...targetRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    const canAccess = targetRoles.some(targetRole =>
      canAccessRole(req.user.role_id, targetRole)
    );

    if (!canAccess) {
      return res.status(403).json({
        error: "Forbidden: cannot access target role data",
        code: "ROLE_ACCESS_DENIED",
        targetRoles: targetRoles,
        userRole: req.user.role_id
      });
    }

    next();
  };
};

/**
 * Require ownership or admin access
 * @param {string} ownerField - Field name containing the owner ID (default: 'userId')
 */
export const requireOwnership = (ownerField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    const resourceOwnerId = req.params[ownerField] || req.body[ownerField];
    const currentUserId = req.user[req.user.constructor.primaryKeyAttribute];

    // Check if user owns the resource
    if (resourceOwnerId === currentUserId) {
      return next();
    }

    // Check if user has admin permissions
    const userPermissions = getAllPermissions(req.user.role_id);
    const hasAdminAccess = userPermissions.some(permission =>
      permission.includes('manage_') || permission.includes('admin')
    );

    if (!hasAdminAccess) {
      return res.status(403).json({
        error: "Forbidden: ownership or admin access required",
        code: "OWNERSHIP_REQUIRED",
        resourceOwner: resourceOwnerId,
        currentUser: currentUserId
      });
    }

    next();
  };
};

/**
 * Department-based access control
 * @param {boolean} sameDepartmentOnly - If true, restrict to same department
 */
export const requireDepartmentAccess = (sameDepartmentOnly = false) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED"
      });
    }

    // Get target department from params or body
    const targetDepartment = req.params.depCode || req.params.Dep_Code || req.body.Dep_Code;

    if (!targetDepartment) {
      return next(); // No department restriction if not specified
    }

    // Check if user belongs to the target department
    if (req.user.Dep_Code === targetDepartment) {
      return next();
    }

    // Allow access if user has cross-department permissions
    if (!sameDepartmentOnly) {
      const userPermissions = getAllPermissions(req.user.role_id);
      const hasCrossDepartmentAccess = userPermissions.some(permission =>
        permission.includes('manage_departments') ||
        permission.includes('admin') ||
        permission === PERMISSIONS.MANAGE_SYSTEM
      );

      if (hasCrossDepartmentAccess) {
        return next();
      }
    }

    return res.status(403).json({
      error: "Forbidden: department access denied",
      code: "DEPARTMENT_ACCESS_DENIED",
      userDepartment: req.user.Dep_Code,
      targetDepartment: targetDepartment
    });
  };
};

/**
 * Combined middleware for complex access control
 * @param {Object} options - Configuration options
 * @param {string[]} options.roles - Required roles
 * @param {string[]} options.permissions - Required permissions
 * @param {boolean} options.requireOwnership - Require ownership or admin
 * @param {boolean} options.sameDepartment - Restrict to same department
 */
export const requireAccess = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Authentication check
      if (!req.user) {
        return res.status(401).json({
          error: "Authentication required",
          code: "AUTH_REQUIRED"
        });
      }

      // Role check
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(req.user.role_id)) {
          return res.status(403).json({
            error: "Forbidden: insufficient role permissions",
            code: "INSUFFICIENT_ROLE",
            required: options.roles,
            current: req.user.role_id
          });
        }
      }

      // Permission check
      if (options.permissions && options.permissions.length > 0) {
        const userPermissions = getAllPermissions(req.user.role_id);
        const hasAllPermissions = options.permissions.every(permission =>
          userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
          return res.status(403).json({
            error: "Forbidden: insufficient permissions",
            code: "INSUFFICIENT_PERMISSIONS",
            required: options.permissions,
            current: userPermissions
          });
        }
      }

      // Ownership check
      if (options.requireOwnership) {
        const ownerField = options.ownerField || 'userId';
        const resourceOwnerId = req.params[ownerField] || req.body[ownerField];
        const currentUserId = req.user[req.user.constructor.primaryKeyAttribute];

        if (resourceOwnerId !== currentUserId) {
          const userPermissions = getAllPermissions(req.user.role_id);
          const hasAdminAccess = userPermissions.some(permission =>
            permission.includes('manage_') || permission.includes('admin')
          );

          if (!hasAdminAccess) {
            return res.status(403).json({
              error: "Forbidden: ownership or admin access required",
              code: "OWNERSHIP_REQUIRED",
              resourceOwner: resourceOwnerId,
              currentUser: currentUserId
            });
          }
        }
      }

      // Department check
      if (options.sameDepartment !== undefined) {
        const targetDepartment = req.params.depCode || req.params.Dep_Code || req.body.Dep_Code;

        if (targetDepartment) {
          if (req.user.Dep_Code !== targetDepartment) {
            if (options.sameDepartment) {
              return res.status(403).json({
                error: "Forbidden: department access denied",
                code: "DEPARTMENT_ACCESS_DENIED",
                userDepartment: req.user.Dep_Code,
                targetDepartment: targetDepartment
              });
            } else {
              // Check for cross-department permissions
              const userPermissions = getAllPermissions(req.user.role_id);
              const hasCrossDepartmentAccess = userPermissions.some(permission =>
                permission.includes('manage_departments') ||
                permission.includes('admin') ||
                permission === PERMISSIONS.MANAGE_SYSTEM
              );

              if (!hasCrossDepartmentAccess) {
                return res.status(403).json({
                  error: "Forbidden: department access denied",
                  code: "DEPARTMENT_ACCESS_DENIED",
                  userDepartment: req.user.Dep_Code,
                  targetDepartment: targetDepartment
                });
              }
            }
          }
        }
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({
        error: "Access control error",
        code: "RBAC_ERROR"
      });
    }
  };
};

/**
 * Middleware to validate role exists in database
 */
export const validateRoleMiddleware = async (req, res, next) => {
  const roleId = req.params.roleId || req.body.role_id;

  if (!roleId) {
    return next();
  }

  const isValid = await validateRole(roleId);
  if (!isValid) {
    return res.status(400).json({
      error: "Invalid role ID",
      code: "INVALID_ROLE"
    });
  }

  next();
};

/**
 * Export common permission combinations for convenience
 */
export const PERMISSION_PRESETS = {
  ADMIN_ONLY: [PERMISSIONS.MANAGE_SYSTEM],
  USER_MANAGEMENT: [PERMISSIONS.CREATE_USER, PERMISSIONS.READ_USER, PERMISSIONS.UPDATE_USER],
  STUDENT_MANAGEMENT: [PERMISSIONS.MANAGE_STUDENTS, PERMISSIONS.VIEW_STUDENT_PROGRESS],
  ACADEMIC_MANAGEMENT: [PERMISSIONS.MANAGE_SUPERVISORS, PERMISSIONS.MANAGE_EXAMINERS, PERMISSIONS.ASSIGN_SUPERVISOR, PERMISSIONS.ASSIGN_EXAMINER],
  DOCUMENT_MANAGEMENT: [PERMISSIONS.UPLOAD_DOCUMENTS, PERMISSIONS.REVIEW_DOCUMENTS, PERMISSIONS.APPROVE_DOCUMENTS],
  SYSTEM_MONITORING: [PERMISSIONS.VIEW_AUDIT_LOGS, PERMISSIONS.VIEW_LOGIN_ATTEMPTS, PERMISSIONS.VIEW_ANALYTICS]
};