import express from "express";
import { getAllRolesInfo } from "../controllers/rolesController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// GET all roles information (Admin only)
router.get("/", protect, requireRole("CGSADM"), getAllRolesInfo);

export default router;