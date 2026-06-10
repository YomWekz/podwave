/**
 * Health Routes
 * Routes for system health checks
 */

const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * @route   GET /api/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', async (req, res) => {
    res.json({
        system: 'admin',
        status: 'ok'
    });
});

/**
 * @route   GET /api/health/db
 * @desc    Database connection health check
 * @access  Public
 */
router.get('/db', async (req, res) => {
    try {
        const connected = await db.testConnection();
        
        res.json({
            system: 'admin',
            database: connected ? 'connected' : 'disconnected',
            status: connected ? 'ok' : 'error'
        });
    } catch (error) {
        res.status(503).json({
            system: 'admin',
            database: 'error',
            status: 'error',
            message: 'Database connection failed'
        });
    }
});

module.exports = router;
