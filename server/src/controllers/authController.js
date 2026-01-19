import AuthService from "../services/authService.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";

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

    return sendSuccess(res, "Login successful", sessionUser);
  } catch (err) {
    console.error("[LOGIN_ERROR]", err);
    const status = err.message.includes("Invalid") || err.message.includes("mismatch") ? 401 : 500;
    return sendError(res, err.message, status);
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  if (!req.session) {
    res.clearCookie("sid");
    return sendSuccess(res, "Logout successful (No session was active)");
  }

  req.session.destroy((err) => {
    if (err) {
      console.error("[LOGOUT_ERROR]", err);
      // Even if destroy fails, we want the client to clear cookie
      res.clearCookie("sid");
      return sendError(res, "Logout failed during session destruction", 500);
    }
    res.clearCookie("sid");
    return sendSuccess(res, "Logout successful");
  });
};
