import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  trackOrderByNumber,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

// Public / Guest / Customer order creation
router.post('/', optionalAuthenticate, createOrder);
router.get('/track/:orderNumber', trackOrderByNumber);

// Customer specific
router.get('/my', authenticate, getMyOrders);

// Staff / Kitchen / Admin order management
router.get('/', authenticate, authorize('ADMIN', 'STAFF', 'KITCHEN'), getOrders);
router.get('/:id', optionalAuthenticate, getOrderById);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'STAFF', 'KITCHEN'), updateOrderStatus);

export default router;
