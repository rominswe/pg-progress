import {
  verificationToken,
  cgs,
  supervisor,
  master_stu,
  examiner,
  visiting_staff,
  role
} from "../config/config.js";
import { createVerificationToken } from "../utils/verification.js";

// Helper: Map Role IDs to Models (Matches logic in authController)
const ROLE_MODEL_MAP = {
  CGSADM: cgs,
  SUV: supervisor,
  STU: master_stu,
  EXCGS: cgs,
  EXA: examiner // Special handling for EXA/Visiting Staff below
};

/* ================= RESEND VERIFICATION TOKEN ================= */
// Usage: POST /api/auth/resend-verification
// Body: { "email": "user@example.com", "role_id": "STU" }
export const resendVerificationToken = async (req, res) => {
  try {
    const { email, role_id } = req.body;

    if (!email || !role_id) {
      return res.status(400).json({ error: "Email and Role ID are required" });
    }

    let user = null;
    let modelUsed = null;
    let userTableString = "";

    // 1. Find the user (Logic mirrors login flow)
    if (role_id === "EXA") {
      // Check Internal Examiner
      user = await examiner.findOne({ where: { EmailId: email } });
      if (user) {
        modelUsed = examiner;
        userTableString = "examiner";
      } else {
        // Check Visiting Staff
        user = await visiting_staff.findOne({ where: { EmailId: email } });
        if (user) {
          modelUsed = visiting_staff;
          userTableString = "visiting_staff";
        }
      }
    } else {
      const Model = ROLE_MODEL_MAP[role_id];
      if (Model) {
        user = await Model.findOne({ where: { EmailId: email } });
        modelUsed = Model;
        userTableString = Model.tableName;
      }
    }

    if (!user) {
      // Security: Don't reveal if user doesn't exist, just say sent if format is valid
      return res.status(200).json({ message: "If an account exists, a new verification link has been sent." });
    }

    // 2. Check if already verified
    if (user.Status === "Active" || user.IsVerified === 1) {
      return res.status(400).json({ error: "Account is already verified. Please log in." });
    }

    // 3. Remove any existing tokens for this user to prevent duplicates
    await verificationToken.destroy({
      where: {
        user_id: String(user[user.constructor.primaryKeyAttribute]), // Dynamic ID fetch
        user_table: userTableString
      }
    });

    // 4. Generate a new token
    // Note: We use the helper from your utils, ensuring we pass the correct table name string
    const newToken = await createVerificationToken(
      userTableString,
      String(user[user.constructor.primaryKeyAttribute])
    );

    // 5. Simulate Email Sending
    // TODO: Integrate your email service here (e.g., Nodemailer)
    console.log(`[EMAIL DEV] Verification Link: ${process.env.FRONTEND_USER_URL}/verify?token=${newToken}`);

    return res.status(200).json({
      message: "Verification link resent successfully.",
      // In development, you might return the token for testing, but remove for production!
      debug_token: process.env.NODE_ENV === "development" ? newToken : undefined
    });

  } catch (err) {
    console.error("Resend Token Error:", err);
    res.status(500).json({ error: "Internal server error processing request" });
  }
};

/* ================= CHECK TOKEN STATUS ================= */
// Usage: GET /api/auth/check-token/:token
// Use this on the Frontend to show a loader or error before the user clicks "Verify"
export const checkTokenStatus = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) return res.status(400).json({ valid: false, error: "Token missing" });

    const record = await verificationToken.findOne({ where: { token } });

    if (!record) {
      return res.status(404).json({ valid: false, error: "Invalid token" });
    }

    // Check Expiry
    if (new Date(record.expiresAt) < new Date()) {
      return res.status(410).json({ valid: false, error: "Token expired" });
    }

    // Token is valid and exists
    return res.status(200).json({ valid: true, message: "Token is valid" });

  } catch (err) {
    console.error("Check Token Error:", err);
    res.status(500).json({ error: "Server error checking token" });
  }
};