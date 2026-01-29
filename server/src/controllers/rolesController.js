import { roles } from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

const allowedAttributes = [
  "role_id",
  "role_name",
  "Dep_Code",
  "Creation_Date"
];

// Get all roles - Admin only
export const getAllRolesInfo = async (req, res) => {
  try {
    const rolesInfoAccess = await roles.findAll({
      attributes: allowedAttributes,
      order: [["Creation_Date", "DESC"]],
    });

    return sendSuccess(res, "Roles fetched successfully from database.", rolesInfoAccess);
  } catch (error) {
    console.error("[GET_ROLES_ERROR]", error);
    return sendError(res, "Failed to fetch roles information", 500);
  }
};

export const getAssignableRoles = async (req, res) => {
  try {
    const rolesFromDB = await roles.findAll({
      where: { Dep_Code: "CGS" },
      attributes: ["role_id", "role_name"],
      order: [["role_name", "ASC"]]
    });

    const formattedRoles = rolesFromDB.map(r => ({
      id: r.role_id,
      label: r.role_name
    }));

    return sendSuccess(res, "Roles fetched successfully from database.", formattedRoles);
  } catch (error) {
    console.error("[GET_ROLES_ERROR]", error);
    return sendError(res, "Failed to fetch assignable roles from system records.", 500);
  }
};