import express from "express";
import { me, updateMe, uploadProfileImage } from "../controllers/profileController.js";
import { protect } from "../middleware/authmiddleware.js";
import rateLimit from "express-rate-limit";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const router = express.Router();

// Multer config for Profile Images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/profiles";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  }
});

const updateProfileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 update requests per window
});

// Get current user profile
router.get("/me", protect, me);

// Update current user profile
// Note: Frontend uses /api/profile/update in Profile.jsx, 
// so let's add an alias or update the frontend. 
// I will add the alias here for backward compatibility.
router.put("/me", protect, updateProfileLimiter, updateMe);
router.put("/update", protect, updateProfileLimiter, updateMe);

// Upload profile image
router.post("/upload-image", protect, upload.single("profileImage"), uploadProfileImage);

export default router;