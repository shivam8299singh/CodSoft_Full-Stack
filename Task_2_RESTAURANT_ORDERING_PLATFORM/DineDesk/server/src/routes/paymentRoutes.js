import { Router } from 'express';
import {
  getAllPayments,
  getPaymentByOrderId,
  processPayment,
} from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.post('/process', processPayment);
router.get('/order/:orderId', getPaymentByOrderId);
router.get('/', authenticate, authorize('ADMIN'), getAllPayments);

export default router;
