import express from "express";
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programInfoController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect, requireRole("CGSADM", "EXCGS"), getAllPrograms);           // Get all programs
router.get("/:Prog_Code", protect, requireRole("CGSADM", "EXCGS"), getProgramById); // Get program by ID
router.post("/", protect, requireRole("CGSADM"), createProgram);           // Create new program
router.put("/:Prog_Code", protect, requireRole("CGSADM"), updateProgram);  // Update program
router.delete("/:Prog_Code", protect, requireRole("CGSADM"), deleteProgram); // Delete program
export default router;