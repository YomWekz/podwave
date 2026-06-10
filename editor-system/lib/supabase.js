/**
 * Supabase Client Configuration for PodWave Editor
 * 
 * This module provides two clients:
 * 1. Browser client (supabase) - for client-side operations with anon key
 * 2. Admin client (supabaseAdmin) - for server-side API routes with service role key
 * 
 * IMPORTANT: Never expose the service role key in client-side code!
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase configuration missing. Using mock data mode.');
}

// Browser-side Supabase client (limited permissions via anon key)
// Safe to use in client components
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side Supabase admin client (full permissions via service role key)
// ONLY use in API routes and server-side code
// This client can bypass Row Level Security (RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Check if admin client is available (server-side only)
 */
export function isAdminClientAvailable() {
  return !!(supabaseUrl && supabaseServiceKey);
}

/**
 * Helper to handle Supabase errors consistently
 * @param {Object} error - Supabase error object
 * @param {string} context - Context for logging
 * @returns {Object} - Standardized error object
 */
export function handleSupabaseError(error, context = 'operation') {
  console.error(`Supabase error during ${context}:`, error);
  
  return {
    success: false,
    error: error?.message || 'An unexpected error occurred',
    code: error?.code || 'UNKNOWN_ERROR',
  };
}

/**
 * Helper to create standardized success response
 * @param {*} data - Response data
 * @returns {Object} - Success response object
 */
export function successResponse(data) {
  return {
    success: true,
    data,
  };
}

export default supabase;
