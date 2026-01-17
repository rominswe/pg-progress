import express from "express";
import rateLimit from "express-rate-limit";
import { login, logout } from "../controllers/authController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 login requests per window
});

router.post("/login", loginLimiter, login);
router.post("/logout", protect, logout);

export default router;