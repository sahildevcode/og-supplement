import { PaymentSettings } from '../models/PaymentSettings.js';
import { HeroBanner } from '../models/HeroBanner.js';

// Get current hero banner slides (Public)
export const getHeroBanners = async (req, res) => {
  try {
    const slides = await HeroBanner.get();
    res.json({
      success: true,
      slides
    });
  } catch (error) {
    console.error('[Settings Controller Error - getHeroBanners]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve banner slides', error: error.message });
  }
};

// Update hero banner slides (Admin only)
export const updateHeroBanners = async (req, res) => {
  try {
    const { slides } = req.body;
    if (!slides || !Array.isArray(slides)) {
      return res.status(400).json({ success: false, message: 'Slides array is required' });
    }

    const updated = await HeroBanner.update(slides);

    const io = req.app.get('io');
    if (io) {
      io.emit('hero-banner:updated', updated);
    }

    res.json({
      success: true,
      message: 'Hero Banners updated successfully!',
      slides: updated
    });
  } catch (error) {
    console.error('[Settings Controller Error - updateHeroBanners]:', error);
    res.status(500).json({ success: false, message: 'Failed to update hero banners', error: error.message });
  }
};

// Get current payment & QR settings (Public for Checkout)
export const getPaymentSettings = async (req, res) => {
  try {
    const settings = await PaymentSettings.get();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('[Settings Controller Error - getPaymentSettings]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve payment settings', error: error.message });
  }
};

// Update payment & QR settings (Admin only)
export const updatePaymentSettings = async (req, res) => {
  try {
    const {
      qrCodeImage,
      upiId,
      merchantName,
      isUpiEnabled,
      isCodEnabled,
      isRazorpayEnabled,
      razorpayKeyId,
      razorpayKeySecret,
      razorpayMode,
      instructions
    } = req.body;

    const updated = await PaymentSettings.update({
      ...(qrCodeImage !== undefined && { qrCodeImage }),
      ...(upiId !== undefined && { upiId }),
      ...(merchantName !== undefined && { merchantName }),
      ...(isUpiEnabled !== undefined && { isUpiEnabled: Boolean(isUpiEnabled) }),
      ...(isCodEnabled !== undefined && { isCodEnabled: Boolean(isCodEnabled) }),
      ...(isRazorpayEnabled !== undefined && { isRazorpayEnabled: Boolean(isRazorpayEnabled) }),
      ...(razorpayKeyId !== undefined && { razorpayKeyId: String(razorpayKeyId).trim() }),
      ...(razorpayKeySecret !== undefined && { razorpayKeySecret: String(razorpayKeySecret).trim() }),
      ...(razorpayMode !== undefined && { razorpayMode: String(razorpayMode).trim() }),
      ...(instructions !== undefined && { instructions })
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('payment-settings:updated', updated);
    }

    res.json({
      success: true,
      message: 'Payment & QR Code settings updated successfully!',
      settings: updated
    });
  } catch (error) {
    console.error('[Settings Controller Error - updatePaymentSettings]:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment settings', error: error.message });
  }
};
