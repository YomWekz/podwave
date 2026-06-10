# PodWave Public - MongoDB Atlas Setup Guide

This guide explains how to connect the Public system to a MongoDB Atlas database.

## Current Status

The Public system works **without MongoDB** using mock data fallback. You can develop and test the UI without any database configuration.

When you're ready to connect to a real database, follow the steps below.

---

## Prerequisites

1. A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier available)
2. A MongoDB Atlas cluster created

---

## Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign in or create an account
3. Create a new project called "PodWave"
4. Build a cluster (free M0 tier is sufficient)
5. Choose a cloud provider and region closest to you

---

## Step 2: Configure Database Access

### Create Database User

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a username and password (save these!)
5. Set privileges to **Read and write to any database**

### Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For development, click **Allow Access from Anywhere** (0.0.0.0/0)
4. For production, add only your server's IP

---

## Step 3: Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** as driver
5. Copy the connection string

The format looks like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## Step 4: Create Environment File

Create a file named `.env` in the `public-system/server/` folder:

```
public-system/server/
├── .env    <-- Create this file
├── src/
├── package.json
└── ...
```

### `.env` Template

```env
# ============================================
# PodWave Public - MongoDB Configuration
# ============================================

# Server Configuration
PUBLIC_PORT=4003
PUBLIC_CLIENT_URL=http://localhost:3003

# MongoDB Atlas Connection String
# Replace <username>, <password>, and cluster URL with your values
# IMPORTANT: Replace <password> with your actual password
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/podwave?retryWrites=true&w=majority

# JWT Secret (generate a secure random string)
JWT_SECRET=replace-with-secure-random-string

# Editor System API Token (for receiving approved podcasts)
EDITOR_TO_PUBLIC_SERVICE_TOKEN=local-editor-public-token
```

**Important Notes:**
- Replace `your-username` with your MongoDB Atlas username
- Replace `your-password` with your MongoDB Atlas password (URL encode if it has special characters)
- Replace the cluster URL with your actual cluster URL
- The database name `podwave` will be created automatically

---

## Step 5: Restart the Server

After creating `.env`:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd public-system/server
npm run dev
```

---

## Database Collections

The following collections will be created automatically by Mongoose:

| Collection | Purpose |
|------------|---------|
| `podcasts` | Published podcasts from Editor |
| `episodes` | Podcast episodes |
| `users` | User profiles, saved podcasts, listen history |

---

## Fallback Behavior (No MongoDB Configured)

When MongoDB is not configured, the Public system:

1. ✅ **Continues to work** using mock data
2. ✅ **All UI features function** normally
3. ✅ **API endpoints return mock data** with `"source": "mock"` flag
4. ⚠️ **Data is not persisted** - changes are lost on refresh
5. ⚠️ **Health check shows** `"mongodb": "not_configured"`

### Example Response (Mock Mode)

```json
{
  "success": true,
  "data": [...],
  "source": "mock"
}
```

---

## Verifying Connection

### Check Health Endpoint

```bash
curl http://localhost:4003/api/health
```

**Without MongoDB:**
```json
{
  "system": "public",
  "status": "ok",
  "mongodb": "not_configured"
}
```

**With MongoDB:**
```json
{
  "system": "public",
  "status": "ok",
  "mongodb": "connected"
}
```

### Check Database Health

```bash
curl http://localhost:4003/api/health/db
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health check |
| GET | `/api/health/db` | Database connection status |
| GET | `/api/podcasts` | List all podcasts |
| GET | `/api/podcasts/featured` | Featured podcasts |
| GET | `/api/podcasts/trending` | Trending podcasts |
| GET | `/api/podcasts/:id` | Single podcast with episodes |
| GET | `/api/podcasts/categories` | List categories |
| GET | `/api/search` | Search podcasts/episodes |
| GET | `/api/search/trending` | Trending searches |
| GET | `/api/user/profile` | User profile |
| GET | `/api/user/saved` | Saved podcasts |
| POST | `/api/user/saved` | Save a podcast |
| DELETE | `/api/user/saved/:id` | Unsave podcast |
| GET | `/api/user/history` | Listen history |
| POST | `/api/user/history` | Add to history |
| POST | `/api/user/ratings` | Rate a podcast |
| GET | `/api/user/player-state` | Current player state |
| POST | `/api/user/player-state` | Save player state |

---

## Security Notes

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Use strong passwords** for MongoDB Atlas
3. **Restrict IP access** in production
4. **Use environment variables** for all secrets
5. **Enable MongoDB Atlas security** features (encryption at rest, etc.)

---

## Troubleshooting

### "MongooseError: Connection refused"

1. Check if your IP is whitelisted in Network Access
2. Verify username/password are correct
3. Ensure the cluster is running (not paused)

### "Authentication failed"

1. Verify username and password in connection string
2. Check if the user has correct privileges
3. URL encode special characters in password

### Connection timeout

1. Check your internet connection
2. Verify the cluster URL is correct
3. Try a different region

---

## Quick Reference

| File | Location |
|------|----------|
| Environment | `public-system/server/.env` |
| Models | `public-system/server/src/models/*.js` |
| Controllers | `public-system/server/src/controllers/*.js` |
| Routes | `public-system/server/src/routes/*.js` |
| Mock Data | `public-system/server/src/data/*.js` |

---

## Need Help?

- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)
