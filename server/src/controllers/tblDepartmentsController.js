import { tbldepartments } from "../config/config.js";

const ensureDepartmentInformationAccess = (req) => {
  if (req.user.role_id !== "CGSADM") {
    const err = new Error("Forbidden: Admin access only");
    err.status = 403;
    throw err;
  }
};

const allowedAttributes = [
  "DepartmentName",
  "Dep_Code"
];

// Get all Deparment - Admin only
export const getAllDepartmentInfo =  async (req, res) => {
  try {
    ensureDepartmentInformationAccess(req);

    const departmentInfoAccess = await tbldepartments.findAll({
      where: {Dep_Code: "CGS"},
      attributes: allowedAttributes,
      order: [["CreationDate", "DESC"]],
    });
    res.status(200).json({
      total: departmentInfoAccess.length,
      departmentInfoAccess
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      message: error.message || "Failed to fetch Department Information" });
  }
};