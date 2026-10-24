import { Router } from 'express';
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItemById,
  getMenuItems,
  toggleAvailability,
  updateMenuItem,
} from '../controllers/menuController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', authenticate, authorize('ADMIN'), createMenuItem);
router.put('/:id', authenticate, authorize('ADMIN'), updateMenuItem);
router.patch('/:id/availability', authenticate, authorize('ADMIN', 'STAFF'), toggleAvailability);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteMenuItem);

export default router;
