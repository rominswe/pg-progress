import studinfo from "../models/studinfo.js";

// Get all students
export const getAllStudinfo = async (req, res) => {
  try {
    const students = await studinfo.findAll();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single student by stu_id
export const getStudinfoById = async (req, res) => {
  try {
    const student = await studinfo.findByPk(req.params.stu_id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new student
export const createStudinfo = async (req, res) => {
  try {
    const newStudent = await studinfo.create(req.body);
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a student
export const updateStudinfo = async (req, res) => {
  try {
    const student = await studinfo.findByPk(req.params.stu_id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.update(req.body);
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a student
export const deleteStudinfo = async (req, res) => {
  try {
    const student = await studinfo.findByPk(req.params.stu_id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.destroy();
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};