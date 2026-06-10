/**
 * Simple Rate Limiting Middleware
 * In-memory rate limiting for basic protection
 * 
 * Note: For production, use a proper rate limiter like express-rate-limit
 * with a Redis store for distributed systems
 */

// In-memory store for rate limiting
// Key: IP address or identifier, Value: { count, resetTime }
const rateLimitStore = new Map();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 60000); // Clean up every minute

/**
 * Create a rate limiting middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message when limit exceeded
 */
function createRateLimit(options = {}) {
    const {
        windowMs = 60000, // 1 minute default
        max = 10, // 10 requests per window default
        message = 'Too many requests, please try again later'
    } = options;
    
    return (req, res, next) => {
        // Use IP address as identifier
        // In production, you might want to use user ID or API key
        const identifier = req.ip || req.connection.remoteAddress || 'unknown';
        const key = `${identifier}:${req.path}`;
        
        const now = Date.now();
        const record = rateLimitStore.get(key);
        
        if (!record || now > record.resetTime) {
            // No record or expired, create new one
            rateLimitStore.set(key, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        
        if (record.count >= max) {
            // Rate limit exceeded
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            return res.status(429).json({
                error: message,
                retryAfter: `${retryAfter} seconds`
            });
        }
        
        // Increment count
        record.count++;
        rateLimitStore.set(key, record);
        next();
    };
}

// Pre-configured rate limiters
const feedCreateLimit = createRateLimit({
    windowMs: 60000, // 1 minute
    max: 5, // 5 feeds per minute
    message: 'Too many feed creation requests. Please wait before adding more feeds.'
});

const syncJobLimit = createRateLimit({
    windowMs: 60000, // 1 minute
    max: 10, // 10 sync requests per minute
    message: 'Too many sync requests. Please wait before triggering more jobs.'
});

module.exports = {
    createRateLimit,
    feedCreateLimit,
    syncJobLimit
};
