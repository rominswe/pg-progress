import express from "express";
const router = express.Router();

/* ================= MIDDLEWARE ================= */
import { protect } from "../middleware/authmiddleware.js";
import { requirePermission, requireRole, PERMISSION_PRESETS } from "../middleware/rbacMiddleware.js";
import { PERMISSIONS } from "../config/rbac.js";

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
// All admin routes require authentication and CGS Admin role
router.use(protect());
router.use(requireRole("CGSADM"));

/* ================= STUDENTS ================= */
router.get("/students", requirePermission(PERMISSIONS.MANAGE_STUDENTS), getAllStudentsAdmin);
router.put("/students/:master_id", requirePermission(PERMISSIONS.MANAGE_STUDENTS), updateStudentAdmin);
router.delete("/students/:master_id", requirePermission(PERMISSIONS.DELETE_USER), deleteStudentAdmin);

/* ================= SUPERVISORS ================= */
router.get("/supervisors", requirePermission(PERMISSIONS.MANAGE_SUPERVISORS), getAllSupervisorsAdmin);

/* ================= EXAMINERS ================= */
router.get("/examiners", requirePermission(PERMISSIONS.MANAGE_EXAMINERS), getAllExaminersAdmin);

/* ================= VISITING STAFF ================= */
router.get("/visiting-staff", requirePermission(PERMISSIONS.MANAGE_EXAMINERS), getAllVisitingStaffAdmin);

/* ================= DEPARTMENTS ================= */
router.get("/departments", requirePermission(PERMISSIONS.MANAGE_DEPARTMENTS), getAllDepartmentsAdmin);
router.put("/departments/:Dep_Code", requirePermission(PERMISSIONS.MANAGE_DEPARTMENTS), updateDepartmentAdmin);

/* ================= PROGRAMS ================= */
router.get("/programs", requirePermission(PERMISSIONS.MANAGE_PROGRAMS), getAllProgramsAdmin);

/* ================= PROGRESS ================= */
router.get("/progress", requirePermission(PERMISSIONS.VIEW_ALL_PROGRESS), getAllProgressAdmin);

/* ================= DOCUMENTS ================= */
router.get("/documents", requirePermission(PERMISSIONS.REVIEW_DOCUMENTS), getAllDocumentsAdmin);
router.delete("/documents/:doc_up_id", requirePermission(PERMISSIONS.APPROVE_DOCUMENTS), deleteDocumentAdmin);

/* ================= SECURITY / AUDIT ================= */
router.get("/auditlogs", requirePermission(PERMISSIONS.VIEW_AUDIT_LOGS), getAuditLogsAdmin);
router.get("/login-attempts", requirePermission(PERMISSIONS.VIEW_LOGIN_ATTEMPTS), getLoginAttemptsAdmin);

export default router;