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

const app = express();
const PORT = process.env.PUBLIC_PORT || 4003;

// Middleware
app.use(cors({
  origin: process.env.PUBLIC_CLIENT_URL || 'http://localhost:3003',
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    system: 'public',
    status: 'ok'
  });
});

// Placeholder routes (to be implemented in later phases)
// app.use('/api/podcasts', require('./routes/podcasts'));
// app.use('/api/search', require('./routes/search'));
// app.use('/api/user', require('./routes/user'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`PodWave Public Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
