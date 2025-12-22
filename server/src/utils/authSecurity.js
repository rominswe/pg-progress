import { loginAttempt } from "../config/config.js";
import { auditLog, AUDIT_ACTIONS, AUDIT_STATUS } from "./audit.js";
import { Op } from "sequelize";

/* ================= LOG AUTH EVENT ================= */
export const logAuthEvent = async (email, role_id, event, req = null, status = AUDIT_STATUS.SUCCESS, errorMessage = null) => {
  try {
    const ip = req?.ip || req?.connection?.remoteAddress || "unknown";
    const userAgent = req?.get("user-agent") || "unknown";
    const sessionId = req?.session?.id || null;

    await auditLog({
      userId: email,
      action: event,
      userRole: role_id,
      entityType: 'SESSION',
      entityId: sessionId,
      details: `${event} event`,
      ipAddress: ip,
      userAgent: userAgent,
      sessionId: sessionId,
      status: status,
      errorMessage: errorMessage
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