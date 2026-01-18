import { tbldepartments } from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

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
    sendSuccess(res, "Department Information fetched successfully", {
      total: departmentInfoAccess.length,
      departmentInfoAccess
    });
  } catch (error) {
    sendError(res, error.message || "Failed to fetch Department Information", error.status || 500);
  }
};