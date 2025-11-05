import evaluation from "../models/evaluation.js";

// Get all evaluations
export const getAllEvaluations = async (req, res) => {
  try {
    const evaluations = await evaluation.findAll();
    res.json(evaluations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single evaluation by evaluation_id
export const getEvaluationById = async (req, res) => {
  try {
    const evalRecord = await evaluation.findByPk(req.params.evaluation_id);
    if (!evalRecord) return res.status(404).json({ message: "Evaluation not found" });
    res.json(evalRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new evaluation
export const createEvaluation = async (req, res) => {
  try {
    const newEvaluation = await evaluation.create(req.body);
    res.status(201).json(newEvaluation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an evaluation
export const updateEvaluation = async (req, res) => {
  try {
    const evalRecord = await evaluation.findByPk(req.params.evaluation_id);
    if (!evalRecord) return res.status(404).json({ message: "Evaluation not found" });

    await evalRecord.update(req.body);
    res.json(evalRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an evaluation
export const deleteEvaluation = async (req, res) => {
  try {
    const evalRecord = await evaluation.findByPk(req.params.evaluation_id);
    if (!evalRecord) return res.status(404).json({ message: "Evaluation not found" });

    await evalRecord.destroy();
    res.json({ message: "Evaluation deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};