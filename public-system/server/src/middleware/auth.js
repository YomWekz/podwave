/**
 * Public User JWT Auth Middleware
 * Protects personalized user routes only.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isConnected } = require('../config/database');

function unauthorized(message = 'Public user authentication required.') {
  return {
    success: false,
    error: message
  };
}

async function requirePublicAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(unauthorized());
  }

  const secret = process.env.PUBLIC_JWT_SECRET;

  if (!secret) {
    console.error('PUBLIC_JWT_SECRET is not configured');
    return res.status(500).json({
      success: false,
      error: 'Public authentication is not configured.'
    });
  }

  try {
    const token = authHeader.slice('Bearer '.length).trim();
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== 'user') {
      return res.status(401).json(unauthorized('Invalid public user token.'));
    }

    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    };

    if (isConnected()) {
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json(unauthorized('User account is not available.'));
      }

      req.userDoc = user;
    }

    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'Public user token has expired.'
      : 'Invalid public user token.';

    return res.status(401).json(unauthorized(message));
  }
}

module.exports = { requirePublicAuth };
