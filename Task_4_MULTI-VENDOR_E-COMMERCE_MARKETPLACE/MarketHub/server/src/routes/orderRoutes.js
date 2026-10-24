import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  requestReturn,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/return', requestReturn);
router.put('/:id/status', requireRole('ADMIN', 'DELIVERY_PARTNER', 'VENDOR'), updateOrderStatus);

export default router;
