import express from 'express';
import { getSupervisorStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Route for Supervisor Dashboard Stats
router.get('/supervisor/stats', protect, requireRole('SUV', 'CGSADM', 'CGSS'), getSupervisorStats);

// Route for Examiner Dashboard - Get Students with Proposal Submissions
import { getExaminerStudents } from '../controllers/dashboardController.js';
router.get('/examiner/students', protect, requireRole('EXA'), getExaminerStudents);

export default router;
