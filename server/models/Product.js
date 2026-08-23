import mongoose from 'mongoose';
import { isConnectedToMongo, localStore } from '../config/db.js';
import crypto from 'crypto';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Protein', 'Mass Gainer', 'Creatine', 'Pre-Workout', 'Supplements', 'Vitamins', 'Protein Bars']
    },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    images: [{ type: String }],
    rating: { type: Number, default: 4.8 },
    reviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock'],
      default: 'in_stock'
    },
    variants: [{ type: String }],
    flavours: [{ type: String }],
    ingredients: { type: String },
    nutritionalInfo: { type: Object, default: {} }
  },
  { timestamps: true }
);

const MongooseProduct = mongoose.models.Product || mongoose.model('Product', productSchema);

// Resilient Product Data Access Layer
export const Product = {
  async find(query = {}) {
    if (isConnectedToMongo) {
      return await MongooseProduct.find(query).sort({ createdAt: -1 });
    }
    let res = [...localStore.products];
    if (query.category) {
      res = res.filter(p => p.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.brand) {
      res = res.filter(p => p.brand.toLowerCase() === query.brand.toLowerCase());
    }
    return res;
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseProduct.findById(id);
    }
    return localStore.products.find(p => p._id === id || p.id === id) || null;
  },

  async create(data) {
    const calcStatus = (stock, threshold = 10) => {
      if (Number(stock) <= 0) return 'out_of_stock';
      if (Number(stock) <= Number(threshold)) return 'low_stock';
      return 'in_stock';
    };

    const discountPercentage = data.price && data.discountPrice && data.price > data.discountPrice
      ? Math.round(((data.price - data.discountPrice) / data.price) * 100)
      : data.discountPercentage || 0;

    const payload = {
      ...data,
      price: Number(data.price),
      discountPrice: Number(data.discountPrice || data.price),
      discountPercentage,
      stock: Number(data.stock),
      lowStockThreshold: Number(data.lowStockThreshold || 10),
      status: calcStatus(data.stock, data.lowStockThreshold || 10),
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [
        "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80"
      ],
      variants: Array.isArray(data.variants) ? data.variants : (data.variants ? String(data.variants).split(',').map(s => s.trim()) : ['Standard']),
      flavours: Array.isArray(data.flavours) ? data.flavours : (data.flavours ? String(data.flavours).split(',').map(s => s.trim()) : ['Unflavored']),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isConnectedToMongo) {
      return await MongooseProduct.create(payload);
    }
    const newDoc = {
      _id: 'prod_' + crypto.randomBytes(8).toString('hex'),
      ...payload
    };
    localStore.products.unshift(newDoc);
    localStore.save();
    return newDoc;
  },

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const calcStatus = (stock, threshold = 10) => {
      if (Number(stock) <= 0) return 'out_of_stock';
      if (Number(stock) <= Number(threshold)) return 'low_stock';
      return 'in_stock';
    };

    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
      const threshold = updateData.lowStockThreshold !== undefined ? Number(updateData.lowStockThreshold) : 10;
      updateData.status = calcStatus(updateData.stock, threshold);
    }
    if (updateData.price && updateData.discountPrice) {
      updateData.price = Number(updateData.price);
      updateData.discountPrice = Number(updateData.discountPrice);
      if (updateData.price > updateData.discountPrice) {
        updateData.discountPercentage = Math.round(((updateData.price - updateData.discountPrice) / updateData.price) * 100);
      }
    }
    updateData.updatedAt = new Date().toISOString();

    if (isConnectedToMongo) {
      return await MongooseProduct.findByIdAndUpdate(id, updateData, options);
    }
    const idx = localStore.products.findIndex(p => p._id === id || p.id === id);
    if (idx === -1) return null;
    localStore.products[idx] = { ...localStore.products[idx], ...updateData };
    localStore.save();
    return localStore.products[idx];
  },

  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      return await MongooseProduct.findByIdAndDelete(id);
    }
    const idx = localStore.products.findIndex(p => p._id === id || p.id === id);
    if (idx === -1) return null;
    const removed = localStore.products.splice(idx, 1)[0];
    localStore.save();
    return removed;
  },

  async countDocuments(filter = {}) {
    if (isConnectedToMongo) {
      return await MongooseProduct.countDocuments(filter);
    }
    let res = localStore.products;
    if (filter.status) {
      res = res.filter(p => p.status === filter.status);
    }
    return res.length;
  }
};
