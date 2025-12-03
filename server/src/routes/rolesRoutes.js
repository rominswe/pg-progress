import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/rolesController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllRoles);
router.get("/:role_id", getRoleById);
router.post("/", createRole);
router.put("/:role_id", updateRole);
router.delete("/:role_id", deleteRole);

export default router;