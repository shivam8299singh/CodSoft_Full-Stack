import { Router } from 'express';
import {
  getFees,
  createFee,
  recordPayment,
  getStudentFees
} from '../controllers/fee.controller.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, getFees);
router.post('/', verifyToken, authorize('ADMIN'), createFee);
router.put('/:id/pay', verifyToken, authorize('ADMIN'), recordPayment);
router.get('/student/:studentId', verifyToken, getStudentFees);

export default router;
