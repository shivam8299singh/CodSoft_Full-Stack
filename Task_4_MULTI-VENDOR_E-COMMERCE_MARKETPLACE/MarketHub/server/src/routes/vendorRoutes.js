import express from 'express';
import {
  getVendorDashboard,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorInventory,
  updateInventoryStock,
  getVendorPromotions,
  createVendorPromotion,
  deleteVendorPromotion,
  getVendorReviews,
} from '../controllers/vendorController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireRole('VENDOR'));

router.get('/dashboard', getVendorDashboard);
router.get('/orders', getVendorOrders);
router.put('/orders/:id/status', updateVendorOrderStatus);
router.get('/inventory', getVendorInventory);
router.put('/inventory/:productId', updateInventoryStock);
router.get('/promotions', getVendorPromotions);
router.post('/promotions', createVendorPromotion);
router.delete('/promotions/:id', deleteVendorPromotion);
router.get('/reviews', getVendorReviews);

export default router;
