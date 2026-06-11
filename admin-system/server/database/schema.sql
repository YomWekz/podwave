-- ============================================
-- PodWave Admin Database Schema
-- MySQL Database for Admin System
-- ============================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS podwave_admin
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE podwave_admin;

-- ============================================
-- TABLE: feeds
-- RSS feed sources to be ingested
-- ============================================
CREATE TABLE IF NOT EXISTS feeds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rss_url VARCHAR(2048) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    status ENUM('active', 'failed', 'pending', 'sent_to_editor') DEFAULT 'pending',
    last_sync_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Index for faster lookups by URL
    INDEX idx_rss_url (rss_url(255)),
    -- Index for filtering by status
    INDEX idx_status (status),
    -- Index for filtering by category
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: podcasts
-- Raw podcast data extracted from feeds
-- ============================================
CREATE TABLE IF NOT EXISTS podcasts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feed_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    image_url VARCHAR(2048) DEFAULT NULL,
    website_url VARCHAR(2048) DEFAULT NULL,
    raw_json JSON DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key to feeds
    CONSTRAINT fk_podcasts_feed
        FOREIGN KEY (feed_id) REFERENCES feeds(id)
        ON DELETE CASCADE,
    
    -- Indexes for common queries
    INDEX idx_feed_id (feed_id),
    INDEX idx_title (title(255)),
    INDEX idx_author (author)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: episodes
-- Raw episode data extracted from podcasts
-- ============================================
CREATE TABLE IF NOT EXISTS episodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    podcast_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT DEFAULT NULL,
    audio_url VARCHAR(2048) DEFAULT NULL,
    duration INT DEFAULT 0 COMMENT 'Duration in seconds',
    published_at DATETIME DEFAULT NULL,
    raw_json JSON DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key to podcasts
    CONSTRAINT fk_episodes_podcast
        FOREIGN KEY (podcast_id) REFERENCES podcasts(id)
        ON DELETE CASCADE,
    
    -- Indexes for common queries
    INDEX idx_podcast_id (podcast_id),
    INDEX idx_published_at (published_at),
    INDEX idx_title (title(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: ingestion_jobs
-- Track RSS sync jobs and their status
-- ============================================
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feed_id INT NOT NULL,
    status ENUM('success', 'error', 'running', 'pending') DEFAULT 'pending',
    message VARCHAR(1000) DEFAULT NULL,
    started_at DATETIME DEFAULT NULL,
    finished_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to feeds
    CONSTRAINT fk_jobs_feed
        FOREIGN KEY (feed_id) REFERENCES feeds(id)
        ON DELETE CASCADE,
    
    -- Indexes for filtering
    INDEX idx_feed_id (feed_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: failed_jobs
-- Track failed ingestion jobs for retry
-- ============================================
CREATE TABLE IF NOT EXISTS failed_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feed_id INT NOT NULL,
    job_id INT DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    retry_count INT DEFAULT 0,
    resolved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key to feeds
    CONSTRAINT fk_failed_feed
        FOREIGN KEY (feed_id) REFERENCES feeds(id)
        ON DELETE CASCADE,
    
    -- Foreign key to jobs (optional, can be NULL)
    CONSTRAINT fk_failed_job
        FOREIGN KEY (job_id) REFERENCES ingestion_jobs(id)
        ON DELETE SET NULL,
    
    -- Indexes for filtering
    INDEX idx_feed_id (feed_id),
    INDEX idx_resolved (resolved),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample feeds
INSERT INTO feeds (rss_url, category, status) VALUES
('https://feeds.npr.org/510289/podcast.xml', 'Technology', 'active'),
('https://feeds.simplecast.com/qm_9xx0g', 'Business', 'active'),
('https://feeds.megaphone.fm/HSW8287465557', 'True Crime', 'pending')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
