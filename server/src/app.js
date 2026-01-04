import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path  from "node:path";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.js";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./config/redis.js";

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
const allowedOrigins = new Set(["http://localhost:5173", "http://localhost:5174"]);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

app.use(
    cors({
        origin: function (origin, callback){
          if (!origin) return callback(null, true);
          if (allowedOrigins.has(origin)) {
            callback(null, true);
          } else {
        callback(new Error("CORS policy: This origin is not allowed"));
      }
    }, 
        credentials: true
    }));

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    name: "sid", // cookie name
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 3, // 3 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;