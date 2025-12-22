import express from "express";
import {
  getAllLoginAttempts,
  getLoginAttemptByEmail,
  createLoginAttempt,
  deleteLoginAttempt,
  deleteAllLoginAttempts,
} from "../controllers/loginAttemptController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// Admin-only access
router.get("/", protect(["CGSADM"]), getAllLoginAttempts);
router.get("/:email", protect(["CGSADM"]), getLoginAttemptByEmail);
router.post("/", protect(["CGSADM"]), createLoginAttempt);
router.delete("/:email", protect(["CGSADM"]), deleteLoginAttempt);
router.delete("/", protect(["CGSADM"]), deleteAllLoginAttempts);

export default router;
