// middleware/authMiddleware.js

export const protect = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Normalize user object
  req.user = {
    id: req.session.user.id,
    email: req.session.user.email,
    role_id: req.session.user.role_id,
    table: req.session.user.table,
    FirstName: req.session.user.FirstName,
    LastName: req.session.user.LastName,
  };

  next();
};