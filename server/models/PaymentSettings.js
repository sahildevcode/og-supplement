import mongoose from 'mongoose';
import { isConnectedToMongo, localStore } from '../config/db.js';

const paymentSettingsSchema = new mongoose.Schema(
  {
    qrCodeImage: {
      type: String,
      default: '/uploads/merchant_qr.jpg'
    },
    upiId: {
      type: String,
      default: 'ogsupplement@okaxis'
    },
    merchantName: {
      type: String,
      default: 'OG Supplement Store'
    },
    isUpiEnabled: {
      type: Boolean,
      default: true
    },
    isCodEnabled: {
      type: Boolean,
      default: true
    },
    isRazorpayEnabled: {
      type: Boolean,
      default: true
    },
    razorpayKeyId: {
      type: String,
      default: 'rzp_test_TkDCf1hSSdbjJC'
    },
    razorpayKeySecret: {
      type: String,
      default: 'HYANv2AAhXJiPKG1zveHNzZS'
    },
    razorpayMode: {
      type: String,
      enum: ['test', 'live'],
      default: 'test'
    },
    instructions: {
      type: String,
      default: 'Scan this QR code using PhonePe, Google Pay, Paytm, or any UPI app. Complete the payment and enter your 12-digit UPI UTR / Transaction Reference Number below.'
    }
  },
  { timestamps: true }
);

const MongoosePaymentSettings = mongoose.models.PaymentSettings || mongoose.model('PaymentSettings', paymentSettingsSchema);

export const defaultSettings = {
  qrCodeImage: '/uploads/merchant_qr.jpg',
  upiId: 'ogsupplement@okaxis',
  merchantName: 'OG Supplement Store',
  isUpiEnabled: true,
  isCodEnabled: true,
  isRazorpayEnabled: true,
  razorpayKeyId: 'rzp_test_TkDCf1hSSdbjJC',
  razorpayKeySecret: 'HYANv2AAhXJiPKG1zveHNzZS',
  razorpayMode: 'test',
  instructions: 'Scan this QR code using PhonePe, Google Pay, Paytm, or any UPI app. Complete the payment and enter your 12-digit UPI UTR / Transaction Reference Number below.'
};

export const PaymentSettings = {
  async get() {
    if (isConnectedToMongo) {
      let doc = await MongoosePaymentSettings.findOne();
      if (!doc) {
        doc = await MongoosePaymentSettings.create(defaultSettings);
      } else if (doc.razorpayKeyId === 'rzp_test_5173DemoKey' || !doc.razorpayKeySecret) {
        doc.razorpayKeyId = 'rzp_test_TkDCf1hSSdbjJC';
        doc.razorpayKeySecret = 'HYANv2AAhXJiPKG1zveHNzZS';
        doc.isRazorpayEnabled = true;
        await doc.save();
      }
      return doc;
    }

    if (!localStore.paymentSettings || Object.keys(localStore.paymentSettings).length === 0 || localStore.paymentSettings.razorpayKeyId === 'rzp_test_5173DemoKey') {
      localStore.paymentSettings = { ...defaultSettings };
      localStore.save();
    }
    return localStore.paymentSettings;
  },

  async update(data) {
    if (isConnectedToMongo) {
      let doc = await MongoosePaymentSettings.findOne();
      if (!doc) {
        doc = await MongoosePaymentSettings.create({ ...defaultSettings, ...data });
      } else {
        doc = await MongoosePaymentSettings.findByIdAndUpdate(doc._id, data, { new: true });
      }
      return doc;
    }

    localStore.paymentSettings = {
      ...(localStore.paymentSettings || defaultSettings),
      ...data,
      updatedAt: new Date().toISOString()
    };
    localStore.save();
    return localStore.paymentSettings;
  }
};
