import { programInfo } from "../config/config.js";

// Get all programs
export const getAllPrograms = async (req, res) => {
  try {
    const programs = await programInfo.findAll();
    res.json(programs);
  } catch (error) {
    console.error("Error fetching programs:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single program by Prog_Code
export const getProgramById = async (req, res) => {
  try {
    const { Prog_Code } = req.params;
    const program = await programInfo.findByPk(Prog_Code);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }
    res.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    res.status(500).json({ error: error.message });
  }
};

// Create a new program
export const createProgram = async (req, res) => {
  try {
    const newProgram = await programInfo.create(req.body);
    res.status(201).json(newProgram);
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a program
export const updateProgram = async (req, res) => {
  try {
    const { Prog_Code } = req.params;
    const program = await programInfo.findByPk(Prog_Code);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    await program.update(req.body);
    res.json(program);
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a program
export const deleteProgram = async (req, res) => {
  try {
    const { Prog_Code } = req.params;
    const program = await programInfo.findByPk(Prog_Code);
    if (!program) {
      return res.status(404).json({ message: "Program not found" });
    }

    await program.destroy();
    res.json({ message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ error: error.message });
  }
};
