import express from "express";
import { login, verifyAccount, logout } from "../controllers/authController.js";
import { resendVerificationToken, checkTokenStatus } from "../controllers/verificationTokenController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/login", login);
router.get("/verify", verifyAccount); 
router.post("/resend-verification", resendVerificationToken);
router.get("/check-token/:token", checkTokenStatus);// expects query params: ?code=<vcode>&type=email
router.post("/logout", protect, logout);

export default router;