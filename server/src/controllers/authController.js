import { masterStu, supervisor } from "../config/config.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Login controller
export const login = async (req, res) => {
  const { role } = req.params; // 'student' or 'supervisor'
  const { email, password } = req.body;

  console.log("=== LOGIN ATTEMPT ===");
  console.log("Role:", role);
  console.log("Email:", email);
  console.log("Password:", password);

  try {
    let user;

    if (role === "student") {
      user = await masterStu.findOne({ where: { stu_email: email } });
    } else if (role === "supervisor") {
      user = await supervisor.findOne({ where: { emp_email: email } });
    } else {
      return res.status(401).json({ error: "Invalid role" });
    }

    if (!user) return res.status(401).json({ error: "User not found" });

    // Compare password
    // const valid = await bcrypt.compare(password, user.Password);
    const valid = password === user.Password; // Temporary plain text comparison for testing
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.stu_id || user.emp_id, role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ token, user: { id: user.stu_id || user.emp_id, name: user.Name || user.Name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};