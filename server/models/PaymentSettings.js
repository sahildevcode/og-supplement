import mongoose from 'mongoose';
import { isConnectedToMongo, localStore } from '../config/db.js';

const paymentSettingsSchema = new mongoose.Schema(
  {
    qrCodeImage: {
      type: String,
      default: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dogsupplement%40okaxis%26pn%3DOG%2BSupplement%26cu%3DINR'
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
    instructions: {
      type: String,
      default: 'Scan this QR code using PhonePe, Google Pay, Paytm, or any UPI app. Complete the payment and enter your 12-digit UPI UTR / Transaction Reference Number below.'
    }
  },
  { timestamps: true }
);

const MongoosePaymentSettings = mongoose.models.PaymentSettings || mongoose.model('PaymentSettings', paymentSettingsSchema);

export const defaultSettings = {
  qrCodeImage: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi%3A%2F%2Fpay%3Fpa%3Dogsupplement%40okaxis%26pn%3DOG%2BSupplement%26cu%3DINR',
  upiId: 'ogsupplement@okaxis',
  merchantName: 'OG Supplement Store',
  isUpiEnabled: true,
  isCodEnabled: true,
  instructions: 'Scan this QR code using PhonePe, Google Pay, Paytm, or any UPI app. Complete the payment and enter your 12-digit UPI UTR / Transaction Reference Number below.'
};

export const PaymentSettings = {
  async get() {
    if (isConnectedToMongo) {
      let doc = await MongoosePaymentSettings.findOne();
      if (!doc) {
        doc = await MongoosePaymentSettings.create(defaultSettings);
      }
      return doc;
    }

    if (!localStore.paymentSettings || Object.keys(localStore.paymentSettings).length === 0) {
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
