import { program_info, tbldepartments } from "../config/config.js";
import { Op } from "sequelize";

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

    res.status(200).json({
      total: programnsInfoAccess.length,
      programs: programnsInfoAccess
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch program information"
    });
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

    res.status(200).json({
      total: programnsInfoAccess.length,
      programs: programnsInfoAccess
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch program information"
    });
  }
};