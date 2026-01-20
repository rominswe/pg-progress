import AuthService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { sign } from "cookie-signature";

/* ================= LOGIN HANDLER ================= */
export const login = async (req, res) => {
  const { email, password, role_id: requestedRole } = req.body;

  if (!email || !password || !requestedRole)
    return sendError(res, "Missing fields", 400);

  try {
    let user = await AuthService.authenticate(email, password, requestedRole);

    // Auto-activate pending users on first login
    user = await AuthService.activatePendingUser(user);

    AuthService.enforceAccountState(user);

    const auth = await AuthService.authorize(user, requestedRole);

    const Model = AuthService.getRoleModel(requestedRole);

    const sessionUser = {
      email: user.EmailId,
      name: `${user.FirstName} ${user.LastName}`,
      role_id: requestedRole,
      role_level: auth.role_level,
      employment_type: auth.employment_type || null,
      table: Model.tableName,
      Status: user.Status,
      Dep_Code: user.Dep_Code,
    };

    // Add role-specific IDs
    if (requestedRole === "STU") {
      sessionUser.id = user.pgstud_id;
      sessionUser.stu_id = user.stu_id;
    } else {
      sessionUser.id = user.pgstaff_id;
      sessionUser.emp_id = user.emp_id;
    }

    req.session.user = sessionUser;

    // Sign the session ID for concurrent session support via X-Auth-Token header
    const signedSessionId = `s:${sign(req.sessionID, process.env.SESSION_SECRET)}`;

    return sendSuccess(res, "Login successful", { ...sessionUser, sessionId: signedSessionId });
  } catch (err) {
    console.error("[LOGIN_ERROR]", err);
    const status = err.message.includes("Invalid") || err.message.includes("mismatch") ? 401 : 500;
    return sendError(res, err.message, status);
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) console.error("[LOGOUT_SESSION_DESTROY_ERROR]", err);
      });
    }
    // Clear both possible cookie names to ensure complete logout
    res.clearCookie("user_session");
    res.clearCookie("admin_session");
    res.clearCookie("sid"); // Legacy fallback
    return sendSuccess(res, "Logout successful");
  } catch (err) {
    console.error("[LOGOUT_ERROR]", err);
    res.clearCookie("user_session");
    res.clearCookie("admin_session");
    res.clearCookie("sid");
    return sendSuccess(res, "Logout successful"); // Return success anyway to clear client state
  }
};
