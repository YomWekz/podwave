/**
 * Validation Middleware
 * Validates request parameters and body
 */

/**
 * Validate that an ID parameter is a positive integer
 * @param {string} paramName - Name of the parameter to validate
 */
function validateId(paramName = 'id') {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        if (!id) {
            return res.status(400).json({ error: `${paramName} is required` });
        }
        
        // Check if it's a valid positive integer
        const parsed = parseInt(id, 10);
        if (isNaN(parsed) || parsed < 1 || parsed.toString() !== id) {
            return res.status(400).json({ error: `Invalid ${paramName} format` });
        }
        
        // Attach parsed ID to request
        req.params[paramName] = parsed;
        next();
    };
}

/**
 * Validate feed creation body
 */
function validateFeedCreate(req, res, next) {
    const { rss_url, category } = req.body;
    
    // RSS URL is required
    if (!rss_url || typeof rss_url !== 'string') {
        return res.status(400).json({ error: 'RSS URL is required' });
    }
    
    // Trim whitespace
    req.body.rss_url = rss_url.trim();
    
    // Category is optional, set default if not provided
    if (category && typeof category === 'string') {
        req.body.category = category.trim() || 'General';
    } else {
        req.body.category = 'General';
    }
    
    next();
}

/**
 * Validate pagination parameters
 */
function validatePagination(req, res, next) {
    const { page, limit } = req.query;
    
    // Parse and validate page
    req.query.page = parseInt(page, 10) || 1;
    if (req.query.page < 1) req.query.page = 1;
    
    // Parse and validate limit
    req.query.limit = parseInt(limit, 10) || 50;
    if (req.query.limit < 1) req.query.limit = 50;
    if (req.query.limit > 100) req.query.limit = 100; // Max 100 per page
    
    next();
}

module.exports = {
    validateId,
    validateFeedCreate,
    validatePagination
};
