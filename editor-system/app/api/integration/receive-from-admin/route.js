/**
 * Integration Route - Receive from Admin
 * POST /api/integration/receive-from-admin
 * Receives podcast data from Admin system and adds to review queue
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, handleSupabaseError, successResponse } from '@/lib/supabase';

// Service token validation
const ADMIN_TO_EDITOR_TOKEN = process.env.ADMIN_TO_EDITOR_SERVICE_TOKEN || 'podwave_admin_to_editor_token_2024';

// Validate authorization header
function validateAuth(authHeader) {
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === ADMIN_TO_EDITOR_TOKEN;
}

// POST /api/integration/receive-from-admin
export async function POST(request) {
  // Validate authorization
  const authHeader = request.headers.get('authorization');
  
  if (!validateAuth(authHeader)) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized - Invalid service token'
    }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.rss_url) {
      return NextResponse.json({
        success: false,
        error: 'rss_url is required'
      }, { status: 400 });
    }
    
    // If no database connection, return mock success
    if (!supabaseAdmin) {
      console.log('[Editor] Received from Admin (mock mode):', body.title || body.rss_url);
      
      return NextResponse.json({
        success: true,
        message: 'Podcast received and added to review queue (mock mode)',
        data: {
          id: `mock-${Date.now()}`,
          title: body.title,
          status: 'pending',
          source: 'mock'
        }
      });
    }
    
    // Check if podcast already exists
    const { data: existing } = await supabaseAdmin
      .from('podcasts')
      .select('id, status')
      .eq('admin_feed_id', body.admin_feed_id)
      .single();
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Podcast already exists in review queue',
        data: existing
      });
    }
    
    // Insert new podcast
    const { data, error } = await supabaseAdmin
      .from('podcasts')
      .insert({
        admin_feed_id: body.admin_feed_id,
        title: body.title || 'Untitled Podcast',
        author: body.author || null,
        description: body.description || null,
        image_url: body.image_url || null,
        website_url: body.website_url || null,
        category: body.category || 'Uncategorized',
        status: 'pending',
        raw_json: body
      })
      .select()
      .single();
    
    if (error) {
      return NextResponse.json(handleSupabaseError(error, 'create podcast'), { status: 500 });
    }
    
    // Log action
    await supabaseAdmin.from('editor_actions').insert({
      action_type: 'receive_from_admin',
      entity_type: 'podcast',
      entity_id: data.id,
      editor_id: 'admin-system',
      editor_name: 'Admin System',
      details: {
        title: data.title,
        admin_feed_id: body.admin_feed_id,
        rss_url: body.rss_url
      }
    });
    
    console.log('[Editor] Received podcast from Admin:', data.title);
    
    return NextResponse.json(successResponse(data), { status: 201 });
    
  } catch (err) {
    console.error('Receive from Admin error:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
