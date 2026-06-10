/**
 * Stats Controller
 * Handles dashboard statistics
 */

const db = require('../db/connection');
const { DatabaseError } = require('../middleware/errorHandler');

/**
 * Get dashboard statistics
 * GET /api/stats
 */
async function getStats(req, res, next) {
    try {
        // Get total podcasts count
        const podcastsResult = await db.queryOne(
            'SELECT COUNT(*) as total FROM podcasts'
        );
        const totalPodcasts = podcastsResult ? podcastsResult.total : 0;
        
        // Get total episodes count
        const episodesResult = await db.queryOne(
            'SELECT COUNT(*) as total FROM episodes'
        );
        const totalEpisodes = episodesResult ? episodesResult.total : 0;
        
        // Get failed jobs count (unresolved)
        const failedJobsResult = await db.queryOne(
            'SELECT COUNT(*) as total FROM failed_jobs WHERE resolved = FALSE'
        );
        const failedJobsCount = failedJobsResult ? failedJobsResult.total : 0;
        
        // Get active feeds count
        const activeFeedsResult = await db.queryOne(
            'SELECT COUNT(*) as total FROM feeds WHERE status = "active"'
        );
        const activeFeedsCount = activeFeedsResult ? activeFeedsResult.total : 0;
        
        // Get total feeds count
        const totalFeedsResult = await db.queryOne(
            'SELECT COUNT(*) as total FROM feeds'
        );
        const totalFeedsCount = totalFeedsResult ? totalFeedsResult.total : 0;
        
        // Get pending jobs count
        const pendingJobsResult = await db.queryOne(
            'SELECT COUNT(*) as total FROM ingestion_jobs WHERE status = "pending" OR status = "running"'
        );
        const pendingJobsCount = pendingJobsResult ? pendingJobsResult.total : 0;
        
        // Get recent sync activity (last 24 hours)
        const recentSyncResult = await db.queryOne(`
            SELECT COUNT(*) as total 
            FROM ingestion_jobs 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `);
        const recentSyncCount = recentSyncResult ? recentSyncResult.total : 0;
        
        // Get success rate
        const successResult = await db.queryOne(
            'SELECT COUNT(*) as total FROM ingestion_jobs WHERE status = "success"'
        );
        const errorResult = await db.queryOne(
            'SELECT COUNT(*) as total FROM ingestion_jobs WHERE status = "error"'
        );
        
        const successCount = successResult ? successResult.total : 0;
        const errorCount = errorResult ? errorResult.total : 0;
        const totalJobs = successCount + errorCount;
        const successRate = totalJobs > 0 
            ? Math.round((successCount / totalJobs) * 100) 
            : 0;
        
        res.json({
            success: true,
            data: {
                podcasts: {
                    total: totalPodcasts
                },
                episodes: {
                    total: totalEpisodes
                },
                feeds: {
                    total: totalFeedsCount,
                    active: activeFeedsCount,
                    failed: totalFeedsCount - activeFeedsCount
                },
                jobs: {
                    failed: failedJobsCount,
                    pending: pendingJobsCount,
                    recentSyncCount,
                    successRate
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        next(new DatabaseError('Failed to fetch statistics'));
    }
}

/**
 * Get feed statistics by category
 * GET /api/stats/categories
 */
async function getCategoryStats(req, res, next) {
    try {
        const categoryStats = await db.query(`
            SELECT 
                category,
                COUNT(*) as feed_count,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count
            FROM feeds
            GROUP BY category
            ORDER BY feed_count DESC
        `);
        
        res.json({
            success: true,
            data: categoryStats
        });
    } catch (error) {
        console.error('Get category stats error:', error);
        next(new DatabaseError('Failed to fetch category statistics'));
    }
}

module.exports = {
    getStats,
    getCategoryStats
};
