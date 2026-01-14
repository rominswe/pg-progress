import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import { createEvaluation, getStudentEvaluations, getAllEvaluations, getStudentById, getAssignedStudents } from '../controllers/evaluationController.js';

const router = express.Router();

// Find student by ID (Supervisor only)
router.get('/find-student/:id', protect, requireRole('SUV', 'CGSADM', 'CGSS'), getStudentById);

// Create a new evaluation (Supervisor only)
router.post('/', protect, requireRole('SUV', 'CGSADM', 'CGSS', 'EXA'), createEvaluation);

// Get assigned students for Examiner
router.get('/assigned-students', protect, requireRole('EXA'), getAssignedStudents);

// Get evaluations for a specific student
router.get('/student/:studentId', protect, getStudentEvaluations);

// Get all evaluations (Admin/Supervisor only)
router.get('/', protect, requireRole('SUV', 'CGSADM', 'CGSS'), getAllEvaluations);

export default router;
