import { PaymentSettings } from '../models/PaymentSettings.js';

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
    const { qrCodeImage, upiId, merchantName, isUpiEnabled, isCodEnabled, instructions } = req.body;

    const updated = await PaymentSettings.update({
      ...(qrCodeImage !== undefined && { qrCodeImage }),
      ...(upiId !== undefined && { upiId }),
      ...(merchantName !== undefined && { merchantName }),
      ...(isUpiEnabled !== undefined && { isUpiEnabled: Boolean(isUpiEnabled) }),
      ...(isCodEnabled !== undefined && { isCodEnabled: Boolean(isCodEnabled) }),
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
