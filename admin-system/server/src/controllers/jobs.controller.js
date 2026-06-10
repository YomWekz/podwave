/**
 * Jobs Controller
 * Handles ingestion job operations
 */

const db = require('../db/connection');
const { NotFoundError, DatabaseError } = require('../middleware/errorHandler');

/**
 * Trigger a sync job for a feed
 * POST /api/jobs/sync
 * 
 * For now, this simulates RSS sync without actual parsing
 */
async function triggerSync(req, res, next) {
    try {
        const { feed_id } = req.body;
        
        if (!feed_id) {
            return res.status(400).json({ error: 'feed_id is required' });
        }
        
        // Verify feed exists
        const feed = await db.queryOne('SELECT * FROM feeds WHERE id = ?', [feed_id]);
        
        if (!feed) {
            return next(new NotFoundError('Feed'));
        }
        
        // Create ingestion job record
        const jobId = await db.insert('ingestion_jobs', {
            feed_id,
            status: 'running',
            started_at: new Date()
        });
        
        // Simulate sync process
        // In a real implementation, this would fetch and parse the RSS feed
        // For now, we simulate success/failure based on random chance
        
        // Simulate processing delay (short for demo)
        setTimeout(async () => {
            try {
                // 90% success rate for simulation
                const success = Math.random() > 0.1;
                
                if (success) {
                    // Update job status to success
                    await db.update('ingestion_jobs', {
                        status: 'success',
                        message: 'RSS feed synced successfully (simulated)',
                        finished_at: new Date()
                    }, 'id = ?', [jobId]);
                    
                    // Update feed status and last_sync_at
                    await db.update('feeds', {
                        status: 'active',
                        last_sync_at: new Date()
                    }, 'id = ?', [feed_id]);
                    
                    // Create mock podcast data (simulated)
                    await createMockPodcastData(feed_id, feed.rss_url);
                    
                } else {
                    // Simulate failure
                    const errorMessages = [
                        'Failed to fetch RSS feed',
                        'RSS feed returned invalid XML',
                        'Connection timeout',
                        'Feed temporarily unavailable'
                    ];
                    const errorMsg = errorMessages[Math.floor(Math.random() * errorMessages.length)];
                    
                    // Update job status to error
                    await db.update('ingestion_jobs', {
                        status: 'error',
                        message: errorMsg,
                        finished_at: new Date()
                    }, 'id = ?', [jobId]);
                    
                    // Create failed job record
                    await db.insert('failed_jobs', {
                        feed_id,
                        job_id: jobId,
                        error_message: errorMsg,
                        retry_count: 0,
                        resolved: false
                    });
                }
            } catch (updateError) {
                console.error('Error updating job status:', updateError);
            }
        }, 500); // 500ms simulated delay
        
        res.status(202).json({
            success: true,
            message: 'Sync job started',
            data: {
                job_id: jobId,
                feed_id,
                status: 'running'
            }
        });
        
    } catch (error) {
        console.error('Trigger sync error:', error);
        next(new DatabaseError('Failed to start sync job'));
    }
}

/**
 * Create mock podcast and episode data for simulation
 */
async function createMockPodcastData(feedId, rssUrl) {
    try {
        // Create mock podcast
        const podcastId = await db.insert('podcasts', {
            feed_id: feedId,
            title: `Podcast from Feed #${feedId}`,
            author: 'Various Authors',
            description: 'This is a simulated podcast entry for demonstration purposes.',
            image_url: null,
            website_url: rssUrl.replace('/feed', '').replace('.xml', ''),
            raw_json: JSON.stringify({ simulated: true, feed_id: feedId })
        });
        
        // Create mock episodes
        for (let i = 1; i <= 3; i++) {
            await db.insert('episodes', {
                podcast_id: podcastId,
                title: `Episode ${i}: Sample Episode`,
                description: `This is simulated episode ${i} for testing purposes.`,
                audio_url: `https://example.com/episodes/${podcastId}/${i}.mp3`,
                duration: Math.floor(Math.random() * 3600) + 1800, // 30-90 mins
                published_at: new Date(Date.now() - (i * 86400000)), // Past days
                raw_json: JSON.stringify({ simulated: true, episode_number: i })
            });
        }
    } catch (error) {
        console.error('Error creating mock data:', error);
    }
}

/**
 * Get ingestion job logs
 * GET /api/jobs/logs
 */
async function getJobLogs(req, res, next) {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;
        
        // Get total count
        const countResult = await db.queryOne('SELECT COUNT(*) as total FROM ingestion_jobs');
        const total = countResult.total;
        
        // Get paginated logs
        const logs = await db.query(`
            SELECT 
                j.id,
                j.feed_id,
                j.status,
                j.message,
                j.started_at,
                j.finished_at,
                j.created_at,
                f.rss_url,
                f.category
            FROM ingestion_jobs j
            LEFT JOIN feeds f ON j.feed_id = f.id
            ORDER BY j.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), offset]);
        
        res.json({
            success: true,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            },
            data: logs
        });
    } catch (error) {
        console.error('Get job logs error:', error);
        next(new DatabaseError('Failed to fetch job logs'));
    }
}

/**
 * Get failed jobs
 * GET /api/jobs/failed
 */
async function getFailedJobs(req, res, next) {
    try {
        const failedJobs = await db.query(`
            SELECT 
                fj.id,
                fj.feed_id,
                fj.job_id,
                fj.error_message,
                fj.retry_count,
                fj.resolved,
                fj.created_at,
                fj.updated_at,
                f.rss_url,
                f.category,
                f.status as feed_status
            FROM failed_jobs fj
            LEFT JOIN feeds f ON fj.feed_id = f.id
            WHERE fj.resolved = FALSE
            ORDER BY fj.created_at DESC
        `);
        
        res.json({
            success: true,
            count: failedJobs.length,
            data: failedJobs
        });
    } catch (error) {
        console.error('Get failed jobs error:', error);
        next(new DatabaseError('Failed to fetch failed jobs'));
    }
}

/**
 * Retry a failed job
 * POST /api/jobs/:id/retry
 */
async function retryJob(req, res, next) {
    try {
        const { id } = req.params;
        
        // Get the failed job
        const failedJob = await db.queryOne(
            'SELECT * FROM failed_jobs WHERE id = ? AND resolved = FALSE',
            [id]
        );
        
        if (!failedJob) {
            return next(new NotFoundError('Failed job'));
        }
        
        // Increment retry count
        const newRetryCount = failedJob.retry_count + 1;
        
        // Simulate retry (80% success rate on retry)
        const success = Math.random() > 0.2;
        
        if (success) {
            // Mark as resolved
            await db.update('failed_jobs', {
                retry_count: newRetryCount,
                resolved: TRUE,
                updated_at: new Date()
            }, 'id = ?', [id]);
            
            // Create a new successful job record
            const jobId = await db.insert('ingestion_jobs', {
                feed_id: failedJob.feed_id,
                status: 'success',
                message: 'Retry successful',
                started_at: new Date(),
                finished_at: new Date()
            });
            
            res.json({
                success: true,
                message: 'Job retry successful',
                data: {
                    failed_job_id: id,
                    new_job_id: jobId,
                    retry_count: newRetryCount,
                    resolved: true
                }
            });
        } else {
            // Update retry count only
            await db.update('failed_jobs', {
                retry_count: newRetryCount,
                updated_at: new Date()
            }, 'id = ?', [id]);
            
            res.json({
                success: false,
                message: 'Job retry failed',
                data: {
                    failed_job_id: id,
                    retry_count: newRetryCount,
                    resolved: false
                }
            });
        }
    } catch (error) {
        console.error('Retry job error:', error);
        next(new DatabaseError('Failed to retry job'));
    }
}

module.exports = {
    triggerSync,
    getJobLogs,
    getFailedJobs,
    retryJob
};
