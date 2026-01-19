import express from 'express';
import calendarController from '../controllers/calendarController.js';
import { restrictTo } from '../middleware/authmiddleware.js';

const router = express.Router();

router.get('/student', restrictTo('Master Student', 'Doctoral Student'), calendarController.getStudentCalendar);
router.get('/staff', restrictTo('SUV', 'EXA'), calendarController.getStaffCalendar);
router.get('/admin', restrictTo('DIR', 'CGS'), calendarController.getAdminCalendar);

export default router;
