import express from "express";
import { getLoginAttempts } from "../controllers/loginAttemptController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// Admin-only route to fetch login attempts
router.get("/", protect, requireRole("CGSADM"), getLoginAttempts);

export default router;