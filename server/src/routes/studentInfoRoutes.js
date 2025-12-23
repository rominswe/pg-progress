import express from "express";
import {
  getAllStudinfo,
  getStudinfoById,
  createStudinfo,
  updateStudinfo,
  deleteStudinfo,
} from "../controllers/studentInfoController.js";
import { protect } from '../middleware/authmiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
const router = express.Router();

// CRUD endpoints
router.get("/", protect, requireRole("CGSADM"), getAllStudinfo);
router.get("/:stu_id", protect, requireRole("CGSADM"), getStudinfoById);
router.post("/", protect, requireRole("CGSADM"), createStudinfo);
router.put("/:stu_id", protect, requireRole("CGSADM"), updateStudinfo);
router.delete("/:stu_id", protect, requireRole("CGSADM"), deleteStudinfo);
export default router;