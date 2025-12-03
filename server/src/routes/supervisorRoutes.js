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
router.get("/:emp_id", getSupervisorById);
router.post("/", createSupervisor);
router.put("/:emp_id", updateSupervisor);
router.delete("/:emp_id", deleteSupervisor);

export default router;