/**
 * Health Check API Route
 * GET /api/health - Returns system status
 * GET /api/health/db - Returns database connection status
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/health
export async function GET(request) {
  const url = new URL(request.url);
  const checkDb = url.searchParams.get('db') === 'true' || url.pathname.endsWith('/db');
  
  // Basic health check
  if (!checkDb) {
    return NextResponse.json({
      system: 'editor',
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: isSupabaseConfigured() ? 'configured' : 'not_configured',
    });
  }
  
  // Database health check
  if (!supabaseAdmin) {
    return NextResponse.json({
      system: 'editor',
      database: 'not_configured',
      status: 'degraded',
      message: 'Supabase credentials not configured. Using mock data mode.',
      timestamp: new Date().toISOString(),
    });
  }
  
  try {
    // Test database connection by querying podcasts table
    const { error, count } = await supabaseAdmin
      .from('podcasts')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return NextResponse.json({
        system: 'editor',
        database: 'error',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
    
    return NextResponse.json({
      system: 'editor',
      database: 'connected',
      status: 'ok',
      podcastCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      system: 'editor',
      database: 'error',
      status: 'error',
      error: err.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
