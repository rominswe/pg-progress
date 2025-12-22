import express from "express";
import {
  getAllProgress,
  getProgressById,
  createProgress,
  updateProgress,
  deleteProgress,
} from "../controllers/progressController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllProgress);
router.get("/:progress_id", getProgressById);
router.post("/", createProgress);
router.put("/:progress_id", updateProgress);
router.delete("/:progress_id", deleteProgress);

export default router;