import express from 'express';
import calendarController from '../controllers/calendarController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

router.get('/student', protect, requireRole('STU'), calendarController.getStudentCalendar);
router.get('/staff', protect, requireRole('SUV', 'EXA', 'CGSADM', 'CGSS'), calendarController.getStaffCalendar);
router.get('/admin', protect, requireRole('CGSADM', 'CGSS'), calendarController.getAdminCalendar);

export default router;
