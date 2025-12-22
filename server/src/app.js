import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.js";
/* ================= ROUTES ================= */
import authRoutes from "./routes/authRoutes.js";
import empinfoRoutes from "./routes/empinfoRoutes.js";
import masterStuRoutes from "./routes/masterStuRoutes.js";
import programInfoRoutes from "./routes/programinfoRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import roleRoutes from "./routes/rolesRoutes.js";
import studentinfoRoutes from "./routes/studentInfoRoutes.js";
import supervisorRoutes from "./routes/supervisorRoutes.js";
import supervisoryMeetingRoutes from "./routes/supervisoryMeetingRoutes.js";
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
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

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
app.use(express.json());
app.use(cookieParser());
app.use(logger);

/* ================= API ROUTES ================= */
app.use("/auth", authRoutes);

app.use("/empinfo", empinfoRoutes);
app.use("/masterstu", masterStuRoutes);
app.use("/cgs", cgsRoutes);
app.use("/programs", programInfoRoutes);
app.use("/progress", progressRoutes);
app.use("/roles", roleRoutes);
app.use("/studentsinfo", studentinfoRoutes);
app.use("/supervisors", supervisorRoutes);
app.use("/examiners", examinerRoutes);
app.use("/visiting-staff", visitingStaffRoutes);
app.use("/supervisory-meetings", supervisoryMeetingRoutes);
app.use("/departments", tblDepartmentsRoutes);

/* ================= ADMIN / SYSTEM ================= */
app.use("/admin", adminRoutes);
app.use("/auditlogs", auditLogRoutes);
app.use("/loginattempts", loginAttemptRoutes);
app.use("/refreshtokens", refreshTokenRoutes);
app.use("/verification-tokens", verificationTokenRoutes);
export default app;