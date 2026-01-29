import emailService from "../services/emailService.js";

/**
 * Send verification email with temporary password and verification link
 * @param {Object} user - user object from DB
 * @param {string} token - stateless verification token
 * @param {string} tempPassword - temporary password
 * @param {string} role_id - role ID
 */
export const sendVerificationEmail = async (user, token, tempPassword, role_id) => {
  // Determine frontend URL based on role
  let frontendUrl;
  switch (role_id) {
    case "CGSADM":
    case "CGSS":
      frontendUrl = process.env.FRONTEND_ADMIN_URL || "http://localhost:5174";
      break;
    default:
      frontendUrl = process.env.FRONTEND_USER_URL || "http://localhost:5173";
  }

  try {
    await emailService.sendVerificationEmail(user, token, tempPassword, frontendUrl);
  } catch (err) {
    console.error("❌ Failed to send verification email:", err);
    throw new Error("Unable to send verification email");
  }
};