import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getAdminStats, getAdminCustomers, updateCustomerStatus } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Setup Multer Storage for file uploads
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `supplement-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter(req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Image Upload Endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }
  // Return absolute URL so it resolves properly across Vercel frontend and admin domains
  const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
  const host = req.get('host') || 'og-supplement-server.onrender.com';
  const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
  const relativeUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    imageUrl: fullUrl,
    url: fullUrl,
    relativeUrl,
    message: 'Image uploaded successfully'
  });
});

// Stats Endpoint
router.get('/stats', getAdminStats);

// Customers Activity & Management Endpoint
router.get('/customers', getAdminCustomers);
router.patch('/customers/:id/status', updateCustomerStatus);

export default router;
