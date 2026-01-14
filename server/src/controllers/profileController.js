import { cgs, supervisor, master_stu, examiner, visiting_staff } from "../config/config.js";
import { logAuthEvent } from "../utils/authSecurity.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
// Map role_id to model
const ROLE_MODEL_MAP = {
  CGSADM: cgs,
  SUV: supervisor,
  STU: master_stu,
  CGSS: cgs,
  EXA: examiner // For EXA we will handle visiting_staff separately
};

// Allowed attributes per role
const allowedAttributes = {
  EXA: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image", "Affiliation", "Expertise"],
  default: ["FirstName", "LastName", "EmailId", "Phonenumber", "Status", "Profile_Image"]
};

// Helper to get EXA user across tables
const getExaModel = async (userId) => {
  let user = await examiner.findByPk(userId);
  if (!user) user = await visiting_staff.findByPk(userId);
  return user;
};

/* ================= GET PROFILE ================= */
export const me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });

    const { id, role_id } = req.user;

    let user;
    if (role_id === "EXA") {
      user = await getExaModel(id);
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (!Model) return res.status(400).json({ message: "Invalid role", data: null });
      user = await Model.findByPk(id);
    }

    if (!user) return res.status(404).json({ message: "User not found", data: null });

    const allowed = allowedAttributes[role_id] || allowedAttributes.default;
    const response = {};
    for (const attr of allowed) {
      response[attr] = user[attr] ?? null;
    }

    response.role_id = role_id;
    response.id = id; // Primary Key

    // Set specialized ID based on role
    if (role_id === "STU") {
      response.university_id = user.stu_id;
    } else if (role_id === "SUV") {
      response.university_id = user.sup_id || user.emp_id;
    } else if (role_id === "CGSADM" || role_id === "CGSS") {
      response.university_id = user.cgs_id || user.emp_id;
    } else if (role_id === "EXA") {
      response.university_id = user.examiner_id || user.emp_id || id;
    } else {
      response.university_id = id;
    }

    response.name = `${user.FirstName} ${user.LastName}`;
    response.FirstName = user.FirstName;
    response.LastName = user.LastName;
    response.mustChangePassword = !!user.MustChangePassword;

    return sendSuccess(res, "Profile fetched successfully", response);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/* ================= UPDATE PROFILE ================= */
export const updateMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", data: null });

    const { id, role_id } = req.user;
    const { Password, Phonenumber, Profile_Image, Expertise, Affiliation } = req.body;

    let user;
    if (role_id === "EXA") {
      user = await getExaModel(id);
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (!Model) return res.status(400).json({ message: "Invalid role", data: null });
      user = await Model.findByPk(id);
    }

    if (!user) return res.status(404).json({ message: "User not found", data: null });

    // Update allowed fields
    if (Password) {
      if (Password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters", data: null });
      user.Password = Password;
      user.MustChangePassword = false;
    }
    if (Phonenumber) user.Phonenumber = Phonenumber;
    if (Profile_Image) user.Profile_Image = Profile_Image;

    // Expertise/Affiliation only exist for visiting_staff (some EXA)
    if (Expertise && user.Expertise !== undefined) user.Expertise = Expertise;
    if (Affiliation && user.Affiliation !== undefined) user.Affiliation = Affiliation;

    await user.save({ hooks: true });
    await logAuthEvent(user.EmailId, role_id, "UPDATE_PROFILE");

    const response = {
      FirstName: user.FirstName,
      LastName: user.LastName,
      EmailId: user.EmailId,
      Phonenumber: user.Phonenumber,
      Profile_Image: user.Profile_Image,
      Affiliation: user.Affiliation,
      Expertise: user.Expertise,
      Status: user.Status,
      role_id: role_id,
      university_id: role_id === "STU" ? user.stu_id : (role_id === "SUV" ? (user.sup_id || user.emp_id) : (user.examiner_id || user.cgs_id || user.emp_id || id))
    };

    return sendSuccess(res, "Profile updated successfully", response);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

/* ================= UPLOAD PROFILE IMAGE ================= */
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { id, role_id } = req.user;

    let user;
    if (role_id === "EXA") {
      user = await getExaModel(id);
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (!Model) return res.status(400).json({ message: "Invalid role" });
      user = await Model.findByPk(id);
    }

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