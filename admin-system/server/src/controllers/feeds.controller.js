/**
 * Feeds Controller
 * Handles RSS feed management operations
 */

const db = require('../db/connection');
const { validateRssUrl, validateCategory } = require('../utils/rssUrlValidator');
const { ValidationError, NotFoundError, DatabaseError } = require('../middleware/errorHandler');

/**
 * Get all feeds
 * GET /api/feeds
 */
async function getAllFeeds(req, res, next) {
    try {
        const feeds = await db.query(`
            SELECT 
                id,
                rss_url,
                category,
                status,
                last_sync_at,
                created_at,
                updated_at
            FROM feeds
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            count: feeds.length,
            data: feeds
        });
    } catch (error) {
        next(new DatabaseError('Failed to fetch feeds'));
    }
}

/**
 * Get a single feed by ID
 * GET /api/feeds/:id
 */
async function getFeedById(req, res, next) {
    try {
        const { id } = req.params;
        
        const feed = await db.queryOne(`
            SELECT 
                id,
                rss_url,
                category,
                status,
                last_sync_at,
                created_at,
                updated_at
            FROM feeds
            WHERE id = ?
        `, [id]);
        
        if (!feed) {
            return next(new NotFoundError('Feed'));
        }
        
        res.json({
            success: true,
            data: feed
        });
    } catch (error) {
        next(new DatabaseError('Failed to fetch feed'));
    }
}

/**
 * Create a new feed
 * POST /api/feeds
 */
async function createFeed(req, res, next) {
    try {
        const { rss_url, category } = req.body;
        
        // Validate RSS URL
        const urlValidation = validateRssUrl(rss_url);
        if (!urlValidation.valid) {
            return res.status(400).json({ error: urlValidation.error });
        }
        
        // Validate category
        const categoryValidation = validateCategory(category);
        if (!categoryValidation.valid) {
            return res.status(400).json({ error: categoryValidation.error });
        }
        
        // Check if feed already exists
        const existing = await db.queryOne(
            'SELECT id FROM feeds WHERE rss_url = ?',
            [rss_url]
        );
        
        if (existing) {
            return res.status(409).json({ error: 'Feed with this URL already exists' });
        }
        
        // Insert new feed
        const feedId = await db.insert('feeds', {
            rss_url,
            category: category || 'General',
            status: 'pending'
        });
        
        // Fetch the created feed
        const feed = await db.queryOne(
            'SELECT * FROM feeds WHERE id = ?',
            [feedId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Feed added successfully',
            data: feed
        });
    } catch (error) {
        console.error('Create feed error:', error);
        next(new DatabaseError('Failed to create feed'));
    }
}

/**
 * Delete a feed
 * DELETE /api/feeds/:id
 */
async function deleteFeed(req, res, next) {
    try {
        const { id } = req.params;
        
        // Check if feed exists
        const feed = await db.queryOne('SELECT id FROM feeds WHERE id = ?', [id]);
        
        if (!feed) {
            return next(new NotFoundError('Feed'));
        }
        
        // Delete feed (cascade will delete related records)
        await db.remove('feeds', 'id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Feed deleted successfully'
        });
    } catch (error) {
        console.error('Delete feed error:', error);
        next(new DatabaseError('Failed to delete feed'));
    }
}

/**
 * Update feed status
 * PUT /api/feeds/:id/status
 */
async function updateFeedStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status, last_sync_at } = req.body;
        
        // Validate status
        const validStatuses = ['active', 'failed', 'pending'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        // Check if feed exists
        const feed = await db.queryOne('SELECT id FROM feeds WHERE id = ?', [id]);
        
        if (!feed) {
            return next(new NotFoundError('Feed'));
        }
        
        // Update feed
        const updateData = { status };
        if (last_sync_at) {
            updateData.last_sync_at = last_sync_at;
        }
        
        await db.update('feeds', updateData, 'id = ?', [id]);
        
        // Fetch updated feed
        const updatedFeed = await db.queryOne('SELECT * FROM feeds WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Feed status updated',
            data: updatedFeed
        });
    } catch (error) {
        console.error('Update feed status error:', error);
        next(new DatabaseError('Failed to update feed status'));
    }
}

module.exports = {
    getAllFeeds,
    getFeedById,
    createFeed,
    deleteFeed,
    updateFeedStatus
};
