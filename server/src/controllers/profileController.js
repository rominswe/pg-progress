import { pgstaffinfo, pgstudinfo, tbldepartments } from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

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
  EXA: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image", "Affiliation", "Expertise"],
  STU: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image", "role_level"],
  default: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image"]
};

/* ================= GET PROFILE (me) ================= */
export const me = async (req, res) => {
  try {
    // req.user is populated by protect middleware
    const { id, role_id } = req.user;

    // Use the model mapping to find the user in the correct table
    const Model = ROLE_MODEL_MAP[role_id];
    if (!Model) return sendError(res, "Invalid role mapping", 400);

    const user = await Model.findByPk(id);
    if (!user) return sendError(res, "Profile not found", 404);

    // Filter attributes based on role permissions
    const allowed = allowedAttributes[role_id] || allowedAttributes.default;
    const responseData = {};

    allowed.forEach(attr => {
      responseData[attr] = user[attr] ?? null;
    });

    // Attach identity metadata
    responseData.id = id;
    responseData.role_id = role_id;
    responseData.role_level = req.user.role_level;
    responseData.stu_id = req.user.stu_id;
    responseData.emp_id = req.user.emp_id;
    responseData.name = `${user.FirstName} ${user.LastName}`; // Standardize name access

    // Fetch Department info if Dep_Code exists
    if (user.Dep_Code) {
      const dept = await tbldepartments.findOne({ where: { Dep_Code: user.Dep_Code } });
      responseData.department_name = dept?.DepartmentName || "N/A";
      responseData.department_code = user.Dep_Code;
    }

    return sendSuccess(res, "Profile fetched successfully", responseData);
  } catch (err) {
    console.error("[PROFILE_ME_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/* ================= UPDATE PROFILE (updateMe) ================= */
export const updateProfile = async (req, res) => {
  try {
    const { id: loggedInId, role_id: loggedInRole } = req.user; // Session-derived role

    // Determine the target user (self or another user)
    const targetId = req.params.targetId || loggedInId;
    const targetRole = req.params.targetRole || loggedInRole;

    // SECURITY: Only allow editing others if logged-in user is CGSADM
    const isEditingSelf = loggedInId === targetId;
    const isAdmin = loggedInRole === "CGSADM";

    if (!isEditingSelf && !isAdmin) {
      return sendError(res, "Access denied. Only admins can edit other users.", 403);
    }

    // Get the correct model
    const Model = ROLE_MODEL_MAP[targetRole];
    if (!Model) return sendError(res, "Invalid role mapping", 400);

    const user = await Model.findByPk(targetId);
    if (!user) return sendError(res, "Target user not found", 404);

    const data = req.body;

    /* --- 1. Fields anyone can update on self --- */
    if (data.Phonenumber) user.Phonenumber = data.Phonenumber;
    if (data.Profile_Image) user.Profile_Image = data.Profile_Image;

    if (data.Password) {
      if (data.Password.length < 6) return sendError(res, "Password must be >= 6 chars", 400);
      user.Password = data.Password; // Ensure bcrypt hook exists
    }

    /* --- 2. Admin-only fields (editable for self if admin or editing others) --- */
    if (isAdmin) {
      if (data.FirstName) user.FirstName = data.FirstName;
      if (data.LastName) user.LastName = data.LastName;
      if (data.EmailId) user.EmailId = data.EmailId;
      if (data.Status) user.Status = data.Status;
    }

    /* --- 3. Role-specific fields (staff only) --- */
    if (targetRole !== "STU") {
      if (data.Expertise) user.Expertise = data.Expertise;
      if (data.Affiliation) user.Affiliation = data.Affiliation;
    }

    await user.save();

    return sendSuccess(res, "Profile successfully updated");
  } catch (err) {
    console.error("[UPDATE_PROFILE_ERROR]", err);
    return sendError(res, err.message, 500);
  }
};

/* ================= UPLOAD PROFILE IMAGE ================= */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { id, role_id } = req.user;

    const Model = ROLE_MODEL_MAP[role_id];
    if (!Model) return res.status(400).json({ message: "Invalid role" });
    const user = await Model.findByPk(id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // The file path relative to the server root
    const filePath = `/uploads/profiles/${req.file.filename}`;
    user.Profile_Image = filePath;
    await user.save();

    return sendSuccess(res, "Profile image uploaded successfully", { Profile_Image: filePath });
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};