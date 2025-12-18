import { masterStu, supervisor, cgs } from "../config/config.js";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";

const cookieOptions = (maxAge) => {
const isProd = process.env.NODE_ENV === 'production';
return{
httpOnly: true,
secure: isProd, // true in prod 
sameSite: isProd? 'strict' : 'lax', // lax in dev
maxAge,
path: '/'
}
};

/* ================= LOGIN HANDLER  ================= */
const loginHandler = async (user, role, res) => {
  const accessToken = signAccessToken({ id: user.id, role });
  const refreshToken = signRefreshToken({ id: user.id, role });

  res
    .cookie('accessToken', accessToken, cookieOptions(60 * 60 * 1000))
    .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    .json({
      role,
      user: { id: user.id, name: user.Name, role }
    });
};

/* ================= STUDENT LOGIN ================= */
export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await masterStu.findOne({ where: { stu_email: email } });
    if (!user) return res.status(401).json({ error: "User not found" });

    const valid = password === user.Password;
    // const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    await loginHandler({ id: user.stu_id, Name: user.Name }, "student", res);

    // const accessToken = signAccessToken({ id: user.stu_id, role: "student" });
    // const refreshToken = signRefreshToken({ id: user.stu_id, role: "student" });

    // res
    // .cookie('accessToken', accessToken, cookieOptions(60 * 60 * 1000))
    // .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    // .json({
    //   role: "student",
    //   user: { id: user.stu_id, name: user.Name }
    // });
    
    console.log("Backend received:", req.body);

  } catch (err) {
    console.error("STUDENT LOGIN:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= SUPERVISOR LOGIN ================= */
export const supervisorLogin = async (req, res) => {
  
  try {
    const { email, password } = req.body;
    const user = await supervisor.findOne({ where: { emp_email: email } });
    if (!user) return res.status(401).json({ error: "User not found" });

    const valid = password === user.Password;
    // const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    await loginHandler({ id: user.emp_id, Name: user.Name }, "supervisor", res);

    // const accessToken = signAccessToken({ id: user.emp_id, role: "supervisor" });
    // const refreshToken = signRefreshToken({ id: user.emp_id, role: "supervisor" });

    // res
    // .cookie('accessToken', accessToken, cookieOptions(60 * 60 * 1000))
    // .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    // .json({
    //   role: "supervisor",
    //   user: { id: user.emp_id, name: user.Name }
    // });

  } catch (err) {
    console.error("SUPERVISOR LOGIN:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= CGS LOGIN ================= */
export const cgsLogin = async (req, res) => {  

  try {
    const { email, password } = req.body;
    const user = await cgs.findOne({ where: { EmailId: email } });
    if (!user) return res.status(401).json({ error: "User not found" });

    console.log("Found user:", user);
    
    const valid = password === user.Password;
    console.log("Password valid?", valid);
    // const valid = await bcrypt.compare(password, user.Password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    await loginHandler({ id: user.emp_id, Name: `${user.FirstName} ${user.LastName}`,role: user.role }, "cgs", res);

    // const accessToken = signAccessToken({ id: user.emp_id, role: "cgs" });
    // const refreshToken = signRefreshToken({ id: user.emp_id, role: "cgs" });

    // res
    // .cookie('accessToken', accessToken, cookieOptions(60 * 60 * 1000))
    // .cookie('refreshToken', refreshToken, cookieOptions(7 * 24 * 60 * 60 * 1000))
    // .json({
    //   role: "cgs",
    //   user: { id: user.emp_id, name: user.Name }
    // });
    
    user.role, // also sign JWT with actual role
    res

  } catch (err) {
    console.error("CGS LOGIN:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ================= REFRESH TOKEN ================= */
export const refreshToken = (req, res) => {
//   if (!req.cookies.refreshToken) {
//   return res.status(401).json({ error: "Logged out" });
// }
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: "Logged out" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const newAccess = signAccessToken({
      id: decoded.id,
      role: decoded.role
    });
    res.cookie('accessToken', newAccess, cookieOptions(60 * 60 * 1000));
    // res.json({ accessToken: newAccess });
    res.json({ ok: true });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

/* ================= LOGOUT ================= */
export const logout = (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
   res
    .clearCookie("accessToken", { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: isProd ? "strict" : "lax", 
      path: "/" 
    })
    .clearCookie("refreshToken", { 
      httpOnly: true, 
      secure: isProd, 
      sameSite: isProd ? "strict" : "lax", 
      path: "/"})
    .status(200)
    .json({ message: "Logout success" });
};
//   res
//   .clearCookie('accessToken', cookieOptions(0))
//   .clearCookie('refreshToken', cookieOptions(0))
//   .status(200)
//   .json({ message: "Logout success" });
// };

/* ================= ME ================= */
export const me = (req, res) => {
  res.json({
    user: req.user || null
  });
};
