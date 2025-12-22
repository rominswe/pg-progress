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
  if (!req.session.user) return res.status(401).json({ error: "Unauthorized Access" });

  // Re-fetch user to ensure up-to-date data
  let user;
  const tableName = req.session.user.table.toLowerCase();

  // Handle dynamic examiner tables
  if (tableName === "examiner") {
    user = await examiner.findByPk(req.session.user.userId);
    if (!user) {
      user = await visiting_staff.findByPk(req.session.user.userId);
      if (user) req.session.user.table = "visitingstaff";
    }
  } else {
    const Model = modelMap[tableName];
    if (!Model) return res.status(401).json({ error: "Invalid user table" });
    user = await Model.findByPk(req.session.user.userId);
  }

  if (!user) {
    req.session.destroy();
    return res.status(401).json({ error: "User not found" });
  }

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
  req.user.table = req.session.user.table;

  next();
};