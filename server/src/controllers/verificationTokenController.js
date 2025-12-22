import { verificationToken } from "../config/config.js";
import { sendVerificationEmail } from "../utils/email.js";

// Resend verification token
export const resendVerificationToken = async (req, res) => {
  try {
    const { userId, user_table } = req.body;
    const token = await verificationToken.create({ user_id: userId, user_table });

    // Fetch user model
    const Model = user_table === "examiner" ? require("../config/config.js").examiner : require("../config/config.js")[user_table];
    const user = await Model.findByPk(userId);

    await sendVerificationEmail(user, token);
    res.json({ status: "success", message: "Verification email resent" });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
