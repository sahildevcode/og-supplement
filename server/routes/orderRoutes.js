import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);

export default router;
