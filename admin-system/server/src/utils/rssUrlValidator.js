/**
 * RSS URL Validator
 * Validates RSS feed URLs for security
 */

/**
 * List of blocked hosts for security
 * Prevents SSRF attacks and internal network access
 */
const BLOCKED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '0.0.0.1',
    '::1',
    '169.254.169.254', // AWS metadata endpoint
    'metadata.google.internal', // GCP metadata
    'metadata.azure.internal' // Azure metadata
];

/**
 * Private IP ranges (for SSRF protection)
 */
const PRIVATE_IP_RANGES = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^169\.254\./,              // Link-local
    /^192\.0\.0\./,             // IANA
    /^192\.0\.2\./,             // TEST-NET-1
    /^198\.51\.100\./,          // TEST-NET-2
    /^203\.0\.113\./,           // TEST-NET-3
    /^224\./,                   // Multicast
    /^240\./,                   // Reserved
    /^255\.255\.255\.255/       // Broadcast
];

/**
 * Check if an IP address is in a private range
 * @param {string} ip - IP address to check
 * @returns {boolean} True if private IP
 */
function isPrivateIP(ip) {
    return PRIVATE_IP_RANGES.some(range => range.test(ip));
}

/**
 * Validate an RSS feed URL
 * @param {string} url - RSS feed URL to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
function validateRssUrl(url) {
    // Check if URL is provided
    if (!url || typeof url !== 'string') {
        return { valid: false, error: 'RSS URL is required' };
    }

    // Trim whitespace
    url = url.trim();

    // Check length
    if (url.length > 2048) {
        return { valid: false, error: 'RSS URL is too long (max 2048 characters)' };
    }

    // Parse URL
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (error) {
        return { valid: false, error: 'Invalid URL format' };
    }

    // Check protocol (only http and https allowed)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { valid: false, error: 'URL must use http or https protocol' };
    }

    // Get hostname (lowercase for comparison)
    const hostname = parsedUrl.hostname.toLowerCase();

    // Check against blocked hosts
    if (BLOCKED_HOSTS.includes(hostname)) {
        return { valid: false, error: 'Access to this host is not allowed' };
    }

    // Check for private IP ranges
    if (isPrivateIP(hostname)) {
        return { valid: false, error: 'Access to private IP addresses is not allowed' };
    }

    // Check for IP address that might be private (numeric check)
    const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
        const octets = ipMatch.slice(1, 5).map(Number);
        
        // Validate it's a valid IP
        if (octets.every(o => o >= 0 && o <= 255)) {
            // Check private ranges again with numeric comparison
            if (octets[0] === 10 ||
                (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
                (octets[0] === 192 && octets[1] === 168) ||
                (octets[0] === 169 && octets[1] === 254) ||
                octets[0] === 127) {
                return { valid: false, error: 'Access to private IP addresses is not allowed' };
            }
        }
    }

    // Check for suspicious patterns
    if (hostname.includes('internal') || hostname.includes('local')) {
        return { valid: false, error: 'Access to internal hosts is not allowed' };
    }

    return { valid: true, error: null };
}

/**
 * Validate category
 * @param {string} category - Category to validate
 * @returns {Object} { valid: boolean, error: string|null }
 */
function validateCategory(category) {
    if (!category) {
        return { valid: true, error: null }; // Category is optional
    }

    if (typeof category !== 'string') {
        return { valid: false, error: 'Category must be a string' };
    }

    // Trim and check length
    category = category.trim();
    if (category.length > 100) {
        return { valid: false, error: 'Category is too long (max 100 characters)' };
    }

    // Check for valid characters (letters, numbers, spaces, hyphens, &)
    if (!/^[a-zA-Z0-9\s\-&]+$/.test(category)) {
        return { valid: false, error: 'Category contains invalid characters' };
    }

    return { valid: true, error: null };
}

module.exports = {
    validateRssUrl,
    validateCategory,
    BLOCKED_HOSTS,
    isPrivateIP
};
