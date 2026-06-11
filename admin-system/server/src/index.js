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
const healthRoutes = require('./routes/health.routes');
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

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for API-only server
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.ADMIN_CLIENT_URL || 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (for debugging)
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES
// ============================================

// Auth routes — OPEN (these are the login entry point)
app.use('/api/auth', authRoutes);

// Health check routes — OPEN (for monitoring, no auth required)
app.use('/api/health', healthRoutes);

// Feed management routes — PROTECTED (Admin JWT required)
app.use('/api/feeds', requireAuth, requireRole('admin'), feedsRoutes);

// Job management routes — PROTECTED (Admin JWT required)
app.use('/api/jobs', requireAuth, requireRole('admin'), jobsRoutes);

// Statistics routes — PROTECTED (Admin JWT required)
app.use('/api/stats', requireAuth, requireRole('admin'), statsRoutes);

// Integration routes — SERVICE TOKEN only (see integration.routes.js + serviceAuth.js)
// These are system-to-system pipeline calls. Must NOT require user JWT.
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
            app.listen(PORT, () => {
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
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await db.closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    await db.closePool();
    process.exit(0);
});

// Start the server
startServer();
