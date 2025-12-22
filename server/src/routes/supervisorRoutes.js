import express from "express";
import {
  getAllSupervisors,
  getSupervisorById,
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
} from "../controllers/supervisorController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// CRUD endpoints
router.get("/", protect(["SUV", "CGSADM", "EXCGS"]), getAllSupervisors);
router.get("/:sup_id", protect(["SUV", "CGSADM", "EXCGS"]), getSupervisorById);
router.post("/", protect(["SUV", "CGSADM", "EXCGS"]), createSupervisor);
router.put("/:sup_id", protect(["SUV", "CGSADM", "EXCGS"]), updateSupervisor);
router.delete("/:sup_id", protect(["SUV", "CGSADM", "EXCGS"]), deleteSupervisor);

export default router;