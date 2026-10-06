import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  addProductReview,
  toggleBestSeller,
  syncBestSellers
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Specific and bulk routes
router.post('/best-sellers/sync', syncBestSellers);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', addProductReview);

// Admin routes (Protected, optionally relaxed for demo or JWT checked)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/stock', updateStock);
router.patch('/:id/best-seller', toggleBestSeller);
router.delete('/:id', deleteProduct);

export default router;
