import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';
import { createDefenseEvaluation, getDefenseEvaluationsByStudent } from '../controllers/defenseEvaluationController.js';

const router = express.Router();

// Create a new defense evaluation (Examiner only)
router.post('/', protect, requireRole('EXA'), createDefenseEvaluation);

// Get evaluations for a student (Examiner, Supervisor, Student, Admin)
// We might want to restrict this based on 'who' is asking, but for now allow authorized roles
router.get('/student/:studentId', protect, getDefenseEvaluationsByStudent);

export default router;
