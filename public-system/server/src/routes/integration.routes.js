/**
 * Integration Routes - Public System
 * Receives published content from Editor system
 */

const express = require('express');
const router = express.Router();
const Podcast = require('../models/Podcast');
const Episode = require('../models/Episode');
const { isConnected } = require('../config/database');

// Service token validation
const EDITOR_TO_PUBLIC_TOKEN = process.env.EDITOR_TO_PUBLIC_SERVICE_TOKEN || 'podwave_editor_to_public_token_2024';

// In-memory store for mock mode
const mockPublishedPodcasts = [];

/**
 * Validate authorization header
 */
function validateAuth(authHeader) {
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === EDITOR_TO_PUBLIC_TOKEN;
}

/**
 * POST /api/integration/receive-from-editor
 * Receive published podcast from Editor system
 */
router.post('/receive-from-editor', async (req, res) => {
  // Validate authorization
  if (!validateAuth(req.headers.authorization)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid service token'
    });
  }
  
  try {
    const body = req.body;
    
    // Validate required fields
    if (!body.title) {
      return res.status(400).json({
        success: false,
        error: 'title is required'
      });
    }
    
    console.log('[Public] Received from Editor:', body.title);
    
    // If not connected to DB, store in memory (mock mode)
    if (!isConnected()) {
      const mockPodcast = {
        id: `mock-${Date.now()}`,
        editor_podcast_id: body.editor_podcast_id,
        title: body.title,
        author: body.author,
        description: body.description,
        category: body.category,
        tags: body.tags || [],
        episode_count: body.episode_count || 0,
        status: 'active',
        publishedAt: new Date(),
        colorClass: getColorClass(body.category),
        iconClass: getIconClass(body.category)
      };
      
      mockPublishedPodcasts.push(mockPodcast);
      
      return res.status(201).json({
        success: true,
        message: 'Podcast received (mock mode)',
        data: mockPodcast,
        source: 'mock'
      });
    }
    
    // Check if podcast already exists
    const existing = await Podcast.findOne({ editorPodcastId: body.editor_podcast_id });
    
    if (existing) {
      // Update existing podcast
      existing.title = body.title;
      existing.author = body.author;
      existing.description = body.description;
      existing.category = body.category;
      existing.tags = body.tags || [];
      existing.episodeCount = body.episode_count || 0;
      await existing.save();
      
      return res.json({
        success: true,
        message: 'Podcast updated',
        data: existing
      });
    }
    
    // Create new podcast
    const podcast = new Podcast({
      title: body.title,
      author: body.author,
      description: body.description,
      imageUrl: body.image_url,
      category: body.category,
      tags: body.tags || [],
      editorPodcastId: body.editor_podcast_id,
      episodeCount: body.episode_count || 0,
      status: 'active',
      colorClass: getColorClass(body.category),
      iconClass: getIconClass(body.category)
    });
    
    await podcast.save();
    
    // Create episodes if provided
    if (body.episodes && Array.isArray(body.episodes)) {
      for (const ep of body.episodes) {
        const episode = new Episode({
          podcastId: podcast._id,
          podcastName: podcast.title,
          title: ep.title,
          description: ep.description,
          audioUrl: ep.audio_url,
          duration: ep.duration || 0,
          editorEpisodeId: ep.editor_episode_id,
          status: 'active'
        });
        await episode.save();
      }
    }
    
    console.log('[Public] Saved podcast:', podcast.title);
    
    res.status(201).json({
      success: true,
      message: 'Podcast received and stored',
      data: podcast
    });
    
  } catch (error) {
    console.error('Receive from Editor error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/integration/published
 * Get list of podcasts published from Editor (for debugging)
 */
router.get('/published', (req, res) => {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockPublishedPodcasts,
      count: mockPublishedPodcasts.length,
      source: 'mock'
    });
  }
  
  Podcast.find({ editorPodcastId: { $exists: true } })
    .then(podcasts => {
      res.json({
        success: true,
        data: podcasts,
        count: podcasts.length
      });
    })
    .catch(error => {
      res.status(500).json({
        success: false,
        error: error.message
      });
    });
});

/**
 * GET /api/integration/status
 * Check integration status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    system: 'public',
    integration: 'active',
    mongodb: isConnected() ? 'connected' : 'mock_mode'
  });
});

/**
 * Helper: Get color class based on category
 */
function getColorClass(category) {
  const colors = {
    'Technology': 't1',
    'Science': 't2',
    'True Crime': 't3',
    'Business': 't-a1',
    'News': 't-a2',
    'Health': 't-a4',
    'Comedy': 't2',
    'Economics': 't-a4'
  };
  return colors[category] || 't1';
}

/**
 * Helper: Get icon class based on category
 */
function getIconClass(category) {
  const icons = {
    'Technology': 'ti-cpu',
    'Science': 'ti-brain',
    'True Crime': 'ti-flame',
    'Business': 'ti-briefcase',
    'News': 'ti-news',
    'Health': 'ti-heart',
    'Comedy': 'ti-mood-smile',
    'Economics': 'ti-coin'
  };
  return icons[category] || 'ti-radio';
}

module.exports = router;
