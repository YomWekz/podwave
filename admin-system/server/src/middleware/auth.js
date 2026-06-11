/**
 * Admin Auth Middleware
 * JWT verification for protected Admin API routes.
 * 
 * Does NOT apply to:
 *   - /api/health (open)
 *   - /api/integration/* (uses service token via serviceAuth.js)
 */

const jwt = require('jsonwebtoken');

/**
 * requireAuth
 * Verifies the JWT in Authorization: Bearer <token>
 * Attaches decoded payload to req.user on success.
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'No token provided. Please log in.'
        });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.ADMIN_JWT_SECRET;

    if (!secret) {
        console.error('ADMIN_JWT_SECRET is not set in .env');
        return res.status(500).json({
            success: false,
            error: 'Server authentication is misconfigured.'
        });
    }

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded; // { username, role, iat, exp }
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            success: false,
            error: 'Invalid token. Please log in again.'
        });
    }
}

/**
 * requireRole
 * Must be used after requireAuth.
 * Ensures the authenticated user has the required role.
 */
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role: ${role}`
            });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };
