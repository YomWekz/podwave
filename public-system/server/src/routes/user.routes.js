/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Profile
router.get('/profile', userController.getProfile);

// Saved podcasts
router.get('/saved', userController.getSaved);
router.post('/saved', userController.savePodcast);
router.delete('/saved/:podcastId', userController.unsavePodcast);

// Listen history
router.get('/history', userController.getHistory);
router.post('/history', userController.addToHistory);

// Ratings
router.post('/ratings', userController.ratePodcast);

// Player state
router.get('/player-state', userController.getPlayerState);
router.post('/player-state', userController.savePlayerState);

module.exports = router;
