import mongoose from 'mongoose';
import { isConnectedToMongo, localStore } from '../config/db.js';
import crypto from 'crypto';

export const themeColorPresets = {
  emerald: {
    colorDark: 'from-emerald-500/20 to-teal-500/5',
    colorLight: 'from-emerald-100 to-teal-50/50',
    borderDark: 'border-slate-800 group-hover:border-emerald-500/50',
    borderLight: 'border-slate-200 group-hover:border-emerald-500/60 shadow-sm hover:shadow-xl'
  },
  purple: {
    colorDark: 'from-purple-500/20 to-indigo-500/5',
    colorLight: 'from-purple-100 to-indigo-50/50',
    borderDark: 'border-slate-800 group-hover:border-purple-500/50',
    borderLight: 'border-slate-200 group-hover:border-purple-500/60 shadow-sm hover:shadow-xl'
  },
  blue: {
    colorDark: 'from-blue-500/20 to-cyan-500/5',
    colorLight: 'from-blue-100 to-cyan-50/50',
    borderDark: 'border-slate-800 group-hover:border-cyan-500/50',
    borderLight: 'border-slate-200 group-hover:border-cyan-500/60 shadow-sm hover:shadow-xl'
  },
  amber: {
    colorDark: 'from-amber-500/20 to-orange-500/5',
    colorLight: 'from-amber-100 to-orange-50/50',
    borderDark: 'border-slate-800 group-hover:border-amber-500/50',
    borderLight: 'border-slate-200 group-hover:border-amber-500/60 shadow-sm hover:shadow-xl'
  },
  rose: {
    colorDark: 'from-rose-500/20 to-pink-500/5',
    colorLight: 'from-rose-100 to-pink-50/50',
    borderDark: 'border-slate-800 group-hover:border-rose-500/50',
    borderLight: 'border-slate-200 group-hover:border-rose-500/60 shadow-sm hover:shadow-xl'
  },
  teal: {
    colorDark: 'from-teal-500/20 to-emerald-500/5',
    colorLight: 'from-teal-100 to-emerald-50/50',
    borderDark: 'border-slate-800 group-hover:border-teal-500/50',
    borderLight: 'border-slate-200 group-hover:border-teal-500/60 shadow-sm hover:shadow-xl'
  },
  cyan: {
    colorDark: 'from-cyan-500/20 to-blue-500/5',
    colorLight: 'from-cyan-100 to-blue-50/50',
    borderDark: 'border-slate-800 group-hover:border-cyan-500/50',
    borderLight: 'border-slate-200 group-hover:border-cyan-500/60 shadow-sm hover:shadow-xl'
  },
  orange: {
    colorDark: 'from-orange-500/20 to-red-500/5',
    colorLight: 'from-orange-100 to-amber-50/50',
    borderDark: 'border-slate-800 group-hover:border-orange-500/50',
    borderLight: 'border-slate-200 group-hover:border-orange-500/60 shadow-sm hover:shadow-xl'
  }
};

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    badge: { type: String, default: '' },
    colorTheme: { type: String, default: 'emerald' },
    colorDark: { type: String },
    colorLight: { type: String },
    borderDark: { type: String },
    borderLight: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const MongooseCategory = mongoose.models.Category || mongoose.model('Category', categorySchema);

const resolveStyles = (data) => {
  const themeKey = data.colorTheme && themeColorPresets[data.colorTheme] ? data.colorTheme : 'emerald';
  const preset = themeColorPresets[themeKey];
  return {
    colorTheme: themeKey,
    colorDark: data.colorDark || preset.colorDark,
    colorLight: data.colorLight || preset.colorLight,
    borderDark: data.borderDark || preset.borderDark,
    borderLight: data.borderLight || preset.borderLight
  };
};

export const Category = {
  async find(query = {}) {
    if (isConnectedToMongo) {
      return await MongooseCategory.find(query).sort({ order: 1, createdAt: 1 });
    }
    let res = [...localStore.categories];
    if (query.isActive !== undefined) {
      res = res.filter((c) => c.isActive === query.isActive);
    }
    if (query.name) {
      res = res.filter((c) => c.name.toLowerCase() === query.name.toLowerCase());
    }
    return res.sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseCategory.findById(id);
    }
    return localStore.categories.find((c) => c._id === id || c.id === id) || null;
  },

  async create(data) {
    const styles = resolveStyles(data);
    const payload = {
      ...data,
      badge: data.badge || data.name,
      ...styles,
      order: Number(data.order || (localStore.categories.length + 1)),
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isConnectedToMongo) {
      return await MongooseCategory.create(payload);
    }

    const newDoc = {
      _id: 'cat_' + crypto.randomBytes(8).toString('hex'),
      ...payload
    };
    localStore.categories.push(newDoc);
    localStore.save();
    return newDoc;
  },

  async findByIdAndUpdate(id, updateData, options = { new: true }) {
    const styles = resolveStyles(updateData);
    const cleanData = {
      ...updateData,
      ...styles,
      updatedAt: new Date().toISOString()
    };

    if (isConnectedToMongo) {
      return await MongooseCategory.findByIdAndUpdate(id, cleanData, options);
    }

    const index = localStore.categories.findIndex((c) => c._id === id || c.id === id);
    if (index === -1) return null;

    localStore.categories[index] = {
      ...localStore.categories[index],
      ...cleanData
    };
    localStore.save();
    return localStore.categories[index];
  },

  async findByIdAndDelete(id) {
    if (isConnectedToMongo) {
      return await MongooseCategory.findByIdAndDelete(id);
    }

    const index = localStore.categories.findIndex((c) => c._id === id || c.id === id);
    if (index === -1) return null;

    const [deletedDoc] = localStore.categories.splice(index, 1);
    localStore.save();
    return deletedDoc;
  }
};
