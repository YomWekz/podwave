/**
 * Collections API Route
 * GET /api/collections - Returns list of curated collections
 * POST /api/collections - Creates a new collection
 * PATCH /api/collections - Updates a collection
 * DELETE /api/collections - Deletes a collection
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError, successResponse } from '@/lib/supabase';
import { requireEditorAuth } from '@/lib/editorAuth';

/**
 * Validate collection input data
 */
function validateCollectionData(data) {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Collection name is required');
  }
  
  if (data.name && data.name.length > 255) {
    errors.push('Collection name must be less than 255 characters');
  }
  
  return errors;
}

// GET /api/collections
export async function GET(request) {
  const authError = requireEditorAuth(request);
  if (authError) return authError;

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  
  // If no database connection, return mock data
  if (!supabaseAdmin) {
    const mockCollections = [
      { id: '1', title: 'Staff picks — June', meta: '8 podcasts', status: 'published', iconClass: 'c1', icon: 'ti-trending-up' },
      { id: '2', title: 'AI & technology deep dives', meta: '12 podcasts', status: 'published', iconClass: 'c2', icon: 'ti-brain' },
      { id: '3', title: 'True crime essentials', meta: '6 podcasts', status: 'draft', iconClass: 'c3', icon: 'ti-flame' },
      { id: '4', title: 'Best for beginners', meta: '5 podcasts', status: 'draft', iconClass: 'c1', icon: 'ti-heart' },
    ];
    
    let filtered = mockCollections;
    if (status) {
      filtered = filtered.filter(c => c.status === status);
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
      .from('collections')
      .select(`
        id,
        name,
        description,
        cover_image_url,
        is_featured,
        status,
        created_by,
        created_at,
        updated_at,
        collection_podcasts(count)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'fetch collections'), { status: 500 });
    }
    
    // Transform data for UI
    const collectionsData = data.map((col, index) => ({
      id: col.id,
      title: col.name,
      description: col.description,
      meta: `${col.collection_podcasts?.[0]?.count || 0} podcasts`,
      status: col.status,
      is_featured: col.is_featured,
      iconClass: `c${(index % 3) + 1}`,
      icon: getIconForCollection(col.name, index),
      cover_image_url: col.cover_image_url,
      created_by: col.created_by,
      created_at: col.created_at,
    }));
    
    return NextResponse.json(successResponse(collectionsData));
  } catch (err) {
    console.error('Collections API error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

// POST /api/collections - Create new collection
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
    const errors = validateCollectionData(body);
    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: errors,
      }, { status: 400 });
    }
    
    // Insert collection
    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert({
        name: body.name.trim(),
        description: body.description?.trim() || null,
        cover_image_url: body.cover_image_url || null,
        is_featured: body.is_featured || false,
        status: body.status || 'draft',
        created_by: body.created_by || 'unknown',
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'create collection'), { status: 500 });
    }
    
    // Add podcasts to collection if provided
    if (body.podcast_ids && Array.isArray(body.podcast_ids) && body.podcast_ids.length > 0) {
      const podcastInserts = body.podcast_ids.map(podcastId => ({
        collection_id: data.id,
        podcast_id: podcastId,
        added_by: body.created_by || 'unknown',
      }));
      
      await supabaseAdmin
        .from('collection_podcasts')
        .insert(podcastInserts);
    }
    
    // Log action
    await supabaseAdmin.from('editor_actions').insert({
      action_type: 'create_collection',
      entity_type: 'collection',
      entity_id: data.id,
      editor_id: body.created_by || 'unknown',
      editor_name: body.editor_name || 'Unknown Editor',
      details: { name: data.name },
    });
    
    return NextResponse.json(successResponse(data), { status: 201 });
  } catch (err) {
    console.error('Create collection error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

// PATCH /api/collections - Update collection
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
    const { id, editor_id, editor_name, ...updateFields } = body;
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Collection ID is required',
      }, { status: 400 });
    }
    
    // Remove fields that shouldn't be updated directly
    delete updateFields.created_at;
    delete updateFields.updated_at;
    
    // Update collection
    const { data, error } = await supabaseAdmin
      .from('collections')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'update collection'), { status: 500 });
    }
    
    // Log action
    await supabaseAdmin.from('editor_actions').insert({
      action_type: 'edit_collection',
      entity_type: 'collection',
      entity_id: id,
      editor_id: editor_id || 'unknown',
      editor_name: editor_name || 'Unknown Editor',
      details: { name: data.name, changes: Object.keys(updateFields) },
    });
    
    return NextResponse.json(successResponse(data));
  } catch (err) {
    console.error('Update collection error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

// DELETE /api/collections - Delete collection
export async function DELETE(request) {
  const authError = requireEditorAuth(request);
  if (authError) return authError;

  if (!supabaseAdmin) {
    return NextResponse.json({
      success: false,
      error: 'Database not configured',
    }, { status: 503 });
  }
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Collection ID is required',
      }, { status: 400 });
    }
    
    // Get collection before deletion for logging
    const { data: collection } = await supabaseAdmin
      .from('collections')
      .select('name')
      .eq('id', id)
      .single();
    
    // Delete collection (cascade will remove collection_podcasts)
    const { error } = await supabaseAdmin
      .from('collections')
      .delete()
      .eq('id', id);
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'delete collection'), { status: 500 });
    }
    
    // Log action
    await supabaseAdmin.from('editor_actions').insert({
      action_type: 'delete_collection',
      entity_type: 'collection',
      entity_id: id,
      editor_id: 'unknown',
      editor_name: 'Unknown Editor',
      details: { name: collection?.name || 'Unknown' },
    });
    
    return NextResponse.json(successResponse({ deleted: true, id }));
  } catch (err) {
    console.error('Delete collection error:', err);
    return NextResponse.json({
      success: false,
      error: err.message,
    }, { status: 500 });
  }
}

/**
 * Helper: Get icon for collection based on name
 */
function getIconForCollection(name, index) {
  const nameLower = name.toLowerCase();
  
  if (nameLower.includes('tech') || nameLower.includes('ai')) return 'ti-brain';
  if (nameLower.includes('crime')) return 'ti-flame';
  if (nameLower.includes('trending') || nameLower.includes('top')) return 'ti-trending-up';
  if (nameLower.includes('heart') || nameLower.includes('favorite')) return 'ti-heart';
  if (nameLower.includes('news')) return 'ti-news';
  if (nameLower.includes('science')) return 'ti-flask';
  
  const icons = ['ti-trending-up', 'ti-brain', 'ti-flame', 'ti-heart', 'ti-star'];
  return icons[index % icons.length];
}
