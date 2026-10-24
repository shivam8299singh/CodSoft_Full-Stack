import { Router } from 'express';
import {
  getAdminDashboard,
  getCustomerDashboard,
  getKitchenDashboard,
  getStaffDashboard,
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.get('/admin', authenticate, authorize('ADMIN'), getAdminDashboard);
router.get('/staff', authenticate, authorize('ADMIN', 'STAFF'), getStaffDashboard);
router.get('/kitchen', authenticate, authorize('ADMIN', 'STAFF', 'KITCHEN'), getKitchenDashboard);
router.get('/customer', authenticate, getCustomerDashboard);

export default router;
