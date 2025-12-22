import jwt from "jsonwebtoken";
import { cgs, supervisor, master_stu, examiner, visiting_staff } from "../config/config.js";

// Map table names for dynamic lookup
const modelMap = {
  cgs,
  supervisor,
  student: master_stu,
  examiner,       // internal examiner
  visitingstaff: visiting_staff, // external examiner
};

export const protect = (roles = []) => async (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized Access" });

  try {
    // Verify token using access secret
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    let user;
    const tableName = decoded.table.toLowerCase();

    // Handle dynamic examiner tables
    if (tableName === "examiner") {
      user = await examiner.findByPk(decoded.userId);
      if (!user) {
        user = await visiting_staff.findByPk(decoded.userId);
        if (user) decoded.table = "visitingstaff"; // update table for downstream
      }
    } else {
      const Model = modelMap[tableName];
      if (!Model) return res.status(401).json({ error: "Invalid user table" });
      user = await Model.findByPk(decoded.userId);
    }

    if (!user) return res.status(401).json({ error: "User not found" });

    // Check account status
    if (user.Status === "Pending") {
      return res.status(403).json({ error: "Account pending verification" });
    }
    if (user.Status === "Inactive") {
      return res.status(403).json({ error: "Account inactive" });
    }

    // Enforce role if roles array is provided
    if (roles.length && !roles.includes(user.role_id)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    // Attach user info and table name for downstream usage
    req.user = user;
    req.user.table = decoded.table;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
};