import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import session from "express-session";
import { RedisStore } from "connect-redis";
import redisClient from "./config/redis.js";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.js";
import crypto from "node:crypto";

/* ================= ROUTES ================= */
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/userRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import tblDepartmentsRoutes from "./routes/tblDepartmentsRoutes.js";
import programInfoRoutes from "./routes/programInfoRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
// Functionate feature routes
import progressRoutes from "./routes/progressRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import defenseEvaluationRoutes from "./routes/defenseEvaluationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();

// Diagnostic logging - AT THE VERY TOP
app.use((req, res, next) => {
  if (!req.path.startsWith("/health") && !req.path.includes(".")) {
    const sidVal = req.headers.cookie?.split(';')?.find(c => c.trim().startsWith('sid='))?.split('=')[1];
    console.log(`[REQ_START] ${req.method} ${req.path} - sid_cookie: ${sidVal ? 'FOUND' : 'MISSING'}, Host: ${req.headers.host}, Origin: ${req.headers.origin}`);
  }
  next();
});

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
app.use(express.json({ limit: "1gb" })); // Keep functionate limit for file uploads
app.use(express.urlencoded({ extended: true, limit: "1gb" }));
app.use(cookieParser());
app.use(logger);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ================= SESSION (REDIS / MEMORY) ================= */
let store;
if (redisClient.isOpen) {
  console.log("✅ Using Redis for Session Store");
  store = new RedisStore({ client: redisClient });
} else {
  console.log("⚠️  Redis not connected. Using MemoryStore for Session Store (Dev Mode).");
  store = new session.MemoryStore();
}

export const sessionMiddleware = session({
  store: store,
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

// Diagnostic logging
app.use((req, res, next) => {
  if (!req.path.startsWith("/health")) {
    console.log(`[REQ] ${req.method} ${req.path} - sid: ${req.cookies.sid ? 'YES' : 'NO'}, session.user: ${req.session?.user ? 'YES' : 'NO'}`);
  }
  next();
});


/* ================= SECURE CSRF TOKEN ================= */
// Middleware to generate CSRF token per session and set cookie
app.use((req, res, next) => {
  // Generate token only once per session
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }

  // Expose token to frontend via cookie
  res.cookie("XSRF-TOKEN", req.session.csrfToken, {
    httpOnly: false, // frontend JS can read
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });

  next();
});

// ================= CSRF BOOTSTRAP =================
app.get("/api/csrf-token", (req, res) => {
  // Session + CSRF token already created by middleware
  res.status(200).json({
    success: true,
    message: "CSRF token initialized",
  });
});


// CSRF validation middleware for mutating routes
app.use((req, res, next) => {
  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

  if (
    safeMethods.has(req.method) ||
    req.path === "/health" ||
    req.path.startsWith("/api/auth")
  ) {
    return next();
  }

  const csrfHeader = req.headers["x-csrf-token"];
  if (!csrfHeader || csrfHeader !== req.session.csrfToken) {
    return res.status(403).json({ message: "CSRF token invalid or missing" });
  }

  next();
});

/* ================= API ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/departments", tblDepartmentsRoutes);
app.use("/api/programs", programInfoRoutes);
app.use("/api/roles", rolesRoutes);
// Functionate feature routes
app.use("/api/progress", progressRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/defense-evaluations", defenseEvaluationRoutes);
app.use("/api/dashboard", dashboardRoutes);

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