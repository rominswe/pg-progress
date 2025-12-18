import { masterStu } from "../config/config.js";

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await masterStu.findAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single student by master_id (primary key)
export const getStudentById = async (req, res) => {
  try {
    const student = await masterStu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new student (password is hashed automatically by hook)
export const createStudent = async (req, res) => {
  try {
    const newStudent = await masterStu.create(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a student (password will be rehashed automatically if changed)
export const updateStudent = async (req, res) => {
  try {
    const student = await masterStu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.update(req.body);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a student
export const deleteStudent = async (req, res) => {
  try {
    const student = await masterStu.findByPk(req.params.master_id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.destroy();
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};