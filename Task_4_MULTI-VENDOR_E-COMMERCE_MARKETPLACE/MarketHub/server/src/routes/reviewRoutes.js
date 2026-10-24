import express from 'express';
import { getProductReviews, createReview } from '../controllers/reviewController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', authenticate, createReview);

export default router;
