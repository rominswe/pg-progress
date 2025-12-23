import express from "express";
import {
  getAllLoginAttempts,
  getLoginAttemptByEmail,
  createLoginAttempt,
  deleteLoginAttempt,
  deleteAllLoginAttempts,
} from "../controllers/loginAttemptController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// CRUD endpoints
router.get("/", protect, requireRole("CGSADM"), getAllLoginAttempts);
router.get("/:email", protect, requireRole("CGSADM"), getLoginAttemptByEmail);
router.post("/", protect, requireRole("CGSADM"), createLoginAttempt);
router.delete("/:email", protect, requireRole("CGSADM"), deleteLoginAttempt);
router.delete("/", protect, requireRole("CGSADM"), deleteAllLoginAttempts);
export default router;
