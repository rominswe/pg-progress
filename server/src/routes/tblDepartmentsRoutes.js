import express from 'express';
import {
  getAllDepartments,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/tblDepartmentsController.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// CRUD endpoints
router.get('/', protect(["CGSADM"]), getAllDepartments);
router.get('/:Dep_Code', protect(["CGSADM", "EXCGS"]), getDepartmentByCode); // use Dep_Code
router.post('/', protect(["CGSADM"]), createDepartment);
router.put('/:Dep_Code', protect(["CGSADM"]), updateDepartment);     // use Dep_Code
router.delete('/:Dep_Code', protect(["CGSADM"]), deleteDepartment);  // use Dep_Code
export default router;