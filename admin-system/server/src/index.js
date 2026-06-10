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

// Import error handling
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

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

// Health check routes
app.use('/api/health', healthRoutes);

// Feed management routes
app.use('/api/feeds', feedsRoutes);

// Job management routes
app.use('/api/jobs', jobsRoutes);

// Statistics routes
app.use('/api/stats', statsRoutes);

// Integration routes (Admin → Editor)
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
        // Test database connection
        console.log('Connecting to MySQL database...');
        const dbConnected = await db.testConnection();
        
        if (!dbConnected) {
            console.error('⚠️  Database connection failed. Server starting anyway...');
            console.error('   Make sure MySQL is running and credentials are correct.');
        }
        
        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════╗');
            console.log('║     PodWave Admin Server Started       ║');
            console.log('╠════════════════════════════════════════╣');
            console.log(`║  Port:     ${PORT.toString().padEnd(27)}║`);
            console.log(`║  Health:   http://localhost:${PORT}/api/health     ║`);
            console.log(`║  Database: ${dbConnected ? 'Connected ✓' : 'Failed ✗'}`.padEnd(41) + '║');
            console.log('╚════════════════════════════════════════╝');
            console.log('');
        });
        
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
