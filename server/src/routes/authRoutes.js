import express from "express";
import rateLimit from "express-rate-limit";
import { login, verifyAccount, logout } from "../controllers/authController.js";
import { resendVerificationToken, checkTokenStatus } from "../controllers/verificationTokenController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 login requests per window
});

router.post("/login", loginLimiter, login);
router.get("/verify", verifyAccount); 
router.post("/resend-verification", resendVerificationToken);
router.get("/check-token/:token", checkTokenStatus);// expects query params: ?code=<vcode>&type=email
router.post("/logout", protect, logout);

export default router;