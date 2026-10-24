import { Router } from 'express';
import {
  createStaffUser,
  deleteUser,
  getCustomersWithStats,
  getUsers,
  updateUserRole,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.get('/customers', authenticate, authorize('ADMIN', 'STAFF'), getCustomersWithStats);
router.get('/', authenticate, authorize('ADMIN'), getUsers);
router.post('/staff', authenticate, authorize('ADMIN'), createStaffUser);
router.patch('/:id/role', authenticate, authorize('ADMIN'), updateUserRole);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteUser);

export default router;
