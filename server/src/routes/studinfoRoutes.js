import express from "express";
import {
  getAllStudinfo,
  getStudinfoById,
  createStudinfo,
  updateStudinfo,
  deleteStudinfo,
} from "../controllers/studentInfoController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllStudinfo);
router.get("/:stu_id", getStudinfoById);
router.post("/", createStudinfo);
router.put("/:stu_id", updateStudinfo);
router.delete("/:stu_id", deleteStudinfo);

export default router;