import express from 'express';
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from '../controllers/cgsController.js';
import { protect } from '../middleware/authmiddleware.js';

const router = express.Router();

// Protect each route explicitly
router.get('/', protect(["CGSADM", "EXCGS"]), getAllAdmins);
router.get('/:cgs_id', protect(["CGSADM", "EXCGS"]), getAdminById); // use cgs_id param
router.post('/', protect(["CGSADM"]), createAdmin);
router.put('/:cgs_id', protect(["CGSADM"]), updateAdmin);
router.delete('/:cgs_id', protect(["CGSADM"]), deleteAdmin);
export default router;