import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/empinfoController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllEmployees);
router.get("/:emp_id", getEmployeeById);
router.post("/", createEmployee);
router.put("/:emp_id", updateEmployee);
router.delete("/:emp_id", deleteEmployee);

export default router;