import nodemailer from "nodemailer";

/**
 * Send verification email with temporary password and verification link
 * @param {Object} user - user object from DB
 * @param {string} token - verification token
 * @param {string} tempPassword - temporary password
 * @param {string} role_id - role ID
 */
export const sendVerificationEmail = async (user, token, tempPassword, role_id) => {
  try {
    // Determine frontend URL
    let frontendUrl;
    switch (role_id) {
      case "CGSADM":
      case "CGSS":
        frontendUrl = process.env.FRONTEND_ADMIN_URL || "http://localhost:5174";
        break;
      default:
        frontendUrl = process.env.FRONTEND_USER_URL || "http://localhost:5173";
    }

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
        <p>Please verify your account by clicking the link below:</p>
        <p><a href="${verificationLink}">Verify Account</a></p>
        <p>Your temporary password for first login is: <strong>${tempPassword}</strong></p>
        <p>After logging in, you must change your password in your profile.</p>
        <p>If you did not register, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email with temp password sent to ${user.EmailId} (role: ${role_id})`);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    throw new Error("Unable to send verification email");
  }
};