import {programInfo} from "../config/config.js";

// Get all programs
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await programInfo.findAll();
    res.json(programs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single program by Prog_Code
export const getProgramById = async (req, res) => {
  try {
    const program = await programInfo.findByPk(req.params.Prog_Code);
    if (!program) return res.status(404).json({ message: "Program not found" });
    res.json(program);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new program
export const createProgram = async (req, res) => {
  try {
    const newProgram = await programInfo.create(req.body);
    res.status(201).json(newProgram);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a program
export const updateProgram = async (req, res) => {
  try {
    const program = await programInfo.findByPk(req.params.Prog_Code);
    if (!program) return res.status(404).json({ message: "Program not found" });

    await program.update(req.body);
    res.json(program);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a program
export const deleteProgram = async (req, res) => {
  try {
    const program = await programInfo.findByPk(req.params.Prog_Code);
    if (!program) return res.status(404).json({ message: "Program not found" });

    await program.destroy();
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};