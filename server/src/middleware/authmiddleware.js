// middleware/authmiddleware.js

export const protect = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Normalize user object
  req.user = {
    id: req.session.user.id,
    email: req.session.user.email,
    role_id: req.session.user.role,
    table: req.session.user.table,
  };

  next();
};