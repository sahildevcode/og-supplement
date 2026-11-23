import express from 'express';
import {
  registerUser,
  sendRegisterOtp,
  verifyRegisterOtp,
  loginUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPasswordWithOtp
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/send-register-otp', sendRegisterOtp);
router.post('/verify-register-otp', verifyRegisterOtp);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordWithOtp);

export default router;
