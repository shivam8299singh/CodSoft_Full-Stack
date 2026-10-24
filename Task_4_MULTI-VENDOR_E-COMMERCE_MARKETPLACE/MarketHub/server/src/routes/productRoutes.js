import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getSearchSuggestions,
} from '../controllers/productController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/suggestions', getSearchSuggestions);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, requireRole('VENDOR', 'ADMIN'), createProduct);
router.put('/:id', authenticate, requireRole('VENDOR', 'ADMIN'), updateProduct);
router.delete('/:id', authenticate, requireRole('VENDOR', 'ADMIN'), deleteProduct);

export default router;
