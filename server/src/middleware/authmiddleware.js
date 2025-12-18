import jwt from "jsonwebtoken";

export const protect = (roles = []) => (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Unauthorized Access" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
