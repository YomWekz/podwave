/**
 * Jobs Routes
 * Routes for ingestion job management
 */

const express = require('express');
const router = express.Router();

const jobsController = require('../controllers/jobs.controller');
const { validateId, validatePagination } = require('../middleware/validate');
const { syncJobLimit } = require('../middleware/rateLimit');

/**
 * @route   POST /api/jobs/sync
 * @desc    Trigger a sync job for a feed
 * @access  Public (will be protected in future)
 */
router.post('/sync', syncJobLimit, jobsController.triggerSync);

/**
 * @route   GET /api/jobs/logs
 * @desc    Get ingestion job logs
 * @access  Public (will be protected in future)
 */
router.get('/logs', validatePagination, jobsController.getJobLogs);

/**
 * @route   GET /api/jobs/failed
 * @desc    Get unresolved failed jobs
 * @access  Public (will be protected in future)
 */
router.get('/failed', jobsController.getFailedJobs);

/**
 * @route   POST /api/jobs/:id/retry
 * @desc    Retry a failed job
 * @access  Public (will be protected in future)
 */
router.post('/:id/retry', validateId('id'), jobsController.retryJob);

module.exports = router;
