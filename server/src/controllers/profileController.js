import { pgstaffinfo, pgstudinfo, tbldepartments } from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import fs from "fs";
import path from "path";

/* ================= CONFIGURATION ================= */
const ROLE_MODEL_MAP = {
  STU: pgstudinfo,
  EXA: pgstaffinfo,
  SUV: pgstaffinfo,
  CGSADM: pgstaffinfo,
  CGSS: pgstaffinfo,
};

// Define what can be seen/returned
const allowedAttributes = {
  EXA: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image", "Affiliation", "Expertise", "Gender", "Dob", "Address", "Country", "Passport", "Honorific_Titles", "Academic_Rank", "Univ_Domain"],
  SUV: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image", "Affiliation", "Expertise", "Gender", "Dob", "Address", "Country", "Passport", "Honorific_Titles", "Academic_Rank", "Univ_Domain"],
  STU: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image", "role_level", "Gender", "Dob", "Address", "Country", "Passport", "Semester", "Acad_Year"],
  default: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image", "Gender", "Dob", "Address", "Country", "Passport", "Honorific_Titles", "Academic_Rank"]
};

const ROLE_LABELS = {
  STU: "Postgraduate Student",
  SUV: "Academic Supervisor",
  EXA: "Viva/Defense Examiner",
  CGSADM: "System Administrator",
  CGSS: "CGS Staff",
};

/* ================= GET PROFILE (me) ================= */
export const me = async (req, res) => {
  try {
    const { id, role_id } = req.user;

    const Model = ROLE_MODEL_MAP[role_id];
    if (!Model) return sendError(res, "Invalid role mapping", 400);

    const user = await Model.findByPk(id);
    if (!user) return sendError(res, "Profile not found", 404);

    const allowed = allowedAttributes[role_id] || allowedAttributes.default;
    const responseData = {};

    allowed.forEach(attr => {
      responseData[attr] = user[attr] ?? null;
    });

    // Identity metadata
    responseData.id = id;
    responseData.role_id = role_id;
    responseData.role_name = ROLE_LABELS[role_id] || role_id;
    responseData.role_level = req.user.role_level;
    responseData.stu_id = req.user.stu_id;
    responseData.emp_id = req.user.emp_id;
    responseData.name = `${user.FirstName} ${user.LastName}`;

    if (role_id === 'STU') {
      responseData.prog_code = user.Prog_Code;
      responseData.acad_year = user.Acad_Year;
      responseData.Semester = user.Semester;

      const program = await Model.sequelize.models.program_info.findByPk(user.Prog_Code);
      responseData.program_name = program ? program.prog_name : "N/A";

      if (user.Dep_Code) {
        const dept = await tbldepartments.findOne({ where: { Dep_Code: user.Dep_Code } });
        responseData.department_name = dept?.DepartmentName || "N/A";
        responseData.department_code = user.Dep_Code;
      }
    } else {
      // Staff specific department lookup from pgstaff_roles
      const staffRole = await Model.sequelize.models.pgstaff_roles.findOne({
        where: { pg_staff_id: id, role_id: role_id }
      });

      if (staffRole && staffRole.Dep_Code) {
        const dept = await tbldepartments.findOne({ where: { Dep_Code: staffRole.Dep_Code } });
        responseData.department_name = dept?.DepartmentName || "N/A";
        responseData.department_code = staffRole.Dep_Code;
      }
    }

    // Staff specific professional info (Associations)
    if (role_id !== 'STU') {
      const quals = await Model.sequelize.models.pgstaff_qualification.findAll({
        where: { pg_staff_id: id },
        include: [{ model: Model.sequelize.models.qualification, as: 'qualification' }]
      });
      responseData.qualifications = quals.map(q => ({
        code: q.qualification_code,
        name: q.qualification?.qualification_name || q.qualification_code
      }));

      const exps = await Model.sequelize.models.pgstaff_expertise.findAll({
        where: { pg_staff_id: id },
        include: [{ model: Model.sequelize.models.expertise, as: 'expertise' }]
      });
      responseData.expertises = exps.map(e => ({
        code: e.expertise_code,
        name: e.expertise?.expertise_name || e.expertise_code
      }));
    }

    return sendSuccess(res, "Profile fetched successfully", responseData);
  } catch (err) {
    console.error("[PROFILE_ME_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

const normalizeEnumValue = (value) => {
  if (value === "" || value === undefined) return null;
  return value;
};

/* ================= UPDATE PROFILE (updateMe) ================= */
export const updateProfile = async (req, res) => {
  try {
    const { id: loggedInId, role_id: loggedInRole } = req.user;

    const targetId = req.params.targetId || loggedInId;
    const targetRole = req.params.targetRole || loggedInRole;

    const isEditingSelf = loggedInId === targetId;
    const isAdmin = loggedInRole === "CGSADM";

    if (!isEditingSelf && !isAdmin) {
      return sendError(res, "Access denied", 403);
    }

    const Model = ROLE_MODEL_MAP[targetRole];
    if (!Model) return sendError(res, "Invalid role mapping", 400);

    const user = await Model.findByPk(targetId);
    if (!user) return sendError(res, "Target user not found", 404);

    const data = req.body;

    // Fields that any user can update for themselves
    const personalFields = ["Phonenumber", "Dob", "Gender", "Address", "Country", "Passport", "Profile_Image"];
    personalFields.forEach(field => {
      if (data[field] !== undefined) user[field] = data[field];
    });

    if (data.Password) {
      if (data.Password.length < 6) return sendError(res, "Password must be at least 6 characters", 400);
      user.Password = data.Password;
    }

    // Role-specific professional fields
    if (targetRole !== "STU") {
      if (data.Expertise !== undefined) user.Expertise = data.Expertise;
      if (data.Affiliation !== undefined) user.Affiliation = data.Affiliation;
      if (data.Univ_Domain !== undefined) user.Univ_Domain = data.Univ_Domain;
      if (Object.prototype.hasOwnProperty.call(data, "Honorific_Titles")) {
        user.Honorific_Titles = normalizeEnumValue(data.Honorific_Titles);
      }
      if (Object.prototype.hasOwnProperty.call(data, "Academic_Rank")) {
        user.Academic_Rank = normalizeEnumValue(data.Academic_Rank);
      }

      // Sync Junction Tables: Qualifications
      if (data.qualification_codes && Array.isArray(data.qualification_codes)) {
        const pg_staff_id = user.pgstaff_id;
        await Model.sequelize.models.pgstaff_qualification.destroy({ where: { pg_staff_id } });
        for (const code of data.qualification_codes) {
          if (code) {
            await Model.sequelize.models.pgstaff_qualification.create({ pg_staff_id, qualification_code: code });
          }
        }
      }

      // Sync Junction Tables: Expertise
      if (data.expertise_codes && Array.isArray(data.expertise_codes)) {
        const pg_staff_id = user.pgstaff_id;
        await Model.sequelize.models.pgstaff_expertise.destroy({ where: { pg_staff_id } });
        for (const code of data.expertise_codes) {
          if (code) {
            await Model.sequelize.models.pgstaff_expertise.create({ pg_staff_id, expertise_code: code });
          }
        }
      }
    }

    // Admin-only fields
    if (isAdmin) {
      if (data.FirstName) user.FirstName = data.FirstName;
      if (data.LastName) user.LastName = data.LastName;
      if (data.EmailId) user.EmailId = data.EmailId;
      if (data.Status) user.Status = data.Status;
    }

    user.updated_at = new Date();
    await user.save();

    return sendSuccess(res, "Profile successfully updated", user);
  } catch (err) {
    console.error("[UPDATE_PROFILE_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/* ================= UPLOAD PROFILE IMAGE ================= */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    if (!req.file) return sendError(res, "No file uploaded", 400);

    const { id, role_id } = req.user;

    const Model = ROLE_MODEL_MAP[role_id];
    if (!Model) return sendError(res, "Invalid role", 400);
    const user = await Model.findByPk(id);

    if (!user) return sendError(res, "User not found", 404);

    // The file path relative to the server root
    const filePath = `/uploads/profiles/${req.file.filename}`;
    user.Profile_Image = filePath;
    user.updated_at = new Date();
    await user.save();

    return sendSuccess(res, "Profile image uploaded successfully", { Profile_Image: filePath });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/* ================= DELETE PROFILE IMAGE ================= */
export const deleteProfileImage = async (req, res) => {
  try {
    if (!req.user) return sendError(res, "Unauthorized", 401);

    const { id, role_id } = req.user;

    const Model = ROLE_MODEL_MAP[role_id];
    if (!Model) return sendError(res, "Invalid role", 400);
    const user = await Model.findByPk(id);

    if (!user) return sendError(res, "User not found", 404);

    if (user.Profile_Image) {
      // Extract the filename from the path
      const filename = path.basename(user.Profile_Image);
      const filePath = path.join(process.cwd(), "uploads", "profiles", filename);

      // Delete the file if it exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      user.Profile_Image = null;
      user.updated_at = new Date();
      await user.save();
    }

    return sendSuccess(res, "Profile image deleted successfully");
  } catch (err) {
    console.error("[DELETE_PROFILE_IMAGE_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};
