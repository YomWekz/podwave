-- ============================================
-- PodWave Editor Database Schema
-- Supabase PostgreSQL Database
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: podcasts
-- Podcasts received from Admin system for review
-- ============================================
CREATE TABLE IF NOT EXISTS podcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_feed_id INTEGER,
    title VARCHAR(500) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    image_url VARCHAR(2048),
    website_url VARCHAR(2048),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, published
    raw_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_podcasts_status (status),
    INDEX idx_podcasts_category (category),
    INDEX idx_podcasts_created_at (created_at)
);

-- ============================================
-- TABLE: episodes
-- Episodes belonging to podcasts
-- ============================================
CREATE TABLE IF NOT EXISTS episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    audio_url VARCHAR(2048),
    duration INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, published, hidden
    raw_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_episodes_podcast_id (podcast_id),
    INDEX idx_episodes_status (status),
    INDEX idx_episodes_published_at (published_at)
);

-- ============================================
-- TABLE: collections
-- Curated collections of podcasts
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url VARCHAR(2048),
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'draft', -- draft, published, archived
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_collections_status (status),
    INDEX idx_collections_is_featured (is_featured)
);

-- ============================================
-- TABLE: collection_podcasts
-- Junction table for podcasts in collections
-- ============================================
CREATE TABLE IF NOT EXISTS collection_podcasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    podcast_id UUID NOT NULL REFERENCES podcasts(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    added_by VARCHAR(255),
    
    -- Unique constraint
    UNIQUE (collection_id, podcast_id),
    
    -- Indexes
    INDEX idx_collection_podcasts_collection_id (collection_id),
    INDEX idx_collection_podcasts_podcast_id (podcast_id)
);

-- ============================================
-- TABLE: ai_highlights
-- AI-generated highlight clips from episodes
-- ============================================
CREATE TABLE IF NOT EXISTS ai_highlights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    title VARCHAR(500),
    description TEXT,
    start_time INTEGER NOT NULL, -- seconds
    end_time INTEGER NOT NULL, -- seconds
    duration INTEGER GENERATED ALWAYS AS (end_time - start_time) STORED,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    tags TEXT[],
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    raw_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_ai_highlights_episode_id (episode_id),
    INDEX idx_ai_highlights_status (status),
    INDEX idx_ai_highlights_tags (tags)
);

-- ============================================
-- TABLE: editor_actions
-- Audit log of editor actions
-- ============================================
CREATE TABLE IF NOT EXISTS editor_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL, -- approve, reject, publish, edit, create_collection, etc.
    entity_type VARCHAR(100), -- podcast, episode, collection, highlight
    entity_id UUID,
    editor_id VARCHAR(255),
    editor_name VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_editor_actions_action_type (action_type),
    INDEX idx_editor_actions_entity (entity_type, entity_id),
    INDEX idx_editor_actions_editor_id (editor_id),
    INDEX idx_editor_actions_created_at (created_at)
);

-- ============================================
-- TABLE: published_content
-- Track content published to Public system
-- ============================================
CREATE TABLE IF NOT EXISTS published_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(100) NOT NULL, -- podcast, episode
    content_id UUID NOT NULL,
    published_to_public_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_by VARCHAR(255),
    public_system_response JSONB,
    
    -- Indexes
    INDEX idx_published_content_type (content_type, content_id),
    INDEX idx_published_content_published_at (published_to_public_at)
);

-- ============================================
-- TABLE: review_notes
-- Notes added during review process
-- ============================================
CREATE TABLE IF NOT EXISTS review_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
    episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_review_notes_podcast_id (podcast_id),
    INDEX idx_review_notes_episode_id (episode_id)
);

-- ============================================
-- FUNCTIONS: Update timestamp trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON podcasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_highlights_updated_at BEFORE UPDATE ON ai_highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample podcasts for testing
INSERT INTO podcasts (id, title, author, description, category, status) VALUES
    (uuid_generate_v4(), 'Hard Fork', 'The New York Times', 'A podcast about technology', 'Technology', 'pending'),
    (uuid_generate_v4(), 'Lex Fridman Podcast', 'Lex Fridman', 'Conversations about AI and technology', 'Science', 'pending'),
    (uuid_generate_v4(), 'Crime Junkie', 'Audiochuck', 'True crime stories', 'True Crime', 'approved')
ON CONFLICT DO NOTHING;

-- Insert sample collection
INSERT INTO collections (name, description, status) VALUES
    ('Top Tech Podcasts', 'Best technology podcasts curated by our editors', 'published'),
    ('True Crime Essentials', 'Must-listen true crime podcasts', 'draft')
ON CONFLICT DO NOTHING;
