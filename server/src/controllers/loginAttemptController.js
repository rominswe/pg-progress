import { loginAttempt } from "../config/config.js";

const ensureCGSAdmin = (req) => {
  if (req.user.role_id !== "CGSADM") {
    const err = new Error("Forbidden: Admin access only");
    err.status = 403;
    throw err;
  }
};

// Login Attempts - Read Only
export const getLoginAttempts = async (req, res) => {
  try {
    ensureCGSAdmin(req); // CGS Admin only

    const attempts = await loginAttempt.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      total: attempts.length,
      attempts
    });

  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || "Failed to fetch login attempts"
    });
  }
};