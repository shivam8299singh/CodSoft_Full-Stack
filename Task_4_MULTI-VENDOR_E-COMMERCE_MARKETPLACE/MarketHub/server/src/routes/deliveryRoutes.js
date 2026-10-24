import express from 'express';
import { getDeliveryOrders, updateDeliveryStatus } from '../controllers/deliveryController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRole('DELIVERY_PARTNER'));

router.get('/orders', getDeliveryOrders);
router.put('/orders/:id/status', updateDeliveryStatus);

export default router;
