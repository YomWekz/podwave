/**
 * PodWave Public Backend Server
 * Express.js + MongoDB Atlas
 * 
 * This is the public user system backend for:
 * - Discover/browse podcasts
 * - Podcast details and episodes
 * - Audio player data
 * - Saved podcasts
 * - Ratings and listen history
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB, isConnected } = require('./config/database');

const app = express();
const PORT = process.env.PUBLIC_PORT || 4003;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.PUBLIC_CLIENT_URL || 'http://localhost:3003',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// Health Check Routes
// ============================================

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({
    system: 'public',
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: isConnected() ? 'connected' : 'not_configured'
  });
});

// Database health check
app.get('/api/health/db', async (req, res) => {
  const dbConnected = isConnected();
  
  res.json({
    system: 'public',
    database: dbConnected ? 'connected' : 'not_configured',
    status: dbConnected ? 'ok' : 'degraded',
    message: dbConnected 
      ? 'MongoDB connected successfully' 
      : 'MongoDB not configured. Using mock data mode.',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// API Routes
// ============================================

app.use('/api/podcasts', require('./routes/podcasts.routes'));
app.use('/api/search', require('./routes/search.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/integration', require('./routes/integration.routes'));

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  
  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    success: false,
    error: message
  });
});

// ============================================
// Start Server
// ============================================

async function startServer() {
  try {
    // Connect to MongoDB
    const dbConnected = await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║   PodWave Public Server Started        ║');
      console.log('╠════════════════════════════════════════╣');
      console.log(`║  Port:     ${PORT.toString().padEnd(27)}║`);
      console.log(`║  Health:   http://localhost:${PORT}/api/health`.padEnd(42) + '║');
      console.log(`║  Database: ${(dbConnected ? 'MongoDB Connected ✓' : 'Mock Data Mode').padEnd(27)}║`);
      console.log('╚════════════════════════════════════════╝');
      console.log('');
      
      if (!dbConnected) {
        console.log('⚠️  MongoDB not configured. Set MONGODB_URI in .env file.');
        console.log('   The server will use mock data for responses.\n');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
