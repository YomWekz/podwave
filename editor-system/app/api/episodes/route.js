/**
 * Episodes API Route
 * GET /api/episodes - Returns list of episodes
 * GET /api/episodes/:id - Returns single episode
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError, successResponse } from '@/lib/supabase';
import { requireEditorAuth } from '@/lib/editorAuth';

// GET /api/episodes
export async function GET(request) {
  const authError = requireEditorAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const podcastId = url.searchParams.get('podcast_id');
  const status = url.searchParams.get('status');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const episodeId = url.searchParams.get('id');
  
  // If no database connection, return mock data
  if (!supabaseAdmin) {
    const mockEpisodes = [
      { id: '1', title: 'Episode 142: The Future of AI', podcast_title: 'Hard Fork', duration: 3360, status: 'approved' },
      { id: '2', title: 'Episode 398: Consciousness Debate', podcast_title: 'Lex Fridman Podcast', duration: 8324, status: 'pending' },
      { id: '3', title: 'Dopamine Protocols', podcast_title: 'Huberman Lab', duration: 6322, status: 'approved' },
    ];
    
    return NextResponse.json({
      success: true,
      data: mockEpisodes,
      total: mockEpisodes.length,
      source: 'mock',
    });
  }
  
  try {
    // Single episode by ID
    if (episodeId) {
      const { data, error } = await supabaseAdmin
        .from('episodes')
        .select(`
          id,
          title,
          description,
          audio_url,
          duration,
          published_at,
          status,
          podcast_id,
          podcasts (
            id,
            title,
            author
          )
        `)
        .eq('id', episodeId)
        .single();
      
      if (error) {
        return NextResponse.json(handleSupabaseError(error, 'fetch episode'), { status: 500 });
      }
      
      return NextResponse.json(successResponse(data));
    }
    
    // List episodes
    let query = supabaseAdmin
      .from('episodes')
      .select(`
        id,
        title,
        description,
        audio_url,
        duration,
        published_at,
        status,
        podcast_id,
        podcasts (
          id,
          title,
          author
        )
      `, { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (podcastId) {
      query = query.eq('podcast_id', podcastId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'fetch episodes'), { status: 500 });
    }
    
    return NextResponse.json(successResponse(data));
  } catch (err) {
    console.error('Episodes API error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
