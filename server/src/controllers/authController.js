import { masterStu, supervisor, cgs_admin } from "../config/config.js";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";

/* ================= STUDENT LOGIN ================= */
export const studentLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await masterStu.findOne({ where: { stu_email: email } });
    if (!user) return res.status(401).json({ error: "User not found" });

    const valid = password === user.Password;
    // const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const accessToken = signAccessToken({ id: user.stu_id, role: "student" });
    const refreshToken = signRefreshToken({ id: user.stu_id, role: "student" });

    res.json({
      accessToken,
      refreshToken,
      role: "student",
      user: { id: user.stu_id, name: user.Name }
    });
    
    console.log("Backend received:", req.body);

  } catch (err) {
    console.error("STUDENT LOGIN:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= SUPERVISOR LOGIN ================= */
export const supervisorLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await supervisor.findOne({ where: { emp_email: email } });
    if (!user) return res.status(401).json({ error: "User not found" });

    
    const valid = password === user.Password;
    // const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const accessToken = signAccessToken({ id: user.emp_id, role: "supervisor" });
    const refreshToken = signRefreshToken({ id: user.emp_id, role: "supervisor" });

    res.json({
      accessToken,
      refreshToken,
      role: "supervisor",
      user: { id: user.emp_id, name: user.Name }
    });

  } catch (err) {
    console.error("SUPERVISOR LOGIN:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= CGS LOGIN ================= */
export const cgsLogin = async (req, res) => {
  const { email, password } = req.body;
  

  try {
    const user = await cgs_admin.findOne({ where: { EmailId: email } });
    if (!user) return res.status(401).json({ error: "User not found" });

    console.log("Found user:", user);
    
    const valid = password === user.Password;
    console.log("Password valid?", valid);
    // const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const accessToken = signAccessToken({ id: user.emp_id, role: "cgs" });
    const refreshToken = signRefreshToken({ id: user.emp_id, role: "cgs" });

    res.json({
      accessToken,
      refreshToken,
      role: "cgs",
      user: { id: user.emp_id, name: user.Name }
    });

  } catch (err) {
    console.error("CGS LOGIN:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccess = signAccessToken({
      id: decoded.id,
      role: decoded.role
    });
    res.json({ accessToken: newAccess });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

export const logout = (req, res) => {
  res.json({ message: "Logout success" });
};