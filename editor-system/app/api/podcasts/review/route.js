/**
 * Review Queue API Route
 * GET /api/podcasts/review - Returns podcasts pending review
 * PATCH /api/podcasts/review - Approve or reject a podcast
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError, successResponse } from '@/lib/supabase';
import { requireEditorAuth } from '@/lib/editorAuth';

// GET /api/podcasts/review - Get podcasts pending review
export async function GET(request) {
  const authError = requireEditorAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  // If no database connection, return mock data
  if (!supabaseAdmin) {
    const mockQueue = [
      { id: '1', title: 'The Knowledge Project', meta: 'Business · 89 eps · ingested 2h ago', artClass: 'qa1', status: 'pending' },
      { id: '2', title: 'Acquired', meta: 'Business · 122 eps · ingested 5h ago', artClass: 'qa2', status: 'review' },
      { id: '3', title: 'My First Million', meta: 'Business · 510 eps · ingested 1d ago', artClass: 'qa3', status: 'pending' },
      { id: '4', title: 'Darknet Diaries', meta: 'Technology · 148 eps · ingested 6h ago', artClass: 'qa4', status: 'pending' },
      { id: '5', title: 'Lex Fridman Podcast', meta: 'Technology · 428 eps · ingested 3h ago', artClass: 'qa2', status: 'pending' },
    ];
    
    return NextResponse.json({
      success: true,
      data: mockQueue.slice(offset, offset + limit),
      total: mockQueue.length,
      source: 'mock',
    });
  }
  
  try {
    // Fetch podcasts with pending or review status
    const { data, error, count } = await supabaseAdmin
      .from('podcasts')
      .select('id, title, author, category, status, created_at, image_url', { count: 'exact' })
      .in('status', ['pending', 'review'])
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'fetch review queue'), { status: 500 });
    }
    
    // Transform data to match UI format
    const queueData = data.map((podcast, index) => {
      const timeAgo = getTimeAgo(new Date(podcast.created_at));
      return {
        id: podcast.id,
        title: podcast.title,
        meta: `${podcast.category || 'Uncategorized'} · ingested ${timeAgo}`,
        artClass: `qa${(index % 4) + 1}`,
        status: podcast.status,
        image_url: podcast.image_url,
        author: podcast.author,
      };
    });
    
    return NextResponse.json(successResponse(queueData));
  } catch (err) {
    console.error('Review queue API error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

// PATCH /api/podcasts/review - Approve or reject podcast
export async function PATCH(request) {
  const authError = requireEditorAuth(request);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { id, action, editor_id, editor_name, reason } = body;
    
    // Validate input
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Podcast ID is required',
      }, { status: 400 });
    }
    
    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        success: false,
        error: 'Action must be "approve" or "reject"',
      }, { status: 400 });
    }
    
    // Get current podcast
    const { data: currentPodcast, error: fetchError } = await supabaseAdmin
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !currentPodcast) {
      return NextResponse.json({
        success: false,
        error: 'Podcast not found',
      }, { status: 404 });
    }
    
    // Update status
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    const { data, error } = await supabaseAdmin
      .from('podcasts')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'update podcast status'), { status: 500 });
    }
    
    // Log action
    await supabaseAdmin.from('editor_actions').insert({
      action_type: action,
      entity_type: 'podcast',
      entity_id: id,
      editor_id: editor_id || 'unknown',
      editor_name: editor_name || 'Unknown Editor',
      details: {
        title: currentPodcast.title,
        previous_status: currentPodcast.status,
        new_status: newStatus,
        reason: reason || null,
      },
    });
    
    return NextResponse.json(successResponse(data));
  } catch (err) {
    console.error('Review action error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

// POST /api/podcasts/review/approve-all - Approve all pending
export async function POST(request) {
  const authError = requireEditorAuth(request);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }
  
  try {
    const body = await request.json();
    const { editor_id, editor_name } = body;
    
    // Update all pending/review to approved
    const { data, error, count } = await supabaseAdmin
      .from('podcasts')
      .update({ status: 'approved' })
      .in('status', ['pending', 'review'])
      .select();
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'approve all podcasts'), { status: 500 });
    }
    
    // Log action
    await supabaseAdmin.from('editor_actions').insert({
      action_type: 'approve_all',
      entity_type: 'podcast',
      editor_id: editor_id || 'unknown',
      editor_name: editor_name || 'Unknown Editor',
      details: {
        count: data?.length || 0,
        message: 'Bulk approved all pending podcasts',
      },
    });
    
    return NextResponse.json(successResponse({
      approved: data?.length || 0,
      podcasts: data,
    }));
  } catch (err) {
    console.error('Approve all error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

/**
 * Helper: Get human-readable time ago
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}
