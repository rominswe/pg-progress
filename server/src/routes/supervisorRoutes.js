import express from "express";
import {
  getAllSupervisors,
  getSupervisorById,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
} from "../controllers/supervisorController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllSupervisors);
router.get("/:supervisor_id", getSupervisorById);
router.post("/", createSupervisor);
router.put("/:supervisor_id", updateSupervisor);
router.delete("/:supervisor_id", deleteSupervisor);

export default router;