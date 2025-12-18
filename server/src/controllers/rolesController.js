import { role } from "../config/config.js"; // Class-based model from config.js

// Get all roles
export const getAllRoles = async (req, res) => {
  try {
    const rolesList = await role.findAll(); // class method
    res.json(rolesList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single role by role_id
export const getRoleById = async (req, res) => {
  try {
    const singleRole = await role.findByPk(req.params.role_id); // class method
    if (!singleRole) return res.status(404).json({ message: "Role not found" });
    res.json(singleRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new role
export const createRole = async (req, res) => {
  try {
    const newRole = await role.create(req.body); // class method
    res.status(201).json(newRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a role
export const updateRole = async (req, res) => {
  try {
    const singleRole = await role.findByPk(req.params.role_id);
    if (!singleRole) return res.status(404).json({ message: "Role not found" });

    await singleRole.update(req.body);
    res.json(singleRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a role
export const deleteRole = async (req, res) => {
  try {
    const singleRole = await role.findByPk(req.params.role_id);
    if (!singleRole) return res.status(404).json({ message: "Role not found" });

    await singleRole.destroy();
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};