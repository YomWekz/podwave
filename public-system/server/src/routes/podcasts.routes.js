/**
 * Podcasts Routes
 */

const express = require('express');
const router = express.Router();
const podcastsController = require('../controllers/podcasts.controller');

// GET /api/podcasts - List all podcasts
router.get('/', podcastsController.getPodcasts);

// GET /api/podcasts/featured - Get featured podcasts
router.get('/featured', podcastsController.getFeatured);

// GET /api/podcasts/trending - Get trending podcasts
router.get('/trending', podcastsController.getTrending);

// GET /api/podcasts/categories - Get categories
router.get('/categories', podcastsController.getCategories);

// GET /api/podcasts/:id - Get single podcast
router.get('/:id', podcastsController.getPodcastById);

module.exports = router;
