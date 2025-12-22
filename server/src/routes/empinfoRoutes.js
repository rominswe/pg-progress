import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/empinfoController.js";
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect(["CGSADM"]), getAllEmployees);
router.get("/:emp_id", protect(["CGSADM"]), getEmployeeById);
router.post("/", protect(["CGSADM"]), createEmployee);
router.put("/:emp_id", protect(["CGSADM"]), updateEmployee);
router.delete("/:emp_id", protect(["CGSADM"]), deleteEmployee);
export default router;