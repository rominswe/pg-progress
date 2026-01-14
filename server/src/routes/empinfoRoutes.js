import express from "express";
import { getAllEmployees, getEmployeeById } from "../controllers/empinfoController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// Admin-only routes for employee info
router.get("/", protect, requireRole("CGSADM"), getAllEmployees);
router.get("/:id", protect, requireRole("CGSADM"), getEmployeeById);

export default router;