-- Update Bible in a Day session types to support new track options

-- Add targetDuration column to sessions table
ALTER TABLE bible_in_a_day_sessions 
ADD COLUMN target_duration INTEGER DEFAULT 60; -- in minutes

-- Update session_type to support new values
-- Note: PostgreSQL doesn't have ENUM constraints by default, so we'll handle validation in the application
-- The session_type field can now accept: fast_track, deep_dive, audio_only

-- Update any existing sessions to have target duration
UPDATE bible_in_a_day_sessions 
SET target_duration = CASE 
  WHEN session_type = 'fast_track' THEN 60
  WHEN session_type = 'full_immersion' THEN 300
  ELSE 60
END
WHERE target_duration IS NULL;