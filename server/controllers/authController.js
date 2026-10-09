import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { sendPasswordResetOtpEmail } from '../services/emailService.js';

// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone = '' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone
    });

    const token = generateToken(user._id || user.id, user.role);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      },
      token
    });
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id || user.id, user.role);

    res.json({
      success: true,
      user: {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || ''
      },
      token
    });
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide registered email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No registered account found with this email address'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await User.updateOne(
      { email: cleanEmail },
      {
        $set: {
          resetOtp: otp,
          resetOtpExpires: otpExpires
        }
      }
    );

    const emailResult = await sendPasswordResetOtpEmail(user.email, otp);

    res.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email.',
      ...(emailResult.simulated ? { simulatedOtp: otp } : {})
    });
  } catch (error) {
    console.error('[Forgot Password Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process forgot password request' });
  }
};

// @route   POST /api/auth/reset-password
export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.resetOtp || user.resetOtp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code (OTP)' });
    }

    if (new Date() > new Date(user.resetOtpExpires)) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
      { email: cleanEmail },
      {
        $set: {
          password: hashedPassword,
          resetOtp: null,
          resetOtpExpires: null,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in.'
    });
  } catch (error) {
    console.error('[Reset Password Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to reset password' });
  }
};
