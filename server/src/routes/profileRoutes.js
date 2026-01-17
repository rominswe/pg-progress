import express from "express";
import { me, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authmiddleware.js";
import rateLimit from "express-rate-limit";

const router = express.Router();

const updateProfileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 update requests per window
});

// Get current user profile
router.get("/me", protect, me);

// Update current user profile
router.put("/update", protect, updateProfileLimiter, updateProfile);

export default router;