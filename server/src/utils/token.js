import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { refreshToken } from "../config/config.js"; // Sequelize model/table

/* ================= SIGN ACCESS TOKEN ================= */
export const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: "1h" });
};

/* ================= SIGN REFRESH TOKEN ================= */
export const signRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

/* ================= ROTATE REFRESH TOKEN ================= */
export const rotateRefreshToken = async (payload, oldToken = null, revoke = false) => {
  if (revoke && oldToken) {
    // Delete old token from DB
    await refreshToken.destroy({ where: { token: oldToken } });
    return null;
  }

  if (!payload) return null;

  // Generate new refresh token
  const newToken = signRefreshToken(payload);

  // Remove old token if exists
  if (oldToken) await RefreshToken.destroy({ where: { token: oldToken } });

  // Store new token in DB
  await refreshToken.create({
    token: newToken,
    userId: payload.userId,
    role_id: payload.role_id,
    user_table: payload.table,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tokenId: uuidv4(),
  });

  return newToken;
};