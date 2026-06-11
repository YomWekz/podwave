/**
 * Public Auth Routes
 * Registration, login, and JWT verification for public users.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requirePublicAuth } = require('../middleware/auth');
const { isConnected } = require('../config/database');

const router = express.Router();

function createToken(user) {
  const secret = process.env.PUBLIC_JWT_SECRET;

  if (!secret) {
    throw new Error('PUBLIC_JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user'
    },
    secret,
    { expiresIn: process.env.PUBLIC_JWT_EXPIRES_IN || '30d' }
  );
}

function toPublicUser(user) {
  return {
    id: (user._id || user.id).toString(),
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    savedPodcasts: user.savedPodcasts || [],
    listenHistory: user.listenHistory || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeUsername(username) {
  return String(username || '').trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validateRegistration({ username, email, password }) {
  const errors = [];

  if (!normalizeUsername(username)) errors.push('Username is required.');
  if (!normalizeEmail(email)) errors.push('Email is required.');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');

  return errors;
}

router.post('/register', async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      error: 'User registration requires MongoDB.'
    });
  }

  try {
    const username = normalizeUsername(req.body.username);
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const errors = validateRegistration({ username, email, password });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        details: errors
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email },
        { username: new RegExp(`^${escapeRegex(username)}$`, 'i') }
      ]
    }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: existingUser.email === email
          ? 'Email is already registered.'
          : 'Username is already taken.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const initials = username.slice(0, 2).toUpperCase();

    const user = await User.create({
      username,
      email,
      name: username,
      initials,
      passwordHash,
      role: 'user',
      savedPodcasts: [],
      listenHistory: []
    });

    return res.status(201).json({
      success: true,
      token: createToken(user),
      user: toPublicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Email or username is already registered.'
      });
    }

    console.error('Public registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed.'
    });
  }
});

router.post('/login', async (req, res) => {
  if (!isConnected()) {
    return res.status(503).json({
      success: false,
      error: 'User login requires MongoDB.'
    });
  }

  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    return res.json({
      success: true,
      token: createToken(user),
      user: toPublicUser(user)
    });
  } catch (error) {
    console.error('Public login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed.'
    });
  }
});

function verifyToken(req, res) {
  return res.json({
    success: true,
    valid: true,
    user: toPublicUser(req.userDoc || req.user)
  });
}

router.get('/verify', requirePublicAuth, verifyToken);
router.post('/verify', requirePublicAuth, verifyToken);
router.get('/me', requirePublicAuth, verifyToken);

module.exports = router;
