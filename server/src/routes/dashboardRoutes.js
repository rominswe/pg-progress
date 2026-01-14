import express from 'express';
import { getSupervisorStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/supervisor/stats', protect, requireRole('SUV', 'CGSADM', 'CGSS'), getSupervisorStats);

export default router;
