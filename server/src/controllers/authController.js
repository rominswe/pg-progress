import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  cgs,
  supervisor,
  master_stu,
  examiner,
  visiting_staff,
  role
} from "../config/config.js";

import {
  signAccessToken,
  signRefreshToken,
  rotateRefreshToken
} from "../utils/token.js";

import { sendVerificationEmail } from "../utils/email.js";
import { createVerificationToken, verifyToken } from "../utils/verification.js";
import { logAuthEvent, handleLockout, recordLoginAttempt } from "../utils/authSecurity.js";
import crypto from "crypto";

/* ================= COOKIE OPTIONS ================= */
const cookieOptions = (maxAge) => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge,
    path: "/",
  };
};

/* ================= ROLE MODEL MAPPING ================= */
const ROLE_MODEL_MAP = {
  CGSADM: cgs,
  SUV: supervisor,
  STU: master_stu,
  EXA: "examiner", // special handling
  EXCGS: cgs,
};

/* ================= ACCOUNT STATUS ENFORCEMENT ================= */
const enforceAccountRules = (user) => {
  if (user.Status === "Inactive") throw new Error("Account inactive");
  // if (user.Status === "Pending") throw new Error("Account not verified");
  if (user.EndDate && new Date(user.EndDate) < new Date()) throw new Error("Account expired");
};

/* ================= LOGIN HANDLER ================= */
export const login = async (req, res) => {
  const { email, password, role_id } = req.body;

  try {
    if (!email || !password || !role_id)
      return res.status(400).json({ error: "Missing fields" });

    await handleLockout(email);

    let user = null;
    let modelUsed = null;

    // Dual-table handling for EXA
    if (role_id === "EXA") {
      user = await examiner.findOne({ where: { EmailId: email }, include: [{ model: role }] });
      if (!user) user = await visiting_staff.findOne({ where: { EmailId: email }, include: [{ model: role }] });
      modelUsed = user?.constructor?.tableName;
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (!Model) throw new Error("Invalid role");
      user = await Model.findOne({ where: { EmailId: email }, include: [{ model: role }] });
      modelUsed = Model.tableName;
    }

    if (!user) {
      await recordLoginAttempt(email);
      await logAuthEvent(email, role_id, "LOGIN_FAIL", req);
      throw new Error("Invalid Email");
    }

    if (user.role.role_id !== role_id) throw new Error("Role mismatch");
    enforceAccountRules(user);

    // Check password
    const valid = await bcrypt.compare(password, user.Password);
    if (!valid) {
      await recordLoginAttempt(email);
      await logAuthEvent(email, role_id, "LOGIN_FAIL", req);
      throw new Error("Invalid Password");
    }

    // Check if user must change temporary password
    if (user.MustChangePassword) {
      return res.status(200).json({
        message: "Login successful. You must change your temporary password.",
        userId: user[user.constructor.primaryKeyAttribute],
        table: modelUsed,
        role_id,
      });
    }

    // Save user info in session
    req.session.user = {
      id: user[user.constructor.primaryKeyAttribute],
      email: user.EmailId,
      role: user.role.role_id,
      table: modelUsed,
    };

    await logAuthEvent(email, role_id, "LOGIN_SUCCESS", req);

    res.json({
      message: "Login successful",
      user: {
        id: user[user.constructor.primaryKeyAttribute],
        name: `${user.FirstName} ${user.LastName}`,
        role: user.role.role_id,
      },
    });
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
};

/* ================= REGISTRATION ================= */
export const register = async (req, res) => {
  const { role_id, email, ...data } = req.body;

  try {
    if (!role_id || !email) return res.status(400).json({ error: "Missing fields" });

    let Model;
    if (role_id === "EXA" && data.isExternal) {
      Model = visiting_staff;
    } else {
      Model = ROLE_MODEL_MAP[role_id];
    }
    if (!Model) return res.status(400).json({ error: "Invalid role" });

    const existing = await Model.findOne({ where: { EmailId: email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    // Generate temporary password
    const tempPassword = crypto.randomBytes(6).toString("hex"); // 12 chars
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user
    const user = await Model.create({
      EmailId: email,
      Password: hashedPassword,
      ...data,
      role_id,
      Status: "Pending",
      IsVerified: 0,
      MustChangePassword: true, // temporary password flag
    });

    // Create verification token
    const token = await createVerificationToken(user.constructor.tableName, user[Model.primaryKeyAttribute]);

    // Send email with temp password and verification link
    await sendVerificationEmail(user, token, tempPassword, role_id);

    await logAuthEvent(email, role_id, "REGISTER");

    res.status(201).json({
      message: "User registered successfully. Temporary password sent via email.",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================= VERIFY ACCOUNT ================= */
export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ error: "Invalid verification token" });

    // Verify token and get associated record
    const record = await verifyToken(token);
    if (!record) return res.status(400).json({ error: "Invalid or expired token" });

    // Determine the model
    let Model;
    if (record.user_table === "examiner") {
      Model = examiner;
    } else if (record.user_table === "visiting_staff") {
      Model = visiting_staff;
    } else {
      Model = ROLE_MODEL_MAP[record.role_id];
    }

    // Fetch the user
    const user = await Model.findByPk(record.user_id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Activate user account
    user.IsVerified = 1;
    user.Status = "Active";
    await user.save();

    // Delete the used verification token
    await record.destroy();

    // Log verification event
    await logAuthEvent(user.EmailId, user.role_id, "VERIFY");

    // Respond with message including temp password info
    res.json({ 
      message: "Account verified successfully. You can now log in using the temporary password sent via email." 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* ================= /ME GET ================= */
export const me = async (req, res) => {
  if (!req.session?.user) return res.status(401).json({ error: "Unauthorized" });

  const { id, role: role_id, table } = req.session.user;
  let Model;

  if (table === "examiner") Model = examiner;
  else if (table === "visiting_staff") Model = visiting_staff;
  else {
    const ROLE_MODEL_MAP = { CGSADM: cgs, SUV: supervisor, STU: master_stu, EXCGS: cgs };
    Model = ROLE_MODEL_MAP[role_id];
  }

  const user = await Model.findByPk(id);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ id: user.id, email: user.EmailId, role: user.role_id });
};

/* ================= /ME UPDATE ================= */
export const updateMe = async (req, res) => {
  const { id: userId, table, role_id } = req.session.user;
  const { Password, Phonenumber, Profile_Image } = req.body;

  let Model;
  if (table === "examiner") {
    Model = examiner;
  } else if (table === "visiting_staff") {
    Model = visiting_staff;
  } else {
    Model = ROLE_MODEL_MAP[role_id];
  }

  const user = await Model.findByPk(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Update password if provided
  if (Password) {
    user.Password = await bcrypt.hash(Password, 10);
    user.MustChangePassword = false; // ✅ Clear temporary password flag
  }

  if (Phonenumber) user.Phonenumber = Phonenumber;
  if (Profile_Image) user.Profile_Image = Profile_Image;

  await user.save();
  await logAuthEvent(user.EmailId, role_id, "UPDATE_PROFILE");

  res.json({ message: "Profile updated successfully" });
};

/* ================= REFRESH TOKEN ================= */
export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "Logged out" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccess = signAccessToken(decoded);
    const newRefresh = await rotateRefreshToken(decoded); // rotation

    res
      .cookie("accessToken", newAccess, cookieOptions(60 * 60 * 1000))
      .cookie("refreshToken", newRefresh, cookieOptions(7 * 24 * 60 * 60 * 1000))
      .json({ ok: true });

    await logAuthEvent(decoded.email, decoded.role_id, "REFRESH_TOKEN");
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: "Logout failed" });
    res.clearCookie("sid").json({ message: "Logout successful" });
  });
};