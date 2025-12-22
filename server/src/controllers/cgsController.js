import { cgs } from "../config/config.js";

// Get all admins
export const getAllAdmins = async (req, res) => {
  try { 
    const admins = await cgs.findAll();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single admin by cgs_id
export const getAdminById = async (req, res) => {
  try {
    const admin = await cgs.findByPk(req.params.cgs_id); // match router param
    if (!admin) return res.status(404).json({ message: "User not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new admin
export const createAdmin = async (req, res) => {
  try {
    // Sequelize hooks will hash the password automatically
    const newAdmin = await cgs.create(req.body);
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an admin
export const updateAdmin = async (req, res) => {
  try {
    const admin = await cgs.findByPk(req.params.cgs_id);
    if (!admin) return res.status(404).json({ message: "User not found" });

    // If updating password, hook will automatically hash it
    await admin.update(req.body);
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an admin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await cgs.findByPk(req.params.cgs_id);
    if (!admin) return res.status(404).json({ message: "User not found" });

    await admin.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};