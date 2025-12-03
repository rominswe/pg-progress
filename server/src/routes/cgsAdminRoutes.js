import express from 'express';
import {
  getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdmin,
    deleteAdmin,
} from '../controllers/cgAdminController.js';
const router = express.Router();

// CRUD endpoints
router.get('/', getAllAdmins);
router.get('/:admin_id', getAdminById);
router.post('/', createAdmin);
router.put('/:admin_id', updateAdmin);
router.delete('/:admin_id', deleteAdmin);

export default router;