import nodemailer from "nodemailer";

/**
 * Send reactivation request email to system admin
 * @param {Object} params - Request parameters
 * @param {string} params.userId - User ID to reactivate
 * @param {string} params.userName - User's full name
 * @param {string} params.userEmail - User's email
 * @param {string} params.userRole - User's role label
 * @param {string} params.requestedBy - Requester's email
 * @param {string} params.requestedByName - Requester's full name
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
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL || "admin@aiu.edu.my";
    const frontendUrl = process.env.FRONTEND_ADMIN_URL || "http://localhost:5174";
    const reactivateLink = `${frontendUrl}/cgs/users/${userId}/verify?intent=reactivate`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"AIU PG Progress" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: "User Reactivation Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">User Reactivation Request</h2>
          <p>A CGSS staff member has requested to reactivate a user account.</p>
          
          <h3 style="color: #374151; margin-top: 20px;">User Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userEmail || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Role:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userRole || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>User ID:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userId}</td>
            </tr>
          </table>

          <h3 style="color: #374151; margin-top: 20px;">Request Details:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Requested by:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${requestedByName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Requester Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${requestedBy}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Request Time:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date().toLocaleString()}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; text-align: center;">
            <a href="${reactivateLink}" style="display:inline-block;padding:12px 24px;background:#10b981;color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Review Reactivation Request</a>
          </div>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">This is an automated notification from the AIU PG Progress system.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    // console.log(`✅ Reactivation request email sent to ${adminEmail} for user ${userId}`);
  } catch (err) {
    console.error("❌ Failed to send reactivation request email:", err);
    throw new Error("Unable to send reactivation request email");
  }
};
