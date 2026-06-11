/**
 * API Service for PodWave Editor
 * Handles all API calls to the backend with mock fallback
 */

// Base URL for API calls (same origin since we're using Next.js API routes)
import { clearInvalidToken, getAuthHeaders } from './auth.js';

const API_BASE = '/api';

/**
 * Fetch helper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      clearInvalidToken();
      return {
        success: false,
        error: data.error || 'Editor session expired. Please sign in again.',
        data: null,
        authRequired: true,
      };
    }
    
    if (!response.ok) {
      console.error(`API Error (${endpoint}):`, data.error);
      return { success: false, error: data.error, data: null };
    }
    
    return data;
  } catch (err) {
    console.error(`Network Error (${endpoint}):`, err.message);
    return { success: false, error: err.message, data: null };
  }
}

/**
 * Health Check
 */
export async function checkHealth() {
  return apiFetch('/health');
}

/**
 * Database Health Check
 */
export async function checkDbHealth() {
  return apiFetch('/health?db=true');
}

/**
 * Stats API
 */
export async function getStats() {
  return apiFetch('/stats');
}

/**
 * Review Queue API
 */
export async function getReviewQueue(limit = 10, offset = 0) {
  return apiFetch(`/podcasts/review?limit=${limit}&offset=${offset}`);
}

/**
 * Approve a podcast
 */
export async function approvePodcast(id, editorId = 'unknown', editorName = 'Unknown Editor') {
  return apiFetch('/podcasts/review', {
    method: 'PATCH',
    body: JSON.stringify({
      id,
      action: 'approve',
      editor_id: editorId,
      editor_name: editorName,
    }),
  });
}

/**
 * Reject a podcast
 */
export async function rejectPodcast(id, editorId = 'unknown', editorName = 'Unknown Editor', reason = '') {
  return apiFetch('/podcasts/review', {
    method: 'PATCH',
    body: JSON.stringify({
      id,
      action: 'reject',
      editor_id: editorId,
      editor_name: editorName,
      reason,
    }),
  });
}

/**
 * Approve all pending podcasts
 */
export async function approveAllPending(editorId = 'unknown', editorName = 'Unknown Editor') {
  return apiFetch('/podcasts/review', {
    method: 'POST',
    body: JSON.stringify({
      editor_id: editorId,
      editor_name: editorName,
    }),
  });
}

/**
 * Podcasts API
 */
export async function getPodcasts(status = null, category = null, limit = 50, offset = 0) {
  const params = new URLSearchParams({ limit, offset });
  if (status) params.append('status', status);
  if (category) params.append('category', category);
  return apiFetch(`/podcasts?${params.toString()}`);
}

/**
 * Create a podcast
 */
export async function createPodcast(podcastData) {
  return apiFetch('/podcasts', {
    method: 'POST',
    body: JSON.stringify(podcastData),
  });
}

/**
 * AI Highlights API
 */
export async function getHighlights(status = 'pending', limit = 10, offset = 0) {
  return apiFetch(`/highlights?status=${status}&limit=${limit}&offset=${offset}`);
}

/**
 * Accept a highlight
 */
export async function acceptHighlight(id, editorId = 'unknown', editorName = 'Unknown Editor', options = {}) {
  return apiFetch('/highlights', {
    method: 'PATCH',
    body: JSON.stringify({
      id,
      action: 'accept',
      editor_id: editorId,
      editor_name: editorName,
      ...options,
    }),
  });
}

/**
 * Reject a highlight
 */
export async function rejectHighlight(id, editorId = 'unknown', editorName = 'Unknown Editor') {
  return apiFetch('/highlights', {
    method: 'PATCH',
    body: JSON.stringify({
      id,
      action: 'reject',
      editor_id: editorId,
      editor_name: editorName,
    }),
  });
}

/**
 * Trim a highlight
 */
export async function trimHighlight(id, trimStart, trimEnd, editorId = 'unknown', editorName = 'Unknown Editor') {
  return apiFetch('/highlights', {
    method: 'PATCH',
    body: JSON.stringify({
      id,
      action: 'accept',
      editor_id: editorId,
      editor_name: editorName,
      trim_start: trimStart,
      trim_end: trimEnd,
    }),
  });
}

/**
 * Tag a highlight
 */
export async function tagHighlight(id, tags, editorId = 'unknown', editorName = 'Unknown Editor') {
  return apiFetch('/highlights', {
    method: 'PATCH',
    body: JSON.stringify({
      id,
      action: 'accept',
      editor_id: editorId,
      editor_name: editorName,
      tags,
    }),
  });
}

/**
 * Collections API
 */
export async function getCollections(status = null, limit = 20, offset = 0) {
  const params = new URLSearchParams({ limit, offset });
  if (status) params.append('status', status);
  return apiFetch(`/collections?${params.toString()}`);
}

/**
 * Create a collection
 */
export async function createCollection(collectionData) {
  return apiFetch('/collections', {
    method: 'POST',
    body: JSON.stringify(collectionData),
  });
}

/**
 * Update a collection
 */
export async function updateCollection(id, updateData) {
  return apiFetch('/collections', {
    method: 'PATCH',
    body: JSON.stringify({ id, ...updateData }),
  });
}

/**
 * Delete a collection
 */
export async function deleteCollection(id) {
  return apiFetch(`/collections?id=${id}`, {
    method: 'DELETE',
  });
}

/**
 * Episodes API
 */
export async function getEpisodes(podcastId = null, status = null, limit = 20, offset = 0) {
  const params = new URLSearchParams({ limit, offset });
  if (podcastId) params.append('podcast_id', podcastId);
  if (status) params.append('status', status);
  return apiFetch(`/episodes?${params.toString()}`);
}

/**
 * Get single episode
 */
export async function getEpisode(id) {
  return apiFetch(`/episodes?id=${id}`);
}

export default {
  checkHealth,
  checkDbHealth,
  getStats,
  getReviewQueue,
  approvePodcast,
  rejectPodcast,
  approveAllPending,
  getPodcasts,
  createPodcast,
  getHighlights,
  acceptHighlight,
  rejectHighlight,
  trimHighlight,
  tagHighlight,
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getEpisodes,
  getEpisode,
};
