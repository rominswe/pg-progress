import bcrypt from "bcryptjs";
import {
  pgstaffinfo,
  pgstaff_roles,
  pgstudinfo,
} from "../config/config.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
/* ================= ROLE MODEL MAPPING ================= */
const ROLE_MODEL_MAP = {
  STU: pgstudinfo,
  EXA: pgstaffinfo,
  SUV: pgstaffinfo,
  CGSADM: pgstaffinfo,
  CGSS: pgstaffinfo,
};

/* ================= AUTHENTICATION ================= */
const authenticateUser = async (email, password, role_id) => {
  const Model = ROLE_MODEL_MAP[role_id];
  if (!Model) throw new Error("Invalid role selection");

  const user = await Model.findOne({ where: { EmailId: email } });
  if (!user) throw new Error("Invalid Email");

  const valid = await bcrypt.compare(password, user.Password);
  if (!valid) throw new Error("Invalid Password");

  return user;
};

/* ================= AUTHORIZATION ================= */
const authorizeRole = async (user, role_id) => {
  if (role_id === "STU") {
    return {
      role_id: "STU",
      role_level: user.role_level,
    };
  }

  const roleRecord = await pgstaff_roles.findOne({
    where: {
      pg_staff_id: user.pg_staff_id,
      role_id,
    },
  });

  if (!roleRecord)
    throw new Error("You are not authorized for this role");

  return {
    role_id,
    role_level: roleRecord.role_level,
    employment_type: roleRecord.employment_type,
  };
};


/* ================= ACCOUNT STATUS ENFORCEMENT ================= */
const enforceAccountState = (user) => {
  if (user.Status === "Inactive")
    throw new Error("Account deactivated. Please contact Admin.");

  if (user.EndDate && new Date(user.EndDate) < new Date())
    throw new Error("Account expired");

  if (!user.IsVerified)
    throw new Error("Account not verified.");
};

/* ================= LOGIN HANDLER ================= */
export const login = async (req, res) => {
  const { email, password, role_id: requestedRole } = req.body;

  if (!email || !password || !requestedRole)
    return sendError(res, "Missing fields", 400);

  try {
    const user = await authenticateUser(email, password, requestedRole);

    if (user.Status === "Pending" && (user.IsVerified === 0 || !user.IsVerified)) {
      user.IsVerified = 1;
      user.Status = "Active";
      await user.save();
      await user.reload();
    }

    enforceAccountState(user);

    const auth = await authorizeRole(user, requestedRole);

    const sessionUser = {
      email: user.EmailId,
      name: `${user.FirstName} ${user.LastName}`,
      role_id: requestedRole,
      role_level: auth.role_level,
      employment_type: auth.employment_type || null,
      table: ROLE_MODEL_MAP[requestedRole].tableName
    };

    if (requestedRole === "STU") {
      sessionUser.id = user.pgstud_id;
      sessionUser.stu_id = user.stu_id;
    } else {
      sessionUser.id = user.pg_staff_id;
      sessionUser.emp_id = user.emp_id;
    }

    req.session.user = sessionUser;

    return sendSuccess(res, "Login successful", req.session.user);
  } catch (err) {
    console.error("[LOGIN_ERROR]", err);
    const status = err.message.includes("Invalid") || err.message.includes("mismatch") ? 401 : 500;
    return sendError(res, err.message, status);
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) return sendError(res, "Logout failed", 500);
    res.clearCookie("sid");
    return sendSuccess(res, "Logout successful");
  });
};