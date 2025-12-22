import express from "express";
import { protect } from "../middleware/authmiddleware.js";
import {
  getAllVisitingStaff,
  getVisitingStaffById,
  createVisitingStaff,
  updateVisitingStaff,
  deleteVisitingStaff
} from "../controllers/visitingStaffController.js";

const router = express.Router();

// Admin access for external examiner management
router.get("/", protect(["CGSADM", "EXCGS"]), getAllVisitingStaff);
router.get("/:staff_id", protect(["CGSADM", "EXCGS"]), getVisitingStaffById);
router.post("/", protect(["CGSADM"]), createVisitingStaff);
router.put("/:staff_id", protect(["CGSADM"]), updateVisitingStaff);
router.delete("/:staff_id", protect(["CGSADM"]), deleteVisitingStaff);

export default router;