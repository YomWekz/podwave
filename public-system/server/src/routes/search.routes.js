/**
 * Search Routes
 */

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

// GET /api/search - Search podcasts and episodes
router.get('/', searchController.search);

// GET /api/search/trending - Get trending search terms
router.get('/trending', searchController.getTrendingSearches);

// GET /api/search/suggestions - Get autocomplete suggestions
router.get('/suggestions', searchController.getSuggestions);

module.exports = router;
