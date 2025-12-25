import { studentinfo } from "../config/config.js";

const ensureStudentInfoAccess = (req) => {
  if (req.user.role_id !== "CGSADM" && req.user.role_id !== "EXCGS") {
    const err = new Error("Forbidden: Admin and Staff access only");
    err.status = 403;
    throw err;
  }
};

const allowedAttributes = [
  "stud_id",
  "FirstName",
  "LastName",
  "EmailId",
  "Prog_Code",
  "Phonenumber",
  "Status",
  "Gender",
  "Acad_Year",
  "Exp_GraduatedYear",
  "Address",
  "Dep_Code"
];

// Get all student info - CGS Staff only
export const getAllStudentInfo  = async (req, res) => {
  try{
    ensureStudentInfoAccess(req);
    const studentinfoaccess = await studentinfo.findAll({
      where: {Dep_code: "CGS"},
      attributes: allowedAttributes,
      order: [["RegDate", "DESC"]]
    });
    res.status(200).json({
      total: studentinfoaccess.length,
      studentinfoaccess
    });
  } catch(error){
    res.status(error.status || 500).json({
      message: error.message || "Failed to fetch Student information"
    });
  }
};

export const getStudentInfoById = async (req, res) => {
  try {
    ensureStudentInfoAccess(req);
    const studentinfoaccess = await studentinfo.findByPk(req.params.id, {
      where: { Dep_Code: "CGS" },
      attributes: allowedAttributes
    });

    res.status(200).json({studentinfoaccess});
  } catch (error) {
    res.status(error.status || 500).json({ 
      message: error.message || "Failed to fetch Student information" });
  } 
};