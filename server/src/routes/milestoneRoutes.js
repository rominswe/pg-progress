import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";
import {
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  listOverrides,
  getStudentMilestones,
} from "../controllers/milestoneController.js";

const router = express.Router();

// Templates available to CGS staff/admin
router.get("/", protect, requireRole("CGSADM", "CGSS", "SUV", "EXA"), listTemplates);
router.get("/overrides", protect, requireRole("CGSADM", "CGSS"), listOverrides);
router.post("/", protect, requireRole("CGSADM", "CGSS"), createTemplate);
router.put("/:id", protect, requireRole("CGSADM", "CGSS"), updateTemplate);
router.delete("/:id", protect, requireRole("CGSADM", "CGSS"), deleteTemplate);

// Student-facing milestone status feed
router.get("/student", protect, requireRole("STU", "SUV", "EXA", "CGSADM", "CGSS"), getStudentMilestones);

export default router;
