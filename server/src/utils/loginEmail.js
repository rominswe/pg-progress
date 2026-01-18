import nodemailer from "nodemailer";

/**
 * Send verification email with temporary password and verification link
 * @param {Object} user - user object from DB
 * @param {string} token - stateless verification token
 * @param {string} tempPassword - temporary password
 * @param {string} role_id - role ID
 */
export const sendVerificationEmail = async (user, token, tempPassword, role_id) => {
  try {
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

    // Stateless verification link
    const verificationLink = `${frontendUrl}/verify-account?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"AIU PG Progress" <${process.env.EMAIL_USER}>`,
      to: user.EmailId,
      subject: `Verify Your Account - ${role_id.toUpperCase()}`,
      html: `
        <p>Hello ${user.FirstName || ""} ${user.LastName || ""},</p>
        <p>Welcome! Please verify your account by clicking the link below:</p>
        <p><a href="${verificationLink}">Verify Account</a></p>
        <p>Your temporary password for first login is: <strong>${tempPassword}</strong></p>
        <p>After logging in, you will be prompted to change this temporary password in your profile.</p>
        <p>If you did not register, you can ignore this email safely.</p>
        <hr>
        <p><small>This link will expire automatically. If it has expired, try logging in again to receive a new activation email.</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${user.EmailId} (role: ${role_id})`);
  } catch (err) {
    console.error("❌ Failed to send verification email:", err);
    throw new Error("Unable to send verification email");
  }
};