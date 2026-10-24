import { Router } from 'express';
import {
  createTable,
  deleteTable,
  getTableById,
  getTables,
  updateTable,
  updateTableStatus,
} from '../controllers/tableController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.get('/', getTables);
router.get('/:id', getTableById);
router.post('/', authenticate, authorize('ADMIN'), createTable);
router.put('/:id', authenticate, authorize('ADMIN'), updateTable);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'STAFF'), updateTableStatus);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteTable);

export default router;
