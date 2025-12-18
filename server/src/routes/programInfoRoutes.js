import express from "express";
import {
  getAllPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programInfoController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllPrograms);           // Get all programs
router.get("/:Prog_Code", getProgramById); // Get program by ID
router.post("/", createProgram);           // Create new program
router.put("/:Prog_Code", updateProgram);  // Update program
router.delete("/:Prog_Code", deleteProgram); // Delete program

export default router;