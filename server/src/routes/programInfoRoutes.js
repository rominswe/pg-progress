import express from "express";
import { getAllProgramInfo } from "../controllers/programInfoController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// GET all program information (for admin or staff)
router.get("/", protect, requireRole("CGSADM", "CGSS"), getAllProgramInfo);

export default router;