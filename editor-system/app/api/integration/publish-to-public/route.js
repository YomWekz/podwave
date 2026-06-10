/**
 * Integration Route - Publish to Public
 * POST /api/integration/publish-to-public
 * Sends approved podcast to Public system
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError, successResponse } from '@/lib/supabase';

// Public API configuration
const PUBLIC_API_URL = process.env.PUBLIC_API_URL || 'http://localhost:4003';
const EDITOR_TO_PUBLIC_TOKEN = process.env.EDITOR_TO_PUBLIC_SERVICE_TOKEN || 'podwave_editor_to_public_token_2024';

// POST /api/integration/publish-to-public
export async function POST(request) {
  try {
    const body = await request.json();
    const { podcastId } = body;
    
    if (!podcastId) {
      return NextResponse.json({
        success: false,
        error: 'podcastId is required'
      }, { status: 400 });
    }
    
    // If no database connection, return mock success
    if (!supabaseAdmin) {
      console.log('[Editor] Publishing to Public (mock mode):', podcastId);
      
      return NextResponse.json({
        success: true,
        message: 'Podcast published to Public system (mock mode)',
        source: 'mock'
      });
    }
    
    // Get podcast data
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
    if (podcast.status === 'published') {
      return NextResponse.json({
        success: true,
        message: 'Podcast is already published'
      });
    }
    
    // Get episodes
    const { data: episodes } = await supabaseAdmin
      .from('episodes')
      .select('*')
      .eq('podcast_id', podcastId)
      .eq('status', 'approved');
    
    // Prepare payload for Public system
    const publicPayload = {
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
    
    // Send to Public API
    try {
      const response = await fetch(`${PUBLIC_API_URL}/api/integration/receive-from-editor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${EDITOR_TO_PUBLIC_TOKEN}`
        },
        body: JSON.stringify(publicPayload)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Public API error:', result);
        return NextResponse.json({
          success: false,
          error: result.error || 'Failed to publish to Public system',
          publicStatus: response.status
        }, { status: 502 });
      }
      
      // Update podcast status to published
      await supabaseAdmin
        .from('podcasts')
        .update({ status: 'published' })
        .eq('id', podcastId);
      
      // Log to published_content
      await supabaseAdmin.from('published_content').insert({
        content_type: 'podcast',
        content_id: podcastId,
        published_by: 'editor',
        public_system_response: result
      });
      
      // Log action
      await supabaseAdmin.from('editor_actions').insert({
        action_type: 'publish_to_public',
        entity_type: 'podcast',
        entity_id: podcastId,
        editor_id: 'editor',
        editor_name: 'Editor',
        details: { title: podcast.title }
      });
      
      console.log('[Editor] Published to Public:', podcast.title);
      
      return NextResponse.json({
        success: true,
        message: 'Podcast published to Public system',
        podcast: podcast.title,
        publicResponse: result
      });
      
    } catch (fetchError) {
      console.error('Failed to connect to Public API:', fetchError.message);
      
      return NextResponse.json({
        success: false,
        error: 'Public system is not available',
        details: 'Could not connect to Public API. Please ensure Public backend is running on port 4003.'
      }, { status: 503 });
    }
    
  } catch (err) {
    console.error('Publish to Public error:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
