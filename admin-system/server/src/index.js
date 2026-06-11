/**
 * PodWave Admin Backend Server
 * Express.js + MySQL
 * 
 * This is the admin system backend for managing:
 * - RSS feeds
 * - Ingestion jobs
 * - Raw podcast data
 * - Failed jobs and retry queue
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./db/connection');

// Import routes
// Note: healthRoutes is NOT mounted here — health is handled directly
// above all middleware via app.get() calls for guaranteed bypass.
const feedsRoutes = require('./routes/feeds.routes');
const jobsRoutes = require('./routes/jobs.routes');
const statsRoutes = require('./routes/stats.routes');
const integrationRoutes = require('./routes/integration.routes');
const authRoutes = require('./routes/auth.routes');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { requireAuth, requireRole } = require('./middleware/auth');

// Create Express app
const app = express();
const PORT = process.env.ADMIN_PORT || 4001;
let server;
let shuttingDown = false;

// ============================================
// HEALTH ROUTES — Mounted BEFORE ALL other middleware
// Basic health does not depend on the database or authentication.
// ============================================
app.get('/api/health', (req, res) => {
    res.json({ system: 'admin', status: 'ok' });
});

app.get('/api/health/db', async (req, res) => {
    try {
        const connected = await db.testConnection();
        res.json({
            system: 'admin',
            database: connected ? 'connected' : 'disconnected',
            status: connected ? 'ok' : 'error'
        });
    } catch (err) {
        res.status(503).json({
            system: 'admin',
            database: 'error',
            status: 'error',
            message: 'Database connection failed'
        });
    }
});

// ============================================
// SECURITY MIDDLEWARE (applies to all routes below)
// ============================================

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.ADMIN_CLIENT_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// ROUTES
// ============================================

// Auth routes — OPEN (login entry point)
app.use('/api/auth', authRoutes);

// Feed management — PROTECTED (Admin JWT required)
app.use('/api/feeds', requireAuth, requireRole('admin'), feedsRoutes);

// Job management — PROTECTED (Admin JWT required)
app.use('/api/jobs', requireAuth, requireRole('admin'), jobsRoutes);

// Statistics — PROTECTED (Admin JWT required)
app.use('/api/stats', requireAuth, requireRole('admin'), statsRoutes);

// Integration — SERVICE TOKEN only (system-to-system pipeline, not user JWT)
app.use('/api/integration', integrationRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'PodWave Admin API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            feeds: '/api/feeds',
            jobs: '/api/jobs',
            stats: '/api/stats'
        }
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
    try {
        // Start listening FIRST — server is always reachable immediately.
        // DB check happens after so a slow/hung MySQL never blocks /api/health.
        await new Promise((resolve, reject) => {
            server = app.listen(PORT, () => {
                console.log('');
                console.log('╔════════════════════════════════════════╗');
                console.log('║     PodWave Admin Server Started       ║');
                console.log('╠════════════════════════════════════════╣');
                console.log(`║  Port:     ${PORT.toString().padEnd(27)}║`);
                console.log(`║  Health:   http://localhost:${PORT}/api/health ║`);
                console.log('╚════════════════════════════════════════╝');
                console.log('');
                resolve();
            }).on('error', reject);
        });

        // Test database connection AFTER server is already accepting requests.
        console.log('Connecting to MySQL database...');
        const dbConnected = await db.testConnection();

        if (!dbConnected) {
            console.error('⚠️  Database connection failed. Server running in degraded mode.');
            console.error('   Make sure MySQL is running and credentials are correct.');
        } else {
            console.log('✓ Admin server fully operational (MySQL connected)');
        }

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
async function shutdown(signal) {
    if (shuttingDown) {
        return;
    }

    shuttingDown = true;
    console.log(`${signal} received. Shutting down gracefully...`);

    if (server) {
        await new Promise(resolve => server.close(resolve));
    }

    await db.closePool();
    process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start the server
startServer();
