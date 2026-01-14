import bcrypt from "bcryptjs";
import {
  cgs,
  supervisor,
  master_stu,
  examiner,
  visiting_staff,
  role
} from "../config/config.js";
import { verifyToken } from "../utils/verification.js";
import { logAuthEvent, handleLockout, recordLoginAttempt } from "../utils/authSecurity.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
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
    await handleLockout(email);

    let user = null;
    let modelUsed = null;

    if (role_id === "EXA") {
      // Internal EXA
      user = await examiner.findOne({ where: { EmailId: email }, include: [{ model: role, as: 'role' }] });
      modelUsed = "examiner";
      // External EXA
      if (!user) {
        user = await visiting_staff.findOne({ where: { EmailId: email }, include: [{ model: role, as: 'role' }] });
        modelUsed = "visiting_staff";
      }
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (!Model) throw new Error("Invalid role");
      user = await Model.findOne({ where: { EmailId: email }, include: [{ model: role, as: 'role' }] });
      modelUsed = Model.tableName;
    }

    if (!user) {
      await recordLoginAttempt(email);
      await logAuthEvent(email, role_id, "LOGIN_FAIL", req, { table: modelUsed });
      throw new Error("Invalid Email");
    }

    if (!user.role || user.role.role_id !== role_id)
      throw new Error("Role mismatch");


    enforceAccountRules(user);

    const valid = await bcrypt.compare(password, user.Password);
    if (!valid) {
      await recordLoginAttempt(email);
      await logAuthEvent(email, role_id, "LOGIN_FAIL", req, { table: modelUsed });
      throw new Error("Invalid Password");
    }

    // Save user info in session
    req.session.user = {
      id: user[user.constructor.primaryKeyAttribute],
      email: user.EmailId,
      role_id: user.role.role_id,
      table: modelUsed,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Status: user.Status,
      MustChangePassword: user.MustChangePassword,
    };

    await logAuthEvent(email, role_id, "LOGIN_SUCCESS", req, { table: modelUsed });

    // Temporary password check
    if (user.MustChangePassword) {
      return sendSuccess(res, "Please update your temporary password", {
        mustChangePassword: true,
        redirectUrl: "/examiner/dashboard",
        user: req.session.user
      });
    }

    return sendSuccess(res, "Login successful", req.session.user);
  } catch (err) {
    console.error("❌ Login Error:", err);
    return sendError(res, err.message, 403);
  }
};

/* ================= VERIFY ACCOUNT ================= */
export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Invalid verification token" });

    const record = await verifyToken(token);
    if (!record) return res.status(400).json({ error: "Invalid or expired token" });

    let Model;
    if (record.user_table === "examiner") Model = examiner;
    else if (record.user_table === "visiting_staff") Model = visiting_staff;
    else Model = ROLE_MODEL_MAP[record.role_id];

    const user = await Model.findByPk(record.user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Activate user
    user.IsVerified = 1;
    user.Status = "Active";
    await user.save();

    await record.destroy();
    await logAuthEvent(
      user.EmailId,
      user.role_id,
      "VERIFY",
      req,
      { table: Model.tableName }
    );

    res.json({
      message: "Account verified successfully. You can now log in using your credentials.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("sid").json({ message: "Logout successful" });
  });
};