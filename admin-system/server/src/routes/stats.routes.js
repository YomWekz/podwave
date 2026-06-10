/**
 * Stats Routes
 * Routes for dashboard statistics
 */

const express = require('express');
const router = express.Router();

const statsController = require('../controllers/stats.controller');

/**
 * @route   GET /api/stats
 * @desc    Get dashboard statistics
 * @access  Public (will be protected in future)
 */
router.get('/', statsController.getStats);

/**
 * @route   GET /api/stats/categories
 * @desc    Get feed statistics by category
 * @access  Public (will be protected in future)
 */
router.get('/categories', statsController.getCategoryStats);

module.exports = router;
