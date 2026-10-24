import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/roles.js';

const router = Router();

router.get('/', getSettings);
router.put('/', authenticate, authorize('ADMIN'), updateSettings);

export default router;
