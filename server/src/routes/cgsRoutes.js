import express from 'express';
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/cgsController.js';
import { protect } from '../middleware/authmiddleware.js';
import { requirePermission } from '../middleware/rbacMiddleware.js';
import { PERMISSIONS } from '../config/rbac.js';

const router = express.Router();

// All routes require authentication
router.use(protect());

// Admin management - CGS Admin full access, EXCGS read-only
router.get('/', requirePermission(PERMISSIONS.MANAGE_SYSTEM), getAllAdmins);
router.get('/:cgs_id', requirePermission(PERMISSIONS.READ_USER), getAdminById);

// Admin CRUD - CGS Admin only
router.post('/', requirePermission(PERMISSIONS.CREATE_USER), createAdmin);
router.put('/:cgs_id', requirePermission(PERMISSIONS.UPDATE_USER), updateAdmin);
router.delete('/:cgs_id', requirePermission(PERMISSIONS.DELETE_USER), deleteAdmin);
export default router;