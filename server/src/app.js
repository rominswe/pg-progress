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
import notificationRoutes from "./routes/notificationRoutes.js";
import calendarRoutes from "./routes/calendarRoutes.js";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const app = express();

// Diagnostic logging - AT THE VERY TOP
app.use((req, res, next) => {
  if (!req.path.startsWith("/health") && !req.path.includes(".")) {
    const sidVal = req.headers.cookie?.split(';')?.find(c => c.trim().startsWith('sid='))?.split('=')[1];
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
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token", "X-Auth-Token", "X-Source-Port"],
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

// Base session configuration
const baseSessionConfig = {
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
};

// Pre-create session middleware instances to prevent memory leaks (MaxListenersExceededWarning)
const userSession = session({
  ...baseSessionConfig,
  name: "user_session",
});

const adminSession = session({
  ...baseSessionConfig,
  name: "admin_session",
});

const defaultSession = session({
  ...baseSessionConfig,
  name: "sid",
});

// Dynamic session middleware dispatcher
// Uses cached middleware instances instead of creating new ones per request
const dynamicSessionMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  // Fallback: Check custom X-Source-Port header for robustness
  const sourcePort = req.headers['x-source-port'];
  // Check cookie string for socket/direct access if headers are missing
  const cookieString = req.headers.cookie || "";

  // DEBUG: Trace session selection
  // console.log(`[Session] ${req.method} ${req.url} | Origin: ${origin} | Port: ${sourcePort} | Cookies: ${cookieString ? 'Present' : 'None'}`);

  // Prioritize User Session
  if (
    origin === process.env.FRONTEND_USER_URL ||
    req.headers.referer?.startsWith(process.env.FRONTEND_USER_URL) ||
    sourcePort === '5173' ||
    cookieString.includes("user_session=")
  ) {
    // console.log(" -> Selected: USER Session");
    return userSession(req, res, next);
  }

  // Check Admin Session
  if (
    origin === process.env.FRONTEND_ADMIN_URL ||
    req.headers.referer?.startsWith(process.env.FRONTEND_ADMIN_URL) ||
    sourcePort === '5174' ||
    cookieString.includes("admin_session=")
  ) {
    // console.log(" -> Selected: ADMIN Session");
    return adminSession(req, res, next);
  }

  // Fallback
  // console.log(" -> Selected: DEFAULT Session (Fallback)");
  return defaultSession(req, res, next);
};

// Apply dynamic middleware to app
app.use(dynamicSessionMiddleware);

// Export for Socket.IO
export const sessionMiddleware = dynamicSessionMiddleware;

// Diagnostic logging
app.use((req, res, next) => {
  if (!req.path.startsWith("/health")) {
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/calendar", calendarRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is reachable",
  });
});

/* ================= 404 ================= */
app.use((req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

/* ================= GLOBAL ERROR HANDLER ================= */
app.use((err, req, res, next) => {
  console.error("🔥 Global Error Error:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

export default app;