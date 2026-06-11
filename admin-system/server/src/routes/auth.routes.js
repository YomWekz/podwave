/**
 * Auth Routes — Admin System
 * JWT login and token verification for the Admin dashboard.
 * 
 * Routes:
 *   POST /api/auth/login   — returns a signed JWT for a valid admin login
 *   POST /api/auth/verify  — validates an existing token (for frontend session checks)
 * 
 * Credentials are stored in .env as:
 *   ADMIN_USERNAME      — plain string (e.g. "admin")
 *   ADMIN_PASSWORD_HASH — bcrypt hash generated offline, never the raw password
 *   ADMIN_JWT_SECRET    — long random string used to sign tokens
 * 
 * NOTE: These routes are intentionally open (no auth middleware).
 *       They ARE the auth entry point.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Validates username + password, returns a signed JWT on success.
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Basic input validation
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            error: 'Username and password are required.'
        });
    }

    // Check required env vars are configured
    const storedUsername = process.env.ADMIN_USERNAME;
    const storedHash = process.env.ADMIN_PASSWORD_HASH;
    const jwtSecret = process.env.ADMIN_JWT_SECRET;

    if (!storedUsername || !storedHash || !jwtSecret) {
        console.error('Admin auth env vars are not configured (ADMIN_USERNAME, ADMIN_PASSWORD_HASH, ADMIN_JWT_SECRET)');
        return res.status(500).json({
            success: false,
            error: 'Authentication is not configured on this server.'
        });
    }

    // Check username
    if (username !== storedUsername) {
        // Intentionally generic message — do not reveal which field is wrong
        return res.status(401).json({
            success: false,
            error: 'Invalid username or password.'
        });
    }

    // Check password against bcrypt hash
    const passwordValid = await bcrypt.compare(password, storedHash);
    if (!passwordValid) {
        return res.status(401).json({
            success: false,
            error: 'Invalid username or password.'
        });
    }

    // Sign and return JWT
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    const token = jwt.sign(
        { username: storedUsername, role: 'admin' },
        jwtSecret,
        { expiresIn }
    );

    return res.json({
        success: true,
        token,
        role: 'admin',
        username: storedUsername,
        expiresIn
    });
});

/**
 * POST /api/auth/verify
 * Validates an existing JWT token.
 * Used by the frontend to check if the session is still valid on page load.
 */
router.post('/verify', requireAuth, (req, res) => {
    // If requireAuth passed, token is valid
    return res.json({
        success: true,
        valid: true,
        user: {
            username: req.user.username,
            role: req.user.role
        }
    });
});

module.exports = router;
