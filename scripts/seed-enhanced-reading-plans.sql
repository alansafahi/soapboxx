-- Enhanced Reading Plans with Subscription Tiers
-- Insert comprehensive reading plans for different subscription levels

-- Free Tier Plans (Basic)
INSERT INTO reading_plans (name, description, type, duration, difficulty, category, subscription_tier, is_active) VALUES
('New Testament in a Year', 'Read through the entire New Testament with daily passages and reflection questions designed for consistent spiritual growth.', 'book_study', 365, 'beginner', 'new_testament', 'free', true),
('Old Testament in a Year', 'Journey through the Old Testament chronologically, discovering God''s redemptive plan from Genesis to Malachi.', 'book_study', 365, 'intermediate', 'old_testament', 'free', true),
('Daily Psalms', 'Experience the beauty and comfort of the Psalms with one psalm per day for 150 days.', 'devotional', 150, 'beginner', 'psalms', 'free', true);

-- Standard Tier Plans (Focus & Character Studies)
INSERT INTO reading_plans (name, description, type, duration, difficulty, category, subscription_tier, is_active) VALUES
('Gospels in 40 Days', 'Immerse yourself in the life and teachings of Jesus through a focused 40-day journey through Matthew, Mark, Luke, and John.', 'book_study', 40, 'beginner', 'gospels', 'standard', true),
('The Journey of David', 'Follow the life of King David from shepherd boy to king, exploring themes of faith, courage, and redemption.', 'character_study', 30, 'intermediate', 'character', 'standard', true),
('Paul''s Missionary Adventures', 'Trace the apostle Paul''s missionary journeys and discover principles for bold evangelism and church planting.', 'character_study', 28, 'intermediate', 'character', 'standard', true),
('Women of Faith', 'Study the remarkable women of the Bible and their examples of courage, faith, and devotion.', 'character_study', 21, 'beginner', 'character', 'standard', true),
('Forgiveness and Grace', 'A topical study exploring biblical passages about forgiveness, mercy, and God''s amazing grace.', 'topical', 14, 'beginner', 'forgiveness', 'standard', true);

-- Premium Tier Plans (AI-Powered & Advanced)
INSERT INTO reading_plans (name, description, type, duration, difficulty, category, subscription_tier, is_ai_generated, is_active) VALUES
('Chronological Bible Order', 'Read the Bible as events actually unfolded in history, with AI-enhanced contextual insights and historical background.', 'chronological', 365, 'advanced', 'chronological', 'premium', false, true),
('As It Happened', 'Experience biblical events in chronological sequence with AI-powered historical context and cultural insights.', 'chronological', 365, 'advanced', 'chronological', 'premium', false, true),
('Peace in Anxiety (AI Curated)', 'AI-selected verses and reflections specifically chosen to address anxiety and promote spiritual peace.', 'thematic', 7, 'beginner', 'peace', 'premium', true, true),
('Joy in Gratitude (AI Curated)', 'Discover joy through gratitude with AI-personalized scripture selections and reflection prompts.', 'thematic', 7, 'beginner', 'joy', 'premium', true, true),
('Psalms for a Quiet Mind (Audio)', 'Audio-focused plan featuring selected Psalms with guided meditation and peaceful reflection.', 'audio', 30, 'beginner', 'psalms', 'premium', false, true),
('Epistles for Morning Commute (Audio)', 'Audio Bible plan designed for busy mornings, featuring Paul''s letters with practical life applications.', 'audio', 21, 'beginner', 'epistles', 'premium', false, true);

-- Seed sample days for "Gospels in 40 Days" plan
INSERT INTO reading_plan_days (plan_id, day_number, title, scripture_reference, devotional_content, reflection_question, prayer_prompt, estimated_reading_time) VALUES
((SELECT id FROM reading_plans WHERE name = 'Gospels in 40 Days'), 1, 'The Birth of Jesus', 'Matthew 1:18-25, Luke 1:26-38', 'The Christmas story begins not with celebration but with faith. Mary''s acceptance of God''s plan teaches us about surrendering our will to His perfect purpose.', 'How can you surrender your plans to God''s greater purpose like Mary did?', 'Lord, help me to trust Your plans even when they seem impossible or uncomfortable.', 10),
((SELECT id FROM reading_plans WHERE name = 'Gospels in 40 Days'), 2, 'Jesus'' Baptism and Temptation', 'Matthew 3:13-17, Matthew 4:1-11', 'Jesus'' baptism marks the beginning of His public ministry, while His temptation shows us how to resist sin through Scripture and reliance on God.', 'What temptations do you face, and how can Scripture help you overcome them?', 'Father, strengthen me to resist temptation and follow Jesus'' example of obedience.', 12),
((SELECT id FROM reading_plans WHERE name = 'Gospels in 40 Days'), 3, 'The First Disciples', 'Matthew 4:18-22, Luke 5:1-11', 'Jesus calls ordinary fishermen to become fishers of men. His invitation is still extended to us today - to leave our nets and follow Him.', 'What "nets" might Jesus be calling you to leave behind to follow Him more fully?', 'Jesus, give me courage to respond to Your call and follow You wholeheartedly.', 8);

-- Seed sample days for "The Journey of David" character study
INSERT INTO reading_plan_days (plan_id, day_number, title, scripture_reference, devotional_content, reflection_question, prayer_prompt, character, estimated_reading_time) VALUES
((SELECT id FROM reading_plans WHERE name = 'The Journey of David'), 1, 'David the Shepherd Boy', '1 Samuel 16:1-13', 'God looks at the heart, not outward appearance. David''s anointing teaches us that God often chooses the unexpected to accomplish His purposes.', 'How has God used your seemingly ordinary background for His extraordinary purposes?', 'Lord, help me to see myself through Your eyes and trust that You can use me despite my limitations.', 'David', 10),
((SELECT id FROM reading_plans WHERE name = 'The Journey of David'), 2, 'David and Goliath', '1 Samuel 17:1-50', 'David''s victory over Goliath shows us that faith in God can overcome any giant we face. His confidence came from knowing God''s character.', 'What giants are you facing today, and how can you approach them with David''s faith?', 'God, You are bigger than any challenge I face. Help me to trust in Your power, not my own.', 'David', 15);

-- Seed AI-generated thematic plan sample
INSERT INTO reading_plan_days (plan_id, day_number, title, scripture_reference, devotional_content, reflection_question, prayer_prompt, tags, estimated_reading_time) VALUES
((SELECT id FROM reading_plans WHERE name = 'Peace in Anxiety (AI Curated)'), 1, 'God''s Perfect Peace', 'Philippians 4:6-7, Isaiah 26:3', 'When anxiety overwhelms, God offers His perfect peace that transcends understanding. This peace guards our hearts and minds through prayer and trust.', 'What anxieties can you surrender to God through prayer today?', 'Prince of Peace, replace my anxiety with Your perfect peace that surpasses all understanding.', ARRAY['peace', 'anxiety', 'prayer'], 5),
((SELECT id FROM reading_plans WHERE name = 'Peace in Anxiety (AI Curated)'), 2, 'Casting All Cares', '1 Peter 5:7, Psalm 55:22', 'God invites us to cast all our anxieties on Him because He cares for us. Our burdens are too heavy for us but not for Him.', 'How can you practically "cast" your worries onto God throughout your day?', 'Caring Father, I give You my worries and fears, trusting in Your loving care over my life.', ARRAY['peace', 'anxiety', 'trust'], 6);

-- Update reading plan durations to match actual content
UPDATE reading_plans SET duration = (
  SELECT COUNT(*) FROM reading_plan_days WHERE reading_plan_days.plan_id = reading_plans.id
) WHERE id IN (
  SELECT id FROM reading_plans WHERE name IN ('Gospels in 40 Days', 'The Journey of David', 'Peace in Anxiety (AI Curated)')
);