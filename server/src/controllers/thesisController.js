import {thesis} from "../config/config.js";

// Get all thesis
export const getAllTheses = async (req, res) => {
  try {
    const theses = await thesis.findAll();
    res.json(theses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single thesis by thesis_id
export const getThesisById = async (req, res) => {
  try {
    const singleThesis = await thesis.findByPk(req.params.thesis_id);
    if (!singleThesis) return res.status(404).json({ message: "Thesis not found" });
    res.json(singleThesis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new thesis
export const createThesis = async (req, res) => {
  try {
    const newThesis = await thesis.create(req.body);
    res.status(201).json(newThesis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a thesis
export const updateThesis = async (req, res) => {
  try {
    const singleThesis = await thesis.findByPk(req.params.thesis_id);
    if (!singleThesis) return res.status(404).json({ message: "Thesis not found" });

    await singleThesis.update(req.body);
    res.json(singleThesis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a thesis
export const deleteThesis = async (req, res) => {
  try {
    const singleThesis = await thesis.findByPk(req.params.thesis_id);
    if (!singleThesis) return res.status(404).json({ message: "Thesis not found" });

    await singleThesis.destroy();
    res.json({ message: "Thesis deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};