import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./config/redis.js";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.js";
import lusca from "lusca";

/* ================= ROUTES ================= */
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import empinfoRoutes from "./routes/empinfoRoutes.js";
import loginAttemptRoutes from "./routes/loginAttemptRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import programInfoRoutes from "./routes/programInfoRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import studentInfoRoutes from "./routes/studentInfoRoutes.js";
import tblDepartmentsRoutes from "./routes/tblDepartmentsRoutes.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();
const { csrf } = lusca;

const allowedOrigins = new Set([
  process.env.FRONTEND_USER_URL,
  process.env.FRONTEND_ADMIN_URL,
]);

/* ================= CORS ================= */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: This origin is not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

/* ================= SESSION (REDIS) ================= */
export const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  name: "sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 1000 * 60 * 60 * 3, // 3 hours
  },
});

app.use(sessionMiddleware);

/* ================= CSRF (BEST PRACTICE) ================= */
app.use((req, res, next) => {
  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

  if (
    safeMethods.has(req.method) ||
    req.path === "/health" ||
    req.path.startsWith("/api/auth")
  ) {
    return next();
  }

  return csrf()(req, res, next);
});

/* ================= API ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/employees", empinfoRoutes);
app.use("/api/login-attempts", loginAttemptRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/program-info", programInfoRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/students", studentInfoRoutes);
app.use("/api/departments", tblDepartmentsRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is reachable",
  });
});

/* ================= 404 ================= */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;