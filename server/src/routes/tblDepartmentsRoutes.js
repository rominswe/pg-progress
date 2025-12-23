import express from 'express';
import {
  getAllDepartments,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/tblDepartmentsController.js';
import { protect } from '../middleware/authmiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
const router = express.Router();

// CRUD endpoints
router.get('/', protect, requireRole("CGSADM"), getAllDepartments);
router.get('/:Dep_Code', protect, requireRole("CGSADM", "EXCGS"), getDepartmentByCode); // use Dep_Code
router.post('/', protect, requireRole("CGSADM"), createDepartment);
router.put('/:Dep_Code', protect, requireRole("CGSADM"), updateDepartment);     // use Dep_Code
router.delete('/:Dep_Code', protect, requireRole("CGSADM"), deleteDepartment);  // use Dep_Code
export default router;