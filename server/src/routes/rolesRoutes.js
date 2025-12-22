import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/rolesController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CRUD endpoints
router.get("/", protect(["CGSADM", "EXCGS"]), getAllRoles);
router.get("/:role_id", protect(["CGSADM", "EXCGS"]), getRoleById);
router.post("/", protect(["CGSADM"]), createRole);
router.put("/:role_id", protect(["CGSADM"]), updateRole);
router.delete("/:role_id", protect(["CGSADM"]), deleteRole);
export default router;
