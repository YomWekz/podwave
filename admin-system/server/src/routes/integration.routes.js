/**
 * Integration Routes - Admin to Editor Communication
 * Handles sending podcast data to the Editor system
 *
 * Auth: These routes use SERVICE TOKEN authentication only.
 * They are system-to-system pipeline calls and must NOT require user JWT.
 * This keeps the Admin→Editor→Public pipeline independent of login sessions.
 */

const express = require('express');
const router = require('express').Router();
const db = require('../db/connection');
const { requireServiceToken } = require('../middleware/serviceAuth');

// Editor API configuration
const EDITOR_API_URL = process.env.EDITOR_API_URL || 'http://localhost:3002';
const ADMIN_TO_EDITOR_TOKEN = process.env.ADMIN_TO_EDITOR_SERVICE_TOKEN || 'podwave_admin_to_editor_token_2024';

/**
 * POST /api/integration/send-to-editor/:feedId
 * Send a podcast/feed to Editor system for review
 */
router.post('/send-to-editor/:feedId', requireServiceToken, async (req, res) => {
  const feedId = req.params.feedId;
  
  try {
    // Get feed data from database
    // NOTE: db.query() already returns the rows array directly (no [rows,fields] destructuring needed)
    const feeds = await db.query(
      'SELECT id, rss_url, category, status, created_at FROM feeds WHERE id = ?',
      [feedId]
    );
    
    if (!Array.isArray(feeds) || feeds.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feed not found'
      });
    }
    
    const feed = feeds[0];
    
    // Get podcast data if available
    const podcasts = await db.query(
      'SELECT title, author, description, image_url, website_url FROM podcasts WHERE feed_id = ? LIMIT 1',
      [feedId]
    );
    
    const podcastData = (Array.isArray(podcasts) && podcasts[0]) || {};
    
    // Prepare data to send to Editor
    const editorPayload = {
      admin_feed_id: feedId,
      rss_url: feed.rss_url,
      category: feed.category,
      title: podcastData.title || `Podcast from ${feed.rss_url}`,
      author: podcastData.author || null,
      description: podcastData.description || null,
      image_url: podcastData.image_url || null,
      website_url: podcastData.website_url || null,
      status: 'pending'
    };
    
    // Try to send to Editor API
    let editorResult = null;
    try {
      const response = await fetch(`${EDITOR_API_URL}/api/integration/receive-from-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ADMIN_TO_EDITOR_TOKEN}`
        },
        body: JSON.stringify(editorPayload)
      });
      
      editorResult = await response.json();
      
      if (!response.ok) {
        console.error('Editor API error:', editorResult);
        return res.status(response.status).json({
          success: false,
          error: editorResult.error || 'Failed to send to Editor system',
          editorStatus: response.status
        });
      }
      
    } catch (fetchError) {
      console.error('Failed to connect to Editor API:', fetchError.message);
      
      // Return error but don't break Admin functionality
      return res.status(503).json({
        success: false,
        error: 'Editor system is not available',
        details: 'Could not connect to Editor API. Please ensure Editor is running on port 3002.',
        feedId: feedId
      });
    }
    
    // Editor call succeeded — update feed status to 'sent_to_editor'
    try {
      await db.query(
        "UPDATE feeds SET status = 'sent_to_editor' WHERE id = ?",
        [feedId]
      );
    } catch (dbError) {
      // Non-fatal: data was already sent to Editor successfully
      // This can happen if the DB ENUM hasn't been updated yet — run the ALTER TABLE migration
      console.warn('Could not update feed status after sending to Editor:', dbError.message);
    }
    
    return res.json({
      success: true,
      message: 'Podcast sent to Editor for review',
      feedId: feedId,
      editorResponse: editorResult
    });
    
  } catch (error) {
    console.error('Integration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/integration/batch-send-to-editor
 * Send multiple feeds to Editor at once
 */
router.post('/batch-send-to-editor', requireServiceToken, async (req, res) => {
  const { feedIds } = req.body;
  
  if (!Array.isArray(feedIds) || feedIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'feedIds must be a non-empty array'
    });
  }
  
  const results = [];
  
  for (const feedId of feedIds) {
    try {
      // Get feed data
      // NOTE: db.query() already returns the rows array directly
      const feeds = await db.query(
        'SELECT id, rss_url, category, status FROM feeds WHERE id = ?',
        [feedId]
      );
      
      if (!Array.isArray(feeds) || feeds.length === 0) {
        results.push({ feedId, success: false, error: 'Feed not found' });
        continue;
      }
      
      const feed = feeds[0];
      
      const editorPayload = {
        admin_feed_id: feedId,
        rss_url: feed.rss_url,
        category: feed.category,
        title: `Podcast from ${feed.rss_url}`,
        status: 'pending'
      };
      
      try {
        const response = await fetch(`${EDITOR_API_URL}/api/integration/receive-from-admin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TO_EDITOR_TOKEN}`
          },
          body: JSON.stringify(editorPayload)
        });
        
        const result = await response.json();
        
        if (response.ok) {
          await db.query('UPDATE feeds SET status = ? WHERE id = ?', ['sent_to_editor', feedId]);
          results.push({ feedId, success: true });
        } else {
          results.push({ feedId, success: false, error: result.error });
        }
        
      } catch (fetchError) {
        results.push({ feedId, success: false, error: 'Editor unavailable' });
      }
      
    } catch (error) {
      results.push({ feedId, success: false, error: error.message });
    }
  }
  
  res.json({
    success: true,
    message: 'Batch send completed',
    results: results,
    successCount: results.filter(r => r.success).length,
    failCount: results.filter(r => !r.success).length
  });
});

/**
 * GET /api/integration/status
 * Check Editor API connectivity
 */
router.get('/status', requireServiceToken, async (req, res) => {
  try {
    const response = await fetch(`${EDITOR_API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ADMIN_TO_EDITOR_TOKEN}`
      }
    });
    
    const result = await response.json();
    
    res.json({
      success: true,
      editorAvailable: response.ok,
      editorUrl: EDITOR_API_URL,
      editorStatus: result
    });
    
  } catch (error) {
    res.json({
      success: true,
      editorAvailable: false,
      editorUrl: EDITOR_API_URL,
      error: 'Editor system is not reachable'
    });
  }
});

module.exports = router;
