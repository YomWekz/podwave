# PodWave Editor - Supabase Setup Guide

This guide explains how to connect the Editor system to a Supabase PostgreSQL database.

## Current Status

The Editor system works **without Supabase** using mock data fallback. You can develop and test the UI without any database configuration.

When you're ready to connect to a real database, follow the steps below.

---

## Prerequisites

1. A [Supabase](https://supabase.com) account (free tier available)
2. A Supabase project created

---

## Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Create a new project or select an existing one
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - click "Reveal")

---

## Step 2: Create Environment File

Create a file named `.env.local` in the `editor-system/` folder:

```
editor-system/
├── .env.local    <-- Create this file
├── app/
├── lib/
└── ...
```

### `.env.local` Template

```env
# ============================================
# PodWave Editor - Supabase Configuration
# ============================================
# Copy this file and fill in your Supabase credentials

# Supabase Project URL
# Find at: Supabase Dashboard → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anonymous Key (public, safe to expose)
# Find at: Supabase Dashboard → Settings → API → Project API keys → anon public
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase Service Role Key (SECRET - never expose in frontend code!)
# Find at: Supabase Dashboard → Settings → API → Project API keys → service_role
# This key is used ONLY in server-side API routes
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# Optional Configuration
# ============================================

# JWT Secret for additional security (generate a random string)
JWT_SECRET=replace-with-secure-random-string

# Admin System API Token (for receiving data from Admin)
ADMIN_TO_EDITOR_SERVICE_TOKEN=local-admin-editor-token

# Public System API (for sending approved podcasts)
PUBLIC_API_URL=http://localhost:4003
EDITOR_TO_PUBLIC_SERVICE_TOKEN=local-editor-public-token
```

---

## Step 3: Create Database Tables

### Option A: Using Supabase SQL Editor (Recommended)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the contents of `database/schema.sql` from this folder
4. Paste into the SQL Editor
5. Click **Run** to execute

### Option B: Using Supabase Table Editor

Create tables manually in the Table Editor. See the schema below for table structure.

---

## Step 4: Restart the Development Server

After creating `.env.local`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

The Editor will automatically connect to Supabase.

---

## Database Schema Overview

The schema is located at: `editor-system/database/schema.sql`

### Tables Created:

| Table | Purpose |
|-------|---------|
| `podcasts` | Podcasts from Admin system awaiting review |
| `episodes` | Individual podcast episodes |
| `collections` | Curated podcast collections |
| `collection_podcasts` | Junction table linking podcasts to collections |
| `ai_highlights` | AI-generated highlight clips |
| `editor_actions` | Audit log of all editor actions |
| `published_content` | Track content published to Public system |
| `review_notes` | Notes added during review process |

---

## Fallback Behavior (No Supabase Configured)

When Supabase is not configured, the Editor system:

1. ✅ **Continues to work** using mock data
2. ✅ **All UI features function** normally
3. ✅ **API endpoints return mock data** with `"source": "mock"` flag
4. ⚠️ **Data is not persisted** - changes are lost on refresh
5. ⚠️ **Connection status shows** "Using mock data" in the topbar

### How It Works

```javascript
// In API routes
if (!supabaseAdmin) {
  // Returns mock data with source flag
  return NextResponse.json({
    success: true,
    data: mockData,
    source: 'mock'
  });
}
```

---

## Verifying Connection

### Check Health Endpoint

```bash
curl http://localhost:3002/api/health
```

**Without Supabase:**
```json
{
  "system": "editor",
  "status": "ok",
  "supabase": "not_configured"
}
```

**With Supabase:**
```json
{
  "system": "editor",
  "status": "ok",
  "supabase": "configured"
}
```

### Check Database Health

```bash
curl "http://localhost:3002/api/health?db=true"
```

**Without Supabase:**
```json
{
  "system": "editor",
  "database": "not_configured",
  "status": "degraded"
}
```

**With Supabase Connected:**
```json
{
  "system": "editor",
  "database": "connected",
  "status": "ok",
  "podcastCount": 5
}
```

---

## Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Service role key is sensitive** - Only use in server-side code
3. **Row Level Security (RLS)** - Consider enabling RLS policies in Supabase
4. **API tokens** - Change default tokens in production

---

## Troubleshooting

### "Module not found: Can't resolve '@/lib/supabase'"

Make sure `jsconfig.json` exists in the `editor-system/` folder.

### Connection shows "Using mock data" but .env.local exists

1. Restart the dev server
2. Check that variable names match exactly:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Tables not created error

Run the schema in Supabase SQL Editor. See Step 3 above.

---

## Quick Reference

| File | Location |
|------|----------|
| Schema | `editor-system/database/schema.sql` |
| Environment | `editor-system/.env.local` (create from `.env.example`) |
| Supabase Client | `editor-system/lib/supabase.js` |
| API Routes | `editor-system/app/api/*/route.js` |

---

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
