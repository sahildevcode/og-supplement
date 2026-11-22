import express from 'express';
import {
  getPaymentSettings,
  updatePaymentSettings,
  getHeroBanners,
  updateHeroBanners
} from '../controllers/settingsController.js';

const router = express.Router();

// Hero Banner Routes
router.get('/banner', getHeroBanners);
router.put('/banner', updateHeroBanners);

// Public: fetch current payment & QR settings for customer checkout
router.get('/payment', getPaymentSettings);

// Admin: update QR code, UPI ID, and payment methods
router.put('/payment', updatePaymentSettings);

export default router;
