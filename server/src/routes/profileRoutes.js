import express from "express";
import { me, updateProfile, uploadProfileImage, deleteProfileImage } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { profileUpload } from "../middleware/upload.js";
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

// Upload profile image
router.post("/upload-image", protect, profileUpload.single("profileImage"), uploadProfileImage);

// Delete profile image
router.delete("/delete-image", protect, deleteProfileImage);

export default router;