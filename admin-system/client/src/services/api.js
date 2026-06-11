/**
 * Admin API Service
 * Handles all API calls to the Admin backend
 * Falls back to mock data if backend is unavailable
 */

import { 
  mockFeeds, 
  mockLogs, 
  mockFailedJobs 
} from '../data/mockData.js';
import { getAuthHeaders, logout } from './auth.js';

// API base URL
const API_BASE_URL = 'http://localhost:4001/api';

// Check if we should use mock data (when backend is unavailable)
let useMockData = false;

class AuthenticationError extends Error {
    constructor(message = 'Your session has expired. Please sign in again.') {
        super(message);
        this.name = 'AuthenticationError';
    }
}

function rethrowAuthenticationError(error) {
    if (error instanceof AuthenticationError) {
        throw error;
    }
}

/**
 * Make an API request with fallback to mock data
 * @param {string} endpoint - API endpoint (without /api prefix)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 && endpoint !== '/health' && endpoint !== '/health/db') {
            logout({ notify: true });
            throw new AuthenticationError(data.error);
        }
        
        if (!response.ok) {
            throw new Error(data.error || `API Error: ${response.status}`);
        }
        
        useMockData = false; // Backend is available
        return data;
    } catch (error) {
        console.warn(`API request failed for ${endpoint}:`, error.message);
        useMockData = true;
        throw error;
    }
}

/**
 * Check backend health
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
    return apiRequest('/health');
}

/**
 * Check database health
 * @returns {Promise<Object>} Database health status
 */
export async function checkDbHealth() {
    return apiRequest('/health/db');
}

/**
 * Get all feeds
 * @returns {Promise<Object>} Feeds list
 */
export async function getFeeds() {
    try {
        return await apiRequest('/feeds');
    } catch (error) {
        rethrowAuthenticationError(error);
        // Return mock data
        return {
            success: true,
            count: mockFeeds.length,
            data: mockFeeds,
            mock: true
        };
    }
}

/**
 * Add a new feed
 * @param {string} rssUrl - RSS feed URL
 * @param {string} category - Feed category
 * @returns {Promise<Object>} Created feed
 */
export async function addFeed(rssUrl, category = 'General') {
    try {
        return await apiRequest('/feeds', {
            method: 'POST',
            body: JSON.stringify({ rss_url: rssUrl, category }),
        });
    } catch (error) {
        rethrowAuthenticationError(error);
        // Simulate adding to mock data
        const newFeed = {
            id: Date.now(),
            rss_url: rssUrl,
            category,
            status: 'pending',
            last_sync_at: null,
            created_at: new Date().toISOString(),
            mock: true
        };
        return {
            success: true,
            message: 'Feed added (mock - backend unavailable)',
            data: newFeed,
            mock: true
        };
    }
}

/**
 * Delete a feed
 * @param {number} feedId - Feed ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFeed(feedId) {
    try {
        return await apiRequest(`/feeds/${feedId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        rethrowAuthenticationError(error);
        return {
            success: true,
            message: 'Feed deleted (mock - backend unavailable)',
            mock: true
        };
    }
}

/**
 * Trigger sync job for a feed
 * @param {number} feedId - Feed ID to sync
 * @returns {Promise<Object>} Job result
 */
export async function syncFeed(feedId) {
    try {
        return await apiRequest('/jobs/sync', {
            method: 'POST',
            body: JSON.stringify({ feed_id: feedId }),
        });
    } catch (error) {
        rethrowAuthenticationError(error);
        return {
            success: true,
            message: 'Sync job started (mock - backend unavailable)',
            data: { job_id: Date.now(), feed_id: feedId, status: 'running' },
            mock: true
        };
    }
}

/**
 * Get job logs
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Job logs
 */
export async function getJobLogs(page = 1, limit = 50) {
    try {
        return await apiRequest(`/jobs/logs?page=${page}&limit=${limit}`);
    } catch (error) {
        rethrowAuthenticationError(error);
        return {
            success: true,
            pagination: { page, limit, total: mockLogs.length, totalPages: 1 },
            data: mockLogs,
            mock: true
        };
    }
}

/**
 * Get failed jobs
 * @returns {Promise<Object>} Failed jobs list
 */
export async function getFailedJobs() {
    try {
        return await apiRequest('/jobs/failed');
    } catch (error) {
        rethrowAuthenticationError(error);
        return {
            success: true,
            count: mockFailedJobs.length,
            data: mockFailedJobs,
            mock: true
        };
    }
}

/**
 * Retry a failed job
 * @param {number} jobId - Job ID to retry
 * @returns {Promise<Object>} Retry result
 */
export async function retryJob(jobId) {
    try {
        return await apiRequest(`/jobs/${jobId}/retry`, {
            method: 'POST',
        });
    } catch (error) {
        rethrowAuthenticationError(error);
        return {
            success: true,
            message: 'Job retry initiated (mock - backend unavailable)',
            mock: true
        };
    }
}

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Stats data
 */
export async function getStats() {
    try {
        return await apiRequest('/stats');
    } catch (error) {
        rethrowAuthenticationError(error);
        // Calculate stats from mock data
        return {
            success: true,
            data: {
                podcasts: { total: 15 },
                episodes: { total: 150 },
                feeds: {
                    total: mockFeeds.length,
                    active: mockFeeds.filter(f => f.status === 'ok').length,
                    failed: mockFeeds.filter(f => f.status === 'fail' || f.status === 'err').length
                },
                jobs: {
                    failed: mockFailedJobs.length,
                    pending: mockLogs.filter(j => j.status === 'r').length,
                    successRate: 85
                }
            },
            mock: true
        };
    }
}

/**
 * Check if using mock data
 * @returns {boolean} True if using mock data
 */
export function isUsingMockData() {
    return useMockData;
}

// Export all functions
export default {
    checkHealth,
    checkDbHealth,
    getFeeds,
    addFeed,
    deleteFeed,
    syncFeed,
    getJobLogs,
    getFailedJobs,
    retryJob,
    getStats,
    isUsingMockData,
};
