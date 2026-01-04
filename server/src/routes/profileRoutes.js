import express from "express";
import { me, updateMe } from "../controllers/profileController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Get current user profile
router.get("/me", protect, me);

// Update current user profile
router.put("/me", protect, updateMe);

export default router;