import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { logger } from "./utils/logger.js";
import authRoutes from "./routes/authRoutes.js";
import empinfoRoutes from "./routes/empInfoRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import masterStuRoutes from "./routes/masterStuRoutes.js";
import programInfoRoutes from "./routes/programInfoRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import roleRoutes from "./routes/rolesRoutes.js";
import studentinfoRoutes from "./routes/studentInfoRoutes.js";
import supervisorRoutes from "./routes/supervisorRoutes.js";
import supervisoryMeetingRoutes from "./routes/supervisoryMeetingRoutes.js";
import thesisRoutes from "./routes/thesisRoutes.js";
import tblDepartmentsRoutes from "./routes/tblDepartmentsRoutes.js";
import cgsadminRoutes from "./routes/cgsAdminRoutes.js";
// import examinerRoutes from "./routes/examinerRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

// Use auth routes
app.use("/auth", authRoutes);

// Use routes
app.use("/empinfo", empinfoRoutes);
app.use("/evaluation", evaluationRoutes);
app.use("/masterstu", masterStuRoutes);
app.use("/programs", programInfoRoutes);
app.use("/progress", progressRoutes);
app.use("/roles", roleRoutes);
app.use("/studentsinfo", studentinfoRoutes);
app.use("/supervisors", supervisorRoutes);
app.use("/supervisory-meetings", supervisoryMeetingRoutes);
app.use("/thesis", thesisRoutes);
app.use("/departments", tblDepartmentsRoutes);
app.use("/cgsadmin", cgsadminRoutes);
// app.use("/examiner", examinerRoutes);


export default app;