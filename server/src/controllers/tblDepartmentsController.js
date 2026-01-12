import { tbldepartments } from "../config/config.js";

const allowedAttributes = [
  "DepartmentName",
  "Dep_Code"
];

// Get all Deparment
export const getAllDepartmentInfo = async (req, res) => {
  try {
    const departmentInfoAccess = await tbldepartments.findAll({
      where: { Dep_Code: ["CGS", "SCI", "SEHS", "SBSS"] },
      attributes: allowedAttributes,
      order: [["CreationDate", "DESC"]],
    });
    res.status(200).json({
      total: departmentInfoAccess.length,
      departmentInfoAccess
    });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Failed to fetch Department Information"
    });
  }
};