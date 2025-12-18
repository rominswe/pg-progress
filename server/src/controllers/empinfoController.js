import { empinfo } from "../config/config.js";

// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const employees = await empinfo.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single employee by emp_id
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await empinfo.findByPk(req.params.emp_id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new employee
export const createEmployee = async (req, res) => {
  try {
    const newEmployee = await empinfo.create(req.body); // ✅ Password hashing is automatic
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an employee
export const updateEmployee = async (req, res) => {
  try {
    const employee = await empinfo.findByPk(req.params.emp_id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await employee.update(req.body); // ✅ Password rehash if updated
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await empinfo.findByPk(req.params.emp_id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await employee.destroy();
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
