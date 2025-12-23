import express from 'express';
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/cgsController.js';
import { protect } from '../middleware/authmiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Protect each route explicitly
router.get('/', protect, requireRole('CGSADM', 'EXCGS'), getAllAdmins);
router.get('/:cgs_id', protect, requireRole('CGSADM', 'EXCGS'), getAdminById); // use cgs_id param
router.post('/', protect, requireRole('CGSADM'), createAdmin);
router.put('/:cgs_id', protect, requireRole('CGSADM'), updateAdmin);
router.delete('/:cgs_id', protect, requireRole('CGSADM'), deleteAdmin);
export default router;