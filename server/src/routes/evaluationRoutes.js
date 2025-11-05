import express from "express";
import {
  getAllEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from "../controllers/evaluationController.js";

const router = express.Router();

// CRUD endpoints
router.get("/", getAllEvaluations);
router.get("/:evaluation_id", getEvaluationById);
router.post("/", createEvaluation);
router.put("/:evaluation_id", updateEvaluation);
router.delete("/:evaluation_id", deleteEvaluation);

export default router;