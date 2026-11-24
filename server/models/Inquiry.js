import mongoose from 'mongoose';
import { isConnectedToMongo, localStore } from '../config/db.js';

const inquirySchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, default: 'General Support Inquiry' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    unreadCustomer: { type: Boolean, default: false },
    unreadAdmin: { type: Boolean, default: true },
    messages: [
      {
        sender: { type: String, enum: ['customer', 'admin'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const MongooseInquiry = mongoose.models.Inquiry || mongoose.model('Inquiry', inquirySchema);

// In-memory fallback if Mongo is disconnected
if (!localStore.inquiries) {
  localStore.inquiries = [];
}

export const Inquiry = {
  async find(query = {}) {
    if (isConnectedToMongo) {
      return await MongooseInquiry.find(query).sort({ updatedAt: -1 });
    }
    let res = [...localStore.inquiries];
    if (query.email) {
      res = res.filter(i => i.email.toLowerCase() === query.email.toLowerCase());
    }
    return res.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseInquiry.findById(id);
    }
    return localStore.inquiries.find(i => i._id === id || i.id === id || i.ticketId === id) || null;
  },

  async create(data) {
    const ticketId = `OG-TKT-${Date.now().toString(36).toUpperCase()}`;
    const payload = {
      ...data,
      ticketId,
      status: 'open',
      unreadAdmin: true,
      unreadCustomer: false
    };

    if (isConnectedToMongo) {
      return await MongooseInquiry.create(payload);
    }

    const newDoc = {
      _id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStore.inquiries.push(newDoc);
    localStore.save();
    return newDoc;
  },

  async findByIdAndUpdate(id, update, options = {}) {
    if (isConnectedToMongo) {
      return await MongooseInquiry.findByIdAndUpdate(id, update, options);
    }
    const idx = localStore.inquiries.findIndex(i => i._id === id || i.id === id || i.ticketId === id);
    if (idx === -1) return null;

    if (update.$push && update.$push.messages) {
      localStore.inquiries[idx].messages.push(update.$push.messages);
    }
    const flatUpdate = { ...update };
    delete flatUpdate.$push;
    localStore.inquiries[idx] = {
      ...localStore.inquiries[idx],
      ...flatUpdate,
      updatedAt: new Date().toISOString()
    };
    localStore.save();
    return localStore.inquiries[idx];
  }
};
