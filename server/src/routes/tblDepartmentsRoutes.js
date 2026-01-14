import express from "express";
import { getAllDepartmentInfo } from "../controllers/tblDepartmentsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// GET all departments (Admin only)
router.get("/", protect, requireRole("CGSADM"), getAllDepartmentInfo);

export default router;