/* ========================= IMPORTS ========================= */
import UserService from "../services/userService.js";
import { registerStudent, registerStaff } from "../services/userRegistrationService.js";
import { sequelize } from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

/* ========================= CONTROLLERS ========================= */

/**
 * Unified User Registration
 */
export const registerUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { searchRole } = req.body;
    if (!searchRole) throw { status: 400, message: "User type (searchRole) is required." };

    let result;
    if (searchRole === "Student") {
      result = await registerStudent(req.body, transaction);
    } else {
      result = await registerStaff(req.body, transaction);
    }

    await transaction.commit();
    return sendSuccess(res, result.message, { id: result.id });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("[REGISTER_ERROR]", err);
    return sendError(res, err.message, err.status || 500);
  }
};

/**
 * List All Users
 */
export const getAllPGUsers = async (req, res) => {
  try {
    const { dept, status, role, search } = req.query;
    const users = await UserService.listUsers({ dept, status, role, search });
    return sendSuccess(res, "Users fetched.", {
      total: users.length,
      users
    });
  } catch (err) {
    console.error("[LIST_USERS_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/**
 * Update User
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await UserService.updateUserProfile(id, req.body);
    return sendSuccess(res, "User updated successfully", { id });
  } catch (err) {
    console.error("[UPDATE_USER_ERROR]", err);
    return sendError(res, err.message, err.status || 500);
  }
};

/**
 * Get Dashboard Statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await UserService.getSystemCounts();
    return sendSuccess(res, "Dashboard stats fetched", stats);
  } catch (err) {
    console.error("[DASHBOARD_STATS_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/**
 * Search User
 */
export const searchUser = async (req, res) => {
  try {
    const { role: searchRole, type, query } = req.query;
    if (!query) return sendError(res, "Invalid search query", 400);

    const { sourceData, systemData, isRegistered } = await UserService.searchUserInMaster(searchRole, query, type);

    if (searchRole === "Student" && !sourceData) return sendError(res, "Student not found in master database.", 404);
    if (searchRole === "Academic Staff" && type === "internal" && !sourceData) return sendError(res, "Employee not found in HR database.", 404);

    if (searchRole === "Academic Staff" && type === "external" && !systemData) {
      return sendSuccess(res, "External user not registered", {
        found: false,
        email: query.trim(),
        allowManual: true
      });
    }

    return sendSuccess(res, "Record found", {
      found: true,
      source: sourceData,
      registered: isRegistered,
      systemRecord: systemData ? await UserService.getDeepUser(systemData.pgstud_id || systemData.pgstaff_id) : null
    });
  } catch (err) {
    console.error("[SEARCH_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/**
 * Get Specific System User
 */
export const getSystemUser = async (req, res) => {
  try {
    const { id } = req.params;
    const ui = await UserService.getDeepUser(id);
    if (!ui) return sendError(res, "User not found", 404);
    return sendSuccess(res, "User found", ui);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

export const getUserDetails = getSystemUser;

/**
 * Toggle User Status
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId, targetStatus } = req.body;
    if (!userId || !["Active", "Inactive"].includes(targetStatus)) {
      return sendError(res, "Invalid request. userId and targetStatus are required.", 400);
    }

    if (req.user.role_id !== "CGSADM") {
      return sendError(res, "Unauthorized. Only System Admins can change user status.", 403);
    }

    const result = await UserService.toggleStatus(userId, targetStatus);
    const action = targetStatus === "Active" ? "reactivated" : "deactivated";
    return sendSuccess(res, `User ${userId} has been successfully ${action}.`, result);
  } catch (err) {
    console.error("[TOGGLE_STATUS_ERROR]", err);
    return sendError(res, err.message || "Server error while updating user status.", err.status || 500);
  }
};
