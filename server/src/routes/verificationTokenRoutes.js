import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  resendVerificationToken
} from "../controllers/verificationTokenController.js";
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Resend verification token (admin or user-initiated)
router.post("/resend", protect, requireRole("CGSADM", "EXCGS", "STU", "EXA", "SUV"), resendVerificationToken);

export default router;