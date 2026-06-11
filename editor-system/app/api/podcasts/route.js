/**
 * Podcasts API Route
 * GET /api/podcasts - Returns list of podcasts
 * POST /api/podcasts - Creates a new podcast
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError, successResponse } from '@/lib/supabase';
import { requireEditorAuth } from '@/lib/editorAuth';

/**
 * Validate podcast input data
 */
function validatePodcastData(data) {
  const errors = [];
  
  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (data.title && data.title.length > 500) {
    errors.push('Title must be less than 500 characters');
  }
  
  if (data.category && data.category.length > 100) {
    errors.push('Category must be less than 100 characters');
  }
  
  if (data.image_url && !isValidUrl(data.image_url)) {
    errors.push('Image URL must be a valid URL');
  }
  
  if (data.website_url && !isValidUrl(data.website_url)) {
    errors.push('Website URL must be a valid URL');
  }
  
  return errors;
}

/**
 * Simple URL validation
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET /api/podcasts
export async function GET(request) {
  const authError = requireEditorAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  // If no database connection, return mock data
  if (!supabaseAdmin) {
    const mockPodcasts = [
      { id: '1', title: 'The Knowledge Project', author: 'Farnam Street', category: 'Business', status: 'pending', meta: 'Business · 89 eps · ingested 2h ago' },
      { id: '2', title: 'Acquired', author: 'Acquired', category: 'Business', status: 'review', meta: 'Business · 122 eps · ingested 5h ago' },
      { id: '3', title: 'My First Million', author: 'HubSpot', category: 'Business', status: 'pending', meta: 'Business · 510 eps · ingested 1d ago' },
      { id: '4', title: 'Darknet Diaries', author: 'Jack Rhysider', category: 'Technology', status: 'pending', meta: 'Technology · 148 eps · ingested 6h ago' },
      { id: '5', title: 'Lex Fridman Podcast', author: 'Lex Fridman', category: 'Technology', status: 'pending', meta: 'Technology · 428 eps · ingested 3h ago' },
    ];
    
    let filtered = mockPodcasts;
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    return NextResponse.json({
      success: true,
      data: filtered.slice(offset, offset + limit),
      total: filtered.length,
      source: 'mock',
    });
  }
  
  try {
    let query = supabaseAdmin
      .from('podcasts')
      .select('id, title, author, category, status, image_url, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.in('status', status.split(','));
    }
    
    if (category) {
      query = query.ilike('category', `%${category}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'fetch podcasts'), { status: 500 });
    }
    
    // Transform data to match UI format
    const transformedData = data.map(podcast => ({
      ...podcast,
      meta: `${podcast.category || 'Uncategorized'} · ${podcast.author || 'Unknown'}`,
    }));
    
    return NextResponse.json(successResponse(transformedData));
  } catch (err) {
    console.error('Podcasts API error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

// POST /api/podcasts
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
    
    // Validate input
    const errors = validatePodcastData(body);
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: errors,
      }, { status: 400 });
    }
    
    // Insert podcast
    const { data, error } = await supabaseAdmin
      .from('podcasts')
      .insert({
        title: body.title.trim(),
        author: body.author?.trim() || null,
        description: body.description?.trim() || null,
        image_url: body.image_url || null,
        website_url: body.website_url || null,
        category: body.category?.trim() || null,
        status: body.status || 'pending',
        admin_feed_id: body.admin_feed_id || null,
        raw_json: body.raw_json || null,
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'create podcast'), { status: 500 });
    }
    
    // Log action
    await supabaseAdmin.from('editor_actions').insert({
      action_type: 'create',
      entity_type: 'podcast',
      entity_id: data.id,
      editor_id: body.editor_id || 'system',
      editor_name: body.editor_name || 'System',
      details: { title: data.title },
    });
    
    return NextResponse.json(successResponse(data), { status: 201 });
  } catch (err) {
    console.error('Create podcast error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}
