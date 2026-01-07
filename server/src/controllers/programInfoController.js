import { programInfo } from "../config/config.js";

const ensureProframInfoAccess = (req) => {
  if (req.user.role_id !== "CGSADM" && req.user.role_id !== "CGSS") {
    const err = new Error("Forbidden: Admin or Staff access only");
    err.status = 403;
    throw err;
  }
};

const allowedAttributes = [
  "Prog_Code",
  "prog_name",
  "Dep_Code",
];
// Get all program information
export const getAllProgramInfo = async (req, res) => {
  try {
    ensureProframInfoAccess(req);

    const programnsInfoAccess = await programInfo.findAll(req.user.id, {
      where: {Dep_Code: "CGS"},
      attributes: allowedAttributes,
      order: [["Creation_Date", "DESC"]],
    });
    res.status(200).json({
      total: programnsInfoAccess.length,
      programnsInfoAccess
    });
  } catch (error) {
    res.status(error.status || 500).json({ 
      message: error.message || "Failed to fetch program information" });
  }
};