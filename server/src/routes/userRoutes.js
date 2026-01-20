import express from "express";
import { getAllPGUsers, searchUser, getSystemUser, getUserDetails, registerUser, toggleUserStatus, getDashboardStats } from "../controllers/userController.js";
import { getAssignableRoles } from "../controllers/rolesController.js";
import { requestAssignment, approveAssignment, rejectAssignment, getAssignments, getAllPendingAssignments, getPendingExecutiveAssignments, getAssignmentStats, deleteAssignment, getAssignmentTypes } from "../controllers/roleAssignmentController.js";
import { requestReactivation } from "../controllers/reactivationController.js";
import { protect, allowAdminOrDirector } from "../middleware/authMiddleware.js";
import { searchUserForAssignment } from "../controllers/roleAssignmentController.js";
import { requireRole } from "../middleware/rbacMiddleware.js";
import { getAssignableProgramInfo } from "../controllers/programInfoController.js";
import { getQualifications, getExpertise, getStaffCredentialsMetadata } from "../controllers/metadataController.js";
import { getUniversities } from "../controllers/universityController.js";

const router = express.Router();

// ================= FETCH USER INFORMATION =================
router.get("/search-info", protect, requireRole("CGSADM", "CGSS"), searchUser);
router.get("/system-user/:id", protect, requireRole("CGSADM", "CGSS"), getSystemUser);
router.get("/user-details/:id", protect, requireRole("CGSADM", "CGSS"), getUserDetails);
router.get("/all-pg-users", protect, requireRole("CGSADM", "CGSS"), getAllPGUsers);
router.get("/dashboard-stats", protect, requireRole("CGSADM", "CGSS"), getDashboardStats);
router.get("/roles/assignable", protect, requireRole("CGSADM", "CGSS"), getAssignableRoles);

// ================= REGISTER USER =================
router.post('/register-user', protect, requireRole("CGSADM", "CGSS"), registerUser);

// ================= USER LIFECYCLE MANAGEMENT =================
// Unified Status Toggle (Deactivate/Reactivate) for Students and Staff
router.put("/manage/status/toggle", protect, requireRole("CGSADM"), toggleUserStatus);
router.post("/request-reactivation", protect, requireRole("CGSADM", "CGSS"), requestReactivation);

// ================= ROLE(Supervisor or Examiner) ASSIGNMENT MANAGEMENT =================
router.get("/assignments/search", protect, requireRole("CGSADM", "CGSS"), searchUserForAssignment);
router.get("/assignments/types", protect, requireRole("CGSADM", "CGSS"), getAssignmentTypes);
router.post("/assignments/request", protect, requireRole("CGSADM", "CGSS"), requestAssignment);
router.post("/assignments/approve", protect, allowAdminOrDirector, approveAssignment);
router.get("/assignments/pending", protect, requireRole("CGSADM", "CGSS"), getAllPendingAssignments);
router.get("/assignments/pending/executive", protect, allowAdminOrDirector, getPendingExecutiveAssignments);
router.post("/assignments/reject", protect, allowAdminOrDirector, rejectAssignment);
router.get("/assignments/stats", protect, requireRole("CGSADM", "CGSS"), getAssignmentStats);
router.get("/assignments/:id", protect, requireRole("CGSADM", "CGSS"), getAssignments);
router.delete("/assignments/:id", protect, requireRole("CGSADM", "CGSS"), deleteAssignment);

// ================= PROGRAM INFORMATION =================
router.get("/program/assignable", protect, requireRole("CGSADM", "CGSS"), getAssignableProgramInfo);

// ================= ACADEMIC CREDENTIALS METADATA =================
router.get("/academic-credentials/qualifications", protect, requireRole("CGSADM", "CGSS"), getQualifications);
router.get("/academic-credentials/expertise", protect, requireRole("CGSADM", "CGSS"), getExpertise);
router.get("/academic-credentials/staff-metadata", protect, requireRole("CGSADM", "CGSS"), getStaffCredentialsMetadata);

// ================= UNIVERSITY METADATA =================
router.get("/universities/search", protect, getUniversities);

export default router;