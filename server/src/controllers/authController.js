import bcrypt from "bcryptjs";
import {
  cgs,
  supervisor,
  master_stu,
  examiner,
  visiting_staff,
  role
} from "../config/config.js";

import { sendVerificationEmail } from "../utils/email.js";
import { createVerificationToken, verifyToken, getUserTokens } from "../utils/verification.js";
import { logAuthEvent, handleLockout, recordLoginAttempt } from "../utils/authSecurity.js";
import { AUDIT_ACTIONS, AUDIT_STATUS } from "../utils/audit.js";
import crypto from "crypto";

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
  if (user.IsVerified === 0 || user.IsVerified === false) throw new Error("Account not verified. Please check your email for verification instructions.");
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
      await logAuthEvent(email, role_id, AUDIT_ACTIONS.LOGIN_FAILED, req, AUDIT_STATUS.FAILURE, "User not found");
      throw new Error("Invalid credentials");
    }

    if (user.role.role_id !== role_id) throw new Error("Role mismatch");

    enforceAccountRules(user);

    // Check password
    const valid = await bcrypt.compare(password, user.Password);
    if (!valid) {
      await recordLoginAttempt(email);
      await logAuthEvent(email, role_id, AUDIT_ACTIONS.LOGIN_FAILED, req, AUDIT_STATUS.FAILURE, "Invalid password");
      return res.status(401).json({ error: "Invalid credentials" });
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

    // Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
        return res.status(500).json({ error: "Session creation failed" });
      }

      // Store user in new session
      req.session.user = {
        userId: user[user.constructor.primaryKeyAttribute],
        role_id: user.role.role_id,
        table: modelUsed,
        email: user.EmailId,
      };

      // Log successful login
      logAuthEvent(email, role_id, AUDIT_ACTIONS.LOGIN, req, AUDIT_STATUS.SUCCESS);

      res.json({
        role: user.role.role_name,
        user: {
          id: req.session.user.userId,
          name: `${user.FirstName} ${user.LastName}`,
        },
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    // Return appropriate status codes based on error type
    if (err.message.includes('Invalid credentials') || err.message.includes('Account inactive') ||
        err.message.includes('Account expired') || err.message.includes('Role mismatch')) {
      return res.status(401).json({ error: err.message });
    }
    if (err.message.includes('Account not verified') || err.message.includes('Account pending')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal server error' });
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

    await logAuthEvent(email, role_id, AUDIT_ACTIONS.USER_CREATED, req, AUDIT_STATUS.SUCCESS, "User registration completed");

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
    if (!token) {
      return res.status(400).json({
        error: "Verification token is required",
        code: "MISSING_TOKEN"
      });
    }

    // Verify token
    const tokenResult = await verifyToken(token);

    if (!tokenResult.valid) {
      const errorMessages = {
        'TOKEN_NOT_FOUND': 'Invalid verification token',
        'TOKEN_EXPIRED': 'Verification token has expired',
        'VERIFICATION_ERROR': 'Token verification failed'
      };

      return res.status(400).json({
        error: errorMessages[tokenResult.error] || 'Invalid verification token',
        code: tokenResult.error
      });
    }

    // Determine the model
    const Model =
      tokenResult.user_table === "examiner"
        ? examiner
        : tokenResult.user_table === "visiting_staff"
        ? visiting_staff
        : ROLE_MODEL_MAP[tokenResult.role_id];

    if (!Model) {
      return res.status(400).json({
        error: "Invalid user type",
        code: "INVALID_USER_TYPE"
      });
    }

    // Fetch the user
    const user = await Model.findByPk(tokenResult.user_id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Check if already verified
    if (user.IsVerified === 1 || user.IsVerified === true) {
      return res.status(200).json({
        message: "Account already verified. You can now log in.",
        code: "ALREADY_VERIFIED"
      });
    }

    // Activate user account
    user.IsVerified = 1;
    user.Status = "Active";
    await user.save();

    // Log verification event
    await logAuthEvent(user.EmailId, tokenResult.role_id, AUDIT_ACTIONS.ACCOUNT_VERIFICATION, req, AUDIT_STATUS.SUCCESS);

    // Respond with success message
    res.json({
      message: "Account verified successfully! You can now log in using the temporary password sent to your email.",
      code: "VERIFICATION_SUCCESS",
      nextStep: "LOGIN"
    });

  } catch (err) {
    console.error('Account verification error:', err);
    res.status(500).json({
      error: "Account verification failed",
      code: "VERIFICATION_FAILED"
    });
  }
};

/* ================= RESEND VERIFICATION EMAIL ================= */
export const resendVerification = async (req, res) => {
  try {
    const { email, role_id } = req.body;

    if (!email || !role_id) {
      return res.status(400).json({
        error: "Email and role are required",
        code: "MISSING_FIELDS"
      });
    }

    let user = null;
    let modelUsed = null;

    // Find user by email and role
    if (role_id === "EXA") {
      user = await examiner.findOne({ where: { EmailId: email } });
      if (!user) user = await visiting_staff.findOne({ where: { EmailId: email } });
      modelUsed = user?.constructor?.tableName;
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (!Model) {
        return res.status(400).json({
          error: "Invalid role",
          code: "INVALID_ROLE"
        });
      }
      user = await Model.findOne({ where: { EmailId: email } });
      modelUsed = Model.tableName;
    }

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Check if already verified
    if (user.IsVerified === 1 || user.IsVerified === true) {
      return res.status(200).json({
        message: "Account already verified. You can log in.",
        code: "ALREADY_VERIFIED"
      });
    }

    // Check for existing tokens and clean them up
    const existingTokens = await getUserTokens(modelUsed, user[user.constructor.primaryKeyAttribute]);
    if (existingTokens.length > 0) {
      // Check if last token was sent recently (prevent spam)
      const lastToken = existingTokens[0];
      const timeSinceLastToken = Date.now() - new Date(lastToken.createdAt).getTime();
      const RESEND_COOLDOWN = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastToken < RESEND_COOLDOWN) {
        const remainingTime = Math.ceil((RESEND_COOLDOWN - timeSinceLastToken) / 60000);
        return res.status(429).json({
          error: `Please wait ${remainingTime} minutes before requesting another verification email`,
          code: "COOLDOWN_ACTIVE",
          remainingMinutes: remainingTime
        });
      }
    }

    // Create new verification token
    const token = await createVerificationToken(modelUsed, user[user.constructor.primaryKeyAttribute], role_id);

    // Generate temporary password (in case they lost the original)
    const tempPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user with new temporary password
    user.Password = hashedPassword;
    user.MustChangePassword = true;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user, token, tempPassword, role_id);

    // Log resend event
    await logAuthEvent(email, role_id, AUDIT_ACTIONS.ACCOUNT_VERIFICATION, req, AUDIT_STATUS.SUCCESS, "Verification email resent");

    res.json({
      message: "Verification email sent successfully. Please check your email.",
      code: "RESEND_SUCCESS"
    });

  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({
      error: "Failed to resend verification email",
      code: "RESEND_FAILED"
    });
  }
};
export const checkVerificationStatus = async (req, res) => {
  try {
    const { email, role_id } = req.body;

    if (!email || !role_id) {
      return res.status(400).json({
        error: "Email and role are required",
        code: "MISSING_FIELDS"
      });
    }

    let user = null;

    // Find user by email and role
    if (role_id === "EXA") {
      user = await examiner.findOne({ where: { EmailId: email } });
      if (!user) user = await visiting_staff.findOne({ where: { EmailId: email } });
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (!Model) {
        return res.status(400).json({
          error: "Invalid role",
          code: "INVALID_ROLE"
        });
      }
      user = await Model.findOne({ where: { EmailId: email } });
    }

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    const isVerified = user.IsVerified === 1 || user.IsVerified === true;

    res.json({
      email: user.EmailId,
      role: role_id,
      isVerified,
      code: isVerified ? "VERIFIED" : "NOT_VERIFIED"
    });

  } catch (err) {
    console.error('Check verification status error:', err);
    res.status(500).json({
      error: "Failed to check verification status",
      code: "CHECK_FAILED"
    });
  }
};
export const me = async (req, res) => {
  const { userId, table, role_id } = req.user;

  const Model =
    table === "examiner"
      ? examiner
      : table === "visiting_staff"
      ? visiting_staff
      : ROLE_MODEL_MAP[role_id];

  const user = await Model.findByPk(userId, { include: [{ model: role }] });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
};

/* ================= /ME UPDATE ================= */
export const updateMe = async (req, res) => {
  const { userId, table, role_id } = req.user;
  const { Password, Phonenumber, Profile_Image } = req.body;

  const Model =
    table === "examiner"
      ? examiner
      : table === "visiting_staff"
      ? visiting_staff
      : ROLE_MODEL_MAP[role_id];

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
  await logAuthEvent(user.EmailId, role_id, AUDIT_ACTIONS.USER_UPDATED, req, AUDIT_STATUS.SUCCESS, "Profile updated");

  res.json({ message: "Profile updated successfully" });
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    const sessionId = req.session.id;
    const userEmail = req.session.user?.email;
    const userRole = req.session.user?.role_id;

    // Destroy session in Redis
    req.session.destroy(async (err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }

      // Clear the session cookie
      res.clearCookie('sessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });

      // Log logout event if user was logged in
      if (userEmail && userRole) {
        await logAuthEvent(userEmail, userRole, AUDIT_ACTIONS.LOGOUT, req, AUDIT_STATUS.SUCCESS);
      }

      res.json({ message: 'Logout successful' });
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
};

/* ================= SESSION VALIDATION ================= */
export const validateSession = async (req, res) => {
  try {
    // Check if session exists
    if (!req.session.user) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    // Re-validate user exists and is active
    let user;
    const tableName = req.session.user.table.toLowerCase();

    if (tableName === "examiner") {
      user = await examiner.findByPk(req.session.user.userId);
      if (!user) {
        user = await visiting_staff.findByPk(req.session.user.userId);
      }
    } else {
      const Model = ROLE_MODEL_MAP[req.session.user.role_id];
      if (!Model) {
        req.session.destroy();
        return res.status(401).json({ error: 'Invalid session' });
      }
      user = await Model.findByPk(req.session.user.userId);
    }

    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }

    // Check account status
    if (user.Status === "Inactive") {
      req.session.destroy();
      return res.status(401).json({ error: 'Account inactive' });
    }

    if (user.EndDate && new Date(user.EndDate) < new Date()) {
      req.session.destroy();
      return res.status(401).json({ error: 'Account expired' });
    }

    res.json({
      valid: true,
      user: {
        id: user[user.constructor.primaryKeyAttribute],
        email: user.EmailId,
        role: user.role_id,
        name: `${user.FirstName} ${user.LastName}`
      }
    });
  } catch (err) {
    console.error('Session validation error:', err);
    req.session.destroy();
    res.status(500).json({ error: 'Session validation failed' });
  }
};