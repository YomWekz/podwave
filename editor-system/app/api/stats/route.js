/**
 * Stats API Route
 * GET /api/stats - Returns dashboard KPI statistics
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError, successResponse } from '@/lib/supabase';

// GET /api/stats
export async function GET() {
  // If no database connection, return mock stats
  if (!supabaseAdmin) {
    return NextResponse.json({
      success: true,
      data: {
        pendingReview: 12,
        drafts: 7,
        published: 284,
        highlightsPending: 5,
      },
      source: 'mock',
    });
  }
  
  try {
    // Get pending review count (podcasts with status 'pending')
    const { count: pendingReview, error: pendingError } = await supabaseAdmin
      .from('podcasts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'review']);
    
    if (pendingError) {
      return NextResponse.json(handleSupabaseError(pendingError, 'fetch pending count'), { status: 500 });
    }
    
    // Get drafts count (collections with status 'draft')
    const { count: drafts, error: draftsError } = await supabaseAdmin
      .from('collections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft');
    
    if (draftsError) {
      return NextResponse.json(handleSupabaseError(draftsError, 'fetch drafts count'), { status: 500 });
    }
    
    // Get published count (podcasts with status 'published' or 'approved')
    const { count: published, error: publishedError } = await supabaseAdmin
      .from('podcasts')
      .select('*', { count: 'exact', head: true })
      .in('status', ['published', 'approved']);
    
    if (publishedError) {
      return NextResponse.json(handleSupabaseError(publishedError, 'fetch published count'), { status: 500 });
    }
    
    // Get highlights pending count
    const { count: highlightsPending, error: highlightsError } = await supabaseAdmin
      .from('ai_highlights')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    if (highlightsError) {
      return NextResponse.json(handleSupabaseError(highlightsError, 'fetch highlights count'), { status: 500 });
    }
    
    return NextResponse.json(successResponse({
      pendingReview: pendingReview || 0,
      drafts: drafts || 0,
      published: published || 0,
      highlightsPending: highlightsPending || 0,
    }));
  } catch (err) {
    console.error('Stats API error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
