import { auditLog, loginAttempt } from "../config/config.js"; // Sequelize models
import { Op } from "sequelize";

/* ================= LOG AUTH EVENT ================= */
export const logAuthEvent = async (email, role_id, event, req = null) => {
  try {
    const ip = req?.ip || "unknown";
    const userAgent = req?.headers["user-agent"] || "unknown";

    await auditLog.create({
      email,
      role_id,
      event,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to log auth event:", err);
  }
};

/* ================= HANDLE LOCKOUT ================= */
export const handleLockout = async (email) => {
  const windowMinutes = 15;
  const maxAttempts = 5;

  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  const attempts = await loginAttempt.count({
    where: { email, createdAt: { [Op.gte]: since } },
  });

  if (attempts >= maxAttempts) {
    throw new Error("Too many login attempts. Please try again later.");
  }
};

/* ================= RECORD LOGIN ATTEMPT ================= */
export const recordLoginAttempt = async (email) => {
  try {
    await loginAttempt.create({ email });
  } catch (err) {
    console.error("Failed to record login attempt:", err);
  }
};