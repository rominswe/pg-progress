import {tbldepartments} from "../config/config.js";

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await tbldepartments.findAll();
    res.json(departments);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

// Get single department by Dep_Code
export const getDepartmentByCode = async (req, res) => {
    try {
    const department = await tbldepartments.findByPk(req.params.Dep_Code);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json(department);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

// Create a new department
export const createDepartment = async (req, res) => {
    try {
    const newDepartment = await tbldepartments.create(req.body);
    res.status(201).json(newDepartment);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

// Update a department
export const updateDepartment = async (req, res) => {
    try {
    const department = await tbldepartments.findByPk(req.params.Dep_Code);
    if (!department) return res.status(404).json({ message: "Department not found" });
    await department.update(req.body);
    res.json(department);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};

// Delete a department
export const deleteDepartment = async (req, res) => {
    try {
    const department = await tbldepartments.findByPk(req.params.Dep_Code);
    if (!department) return res.status(404).json({ message: "Department not found" });
    await department.destroy();
    res.json({ message: "Department deleted successfully" });
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
};