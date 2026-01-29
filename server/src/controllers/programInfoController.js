import { program_info, tbldepartments } from "../config/config.js";
import { Op } from "sequelize";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

const allowedAttributes = ["Prog_Code", "prog_name", "Dep_Code"];

export const getAllProgramInfo = async (req, res) => {
  try {
    const programnsInfoAccess = await program_info.findAll({
      attributes: allowedAttributes,
      include: [
        {
          model: tbldepartments,
          as: "tbldepartment",
          attributes: ["DepartmentName"]
        }
      ],
      order: [["prog_name", "ASC"]],
    });

    sendSuccess(res, "Programs fetched successfully", {
      total: programnsInfoAccess.length,
      programs: programnsInfoAccess
    });
  } catch (error) {
    sendError(res, error.message || "Failed to fetch program information", 500);
  }
};

export const getAssignableProgramInfo = async (req, res) => {
  try {
    const programnsInfoAccess = await program_info.findAll({
      where: {
        Dep_Code: ["CGS", "SCI", "SBSS", "SEHS"],
        [Op.or]: [
          { prog_name: { [Op.like]: 'Master of%' } },
          { prog_name: { [Op.like]: 'Doctor of%' } }
        ]
      },
      attributes: allowedAttributes,
      include: [
        {
          model: tbldepartments,
          as: "tbldepartment",
          attributes: ["DepartmentName"]
        }
      ],
      order: [["prog_name", "ASC"]],
    });

    sendSuccess(res, "Assignable programs fetched successfully", {
      total: programnsInfoAccess.length,
      programs: programnsInfoAccess
    });
  } catch (error) {
    sendError(res, error.message || "Failed to fetch program information", 500);
  }
};