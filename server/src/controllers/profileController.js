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
    response.id = id; // Ensure ID is sent
    response.name = `${user.FirstName} ${user.LastName}`;

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
    if (Expertise) user.Expertise = Expertise;
    if (Affiliation) user.Affiliation = Affiliation;

    await user.save({ hooks: true });
    await logAuthEvent(user.EmailId, role_id, "UPDATE_PROFILE");

    return sendSuccess(res, "Profile updated successfully", response);
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};