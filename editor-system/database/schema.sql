-- ============================================
-- PodWave Editor Database Schema
-- Supabase PostgreSQL Database
-- ============================================
-- Run this entire file in:
-- Supabase Dashboard → SQL Editor → New Query → Paste → Run

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts (status);
CREATE INDEX IF NOT EXISTS idx_podcasts_category ON podcasts (category);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_at ON podcasts (created_at);

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_episodes_podcast_id ON episodes (podcast_id);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes (status);
CREATE INDEX IF NOT EXISTS idx_episodes_published_at ON episodes (published_at);

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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_status ON collections (status);
CREATE INDEX IF NOT EXISTS idx_collections_is_featured ON collections (is_featured);

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
    UNIQUE (collection_id, podcast_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_podcasts_collection_id ON collection_podcasts (collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_podcasts_podcast_id ON collection_podcasts (podcast_id);

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
    end_time INTEGER NOT NULL,   -- seconds
    duration INTEGER GENERATED ALWAYS AS (end_time - start_time) STORED,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    tags TEXT[],
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    raw_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_highlights_episode_id ON ai_highlights (episode_id);
CREATE INDEX IF NOT EXISTS idx_ai_highlights_status ON ai_highlights (status);

-- ============================================
-- TABLE: editor_actions
-- Audit log of editor actions
-- ============================================
CREATE TABLE IF NOT EXISTS editor_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL, -- approve, reject, publish, edit, create_collection, etc.
    entity_type VARCHAR(100),          -- podcast, episode, collection, highlight
    entity_id UUID,
    editor_id VARCHAR(255),
    editor_name VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_editor_actions_action_type ON editor_actions (action_type);
CREATE INDEX IF NOT EXISTS idx_editor_actions_entity ON editor_actions (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_editor_actions_editor_id ON editor_actions (editor_id);
CREATE INDEX IF NOT EXISTS idx_editor_actions_created_at ON editor_actions (created_at);

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
    public_system_response JSONB
);

CREATE INDEX IF NOT EXISTS idx_published_content_type ON published_content (content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_published_content_published_at ON published_content (published_to_public_at);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_notes_podcast_id ON review_notes (podcast_id);
CREATE INDEX IF NOT EXISTS idx_review_notes_episode_id ON review_notes (episode_id);

-- ============================================
-- FUNCTIONS: Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_podcasts_updated_at ON podcasts;
CREATE TRIGGER update_podcasts_updated_at
    BEFORE UPDATE ON podcasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_episodes_updated_at ON episodes;
CREATE TRIGGER update_episodes_updated_at
    BEFORE UPDATE ON episodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_highlights_updated_at ON ai_highlights;
CREATE TRIGGER update_ai_highlights_updated_at
    BEFORE UPDATE ON ai_highlights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - safe to skip)
-- ============================================
INSERT INTO podcasts (title, author, description, category, status) VALUES
    ('Hard Fork', 'The New York Times', 'A podcast about technology', 'Technology', 'pending'),
    ('Lex Fridman Podcast', 'Lex Fridman', 'Conversations about AI and technology', 'Science', 'pending'),
    ('Crime Junkie', 'Audiochuck', 'True crime stories', 'True Crime', 'approved')
ON CONFLICT DO NOTHING;

INSERT INTO collections (name, description, status) VALUES
    ('Top Tech Podcasts', 'Best technology podcasts curated by our editors', 'published'),
    ('True Crime Essentials', 'Must-listen true crime podcasts', 'draft')
ON CONFLICT DO NOTHING;
