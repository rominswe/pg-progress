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
router.get("/", getAllPrograms);
router.get("/:Prog_Code", getProgramById);
router.post("/", createProgram);
router.put("/:Prog_Code", updateProgram);
router.delete("/:Prog_Code", deleteProgram);

export default router;