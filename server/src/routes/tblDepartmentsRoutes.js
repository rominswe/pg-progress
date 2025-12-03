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
router.get('/:dept_id', getDepartmentByCode);
router.post('/', createDepartment);
router.put('/:dept_id', updateDepartment);
router.delete('/:dept_id', deleteDepartment);

export default router;