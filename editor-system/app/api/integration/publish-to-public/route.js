/**
 * Integration Route - Publish to Public
 * POST /api/integration/publish-to-public
 * Sends approved podcast to Public system
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Public API configuration
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || 'http://localhost:4003';
const EDITOR_TO_PUBLIC_TOKEN = process.env.EDITOR_TO_PUBLIC_SERVICE_TOKEN || 'podwave_editor_to_public_token_2024';

// POST /api/integration/publish-to-public
export async function POST(request) {
  try {
    const body = await request.json();
    const { podcastId, force = false } = body;

    if (!podcastId) {
      return NextResponse.json({
        success: false,
        error: 'podcastId is required'
      }, { status: 400 });
    }

    let publicPayload;

    // ── MOCK MODE (no Supabase) ──────────────────────────────────────────────
    // Skip DB lookup, but STILL call the real Public API with a mock payload.
    // This ensures Public mock storage is populated and GET /published returns data.
    // BUG FIX: Previously this block returned early without calling Public at all.
    if (!supabaseAdmin) {
      console.log('[Editor] publish-to-public mock mode — building mock payload for podcastId:', podcastId);

      publicPayload = {
        editor_podcast_id: podcastId,
        title: `Mock Podcast (${podcastId})`,
        author: 'Mock Author',
        description: 'Mock podcast sent from Editor in mock mode.',
        image_url: null,
        category: 'General',
        tags: [],
        episode_count: 0,
        episodes: []
      };

    // ── LIVE MODE (Supabase connected) ───────────────────────────────────────
    } else {
      // Get podcast data from Supabase
      const { data: podcast, error: fetchError } = await supabaseAdmin
        .from('podcasts')
        .select('*')
        .eq('id', podcastId)
        .single();

      if (fetchError || !podcast) {
        return NextResponse.json({
          success: false,
          error: 'Podcast not found'
        }, { status: 404 });
      }

      // Check if already published
      // Allow bypass with force=true (e.g. when Public DB was in mock mode during original publish)
      if (podcast.status === 'published' && !force) {
        return NextResponse.json({
          success: true,
          message: 'Podcast is already published'
        });
      }

      if (podcast.status === 'published' && force) {
        console.log('[Editor] Force republish requested for podcastId:', podcastId);
      }

      // Get approved episodes
      const { data: episodes } = await supabaseAdmin
        .from('episodes')
        .select('*')
        .eq('podcast_id', podcastId)
        .eq('status', 'approved');

      publicPayload = {
        editor_podcast_id: podcast.id,
        title: podcast.title,
        author: podcast.author,
        description: podcast.description,
        image_url: podcast.image_url,
        category: podcast.category,
        tags: podcast.tags || [],
        episode_count: episodes?.length || 0,
        episodes: episodes?.map(ep => ({
          editor_episode_id: ep.id,
          title: ep.title,
          description: ep.description,
          audio_url: ep.audio_url,
          duration: ep.duration
        })) || []
      };
    }

    // ── CALL PUBLIC API (always, mock or live) ───────────────────────────────
    let result;
    try {
      console.log('[Editor] Calling Public API:', `${PUBLIC_API_URL}/api/integration/receive-from-editor`);

      const response = await fetch(`${PUBLIC_API_URL}/api/integration/receive-from-editor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EDITOR_TO_PUBLIC_TOKEN}`
        },
        body: JSON.stringify(publicPayload)
      });

      result = await response.json();

      if (!response.ok) {
        console.error('[Editor] Public API returned error:', result);
        return NextResponse.json({
          success: false,
          error: result.error || 'Failed to publish to Public system',
          publicStatus: response.status
        }, { status: 502 });
      }

      console.log('[Editor] Public API accepted podcast:', publicPayload.title);

    } catch (fetchError) {
      console.error('[Editor] Failed to connect to Public API:', fetchError.message);
      return NextResponse.json({
        success: false,
        error: 'Public system is not available',
        details: 'Could not connect to Public API. Please ensure Public backend is running on port 4003.'
      }, { status: 503 });
    }

    // ── POST-PUBLISH DB UPDATES (live mode only) ─────────────────────────────
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('podcasts')
          .update({ status: 'published' })
          .eq('id', podcastId);

        await supabaseAdmin.from('published_content').insert({
          content_type: 'podcast',
          content_id: podcastId,
          published_by: 'editor',
          public_system_response: result
        });

        await supabaseAdmin.from('editor_actions').insert({
          action_type: 'publish_to_public',
          entity_type: 'podcast',
          entity_id: podcastId,
          editor_id: 'editor',
          editor_name: 'Editor',
          details: { podcastId }
        });
      } catch (dbError) {
        // Non-fatal: Public already received the podcast, just log the DB update failure
        console.warn('[Editor] Could not update Supabase after publishing:', dbError.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: supabaseAdmin
        ? (force ? 'Podcast force-republished to Public system' : 'Podcast published to Public system')
        : 'Podcast published to Public system (mock mode)',
      podcastId,
      force: force || false,
      publicResponse: result,
      source: supabaseAdmin ? 'live' : 'mock'
    });

  } catch (err) {
    console.error('Publish to Public error:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
