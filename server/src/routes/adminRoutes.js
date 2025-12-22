import express from "express";
const router = express.Router();

/* ================= MIDDLEWARE ================= */
import {protect} from "../middleware/authmiddleware.js";

/* ================= CONTROLLERS ================= */
import {
  getAllStudentsAdmin,
  updateStudentAdmin,
  deleteStudentAdmin,

  getAllSupervisorsAdmin,
  getAllExaminersAdmin,
  getAllVisitingStaffAdmin,

  getAllDepartmentsAdmin,
  updateDepartmentAdmin,

  getAllProgramsAdmin,
  getAllProgressAdmin,

  getAllDocumentsAdmin,
  deleteDocumentAdmin,

  getAuditLogsAdmin,
  getLoginAttemptsAdmin
} from "../controllers/adminController.js";

/* ================= ROUTE PROTECTION ================= */
router.use(protect()); // 🛡️ PROTECT ALL ROUTES
router.use(protect(["CGSADM"])); // 🔐 ONLY CGS ADMIN

/* ================= STUDENTS ================= */
router.get("/students", getAllStudentsAdmin);
router.put("/students/:master_id", updateStudentAdmin);
router.delete("/students/:master_id", deleteStudentAdmin);

/* ================= SUPERVISORS ================= */
router.get("/supervisors", getAllSupervisorsAdmin);

/* ================= EXAMINERS ================= */
router.get("/examiners", getAllExaminersAdmin);

/* ================= VISITING STAFF ================= */
router.get("/visiting-staff", getAllVisitingStaffAdmin);

/* ================= DEPARTMENTS ================= */
router.get("/departments", getAllDepartmentsAdmin);
router.put("/departments/:Dep_Code", updateDepartmentAdmin);

/* ================= PROGRAMS ================= */
router.get("/programs", getAllProgramsAdmin);

/* ================= PROGRESS ================= */
router.get("/progress", getAllProgressAdmin);

/* ================= DOCUMENTS ================= */
router.get("/documents", getAllDocumentsAdmin);
router.delete("/documents/:doc_up_id", deleteDocumentAdmin);

/* ================= SECURITY / AUDIT ================= */
router.get("/auditlogs", getAuditLogsAdmin);
router.get("/loginattempts", getLoginAttemptsAdmin);

export default router;