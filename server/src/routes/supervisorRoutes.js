import express from "express";
import {
  getAllSupervisors,
  getSupervisorById,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
  loginSupervisor // optional
} from "../controllers/supervisorController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// CRUD endpoints
router.get("/", protect(["supervisor"]), getAllSupervisors);
router.get("/:emp_id", protect(["supervisor"]), getSupervisorById);
router.post("/", protect(["supervisor"]), createSupervisor);
router.put("/:emp_id", protect(["supervisor"]), updateSupervisor);
router.delete("/:emp_id", protect(["supervisor"]), deleteSupervisor);

// Optional login route
router.post("/login", loginSupervisor);

export default router;