import express from 'express';
import { createRequest, getRequests, updateRequestStatus, getRequestById } from '../controllers/serviceRequestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/rbacMiddleware.js';

const router = express.Router();

// Student: Submit Request
router.post('/', protect, requireRole('STU'), createRequest);

// Student & Supervisor: Get Requests (Controller handles filtering)
router.get('/', protect, requireRole('STU', 'SUV', 'CGSADM', 'CGSS'), getRequests);

// Student & Supervisor: Get Single Request
router.get('/:id', protect, requireRole('STU', 'SUV', 'CGSADM', 'CGSS'), getRequestById);

// Supervisor: Update Status
router.put('/:id', protect, requireRole('SUV', 'CGSADM', 'CGSS'), updateRequestStatus);

export default router;
