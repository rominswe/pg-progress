import { verificationToken } from "../config/config.js"; // Sequelize model
import { v4 as uuidv4 } from "uuid";

/* ================= CREATE VERIFICATION TOKEN ================= */
export const createVerificationToken = async (user_table, user_id) => {
  const token = uuidv4();

  await VerificationToken.create({
    token,
    user_table,
    user_id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
  });

  return token;
};

/* ================= VERIFY TOKEN ================= */
export const verifyToken = async (token) => {
  const record = await verificationToken.findOne({ where: { token } });
  if (!record) return null;

  // Expired
  if (record.expiresAt < new Date()) {
    await verificationToken.destroy({ where: { token } });
    return null;
  }

  // Delete after use (one-time token)
  await verificationToken.destroy({ where: { token } });
  return record;
};