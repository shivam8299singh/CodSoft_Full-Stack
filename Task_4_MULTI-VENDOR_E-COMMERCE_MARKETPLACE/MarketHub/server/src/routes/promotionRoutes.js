import express from 'express';
import {
  getActivePromotions,
  validatePromotion,
  getAllPromotions,
  createPromotion,
  deletePromotion,
} from '../controllers/promotionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/active', getActivePromotions);
router.post('/validate', validatePromotion);
router.get('/', authenticate, requireRole('ADMIN'), getAllPromotions);
router.post('/', authenticate, requireRole('ADMIN'), createPromotion);
router.delete('/:id', authenticate, requireRole('ADMIN'), deletePromotion);

export default router;
