import { studentinfo } from "../config/config.js";

// Get all students
export const getAllStudinfo = async (req, res) => {
  try {
    const students = await studentinfo.findAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single student by stu_id
export const getStudinfoById = async (req, res) => {
  try {
    const student = await studentinfo.findByPk(req.params.stu_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new student
export const createStudinfo = async (req, res) => {
  try {
    // Password will automatically be hashed via the model hook
    const newStudent = await studentinfo.create(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a student
export const updateStudinfo = async (req, res) => {
  try {
    const student = await studentinfo.findByPk(req.params.stu_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // If password is included in update, it will automatically be hashed
    await student.update(req.body);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a student
export const deleteStudinfo = async (req, res) => {
  try {
    const student = await studentinfo.findByPk(req.params.stu_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.destroy();
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
