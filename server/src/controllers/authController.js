import bcrypt from "bcryptjs";
import {
  cgs,
  supervisor,
  master_stu,
  examiner,
  visiting_staff,
  role
} from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { verifyActivationToken } from "../utils/activationToken.js";
/* ================= ROLE MODEL MAPPING ================= */
const ROLE_MODEL_MAP = {
  CGSADM: cgs,
  SUV: supervisor,
  STU: master_stu,
  CGSS: cgs,
  EXA: examiner
};

/* ================= ACCOUNT STATUS ENFORCEMENT ================= */
const enforceAccountRules = (user) => {
  if (user.Status === "Inactive") throw new Error("Account inactive");
  if (user.Status === "Pending") throw new Error("Account not verified");
  if (user.EndDate && new Date(user.EndDate) < new Date())
    throw new Error("Account expired");
};

/* ================= LOGIN HANDLER ================= */
export const login = async (req, res) => {
  const { email, password, role_id } = req.body;

  if (!email || !password || !role_id)
    return res.status(400).json({ error: "Missing fields" });

  try {
    let user = null;
    let modelUsed = null;

    if (role_id === "EXA") {
      // Internal EXA
      user = await examiner.findOne({ where: { EmailId: email }, include: [{ model: role }] });
      modelUsed = "examiner";
      // External EXA
      if (!user) {
        user = await visiting_staff.findOne({ where: { EmailId: email }, include: [{ model: role }] });
        modelUsed = "visiting_staff";
      }
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (!Model) throw new Error("Invalid role");
      user = await Model.findOne({ where: { EmailId: email }, include: [{ model: role }] });
      modelUsed = Model.tableName;
    }

    if (!user) {
      throw new Error("Invalid Email");
    }

    if (!user.role || user.role.role_id !== role_id)
      throw new Error("Role mismatch");

    if (!user.IsVerified || user.Status !== "Active") {
      const tempToken = generateActivationToken(user[user.constructor.primaryKeyAttribute]);
      await sendVerificationSafe(user, tempToken, user.Password, user.role.role_id);

      return res.status(403).json({
        message: "Account not verified. Activation email resent."
      });
    }

    enforceAccountRules(user);

    const valid = await bcrypt.compare(password, user.Password);
    if (!valid) {
      throw new Error("Invalid Password");
    }

    // Save user info in session
    req.session.user = {
      id: user[user.constructor.primaryKeyAttribute],
      email: user.EmailId,
      role_id: user.role.role_id,
      table: modelUsed,
      Status: user.Status,
      MustChangePassword: user.MustChangePassword,
    };

    // Temporary password check
    if (user.MustChangePassword) {
      return sendSuccess(res, "Please update your temporary password", {
        mustChangePassword: true,
        redirectUrl: "/api/profile/me" // Updated to a frontend-friendly route
      });
    }

    return sendSuccess(res, "Login successful", req.session.user);
  } catch (err) {
    console.error("[LOGIN_ERROR]", err);
    // Return 401 for known auth errors, 500 for others
    const status = err.message.includes("Invalid") || err.message.includes("mismatch") ? 401 : 500;
    return sendError(res, err.message, status);
  }
};

/* ================= VERIFY ACCOUNT ================= */
export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Token required" });

    const userId = verifyActivationToken(token);

    // Find user by ID
    let user = await master_stu.findByPk(userId)
      || await cgs.findByPk(userId)
      || await examiner.findByPk(userId)
      || await visiting_staff.findByPk(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    // Activate account
    user.IsVerified = 1;
    user.Status = "Active";
    user.MustChangePassword = 1; // force password update
    await user.save();

    return res.json({ message: "Account verified. Please log in." });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("sid").json({ message: "Logout successful" });
  });
};