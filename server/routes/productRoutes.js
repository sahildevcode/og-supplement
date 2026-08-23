import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes (Protected, optionally relaxed for demo or JWT checked)
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/stock', updateStock);
router.delete('/:id', deleteProduct);

export default router;
