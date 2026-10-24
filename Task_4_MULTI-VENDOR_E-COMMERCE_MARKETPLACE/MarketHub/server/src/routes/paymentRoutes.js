import express from 'express';
import { processPayment, getPaymentById } from '../controllers/paymentController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', processPayment);
router.get('/:id', getPaymentById);

export default router;
