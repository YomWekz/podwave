/**
 * Feeds Routes
 * Routes for RSS feed management
 */

const express = require('express');
const router = express.Router();

const feedsController = require('../controllers/feeds.controller');
const { validateId, validateFeedCreate } = require('../middleware/validate');
const { feedCreateLimit } = require('../middleware/rateLimit');

/**
 * @route   GET /api/feeds
 * @desc    Get all feeds
 * @access  Public (will be protected in future)
 */
router.get('/', feedsController.getAllFeeds);

/**
 * @route   GET /api/feeds/:id
 * @desc    Get a single feed by ID
 * @access  Public (will be protected in future)
 */
router.get('/:id', validateId('id'), feedsController.getFeedById);

/**
 * @route   POST /api/feeds
 * @desc    Create a new feed
 * @access  Public (will be protected in future)
 */
router.post('/', feedCreateLimit, validateFeedCreate, feedsController.createFeed);

/**
 * @route   DELETE /api/feeds/:id
 * @desc    Delete a feed by ID
 * @access  Public (will be protected in future)
 */
router.delete('/:id', validateId('id'), feedsController.deleteFeed);

/**
 * @route   PUT /api/feeds/:id/status
 * @desc    Update feed status
 * @access  Public (will be protected in future)
 */
router.put('/:id/status', validateId('id'), feedsController.updateFeedStatus);

module.exports = router;
