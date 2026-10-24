import express from 'express';
import {
  getWishlist,
  toggleWishlistItem,
  removeWishlistItem,
  moveToCart,
} from '../controllers/wishlistController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getWishlist);
router.post('/', toggleWishlistItem);
router.delete('/:id', removeWishlistItem);
router.post('/move-to-cart', moveToCart);

export default router;
