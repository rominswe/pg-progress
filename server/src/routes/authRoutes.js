import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// Login route
router.post("/login/:role", login);

export default router;