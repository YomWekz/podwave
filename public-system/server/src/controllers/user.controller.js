/**
 * User Controller
 * Handles user saved podcasts, ratings, and listen history
 */

const User = require('../models/User');
const Podcast = require('../models/Podcast');
const Episode = require('../models/Episode');
const { isConnected } = require('../config/database');

// Mock user data
const mockUser = require('../data/mockUser');

/**
 * GET /api/user/profile
 * Get current user profile
 */
async function getProfile(req, res) {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockUser.profile,
      source: 'mock'
    });
  }
  
  try {
    // For now, return first user or create mock
    let user = await User.findOne().lean();
    
    if (!user) {
      return res.json({
        success: true,
        data: mockUser.profile,
        source: 'mock'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        initials: user.initials || user.name?.substring(0, 2).toUpperCase(),
        plan: user.plan,
        stats: {
          saved: user.savedPodcasts?.length || 0,
          listened: user.listenHistory?.length || 0,
          reviews: user.reviews?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/user/saved
 * Get user's saved podcasts
 */
async function getSaved(req, res) {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockUser.savedPodcasts,
      source: 'mock'
    });
  }
  
  try {
    let user = await User.findOne().populate('savedPodcasts');
    
    if (!user || !user.savedPodcasts) {
      return res.json({
        success: true,
        data: [],
        source: 'mock'
      });
    }
    
    res.json({
      success: true,
      data: user.savedPodcasts.map(p => ({
        id: p._id,
        name: p.title,
        meta: `${p.category || 'Uncategorized'} · ${p.episodeCount || 0} eps`,
        category: p.category,
        colorClass: p.colorClass,
        iconClass: p.iconClass,
        saved: true
      }))
    });
  } catch (error) {
    console.error('Error fetching saved podcasts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/user/saved
 * Save a podcast
 */
async function savePodcast(req, res) {
  const { podcastId } = req.body;
  
  if (!isConnected()) {
    return res.json({
      success: true,
      message: 'Podcast saved (mock mode)',
      source: 'mock'
    });
  }
  
  try {
    let user = await User.findOne();
    
    if (!user) {
      // Create a mock user
      user = new User({
        email: 'demo@podwave.io',
        name: 'Demo User',
        initials: 'DU',
        plan: 'free'
      });
    }
    
    await user.savePodcast(podcastId);
    
    // Update podcast save count
    await Podcast.findByIdAndUpdate(podcastId, {
      $inc: { saveCount: 1 }
    });
    
    res.json({
      success: true,
      message: 'Podcast saved'
    });
  } catch (error) {
    console.error('Error saving podcast:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * DELETE /api/user/saved/:podcastId
 * Unsave a podcast
 */
async function unsavePodcast(req, res) {
  const { podcastId } = req.params;
  
  if (!isConnected()) {
    return res.json({
      success: true,
      message: 'Podcast unsaved (mock mode)',
      source: 'mock'
    });
  }
  
  try {
    let user = await User.findOne();
    
    if (user) {
      await user.unsavePodcast(podcastId);
      
      // Update podcast save count
      await Podcast.findByIdAndUpdate(podcastId, {
        $inc: { saveCount: -1 }
      });
    }
    
    res.json({
      success: true,
      message: 'Podcast unsaved'
    });
  } catch (error) {
    console.error('Error unsaving podcast:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/user/history
 * Get listen history
 */
async function getHistory(req, res) {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockUser.listenHistory,
      source: 'mock'
    });
  }
  
  try {
    const user = await User.findOne()
      .populate('listenHistory.episodeId')
      .populate('listenHistory.podcastId');
    
    if (!user || !user.listenHistory) {
      return res.json({
        success: true,
        data: [],
        source: 'mock'
      });
    }
    
    res.json({
      success: true,
      data: user.listenHistory.slice(0, 50)
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/user/history
 * Add to listen history
 */
async function addToHistory(req, res) {
  const { episodeId, podcastId, progress } = req.body;
  
  if (!isConnected()) {
    return res.json({
      success: true,
      message: 'Added to history (mock mode)',
      source: 'mock'
    });
  }
  
  try {
    let user = await User.findOne();
    
    if (!user) {
      user = new User({
        email: 'demo@podwave.io',
        name: 'Demo User',
        initials: 'DU',
        plan: 'free'
      });
    }
    
    await user.addToHistory(episodeId, podcastId, progress || 0);
    
    // Update episode play count
    await Episode.findByIdAndUpdate(episodeId, {
      $inc: { playCount: 1 }
    });
    
    res.json({
      success: true,
      message: 'Added to history'
    });
  } catch (error) {
    console.error('Error adding to history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/user/ratings
 * Rate a podcast
 */
async function ratePodcast(req, res) {
  const { podcastId, rating } = req.body;
  
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: 'Rating must be between 1 and 5'
    });
  }
  
  if (!isConnected()) {
    return res.json({
      success: true,
      message: 'Rating saved (mock mode)',
      source: 'mock'
    });
  }
  
  try {
    let user = await User.findOne();
    
    if (!user) {
      user = new User({
        email: 'demo@podwave.io',
        name: 'Demo User',
        initials: 'DU',
        plan: 'free'
      });
      await user.save();
    }
    
    await user.ratePodcast(podcastId, rating);
    
    // Update podcast rating
    const podcast = await Podcast.findById(podcastId);
    if (podcast) {
      await podcast.updateRating(rating);
    }
    
    res.json({
      success: true,
      message: 'Rating saved'
    });
  } catch (error) {
    console.error('Error saving rating:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/user/player-state
 * Get current player state
 */
async function getPlayerState(req, res) {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockUser.currentEpisode,
      source: 'mock'
    });
  }
  
  try {
    const user = await User.findOne()
      .populate('currentEpisode.episodeId')
      .populate('currentEpisode.podcastId');
    
    if (!user || !user.currentEpisode?.episodeId) {
      return res.json({
        success: true,
        data: mockUser.currentEpisode,
        source: 'mock'
      });
    }
    
    const episode = user.currentEpisode.episodeId;
    const podcast = user.currentEpisode.podcastId;
    
    res.json({
      success: true,
      data: {
        episodeId: episode._id,
        title: episode.title,
        podcast: podcast?.title,
        podcastId: podcast?._id,
        currentTime: user.currentEpisode.progress || 0,
        totalTime: episode.duration || 0,
        playbackRate: user.currentEpisode.playbackRate || 1.0
      }
    });
  } catch (error) {
    console.error('Error fetching player state:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/user/player-state
 * Save player state
 */
async function savePlayerState(req, res) {
  const { episodeId, podcastId, progress, playbackRate } = req.body;
  
  if (!isConnected()) {
    return res.json({
      success: true,
      message: 'Player state saved (mock mode)',
      source: 'mock'
    });
  }
  
  try {
    let user = await User.findOne();
    
    if (!user) {
      user = new User({
        email: 'demo@podwave.io',
        name: 'Demo User',
        initials: 'DU',
        plan: 'free'
      });
      await user.save();
    }
    
    user.currentEpisode = {
      episodeId,
      podcastId,
      progress: progress || 0,
      playbackRate: playbackRate || 1.0
    };
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Player state saved'
    });
  } catch (error) {
    console.error('Error saving player state:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getProfile,
  getSaved,
  savePodcast,
  unsavePodcast,
  getHistory,
  addToHistory,
  ratePodcast,
  getPlayerState,
  savePlayerState
};
