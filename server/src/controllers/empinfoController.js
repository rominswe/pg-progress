import { empinfo } from "../config/config.js";

const ensureEmpinfoAccess = (req) => {
  if (req.user.role_id !== "CGSADM") {
    const err = new Error("Forbidden: Admin access only");
    err.status = 403;
    throw err;
  }
};

const allowedAttributes = [
  "emp_id",
  "FirstName",
  "LastName",
  "EmailId",
  "Dep_Code",
  "Phonenumber",
  "Status",
  "role"
];

export const getAllEmployees = async (req, res) => {
  try {
    ensureEmpinfoAccess(req);
    const employees = await empinfo.findAll({
      where: { Dep_Code: "CGS" },
      attributes: allowedAttributes,
      order: [["RegDate", "DESC"]]
    });

    res.json({ total: employees.length, employees });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    ensureEmpinfoAccess(req);
    const employees = await empinfo.findByPk(req.params.id, {
      where: { Dep_Code: "CGS" },
      attributes: allowedAttributes
    });

    res.status(200).json({employees});
  } catch (error) {
    res.status(error.status || 500).json({ 
      message: error.message || "Failed to fetch Employees information" });
  } 
};