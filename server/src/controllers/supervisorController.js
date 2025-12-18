import { supervisor } from "../config/config.js";

// Get all supervisors
export const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await supervisor.findAll();
    res.json(supervisors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single supervisor by emp_id
export const getSupervisorById = async (req, res) => {
  try {
    const singleSupervisor = await supervisor.findByPk(req.params.emp_id);
    if (!singleSupervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }
    res.json(singleSupervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new supervisor
export const createSupervisor = async (req, res) => {
  try {
    // Password will be hashed automatically via model hook
    const newSupervisor = await supervisor.create(req.body);
    res.status(201).json(newSupervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a supervisor
export const updateSupervisor = async (req, res) => {
  try {
    const singleSupervisor = await supervisor.findByPk(req.params.emp_id);
    if (!singleSupervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    // Password will be hashed automatically if changed
    await singleSupervisor.update(req.body);
    res.json(singleSupervisor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a supervisor
export const deleteSupervisor = async (req, res) => {
  try {
    const singleSupervisor = await supervisor.findByPk(req.params.emp_id);
    if (!singleSupervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    await singleSupervisor.destroy();
    res.json({ message: "Supervisor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login check example (optional)
export const loginSupervisor = async (req, res) => {
  try {
    const { EmailId, Password } = req.body;
    const user = await supervisor.findOne({ where: { EmailId } });
    if (!user) return res.status(404).json({ message: "Supervisor not found" });

    const isMatch = await user.checkPassword(Password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};