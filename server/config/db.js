import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isConnectedToMongo = false;

const DB_FILE = path.join(__dirname, '../data/local_db.json');

// Local fallback store for high resilience
export const localStore = {
  products: [],
  orders: [],
  users: [],
  init() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.products = parsed.products || [];
        this.orders = parsed.orders || [];
        this.users = parsed.users || [];
      }
    } catch (e) {
      console.warn('[DB] Fallback store init note:', e.message);
    }
  },
  save() {
    try {
      const dataDir = path.dirname(DB_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify({
        products: this.products,
        orders: this.orders,
        users: this.users
      }, null, 2));
    } catch (e) {
      console.error('[DB] Fallback save error:', e.message);
    }
  }
};

localStore.init();

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/supplement_store';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isConnectedToMongo = true;
    console.log(`\x1b[32m[MongoDB Connected]\x1b[0m ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnectedToMongo = false;
    console.log(`\x1b[33m[MongoDB Notice]\x1b[0m Could not connect to local MongoDB (${error.message}). Using Resilient Persistent Data Store with Real-Time Socket.IO.`);
    return false;
  }
};
