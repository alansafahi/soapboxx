-- Test Users for Comprehensive Verification Testing
-- Password for all users: TestPass123!

-- Clear existing test users
DELETE FROM user_communities WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@soapboxtest.com'
);
DELETE FROM users WHERE email LIKE '%@soapboxtest.com';

-- Create test community if it doesn't exist
INSERT INTO communities (name, description, denomination_tradition, address, city, state, zip_code, country, is_verified, verification_status, created_by)
VALUES ('Test Community', 'Test community for verification testing', 'Non-denominational', '123 Test Street', 'Test City', 'TS', '12345', 'USA', true, 'approved', 'system')
ON CONFLICT (name) DO NOTHING;

-- Get community ID for reference
DO $$
DECLARE
    test_community_id INTEGER;
    user_id_var TEXT;
BEGIN
    SELECT id INTO test_community_id FROM communities WHERE name = 'Test Community';
    
    -- Member role - all verification stages
    INSERT INTO users (
        email, username, first_name, last_name, password,
        email_verified, phone_verified, mobile_number,
        email_verification_token, email_verification_sent_at,
        has_completed_onboarding, is_discoverable, profile_complete,
        created_at, updated_at
    ) VALUES 
    -- Completely new member
    ('member.new@soapboxtest.com', 'member_new', 'Alex', 'Member', 
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     false, false, null,
     'test_token_member_new', NOW(),
     true, true, true, NOW(), NOW()),
    
    -- Email verified member
    ('member.email@soapboxtest.com', 'member_email', 'Jordan', 'EmailMember',
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     true, false, null,
     null, null,
     true, true, true, NOW(), NOW()),
    
    -- SMS verified member  
    ('member.sms@soapboxtest.com', 'member_sms', 'Casey', 'SMSMember',
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     false, true, '+15551234567',
     'test_token_member_sms', NOW(),
     true, true, true, NOW(), NOW()),
     
    -- Church Leader role - all verification stages  
    ('leader.new@soapboxtest.com', 'leader_new', 'Morgan', 'Leader',
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     false, false, null,
     'test_token_leader_new', NOW(),
     true, true, true, NOW(), NOW()),
     
    ('leader.email@soapboxtest.com', 'leader_email', 'Taylor', 'EmailLeader',
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     true, false, null,
     null, null,
     true, true, true, NOW(), NOW()),
     
    ('leader.sms@soapboxtest.com', 'leader_sms', 'River', 'SMSLeader',
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     false, true, '+15551234568',
     'test_token_leader_sms', NOW(),
     true, true, true, NOW(), NOW()),
     
    -- Volunteer role - all verification stages
    ('volunteer.new@soapboxtest.com', 'volunteer_new', 'Sage', 'Volunteer',
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     false, false, null,
     'test_token_volunteer_new', NOW(),
     true, true, true, NOW(), NOW()),
     
    ('volunteer.email@soapboxtest.com', 'volunteer_email', 'Avery', 'EmailVolunteer',
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     true, false, null,
     null, null,
     true, true, true, NOW(), NOW()),
     
    ('volunteer.sms@soapboxtest.com', 'volunteer_sms', 'Quinn', 'SMSVolunteer',
     '$2b$12$701fPmvIzORbx9Ys9mP3e.TtvYQbZqBiuwrD52IfZHq6TS.1jWKgu',
     false, true, '+15551234569',
     'test_token_volunteer_sms', NOW(),
     true, true, true, NOW(), NOW());

    -- Add users to community with appropriate roles
    FOR user_id_var IN 
        SELECT id FROM users WHERE email LIKE '%@soapboxtest.com'
    LOOP
        INSERT INTO user_communities (user_id, community_id, role, is_active, joined_at)
        VALUES (
            user_id_var, 
            test_community_id,
            CASE 
                WHEN user_id_var IN (SELECT id FROM users WHERE email LIKE 'leader.%@soapboxtest.com') THEN 'Pastor'
                ELSE 'Member'
            END,
            true,
            NOW()
        );
    END LOOP;
    
END $$;