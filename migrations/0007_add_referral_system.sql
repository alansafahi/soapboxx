-- Add referral system columns to users table
ALTER TABLE users ADD COLUMN referred_by VARCHAR;
ALTER TABLE users ADD COLUMN referral_code VARCHAR UNIQUE;

-- Create referrals table
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_id VARCHAR NOT NULL REFERENCES users(id),
    referee_id VARCHAR NOT NULL REFERENCES users(id),
    referral_code VARCHAR NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    referrer_points_awarded INTEGER DEFAULT 0,
    referee_points_awarded INTEGER DEFAULT 0,
    referrer_rewarded_at TIMESTAMP,
    referee_rewarded_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create referral_rewards table
CREATE TABLE referral_rewards (
    id SERIAL PRIMARY KEY,
    tier VARCHAR(20) NOT NULL,
    min_referrals INTEGER NOT NULL,
    referrer_base_points INTEGER DEFAULT 500,
    referee_welcome_points INTEGER DEFAULT 250,
    tier_bonus_points INTEGER DEFAULT 0,
    bonus_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create referral_milestones table
CREATE TABLE referral_milestones (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    milestone_type VARCHAR(50) NOT NULL,
    total_referrals INTEGER NOT NULL,
    bonus_points INTEGER NOT NULL,
    badge_awarded VARCHAR(100),
    achieved_at TIMESTAMP DEFAULT NOW(),
    points_awarded BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default referral reward tiers
INSERT INTO referral_rewards (tier, min_referrals, referrer_base_points, referee_welcome_points, tier_bonus_points, bonus_description) VALUES
('bronze', 0, 500, 250, 0, 'Base referral rewards for new community builders'),
('silver', 5, 750, 300, 100, 'Enhanced rewards for dedicated evangelists'),
('gold', 15, 1000, 400, 250, 'Premium rewards for spiritual mentors'),
('platinum', 50, 1500, 500, 500, 'Elite rewards for kingdom multipliers');

-- Create indexes for performance
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referral_milestones_user_id ON referral_milestones(user_id);
CREATE INDEX idx_users_referral_code ON users(referral_code);