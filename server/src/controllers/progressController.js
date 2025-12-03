import {progress} from "../config/config.js";

// Get all progress records
export const getAllProgress = async (req, res) => {
  try {
    const progressRecords = await progress.findAll();
    res.json(progressRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single progress record by progress_id
export const getProgressById = async (req, res) => {
  try {
    const record = await progress.findByPk(req.params.progress_id);
    if (!record) return res.status(404).json({ message: "Progress record not found" });
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new progress record
export const createProgress = async (req, res) => {
  try {
    const newRecord = await progress.create(req.body);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a progress record
export const updateProgress = async (req, res) => {
  try {
    const record = await progress.findByPk(req.params.progress_id);
    if (!record) return res.status(404).json({ message: "Progress record not found" });

    await record.update(req.body);
    res.json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a progress record
export const deleteProgress = async (req, res) => {
  try {
    const record = await progress.findByPk(req.params.progress_id);
    if (!record) return res.status(404).json({ message: "Progress record not found" });

    await record.destroy();
    res.json({ message: "Progress record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};