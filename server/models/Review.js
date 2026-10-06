import mongoose from 'mongoose';
import { isConnectedToMongo, localStore } from '../config/db.js';
import crypto from 'crypto';

const reviewSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    city: { type: String, default: 'India' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    transformationGoal: {
      type: String,
      enum: ['Muscle Building', 'Fat Loss & Shred', 'Strength & Power', 'Daily Fitness & Stamina', 'General Wellness'],
      default: 'Muscle Building'
    },
    duration: { type: String, default: '12 Weeks' },
    productUsed: { type: String, required: true },
    productId: { type: String, default: '' },
    title: { type: String, default: '' },
    comment: { type: String, required: true },
    beforeImage: { type: String, default: '' },
    afterImage: { type: String, default: '' },
    reviewImages: [{ type: String }],
    verified: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    likes: { type: Number, default: 12 },
    createdAt: { type: String }
  },
  { timestamps: true }
);

const MongooseReview = mongoose.models.Review || mongoose.model('Review', reviewSchema);

// Fallback container in localStore
if (!localStore.reviews) {
  localStore.reviews = [];
}

export const Review = {
  async find(query = {}) {
    if (isConnectedToMongo) {
      const q = {};
      if (query.transformationGoal && query.transformationGoal !== 'All') {
        q.transformationGoal = query.transformationGoal;
      }
      if (query.rating && query.rating !== 'All') {
        q.rating = Number(query.rating);
      }
      return await MongooseReview.find(q).sort({ createdAt: -1 });
    }

    let list = localStore.reviews || [];
    if (query.transformationGoal && query.transformationGoal !== 'All') {
      list = list.filter(r => r.transformationGoal.toLowerCase() === query.transformationGoal.toLowerCase());
    }
    if (query.rating && query.rating !== 'All') {
      list = list.filter(r => Number(r.rating) === Number(query.rating));
    }
    return list;
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseReview.findById(id);
    }
    return (localStore.reviews || []).find(r => r._id === id || r.id === id) || null;
  },

  async create(data) {
    const payload = {
      customerName: data.customerName?.trim() || 'Verified Athlete',
      city: data.city?.trim() || 'India',
      rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
      transformationGoal: data.transformationGoal || 'Muscle Building',
      duration: data.duration?.trim() || '12 Weeks',
      productUsed: data.productUsed?.trim() || '100% Authentic Whey',
      productId: data.productId || '',
      title: data.title?.trim() || '',
      comment: data.comment?.trim() || '',
      beforeImage: data.beforeImage || '',
      afterImage: data.afterImage || '',
      reviewImages: Array.isArray(data.reviewImages) ? data.reviewImages : (data.reviewImages ? [data.reviewImages] : []),
      verified: true,
      isFeatured: Boolean(data.isFeatured || false),
      likes: Number(data.likes || Math.floor(Math.random() * 25) + 5),
      createdAt: new Date().toISOString()
    };

    if (isConnectedToMongo) {
      return await MongooseReview.create(payload);
    }

    const doc = {
      _id: 'rev_' + crypto.randomBytes(8).toString('hex'),
      ...payload
    };
    if (!localStore.reviews) localStore.reviews = [];
    localStore.reviews.unshift(doc);
    localStore.save();
    return doc;
  },

  async like(id) {
    if (isConnectedToMongo) {
      return await MongooseReview.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });
    }
    const r = (localStore.reviews || []).find(x => x._id === id || x.id === id);
    if (r) {
      r.likes = (Number(r.likes) || 0) + 1;
      localStore.save();
      return r;
    }
    return null;
  },

  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      return await MongooseReview.findByIdAndDelete(id);
    }
    const idx = (localStore.reviews || []).findIndex(r => r._id === id || r.id === id);
    if (idx !== -1) {
      const removed = localStore.reviews.splice(idx, 1)[0];
      localStore.save();
      return removed;
    }
    return null;
  }
};
