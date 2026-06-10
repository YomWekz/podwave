/**
 * Search Controller
 * Handles podcast and episode search
 */

const Podcast = require('../models/Podcast');
const Episode = require('../models/Episode');
const { isConnected } = require('../config/database');

// Mock data
const mockPodcasts = require('../data/mockPodcasts');

/**
 * GET /api/search
 * Search podcasts and episodes
 */
async function search(req, res) {
  const { q, type = 'all', limit = 20 } = req.query;
  
  if (!q) {
    return res.json({
      success: true,
      data: {
        podcasts: [],
        episodes: [],
        total: 0
      }
    });
  }
  
  if (!isConnected()) {
    const searchLower = q.toLowerCase();
    
    // Search podcasts
    const matchingPodcasts = mockPodcasts.all.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.category?.toLowerCase().includes(searchLower)
    );
    
    // Search episodes (from podcast details)
    const matchingEpisodes = [];
    for (const [podcastName, details] of Object.entries(mockPodcasts.details)) {
      if (details.episodes) {
        for (const ep of details.episodes) {
          if (ep.title.toLowerCase().includes(searchLower)) {
            matchingEpisodes.push({
              ...ep,
              podcastName,
              podcastId: details.id
            });
          }
        }
      }
    }
    
    return res.json({
      success: true,
      data: {
        podcasts: matchingPodcasts.slice(0, parseInt(limit)),
        episodes: matchingEpisodes.slice(0, parseInt(limit)),
        total: matchingPodcasts.length + matchingEpisodes.length
      },
      source: 'mock'
    });
  }
  
  try {
    const searchRegex = new RegExp(q, 'i');
    
    // Search podcasts
    const podcasts = await Podcast.find({
      status: 'active',
      $or: [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ]
    })
      .limit(parseInt(limit))
      .lean();
    
    // Search episodes
    const episodes = await Episode.find({
      status: 'active',
      $or: [
        { title: searchRegex },
        { description: searchRegex }
      ]
    })
      .populate('podcastId', 'title colorClass iconClass')
      .limit(parseInt(limit))
      .lean();
    
    res.json({
      success: true,
      data: {
        podcasts: podcasts.map(p => ({
          ...p,
          meta: `${p.category || 'Uncategorized'} · ${p.episodeCount || 0} eps`
        })),
        episodes: episodes.map(e => ({
          id: e._id,
          title: e.title,
          description: e.description,
          duration: e.formattedDuration,
          podcastName: e.podcastId?.title,
          podcastId: e.podcastId?._id
        })),
        total: podcasts.length + episodes.length
      }
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/search/trending
 * Get trending search terms
 */
async function getTrendingSearches(req, res) {
  if (!isConnected()) {
    return res.json({
      success: true,
      data: mockPodcasts.trendingSearches,
      source: 'mock'
    });
  }
  
  try {
    // Get top categories by podcast count
    const topCategories = await Podcast.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    
    const trendingSearches = [
      'Technology',
      'True Crime',
      'Business',
      'Science',
      'Health',
      'News',
      ...topCategories.map(c => c._id).filter(Boolean)
    ];
    
    // Remove duplicates
    const uniqueSearches = [...new Set(trendingSearches)].slice(0, 10);
    
    res.json({
      success: true,
      data: uniqueSearches
    });
  } catch (error) {
    console.error('Error fetching trending searches:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * GET /api/search/suggestions
 * Get search suggestions (autocomplete)
 */
async function getSuggestions(req, res) {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.json({
      success: true,
      data: []
    });
  }
  
  if (!isConnected()) {
    const suggestions = mockPodcasts.all
      .filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 5)
      .map(p => ({
        type: 'podcast',
        id: p.id,
        name: p.name,
        category: p.category
      }));
    
    return res.json({
      success: true,
      data: suggestions,
      source: 'mock'
    });
  }
  
  try {
    const podcasts = await Podcast.find({
      status: 'active',
      title: { $regex: q, $options: 'i' }
    })
      .select('title category')
      .limit(5)
      .lean();
    
    const suggestions = podcasts.map(p => ({
      type: 'podcast',
      id: p._id,
      name: p.title,
      category: p.category
    }));
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  search,
  getTrendingSearches,
  getSuggestions
};
