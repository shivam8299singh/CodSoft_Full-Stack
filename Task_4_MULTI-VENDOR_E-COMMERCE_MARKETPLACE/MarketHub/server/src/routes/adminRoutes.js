import express from 'express';
import {
  getAdminDashboard,
  getAdminUsers,
  toggleUserStatus,
  getAdminVendors,
  updateVendorStatus,
  getAdminOrders,
  assignDeliveryPartner,
  getAdminCommissions,
  settleCommission,
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAdminUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.get('/vendors', getAdminVendors);
router.put('/vendors/:id/status', updateVendorStatus);
router.get('/orders', getAdminOrders);
router.put('/orders/:orderId/assign-delivery', assignDeliveryPartner);
router.get('/commissions', getAdminCommissions);
router.put('/commissions/:id/settle', settleCommission);

export default router;
