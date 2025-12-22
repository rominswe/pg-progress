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

const router = express.Router();

/* ================= REGISTRATION ================= */
router.post("/register", register); // expects { role, email, firstName, lastName, password, depCode, extraFields }

/* ================= DYNAMIC LOGIN ================= */
router.post("/login", login); // expects { email, password, role }

/* ================= REFRESH TOKEN ================= */
router.post("/refresh", refreshToken);

/* ================= LOGOUT ================= */
router.post("/logout", logout);

/* ================= VERIFY ACCOUNT ================= */
router.get("/verify-account", verifyAccount); // expects query params: ?code=<vcode>&type=<role>

/* ================= CURRENT USER INFO ================= */
router.get("/me", protect(["STU", "EXA", "SUV", "CGSADM", "EXCGS"]), me);

/* ================= UPDATE CURRENT USER ================= */
router.patch("/me", protect(["STU", "EXA", "SUV", "CGSADM", "EXCGS"]), updateMe);

export default router;