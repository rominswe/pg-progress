import {cgs_admin} from "../config/config.js";

// Get all admins
export const getAllAdmins = async (req, res) => {
  try { 
    const admins = await cgs_admin.findAll();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single admin by cgs_id
export const getAdminById = async (req, res) => {
  try {
    const admin = await cgs_admin.findByPk(req.params.cgs_id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new admin
export const createAdmin = async (req, res) => {
  try {
    const newAdmin = await cgs_admin.create(req.body);
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an admin
export const updateAdmin = async (req, res) => {
  try {
    const admin = await cgs_admin.findByPk(req.params.cgs_id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    await admin.update(req.body);
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an admin
export const deleteAdmin = async (req, res) => {
  try {
    const admin = await cgs_admin.findByPk(req.params.cgs_id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    await admin.destroy();
    res.json({ message: "Admin deleted successfully" });
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};