import express from "express";
import {
  getAllStudinfo,
  getStudinfoById,
  createStudinfo,
  updateStudinfo,
  deleteStudinfo,
} from "../controllers/studentInfoController.js";
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get("/", protect(["CGSADM"]), getAllStudinfo);
router.get("/:stu_id", protect(["CGSADM"]), getStudinfoById);
router.post("/", protect(["CGSADM"]), createStudinfo);
router.put("/:stu_id", protect(["CGSADM"]), updateStudinfo);
router.delete("/:stu_id", protect(["CGSADM"]), deleteStudinfo);
export default router;