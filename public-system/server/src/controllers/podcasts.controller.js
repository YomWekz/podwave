/**
 * Podcasts Controller
 * Handles podcast listing, search, and details
 */

const Podcast = require('../models/Podcast');
const Episode = require('../models/Episode');
const { isConnected } = require('../config/database');

// Mock data for fallback
const mockPodcasts = require('../data/mockPodcasts');

/**
 * GET /api/podcasts
 * Get all podcasts with optional filtering
 */
async function getPodcasts(req, res) {
  const { category, search, limit = 20, offset = 0, sort = 'latest' } = req.query;
  
  // If not connected to DB, return mock data
  if (!isConnected()) {
    let filtered = [...mockPodcasts.all];
    
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return res.json({
      success: true,
      data: filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit)),
      total: filtered.length,
      source: 'mock'
    });
  }
  
  try {
    // Build query
    let query = { status: 'active' };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { totalListenCount: -1 };
        break;
      case 'rating':
        sortOptions = { averageRating: -1, ratingCount: -1 };
        break;
      case 'latest':
      default:
        sortOptions = { publishedAt: -1 };
    }
    
    const podcasts = await Podcast.find(query)
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean();
    
    const total = await Podcast.countDocuments(query);
    
    res.json({
      success: true,
      data: podcasts.map(p => ({
        ...p,
        meta: `${p.category || 'Uncategorized'} · ${p.episodeCount || 0} eps`
      })),
      total
    });
  } catch (error) {
    console.error('Error fetching podcasts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/podcasts/featured
 * Get featured podcasts for home page
 */
async function getFeatured(req, res) {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockPodcasts.featured,
      source: 'mock'
    });
  }
  
  try {
    const podcasts = await Podcast.find({
      status: 'active',
      isFeatured: true
    })
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();
    
    res.json({
      success: true,
      data: podcasts.map(p => ({
        ...p,
        meta: `${p.category || 'Uncategorized'} · ${p.episodeCount || 0} eps`
      }))
    });
  } catch (error) {
    console.error('Error fetching featured podcasts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/podcasts/trending
 * Get trending podcasts
 */
async function getTrending(req, res) {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockPodcasts.trending,
      source: 'mock'
    });
  }
  
  try {
    const podcasts = await Podcast.find({ status: 'active' })
      .sort({ totalListenCount: -1, publishedAt: -1 })
      .limit(10)
      .lean();
    
    res.json({
      success: true,
      data: podcasts.map((p, index) => ({
        ...p,
        rank: index + 1,
        meta: `${p.category || 'Uncategorized'} · ${p.episodeCount || 0} eps`
      }))
    });
  } catch (error) {
    console.error('Error fetching trending podcasts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/podcasts/:id
 * Get single podcast with episodes
 */
async function getPodcastById(req, res) {
  const { id } = req.params;
  
  if (!isConnected()) {
    // Find in mock data by name or id
    const mockDetails = mockPodcasts.details;
    let podcast = null;
    
    // Try to find by name first
    for (const [name, details] of Object.entries(mockDetails)) {
      if (details.id == id || name.toLowerCase().includes(id.toLowerCase())) {
        podcast = details;
        break;
      }
    }
    
    if (!podcast) {
      // Return first podcast as default
      podcast = Object.values(mockDetails)[0];
    }
    
    return res.json({
      success: true,
      data: podcast,
      source: 'mock'
    });
  }
  
  try {
    const podcast = await Podcast.findById(id).lean();
    
    if (!podcast) {
      return res.status(404).json({
        success: false,
        error: 'Podcast not found'
      });
    }
    
    // Get episodes
    const episodes = await Episode.find({ 
      podcastId: id,
      status: 'active'
    })
      .sort({ publishedAt: -1 })
      .limit(50)
      .lean();
    
    res.json({
      success: true,
      data: {
        ...podcast,
        episodes: episodes.map(e => ({
          id: e._id,
          title: e.title,
          description: e.description,
          duration: e.formattedDuration,
          audioUrl: e.audioUrl,
          date: e.publishedAt ? new Date(e.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching podcast:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/podcasts/categories
 * Get all categories with counts
 */
async function getCategories(req, res) {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockPodcasts.categories,
      source: 'mock'
    });
  }
  
  try {
    const categories = await Podcast.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      data: ['All', ...categories.map(c => c._id).filter(Boolean)]
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getPodcasts,
  getFeatured,
  getTrending,
  getPodcastById,
  getCategories
};
