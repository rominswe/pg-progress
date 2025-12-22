import { examiner } from "../config/config.js";

// Get all examiners
export const getAllExaminers = async (req, res) => {
  try {
    const examiners = await examiner.findAll();
    res.json(examiners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single examiner by examiner_id
export const getExaminerById = async (req, res) => {
  try {
    const examiner = await examiner.findByPk(req.params.examiner_id);
    if (!examiner) return res.status(404).json({ message: "Examiner not found" });
    res.json(examiner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new examiner
export const createExaminer = async (req, res) => {
  try {
    const newExaminer = await examiner.create(req.body);
    res.status(201).json(newExaminer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an examiner
export const updateExaminer = async (req, res) => {
  try {
    const examiner = await examiner.findByPk(req.params.examiner_id);
    if (!examiner) return res.status(404).json({ message: "Examiner not found" });

    await examiner.update(req.body);
    res.json(examiner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an examiner
export const deleteExaminer = async (req, res) => {
  try {
    const examiner = await examiner.findByPk(req.params.examiner_id);
    if (!examiner) return res.status(404).json({ message: "Examiner not found" });

    await examiner.destroy();
    res.json({ message: "Examiner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};