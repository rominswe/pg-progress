import { role } from "../config/config.js"; // Class-based model from config.js

const ensureRoleInfomationAccess = (req) => {
  //   if (req.user.role_id !== "CGSADM") {
  //     const err = new Error("Forbidden: Admin access only");
  //     err.status = 403;
  //     throw err;
  //   }
};

const allowedAttributes = [
  "role_id",
  "role_name",
  "Dep_Code"
];

// Get all roles - Admin only
export const getAllRolesInfo = async (req, res) => {
  try {
    //     ensureRoleInfomationAccess(req);

    const rolesInfoAccess = await role.findAll({
      where: { Dep_Code: "CGS" },
      attributes: allowedAttributes,
      order: [["Creation_Date", "DESC"]],
    });

    res.status(200).json({
      total: rolesInfoAccess.length,
      rolesInfoAccess
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Failed to fetch roles information"
    });
  }
};