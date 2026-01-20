import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "node:path";

// Load environment variables if not already loaded
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === "true",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    /**
     * Generic send email method
     */
    async sendEmail({ to, subject, html }) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || `"AIU PG Progress" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            return info;
        } catch (error) {
            console.error("Email sending failed:", error);
            throw error;
        }
    }

    /**
     * Send account verification email
     */
    async sendVerificationEmail(user, token, tempPassword, frontendUrl) {
        const verificationLink = `${frontendUrl}/verify-account?token=${token}`;
        const subject = `Verify Your Account - AIU PG Progress`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Welcome to AIU PG Progress</h2>
                <p>Hello ${user.FirstName || ""} ${user.LastName || ""},</p>
                <p>Please verify your account by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Account</a>
                </div>
                <p>Your temporary password for first login is: <strong style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${tempPassword}</strong></p>
                <p>After logging in, you will be prompted to change this temporary password in your profile.</p>
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">If you did not register, you can ignore this email safely.</p>
            </div>
        `;
        return this.sendEmail({ to: user.EmailId, subject, html });
    }

    /**
     * Send administrative notice / notification alert
     */
    async sendAdministrativeNotice(user, title, message) {
        const subject = `Administrative Notice: ${title}`;
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">${title}</h2>
                <p>Hello ${user.FirstName || ""} ${user.LastName || ""},</p>
                <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; font-style: italic;">
                    ${message}
                </div>
                <p>Please log in to your dashboard for more details.</p>
                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">This is an automated message from the AIU Centre for Graduate Studies.</p>
            </div>
        `;
        return this.sendEmail({ to: user.EmailId, subject, html });
    }

    /**
     * Send reactivation request email to system admin
     */
    async sendReactivationRequest({ adminEmail, userId, userName, userEmail, userRole, requestedBy, requestedByName, reactivateLink }) {
        const subject = "User Reactivation Request";
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">User Reactivation Request</h2>
                <p>A CGSS staff member has requested to reactivate a user account.</p>
                
                <h3 style="color: #374151; margin-top: 20px;">User Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userName}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userEmail || "N/A"}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Role:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userRole || "N/A"}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>User ID:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${userId}</td></tr>
                </table>

                <h3 style="color: #374151; margin-top: 20px;">Request Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Requested by:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${requestedByName}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${requestedBy}</td></tr>
                </table>

                <div style="margin-top: 30px; text-align: center;">
                    <a href="${reactivateLink}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Request</a>
                </div>

                <hr style="margin: 30px 0; border: 0; border-top: 1px solid #eee;">
                <p style="font-size: 12px; color: #666;">This is an automated notification from the AIU PG Progress system.</p>
            </div>
        `;
        return this.sendEmail({ to: adminEmail, subject, html });
    }
}

export default new EmailService();
