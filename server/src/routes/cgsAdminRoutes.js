import express from 'express';
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/cgsAdminController.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// Protect each route explicitly
router.get('/', protect(['cgs']), getAllAdmins);
router.get('/:admin_id', protect(['cgs']), getAdminById); // use admin_id param
router.post('/', protect(['cgs']), createAdmin);
router.put('/:admin_id', protect(['cgs']), updateAdmin);
router.delete('/:admin_id', protect(['cgs']), deleteAdmin);

export default router;