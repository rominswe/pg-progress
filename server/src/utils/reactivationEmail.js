import emailService from "../services/emailService.js";

/**
 * Send reactivation request email to system admin
 * @param {Object} params - Request parameters
 */
export const sendReactivationRequestEmail = async ({
  userId,
  userName,
  userEmail,
  userRole,
  requestedBy,
  requestedByName
}) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@aiu.edu.my";
    const frontendUrl = process.env.FRONTEND_ADMIN_URL || "http://localhost:5174";
    const reactivateLink = `${frontendUrl}/cgs/users/${userId}/verify?intent=reactivate`;

    await emailService.sendReactivationRequest({
      adminEmail,
      userId,
      userName,
      userEmail,
      userRole,
      requestedBy,
      requestedByName,
      reactivateLink
    });
  } catch (err) {
    console.error("❌ Failed to send reactivation request email:", err);
    throw new Error("Unable to send reactivation request email");
  }
};
