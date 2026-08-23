import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, localStore } from './config/db.js';
import { initialProducts } from './data/seedProducts.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Store io instance on app for access in route controllers
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connectedSockets: io.engine.clientsCount
  });
});

// Socket.IO Connection Telemetry
io.on('connection', (socket) => {
  console.log(`\x1b[32m[Socket.IO Client Connected]\x1b[0m ID: ${socket.id} | Total Connected: ${io.engine.clientsCount}`);

  // Emit current server status to newly connected client
  socket.emit('socket:connected', {
    message: 'Real-Time Synchronization Active',
    clientId: socket.id,
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    console.log(`\x1b[31m[Socket.IO Client Disconnected]\x1b[0m ID: ${socket.id}`);
  });
});

// Auto-seed initial catalog & demo accounts
const seedDatabase = async () => {
  try {
    const existingProducts = await Product.find();
    if (existingProducts.length === 0) {
      console.log('\x1b[36m[DB Seeding]\x1b[0m Populating initial premium supplement catalog...');
      for (const item of initialProducts) {
        await Product.create(item);
      }
      console.log(`\x1b[32m[DB Seeded]\x1b[0m Successfully loaded ${initialProducts.length} supplement products!`);
    }

    // Seed default admin & test customer
    const existingAdmin = await User.findOne({ email: 'admin@apexnutra.com' });
    if (!existingAdmin) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@apexnutra.com',
        password: 'adminpassword123',
        role: 'admin',
        phone: '+91 98765 43210'
      });
      console.log('\x1b[32m[Auth Seeded]\x1b[0m Created Admin Account: admin@apexnutra.com (Pass: adminpassword123)');
    }

    const existingCustomer = await User.findOne({ email: 'john@example.com' });
    if (!existingCustomer) {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'customerpassword123',
        role: 'customer',
        phone: '+91 91234 56789'
      });
      console.log('\x1b[32m[Auth Seeded]\x1b[0m Created Customer Account: john@example.com (Pass: customerpassword123)');
    }
  } catch (error) {
    console.warn('[Seed Error]', error.message);
  }
};

const PORT = process.env.PORT || 5000;

// Start Server & Database
(async () => {
  await connectDB();
  await seedDatabase();

  server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀  \x1b[1m\x1b[32mAPEXNUTRA SUPPLEMENT REAL-TIME SERVER IS RUNNING\x1b[0m        ║
║                                                               ║
║   📡  API URL:       \x1b[36mhttp://localhost:${PORT}/api\x1b[0m                     ║
║   ⚡  Socket.IO:     \x1b[35mhttp://localhost:${PORT}\x1b[0m                         ║
║   📦  Storage Mode:  \x1b[33mResilient Multi-Store (DB + Local)\x1b[0m       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
})();
