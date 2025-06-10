-- Bible in a Day feature tables

-- Bible in a Day sessions
CREATE TABLE bible_in_a_day_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  current_section_index INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in minutes
  is_completed BOOLEAN DEFAULT FALSE,
  reflection_notes TEXT,
  final_rating INTEGER, -- 1-5 stars
  session_type VARCHAR(20) DEFAULT 'fast_track' -- fast_track, full_immersion
);

-- Bible in a Day section progress
CREATE TABLE bible_in_a_day_section_progress (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES bible_in_a_day_sessions(id),
  section_key VARCHAR(50) NOT NULL, -- creation, fall_promise, christ, church_future
  section_title VARCHAR(100) NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  time_spent INTEGER DEFAULT 0, -- in minutes
  reflection_answer TEXT,
  is_completed BOOLEAN DEFAULT FALSE
);

-- Bible in a Day completion badges
CREATE TABLE bible_in_a_day_badges (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  session_id INTEGER NOT NULL REFERENCES bible_in_a_day_sessions(id),
  badge_type VARCHAR(50) NOT NULL, -- fast_track_finisher, full_immersion_finisher, first_timer, repeat_reader
  earned_at TIMESTAMP DEFAULT NOW(),
  share_count INTEGER DEFAULT 0
);

-- Add indexes for performance
CREATE INDEX idx_bible_in_a_day_sessions_user_id ON bible_in_a_day_sessions(user_id);
CREATE INDEX idx_bible_in_a_day_section_progress_session_id ON bible_in_a_day_section_progress(session_id);
CREATE INDEX idx_bible_in_a_day_badges_user_id ON bible_in_a_day_badges(user_id);