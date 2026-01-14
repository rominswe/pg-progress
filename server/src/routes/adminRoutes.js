import express from "express";
import {
  // Student routes
  createStudentAdmin,
  getAllStudentsAdmin,
  updateStudentAdmin,
  deleteStudentAdmin,
  // Staff routes
  createInternalStaffAdmin,
  createExternalStaffAdmin,
  getAllStaffAdmin,
  updateStaffAdmin,
  deleteStaffAdmin,
  // Program routes
  createProgramAdmin,
  getAllProgramsAdmin,
  updateProgramAdmin,
  deleteProgramAdmin,
  // Document routes
  getAllDocumentsAdmin,
  updateDocumentAdmin,
  deleteDocumentAdmin
} from "../controllers/adminController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// ================= STUDENT =================
const studentRouter = express.Router();
studentRouter.post("/", createStudentAdmin);
studentRouter.get("/", getAllStudentsAdmin);
studentRouter.put("/:master_id", updateStudentAdmin);
studentRouter.delete("/:master_id", deleteStudentAdmin);

router.use("/students", protect, requireRole("CGSADM"), studentRouter);

// ================= STAFF =================
const staffRouter = express.Router();
staffRouter.post("/internal", createInternalStaffAdmin);
staffRouter.post("/external", createExternalStaffAdmin);
staffRouter.get("/", getAllStaffAdmin);
staffRouter.put("/:target_role/:source/:id", updateStaffAdmin);
staffRouter.delete("/:target_role/:source/:id", deleteStaffAdmin);

router.use("/staff", protect, requireRole("CGSADM"), staffRouter);

// ================= PROGRAM =================
const programRouter = express.Router();
programRouter.post("/", createProgramAdmin);
programRouter.get("/", getAllProgramsAdmin);
programRouter.put("/", updateProgramAdmin);
programRouter.delete("/:Prog_Code", deleteProgramAdmin);

router.use("/programs", protect, requireRole("CGSADM"), programRouter);

// ================= DOCUMENT =================
const documentRouter = express.Router();
documentRouter.get("/", getAllDocumentsAdmin);
documentRouter.put("/:doc_up_id", updateDocumentAdmin);
documentRouter.delete("/:doc_up_id", deleteDocumentAdmin);

router.use("/documents", protect, requireRole("CGSADM"), documentRouter);

export default router;