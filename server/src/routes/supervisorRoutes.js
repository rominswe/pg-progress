import express from "express";
import {
  getAllSupervisors,
  getSupervisorById,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
} from "../controllers/supervisorController.js";
import { protect } from "../middleware/authmiddleware.js";
import { requireRole } from '../middleware/rbacMiddleware.js';
const router = express.Router();

// CRUD endpoints
router.get("/", protect, requireRole("CGSADM", "EXCGS"), getAllSupervisors);
router.get("/:sup_id", protect, requireRole("CGSADM", "EXCGS"), getSupervisorById);
router.post("/", protect, requireRole("CGSADM"), createSupervisor);
router.put("/:sup_id", protect, requireRole("CGSADM", "EXCGS"), updateSupervisor);
router.delete("/:sup_id", protect, requireRole("CGSADM", "EXCGS"), deleteSupervisor);
export default router;