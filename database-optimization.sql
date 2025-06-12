-- SoapBox Super App Database Performance Optimization
-- This script creates indexes and optimizations to improve query performance

-- User-related indexes for authentication and profile queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_updated_at ON users(updated_at);

-- Church-related indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_churches_is_active ON churches(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_churches_city ON churches(city);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_churches_name_trgm ON churches USING gin(name gin_trgm_ops);

-- User-church relationship indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_churches_user_id ON user_churches(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_churches_church_id ON user_churches(church_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_churches_role ON user_churches(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_churches_active ON user_churches(is_active);

-- Events indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_church_id ON events(church_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Prayer requests indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_author_id ON prayer_requests(author_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_church_id ON prayer_requests(church_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_is_anonymous ON prayer_requests(is_anonymous);

-- Discussions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_author_id ON discussions(author_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_church_id ON discussions(church_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_created_at ON discussions(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_is_public ON discussions(is_public);

-- Check-ins performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checkins_created_at ON checkins(created_at);

-- Bible verses indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_verses_reference ON bible_verses(reference);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_verses_theme ON bible_verses(theme);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_verses_book ON bible_verses(book);

-- Daily verses indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_verses_date ON daily_verses(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_verses_journey_type ON daily_verses(journey_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_verses_theme ON daily_verses(theme);

-- Reading progress indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_date ON reading_progress(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_verse_id ON reading_progress(verse_id);

-- Mood check-ins indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_checkins_user_id ON mood_checkins(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_checkins_created_at ON mood_checkins(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mood_checkins_mood_score ON mood_checkins(mood_score);

-- Volunteer indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_volunteers_church_id ON volunteers(church_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_volunteers_is_active ON volunteers(is_active);

-- Volunteer opportunities indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_volunteer_opportunities_church_id ON volunteer_opportunities(church_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_volunteer_opportunities_date ON volunteer_opportunities(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_volunteer_opportunities_is_active ON volunteer_opportunities(is_active);

-- Messages indexes for chat performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Conversations indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

-- Donations indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donations_church_id ON donations(church_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donations_created_at ON donations(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_donations_amount ON donations(amount);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_church_date ON events(church_id, date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayers_church_created ON prayer_requests(church_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_church_created ON discussions(church_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_checkins_user_date ON checkins(user_id, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_progress_user_date ON reading_progress(user_id, date DESC);

-- Full-text search indexes (requires pg_trgm extension)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_content_trgm ON prayer_requests USING gin(content gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_discussions_content_trgm ON discussions USING gin(content gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_title_trgm ON events USING gin(title gin_trgm_ops);

-- Statistics update for better query planning
ANALYZE users;
ANALYZE churches;
ANALYZE user_churches;
ANALYZE events;
ANALYZE prayer_requests;
ANALYZE discussions;
ANALYZE checkins;
ANALYZE bible_verses;
ANALYZE daily_verses;
ANALYZE reading_progress;
ANALYZE mood_checkins;
ANALYZE volunteers;
ANALYZE volunteer_opportunities;
ANALYZE messages;
ANALYZE conversations;
ANALYZE donations;