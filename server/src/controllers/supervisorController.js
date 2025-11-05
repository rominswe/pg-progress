import supervisor from "../models/Supervisor.js";

// Get all supervisors
export const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await supervisor.findAll();
    res.json(supervisors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single supervisor by supervisor_id
export const getSupervisorById = async (req, res) => {
  try {
    const singleSupervisor = await supervisor.findByPk(req.params.supervisor_id);
    if (!singleSupervisor) return res.status(404).json({ message: "Supervisor not found" });
    res.json(singleSupervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new supervisor
export const createSupervisor = async (req, res) => {
  try {
    const newSupervisor = await supervisor.create(req.body);
    res.status(201).json(newSupervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a supervisor
export const updateSupervisor = async (req, res) => {
  try {
    const singleSupervisor = await supervisor.findByPk(req.params.supervisor_id);
    if (!singleSupervisor) return res.status(404).json({ message: "Supervisor not found" });

    await singleSupervisor.update(req.body);
    res.json(singleSupervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a supervisor
export const deleteSupervisor = async (req, res) => {
  try {
    const singleSupervisor = await supervisor.findByPk(req.params.supervisor_id);
    if (!singleSupervisor) return res.status(404).json({ message: "Supervisor not found" });

    await singleSupervisor.destroy();
    res.json({ message: "Supervisor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};