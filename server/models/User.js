import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isConnectedToMongo, localStore } from '../config/db.js';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  { timestamps: true }
);

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

export const User = {
  async findOne(query) {
    if (isConnectedToMongo) {
      return await MongooseUser.findOne(query);
    }
    const emailToFind = query.email ? query.email.toLowerCase() : null;
    if (emailToFind) {
      return localStore.users.find(u => u.email.toLowerCase() === emailToFind) || null;
    }
    return localStore.users.find(u => {
      for (let k in query) {
        if (u[k] !== query[k]) return false;
      }
      return true;
    }) || null;
  },

  async findById(id) {
    if (isConnectedToMongo) {
      return await MongooseUser.findById(id).select('-password');
    }
    const user = localStore.users.find(u => u._id === id || u.id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const payload = {
      ...data,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      role: data.role || 'customer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isConnectedToMongo) {
      return await MongooseUser.create(payload);
    }
    const newDoc = {
      _id: 'usr_' + crypto.randomBytes(8).toString('hex'),
      ...payload
    };
    localStore.users.push(newDoc);
    localStore.save();
    return newDoc;
  },

  async countDocuments(filter = {}) {
    if (isConnectedToMongo) {
      return await MongooseUser.countDocuments(filter);
    }
    return localStore.users.length;
  }
};
