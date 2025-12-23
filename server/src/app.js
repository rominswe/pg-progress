import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.js";
import session from "express-session";
import connectRedis from "connect-redis";
import redisClient from "./config/redis.js";
/* ================= ROUTES ================= */
import authRoutes from "./routes/authRoutes.js";
import empinfoRoutes from "./routes/empinfoRoutes.js";
import masterStuRoutes from "./routes/masterStuRoutes.js";
import programInfoRoutes from "./routes/programinfoRoutes.js";
import roleRoutes from "./routes/rolesRoutes.js";
import studentinfoRoutes from "./routes/studentInfoRoutes.js";
import supervisorRoutes from "./routes/supervisorRoutes.js";
import tblDepartmentsRoutes from "./routes/tblDepartmentsRoutes.js";
import examinerRoutes from "./routes/examinerRoutes.js";
import visitingStaffRoutes from "./routes/visitingStaffRoutes.js";
import cgsRoutes from "./routes/cgsRoutes.js";

/* ===== System / Security ===== */
import adminRoutes from "./routes/adminRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import loginAttemptRoutes from "./routes/loginAttemptRoutes.js";
import refreshTokenRoutes from "./routes/refreshTokenRoutes.js";
import verificationTokenRoutes from "./routes/verificationTokenRoutes.js";

dotenv.config();
const app = express();
const RedisStore = connectRedis(session);
const allowedOrigins = new Set(["http://localhost:5173", "http://localhost:5174"]);

app.use(
    cors({
        origin: function (origin, callback){
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
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
app.use(express.json());
app.use(cookieParser());
app.use(logger);

/* ================= API ROUTES ================= */
app.use("/auth", authRoutes);

app.use("/empinfo", empinfoRoutes);
app.use("/masterstu", masterStuRoutes);
app.use("/cgs", cgsRoutes);
app.use("/programs", programInfoRoutes);
app.use("/roles", roleRoutes);
app.use("/studentsinfo", studentinfoRoutes);
app.use("/supervisors", supervisorRoutes);
app.use("/examiners", examinerRoutes);
app.use("/visiting-staff", visitingStaffRoutes);
app.use("/departments", tblDepartmentsRoutes);

/* ================= ADMIN / SYSTEM ================= */
app.use("/admin", adminRoutes);
app.use("/auditlogs", auditLogRoutes);
app.use("/loginattempts", loginAttemptRoutes);
app.use("/refreshtokens", refreshTokenRoutes);
app.use("/verification-tokens", verificationTokenRoutes);
export default app;