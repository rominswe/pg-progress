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
import milestoneRoutes from "./routes/milestoneRoutes.js";

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
    secure: true,
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

const parsePortalPort = (urlString) => {
  if (!urlString) return null;
  try {
    const parsed = new URL(urlString);
    if (parsed.port) return parsed.port;
    return parsed.protocol === "https:" ? "443" : "80";
  } catch {
    return null;
  }
};

const FRONTEND_USER_ORIGIN = process.env.FRONTEND_USER_URL?.toLowerCase() || "";
const FRONTEND_ADMIN_ORIGIN = process.env.FRONTEND_ADMIN_URL?.toLowerCase() || "";
const FRONTEND_USER_PORT = parsePortalPort(process.env.FRONTEND_USER_URL);
const FRONTEND_ADMIN_PORT = parsePortalPort(process.env.FRONTEND_ADMIN_URL);

const PORTAL_CSRF_COOKIE_NAMES = {
  user: "USER-XSRF-TOKEN",
  admin: "ADMIN-XSRF-TOKEN",
};

const detectPortalType = (req) => {
  const origin = (req.headers.origin || "").toLowerCase();
  const referer = (req.headers.referer || "").toLowerCase();
  const sourcePortHeader = req.headers["x-source-port"];
  const sourcePort =
    typeof sourcePortHeader === "string"
      ? sourcePortHeader.trim()
      : sourcePortHeader?.toString() || "";
  const cookieString = req.headers.cookie || "";

  const portalHints = [
    { name: "user", origin: FRONTEND_USER_ORIGIN, port: FRONTEND_USER_PORT },
    { name: "admin", origin: FRONTEND_ADMIN_ORIGIN, port: FRONTEND_ADMIN_PORT },
  ];

  for (const portal of portalHints) {
    if (portal.origin && origin === portal.origin) {
      return portal.name;
    }
    if (portal.origin && referer.startsWith(portal.origin)) {
      return portal.name;
    }
    if (portal.port && sourcePort === portal.port) {
      return portal.name;
    }
  }

  const hasAdminSessionCookie = cookieString.includes("admin_session=");
  const hasUserSessionCookie = cookieString.includes("user_session=");

  if (hasAdminSessionCookie && !hasUserSessionCookie) {
    return "admin";
  }

  if (hasUserSessionCookie && !hasAdminSessionCookie) {
    return "user";
  }

  return null;
};

// Dynamic session middleware dispatcher
// Uses cached middleware instances instead of creating new ones per request
const dynamicSessionMiddleware = (req, res, next) => {
  const portalType = detectPortalType(req);
  req.portalType = portalType || "unknown";

  if (portalType === "user") {
    return userSession(req, res, next);
  }

  if (portalType === "admin") {
    return adminSession(req, res, next);
  }

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
// Middleware to generate CSRF token per session and set portal-specific cookie
app.use((req, res, next) => {
  // Generate token only once per session
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }

  // Expose token to frontend via cookie
  const portalCookieName =
    PORTAL_CSRF_COOKIE_NAMES[req.portalType] || "XSRF-TOKEN";

  res.cookie(portalCookieName, req.session.csrfToken, {
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
app.use("/api/milestones", milestoneRoutes);

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
