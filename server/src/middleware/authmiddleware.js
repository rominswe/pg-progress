import { sendError } from "../utils/responseHandler.js";
import {
  pgstaffinfo,
  pgstaff_roles,
  pgstudinfo,
} from "../config/config.js";

/* ================= AUTH PROTECTION MIDDLEWARE ================= */
export const protect = async (req, res, next) => {
  const sessionUser = req.session?.user;

  /* ---------- No session ---------- */
  if (!sessionUser) {
    console.warn(`[AUTH_BLOCKED] ${req.method} ${req.path} - No session`);
    return sendError(res, "Unauthorized. Please log in.", 401);
  }

  /* ---------- Session integrity guard ---------- */
  if (!sessionUser.id || !sessionUser.role_id || !sessionUser.email) {
    console.error("[AUTH_CORRUPT_SESSION]", sessionUser);
    return sendError(res, "Session invalid. Please log in again.", 401);
  }

  // Destructure sessionUser to get variables used below
  const { id, role_id, email: sessionEmail } = sessionUser;

  try {
    let dbUser;
    let roleRecord;

    if (role_id === "STU") {
      // Fetch student
      dbUser = await pgstudinfo.findByPk(id);
      if (!dbUser) {
        req.session.destroy(() => { });
        return sendError(res, "User no longer exists. Please re-login.", 401);
      }
    } else {
      // Fetch staff
      dbUser = await pgstaffinfo.findByPk(id);
      if (!dbUser) {
        req.session.destroy(() => { });
        return sendError(res, "User no longer exists. Please re-login.", 401);
      }

      // Re-validate role in pgstaff_roles
      roleRecord = await pgstaff_roles.findOne({
        where: { pg_staff_id: id, role_id }
      });

      if (!roleRecord) {
        req.session.destroy(() => { });
        return sendError(res, "Your role was removed. Please re-login.", 401);
      }
    }

    // Optional: check if email changed
    if (dbUser.EmailId !== sessionEmail) {
      req.session.destroy(() => { });
      return sendError(res, "Email changed. Please re-login.", 401);
    }

    /* ---------- Normalize session → request ---------- */
    req.user = {
      /* Shared identity */
      id,            // pgstud_id OR pg_staff_id
      email: sessionUser.email,
      name: sessionUser.name,
      role_id,  // STU / EXA / SUV / CGSADM / CGSS
      role_level: role_id === "STU" ? dbUser.role_level : roleRecord.role_level,

      /* Identity classification */
      isStudent: role_id === "STU",
      isStaff: role_id !== "STU",

      /* Safe identifier mapping */
      stu_id: role_id === "STU" ? dbUser.stu_id : null,
      emp_id: role_id !== "STU" ? dbUser.emp_id : null,

      /* Staff-only metadata */
      employment_type: roleRecord?.employment_type || null,

      /* Internal use only (never expose in API responses) */
      _table: role_id === "STU" ? "pgstudinfo" : "pgstaffinfo"
    };

    console.log(
      `[AUTH_ACTIVE] role=${req.user.role_id} id=${req.user.id}`
    );

    next();
  } catch (err) {
    console.error("[PROTECT_ERROR]", err);
    return sendError(res, "Authorization failed", 500);
  }
};

/* ================= ROLE-BASED ACCESS CONTROL ================= */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return sendError(res, "Unauthorized", 401);
      }

      if (!allowedRoles.includes(req.user.role_id)) {
        return sendError(
          res,
          "Access forbidden: insufficient permissions.",
          403
        );
      }

      next();
    } catch (err) {
      console.error("[RESTRICT_TO_ERROR]", err);
      return sendError(res, "Authorization failed", 500);
    }
  };
};

/* ================= HIERARCHICAL ACCESS CONTROL ================= */
export const allowAdminOrDirector = (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }

    const { role_id, role_level } = req.user;

    const isAdmin = role_id === "CGSADM";
    const isDirector = role_id === "CGSS" && role_level === "Director";

    if (isAdmin || isDirector) {
      return next();
    }

    return sendError(
      res,
      "Access denied. Requires Admin or Director privileges.",
      403
    );
  } catch (err) {
    console.error("[ALLOW_ADMIN_OR_DIRECTOR_ERROR]", err);
    return sendError(res, "Authorization failed", 500);
  }
};