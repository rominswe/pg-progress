import express from 'express';
import {
  getAllDepartments,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/tblDepartmentsController.js';

const router = express.Router();

// CRUD endpoints
router.get('/', getAllDepartments);
router.get('/:Dep_Code', getDepartmentByCode); // use Dep_Code
router.post('/', createDepartment);
router.put('/:Dep_Code', updateDepartment);     // use Dep_Code
router.delete('/:Dep_Code', deleteDepartment);  // use Dep_Code

export default router;