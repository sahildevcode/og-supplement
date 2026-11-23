import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { sendPasswordResetOtpEmail, sendVerificationOtpEmail } from '../services/emailService.js';

// In-memory pending signups container for OTP verification
// Format: email -> { name, email, password, phone, address, city, state, pincode, landmark, otp, expiresAt }
const pendingVerifications = new Map();

// Helper to clean expired OTPs every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pendingVerifications.entries()) {
    if (now > value.expiresAt) {
      pendingVerifications.delete(key);
    }
  }
}, 10 * 60 * 1000);

// @route   POST /api/auth/send-register-otp
// Step 1 of registration: validate fields, generate OTP, send email
export const sendRegisterOtp = async (req, res) => {
  try {
    const { name, email, password, phone = '', address = '', city = '', state = '', pincode = '', landmark = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide Name, Email, and Password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please login.' });
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

    // Store in pendingVerifications map
    pendingVerifications.set(cleanEmail, {
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      landmark: landmark.trim(),
      otp,
      expiresAt
    });

    const emailResult = await sendVerificationOtpEmail(cleanEmail, otp, name.trim());

    console.log(`\x1b[36m[Register OTP]\x1b[0m Sent 6-digit verification code to ${cleanEmail}`);

    res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Please enter the 6-digit OTP to activate your account.`,
      ...(emailResult.simulated ? { simulatedOtp: otp } : {})
    });
  } catch (error) {
    console.error('[Send Register OTP Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send verification OTP' });
  }
};

// @route   POST /api/auth/verify-register-otp
// Step 2 of registration: verify OTP, create verified user, issue JWT token
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and 6-digit OTP are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = pendingVerifications.get(cleanEmail);

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email, or the OTP has expired. Please try again.'
      });
    }

    if (Date.now() > pending.expiresAt) {
      pendingVerifications.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired (valid for 10 minutes). Please request a new OTP.'
      });
    }

    if (pending.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit OTP. Please check your email and try again.' });
    }

    // Double check email uniqueness before creation
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      pendingVerifications.delete(cleanEmail);
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Create verified customer account
    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      role: 'customer',
      phone: pending.phone,
      address: pending.address,
      city: pending.city,
      state: pending.state,
      pincode: pending.pincode,
      landmark: pending.landmark,
      isEmailVerified: true
    });

    // Clean up memory
    pendingVerifications.delete(cleanEmail);

    const token = generateToken(user._id || user.id, user.role);

    console.log(`\x1b[32m[User Verified & Created]\x1b[0m ${user.email} (${user.name})`);

    res.status(201).json({
      success: true,
      message: 'Account successfully verified and created! Welcome to OG Supplements.',
      user: {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        landmark: user.landmark || ''
      },
      token
    });
  } catch (error) {
    console.error('[Verify Register OTP Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = 'customer', phone = '', address = '', city = '', state = '', pincode = '', landmark = '' } = req.body;
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
      phone,
      address,
      city,
      state,
      pincode,
      landmark
    });

    const token = generateToken(user._id || user.id, user.role);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        landmark: user.landmark || ''
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
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        landmark: user.landmark || ''
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

// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, phone, address, city, state, pincode, landmark, currentPassword, newPassword } = req.body;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();
    if (city !== undefined) updates.city = city.trim();
    if (state !== undefined) updates.state = state.trim();
    if (pincode !== undefined) updates.pincode = pincode.trim();
    if (landmark !== undefined) updates.landmark = landmark.trim();

    // If changing password
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please provide current password to update password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    updates.updatedAt = new Date();

    await User.updateOne({ _id: userId }, { $set: updates });

    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: updatedUser._id || updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        city: updatedUser.city || '',
        state: updatedUser.state || '',
        pincode: updatedUser.pincode || '',
        landmark: updatedUser.landmark || '',
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
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
