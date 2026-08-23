import mongoose from 'mongoose';
import { isConnectedToMongo, localStore } from '../config/db.js';
import crypto from 'crypto';

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, default: 'guest' },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String, default: '' },
    products: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        brand: { type: String },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        variant: { type: String },
        flavour: { type: String }
      }
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    orderStatus: {
      type: String,
      enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Order Placed'
    }
  },
  { timestamps: true }
);

const MongooseOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

export const Order = {
  async find(query = {}) {
    if (isConnectedToMongo) {
      return await MongooseOrder.find(query).sort({ createdAt: -1 });
    }
    let res = [...localStore.orders];
    if (query.userId) {
      res = res.filter(o => o.userId === query.userId || o.email === query.email);
    }
    return res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseOrder.findById(id);
    }
    return localStore.orders.find(o => o._id === id || o.orderId === id) || null;
  },

  async findOne(query) {
    if (isConnectedToMongo) {
      return await MongooseOrder.findOne(query);
    }
    return localStore.orders.find(o => {
      for (let k in query) {
        if (o[k] !== query[k]) return false;
      }
      return true;
    }) || null;
  },

  async create(data) {
    const orderId = data.orderId || 'SUPP-' + Math.floor(100000 + Math.random() * 900000);
    const payload = {
      ...data,
      orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isConnectedToMongo) {
      return await MongooseOrder.create(payload);
    }
    const newDoc = {
      _id: 'ord_' + crypto.randomBytes(8).toString('hex'),
      ...payload
    };
    localStore.orders.unshift(newDoc);
    localStore.save();
    return newDoc;
  },

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    updateData.updatedAt = new Date().toISOString();
    if (isConnectedToMongo) {
      return await MongooseOrder.findByIdAndUpdate(id, updateData, options);
    }
    const idx = localStore.orders.findIndex(o => o._id === id || o.orderId === id);
    if (idx === -1) return null;
    localStore.orders[idx] = { ...localStore.orders[idx], ...updateData };
    localStore.save();
    return localStore.orders[idx];
  },

  async countDocuments(filter = {}) {
    if (isConnectedToMongo) {
      return await MongooseOrder.countDocuments(filter);
    }
    return localStore.orders.length;
  }
};
