/**
 * Service Auth Middleware
 * Validates service-to-service calls using a shared static SERVICE_TOKEN.
 * 
 * Applied ONLY to integration routes:
 *   - POST /api/integration/send-to-editor/:feedId
 *   - POST /api/integration/batch-send-to-editor
 *   - GET  /api/integration/status
 * 
 * These routes handle system pipeline calls (Admin → Editor → Public).
 * They must stay independent of user login sessions.
 */

/**
 * requireServiceToken
 * Checks Authorization: Bearer <SERVICE_TOKEN> header.
 * The SERVICE_TOKEN is a static shared secret in .env — not a user JWT.
 */
function requireServiceToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            success: false,
            error: 'Service token required. This endpoint is for system-to-system calls only.'
        });
    }

    const token = authHeader.split(' ')[1];
    const serviceToken = process.env.SERVICE_TOKEN;

    if (!serviceToken) {
        console.error('SERVICE_TOKEN is not set in .env');
        return res.status(500).json({
            success: false,
            error: 'Service token is not configured on this server.'
        });
    }

    if (token !== serviceToken) {
        return res.status(403).json({
            success: false,
            error: 'Invalid service token.'
        });
    }

    next();
}

module.exports = { requireServiceToken };
