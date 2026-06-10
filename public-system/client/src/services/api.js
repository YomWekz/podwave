/**
 * Public API Service
 * Handles all API calls to the Public backend
 * Falls back to mock data if backend is unavailable
 */

// API base URL
const API_BASE_URL = 'http://localhost:4003/api';

/**
 * Make an API request with fallback to mock data
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`API request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// ============================================
// Health Check
// ============================================

export async function checkHealth() {
  return apiRequest('/health');
}

export async function checkDbHealth() {
  return apiRequest('/health/db');
}

// ============================================
// Podcasts
// ============================================

export async function getPodcasts(options = {}) {
  const params = new URLSearchParams();
  if (options.category) params.append('category', options.category);
  if (options.search) params.append('search', options.search);
  if (options.limit) params.append('limit', options.limit);
  if (options.offset) params.append('offset', options.offset);
  if (options.sort) params.append('sort', options.sort);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/podcasts${query}`);
}

export async function getFeaturedPodcasts() {
  return apiRequest('/podcasts/featured');
}

export async function getTrendingPodcasts() {
  return apiRequest('/podcasts/trending');
}

export async function getPodcastById(id) {
  return apiRequest(`/podcasts/${id}`);
}

export async function getCategories() {
  return apiRequest('/podcasts/categories');
}

// ============================================
// Search
// ============================================

export async function search(query, type = 'all') {
  return apiRequest(`/search?q=${encodeURIComponent(query)}&type=${type}`);
}

export async function getTrendingSearches() {
  return apiRequest('/search/trending');
}

export async function getSearchSuggestions(query) {
  return apiRequest(`/search/suggestions?q=${encodeURIComponent(query)}`);
}

// ============================================
// User
// ============================================

export async function getUserProfile() {
  return apiRequest('/user/profile');
}

export async function getSavedPodcasts() {
  return apiRequest('/user/saved');
}

export async function savePodcast(podcastId) {
  return apiRequest('/user/saved', {
    method: 'POST',
    body: JSON.stringify({ podcastId })
  });
}

export async function unsavePodcast(podcastId) {
  return apiRequest(`/user/saved/${podcastId}`, {
    method: 'DELETE'
  });
}

export async function getListenHistory() {
  return apiRequest('/user/history');
}

export async function addToHistory(episodeId, podcastId, progress = 0) {
  return apiRequest('/user/history', {
    method: 'POST',
    body: JSON.stringify({ episodeId, podcastId, progress })
  });
}

export async function ratePodcast(podcastId, rating) {
  return apiRequest('/user/ratings', {
    method: 'POST',
    body: JSON.stringify({ podcastId, rating })
  });
}

export async function getPlayerState() {
  return apiRequest('/user/player-state');
}

export async function savePlayerState(episodeId, podcastId, progress = 0, playbackRate = 1.0) {
  return apiRequest('/user/player-state', {
    method: 'POST',
    body: JSON.stringify({ episodeId, podcastId, progress, playbackRate })
  });
}

export default {
  checkHealth,
  checkDbHealth,
  getPodcasts,
  getFeaturedPodcasts,
  getTrendingPodcasts,
  getPodcastById,
  getCategories,
  search,
  getTrendingSearches,
  getSearchSuggestions,
  getUserProfile,
  getSavedPodcasts,
  savePodcast,
  unsavePodcast,
  getListenHistory,
  addToHistory,
  ratePodcast,
  getPlayerState,
  savePlayerState
};
