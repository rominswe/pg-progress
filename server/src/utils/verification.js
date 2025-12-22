import { verificationToken } from "../config/config.js"; // Sequelize model
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

/* ================= CONFIGURATION ================= */
const TOKEN_EXPIRY_HOURS = 24; // Token expires in 24 hours
const MAX_VERIFICATION_ATTEMPTS = 5; // Maximum verification attempts per hour per IP

/* ================= CREATE VERIFICATION TOKEN ================= */
export const createVerificationToken = async (user_table, user_id, role_id = null) => {
  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');

  // Clean up expired tokens for this user first
  await cleanupExpiredTokens(user_table, user_id);

  // Remove any existing tokens for this user (only one active token per user)
  await verificationToken.destroy({
    where: { user_table, user_id }
  });

  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await verificationToken.create({
    token,
    user_table,
    user_id,
    role_id,
    expiresAt,
    createdAt: new Date()
  });

  return token;
};

/* ================= VERIFY TOKEN ================= */
export const verifyToken = async (token) => {
  try {
    const record = await verificationToken.findOne({
      where: { token },
      order: [['createdAt', 'DESC']] // Get most recent if duplicates
    });

    if (!record) {
      return { valid: false, error: 'TOKEN_NOT_FOUND' };
    }

    // Check if expired
    if (record.expiresAt < new Date()) {
      await verificationToken.destroy({ where: { token } });
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }

    // Delete the token after successful verification (one-time use)
    await verificationToken.destroy({ where: { token } });

    return {
      valid: true,
      user_table: record.user_table,
      user_id: record.user_id,
      role_id: record.role_id
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, error: 'VERIFICATION_ERROR' };
  }
};

/* ================= CHECK TOKEN VALIDITY (WITHOUT CONSUMING) ================= */
export const checkTokenValidity = async (token) => {
  try {
    const record = await verificationToken.findOne({ where: { token } });

    if (!record) {
      return { valid: false, error: 'TOKEN_NOT_FOUND' };
    }

    if (record.expiresAt < new Date()) {
      return { valid: false, error: 'TOKEN_EXPIRED' };
    }

    return {
      valid: true,
      user_table: record.user_table,
      user_id: record.user_id,
      role_id: record.role_id,
      expiresAt: record.expiresAt
    };
  } catch (error) {
    console.error('Token validity check error:', error);
    return { valid: false, error: 'VALIDITY_CHECK_ERROR' };
  }
};

/* ================= CLEANUP EXPIRED TOKENS ================= */
export const cleanupExpiredTokens = async (user_table = null, user_id = null) => {
  try {
    const whereClause = { expiresAt: { [require('sequelize').Op.lt]: new Date() } };

    if (user_table && user_id) {
      whereClause.user_table = user_table;
      whereClause.user_id = user_id;
    }

    const deletedCount = await verificationToken.destroy({ where: whereClause });
    if (deletedCount > 0) {
      console.log(`Cleaned up ${deletedCount} expired verification tokens`);
    }
    return deletedCount;
  } catch (error) {
    console.error('Token cleanup error:', error);
    return 0;
  }
};

/* ================= GET USER TOKENS ================= */
export const getUserTokens = async (user_table, user_id) => {
  try {
    return await verificationToken.findAll({
      where: { user_table, user_id },
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.error('Get user tokens error:', error);
    return [];
  }
};

/* ================= REVOKE USER TOKENS ================= */
export const revokeUserTokens = async (user_table, user_id) => {
  try {
    const deletedCount = await verificationToken.destroy({
      where: { user_table, user_id }
    });
    console.log(`Revoked ${deletedCount} tokens for user ${user_table}:${user_id}`);
    return deletedCount;
  } catch (error) {
    console.error('Revoke user tokens error:', error);
    return 0;
  }
};

/* ================= SCHEDULED CLEANUP ================= */
// Run cleanup every hour
setInterval(() => {
  cleanupExpiredTokens();
}, 60 * 60 * 1000); // 1 hour

// Initial cleanup on startup
cleanupExpiredTokens();