import express from 'express';
import {
  getAllDepartments,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/tblDepartmentsController.js';
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(protect());

// CRUD endpoints - department management permissions
router.get('/', requirePermission(PERMISSIONS.MANAGE_DEPARTMENTS), getAllDepartments);
router.get('/:Dep_Code', requirePermission(PERMISSIONS.READ_USER), getDepartmentByCode);
router.post('/', requirePermission(PERMISSIONS.MANAGE_DEPARTMENTS), createDepartment);
router.put('/:Dep_Code', requirePermission(PERMISSIONS.MANAGE_DEPARTMENTS), updateDepartment);
router.delete('/:Dep_Code', requirePermission(PERMISSIONS.MANAGE_DEPARTMENTS), deleteDepartment);
export default router;