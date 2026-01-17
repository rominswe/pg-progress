import express from "express";
import { getAllDepartmentInfo } from "../controllers/tblDepartmentsController.js";
import { protect } from "../middleware/authmiddleware.js";

import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// GET all departments (System Admin or CGS Staff)
router.get("/", protect, requireRole("CGSADM", "CGSS"), getAllDepartmentInfo);

export default router;