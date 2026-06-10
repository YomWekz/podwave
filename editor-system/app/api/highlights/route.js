/**
 * AI Highlights API Route
 * GET /api/highlights - Returns AI-generated highlights awaiting review
 * PATCH /api/highlights - Accept or reject a highlight
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError, successResponse } from '@/lib/supabase';

// GET /api/highlights
export async function GET(request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || 'pending';
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  // If no database connection, return mock data
  if (!supabaseAdmin) {
    const mockHighlights = [
      { 
        id: '1', 
        title: 'Hard Fork · Ep. 142 — "The model is already smarter than us"', 
        snippet: 'Key segment: speaker discusses AGI timeline — high engagement markers detected', 
        timeRange: '12:14 – 14:48', 
        total: '56:10', 
        clipLeft: '20%', 
        clipWidth: '16%',
        start_time: 734,
        end_time: 888,
        status: 'pending',
      },
      { 
        id: '2', 
        title: 'Lex Fridman · Ep. 398 — "The nature of consciousness"', 
        snippet: 'Key segment: debate on hard problem of consciousness — sentiment peak detected', 
        timeRange: '41:05 – 42:55', 
        total: '2:18:44', 
        clipLeft: '35%', 
        clipWidth: '12%',
        start_time: 2465,
        end_time: 2575,
        status: 'pending',
      },
      { 
        id: '3', 
        title: 'Huberman Lab · Ep. 71 — "Controlling dopamine"', 
        snippet: 'Key segment: protocol for dopamine regulation — listener retention spike', 
        timeRange: '28:00 – 31:10', 
        total: '1:45:22', 
        clipLeft: '27%', 
        clipWidth: '10%',
        start_time: 1680,
        end_time: 1870,
        status: 'pending',
      },
    ];
    
    return NextResponse.json({
      success: true,
      data: mockHighlights.slice(offset, offset + limit),
      total: mockHighlights.length,
      source: 'mock',
    });
  }
  
  try {
    const { data, error, count } = await supabaseAdmin
      .from('ai_highlights')
      .select(`
        id,
        title,
        description,
        start_time,
        end_time,
        duration,
        status,
        tags,
        confidence_score,
        episode_id,
        created_at,
        episodes (
          id,
          title,
          duration,
          podcasts (
            title
          )
        )
      `, { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'fetch highlights'), { status: 500 });
    }
    
    // Transform data for UI
    const highlightsData = data.map(hl => {
      const episode = hl.episodes;
      const podcast = episode?.podcasts;
      const episodeDuration = episode?.duration || 3600;
      
      return {
        id: hl.id,
        title: podcast ? `${podcast.title} · ${episode?.title || 'Episode'}` : hl.title || 'Untitled',
        snippet: hl.description || 'AI-detected highlight segment',
        timeRange: `${formatTime(hl.start_time)} – ${formatTime(hl.end_time)}`,
        total: formatDuration(episodeDuration),
        clipLeft: `${Math.round((hl.start_time / episodeDuration) * 100)}%`,
        clipWidth: `${Math.round(((hl.end_time - hl.start_time) / episodeDuration) * 100)}%`,
        start_time: hl.start_time,
        end_time: hl.end_time,
        duration: hl.duration,
        status: hl.status,
        tags: hl.tags,
        confidence_score: hl.confidence_score,
        episode_id: hl.episode_id,
      };
    });
    
    return NextResponse.json(successResponse(highlightsData));
  } catch (err) {
    console.error('Highlights API error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

// PATCH /api/highlights - Accept or reject highlight
export async function PATCH(request) {
  if (!supabaseAdmin) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { id, action, editor_id, editor_name, trim_start, trim_end, tags } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Highlight ID is required',
      }, { status: 400 });
    }
    
    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Action must be "accept" or "reject"',
      }, { status: 400 });
    }
    
    // Get current highlight
    const { data: currentHighlight, error: fetchError } = await supabaseAdmin
      .from('ai_highlights')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !currentHighlight) {
      return NextResponse.json({
        success: false,
        error: 'Highlight not found',
      }, { status: 404 });
    }
    
    // Prepare update data
    const updateData = {
      status: action === 'accept' ? 'approved' : 'rejected',
    };
    
    // Handle trim if provided
    if (trim_start !== undefined || trim_end !== undefined) {
      updateData.start_time = trim_start ?? currentHighlight.start_time;
      updateData.end_time = trim_end ?? currentHighlight.end_time;
    }
    
    // Handle tags if provided
    if (tags && Array.isArray(tags)) {
      updateData.tags = tags;
    }
    
    // Update highlight
    const { data, error } = await supabaseAdmin
      .from('ai_highlights')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'update highlight'), { status: 500 });
    }
    
    // Log action
    await supabaseAdmin.from('editor_actions').insert({
      action_type: `highlight_${action}`,
      entity_type: 'highlight',
      entity_id: id,
      editor_id: editor_id || 'unknown',
      editor_name: editor_name || 'Unknown Editor',
      details: {
        title: currentHighlight.title,
        previous_status: currentHighlight.status,
        new_status: updateData.status,
        trimmed: !!(trim_start || trim_end),
        tags: tags || null,
      },
    });
    
    return NextResponse.json(successResponse(data));
  } catch (err) {
    console.error('Highlight action error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

/**
 * Helper: Format seconds to mm:ss
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Helper: Format duration in seconds to h:mm:ss or mm:ss
 */
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
