import express from "express";
import { getAllStudentInfo, getStudentInfoById } from "../controllers/studentInfoController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// GET all student info (Admin only)
router.get("/", protect, requireRole("CGSADM"), getAllStudentInfo);

// GET single student info by ID (Admin only)
router.get("/:id", protect, requireRole("CGSADM"), getStudentInfoById);

export default router;