import express from "express";
import {
  getAllTheses,
  getThesisById,
  createThesis,
  updateThesis,
  deleteThesis,
} from "../controllers/thesisController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllTheses);
router.get("/:thesis_id", getThesisById);
router.post("/", createThesis);
router.put("/:thesis_id", updateThesis);
router.delete("/:thesis_id", deleteThesis);

export default router;