import express from "express";
import {
  login,
  register,
  refreshToken,
  verifyAccount,
  logout,
  me,
  updateMe
} from "../controllers/authController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

/* ================= REGISTRATION ================= */
router.post("/register", protect, requireRole("CGSADM"), register); // expects { role: "CGSADM", email, firstName, lastName, password, depCode }

/* ================= DYNAMIC LOGIN ================= */
router.post("/login", protect, requireRole("STU", "EXA", "SUV", "CGSADM", "EXCGS"), login); // expects { email, password, role }

/* ================= REFRESH TOKEN ================= */
router.post("/refresh", protect, requireRole("STU", "EXA", "SUV", "CGSADM", "EXCGS"), refreshToken);

/* ================= LOGOUT ================= */
router.post("/logout", protect, requireRole("STU", "EXA", "SUV", "CGSADM", "EXCGS"), logout);

/* ================= VERIFY ACCOUNT ================= */
router.get("/verify-email", protect, requireRole("STU", "EXA", "SUV", "CGSADM", "EXCGS"), verifyAccount); // expects query params: ?code=<vcode>&type=email

/* ================= CURRENT USER INFO ================= */
router.get("/me", protect, requireRole("STU", "EXA", "SUV", "CGSADM", "EXCGS"), me);

/* ================= UPDATE CURRENT USER ================= */
router.patch("/me", protect, requireRole("STU", "EXA", "SUV", "CGSADM", "EXCGS"), updateMe);
export default router;