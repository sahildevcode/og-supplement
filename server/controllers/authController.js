import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';

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
