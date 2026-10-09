import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  refundOrder,
  getCancellationPreview,
  cancelOrder,
  updateRefundStatus,
  deleteOrder
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', updateOrderStatus);
router.patch('/:id/refund-status', updateRefundStatus);
router.post('/:id/refund', refundOrder);
router.get('/:id/cancel-preview', getCancellationPreview);
router.post('/:id/cancel', cancelOrder);
router.delete('/:id', deleteOrder);

export default router;
