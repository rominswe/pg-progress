import { masterStu, supervisor, cgs_admin } from "../config/config.js";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";

const cookieOptions = (maxAge) => ({
httpOnly: true,
secure: process.env.NODE_ENV === 'production', // true in prod 
sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // lax in dev
maxAge
});

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

    res
    .cookie('accessToken', accessToken, cookieOptions(60 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    .json({
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
    const user = await supervisor.findOne({ where: { EmailId: email } });

    if (!user) return res.status(401).json({ error: "User not found" });

    
    const valid = password === user.Password;
    // const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const accessToken = signAccessToken({ id: user.emp_id, role: "supervisor" });
    const refreshToken = signRefreshToken({ id: user.emp_id, role: "supervisor" });

    res
    .cookie('accessToken', accessToken, cookieOptions(60 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    .json({
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

    res
    .cookie('accessToken', accessToken, cookieOptions(60 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    .json({
      role: "cgs",
      user: { id: user.emp_id, name: user.Name }
    });

  } catch (err) {
    console.error("CGS LOGIN:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccess = signAccessToken({
      id: decoded.id,
      role: decoded.role
    });
    res.cookie('accessToken', newAccess, cookieOptions(60 * 60 * 1000));
    res.json({ success: true });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

export const logout = (req, res) => {
  res
  .clearCookie('accessToken')
  .clearCookie('refreshToken')
  .json({ message: "Logout success" });
};

export const me = (req, res) => {
  res.json({
    user: req.user
  });
};
