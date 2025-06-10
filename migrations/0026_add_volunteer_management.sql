-- Create volunteer management system tables

-- Volunteer roles
CREATE TABLE volunteer_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  required_skills TEXT[],
  department VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer profiles
CREATE TABLE volunteers (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  church_id INTEGER REFERENCES churches(id),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  date_of_birth DATE,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  skills TEXT[],
  interests TEXT[],
  availability JSONB,
  background_check BOOLEAN DEFAULT false,
  background_check_date DATE,
  orientation BOOLEAN DEFAULT false,
  orientation_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer role assignments
CREATE TABLE volunteer_role_assignments (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id),
  role_id INTEGER NOT NULL REFERENCES volunteer_roles(id),
  assigned_by VARCHAR NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP,
  notes TEXT
);

-- Volunteer opportunities/events
CREATE TABLE volunteer_opportunities (
  id SERIAL PRIMARY KEY,
  church_id INTEGER REFERENCES churches(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  role_id INTEGER REFERENCES volunteer_roles(id),
  coordinator_id VARCHAR REFERENCES users(id),
  location VARCHAR(200),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  volunteers_needed INTEGER DEFAULT 1,
  volunteers_registered INTEGER DEFAULT 0,
  required_skills TEXT[],
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern JSONB,
  status VARCHAR(20) DEFAULT 'open',
  priority VARCHAR(20) DEFAULT 'medium',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer registrations for opportunities
CREATE TABLE volunteer_registrations (
  id SERIAL PRIMARY KEY,
  opportunity_id INTEGER NOT NULL REFERENCES volunteer_opportunities(id),
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'registered',
  notes TEXT,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,
  hours_served DECIMAL(4,2),
  feedback TEXT,
  rating INTEGER
);

-- Volunteer hour tracking
CREATE TABLE volunteer_hours (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id),
  opportunity_id INTEGER REFERENCES volunteer_opportunities(id),
  role_id INTEGER REFERENCES volunteer_roles(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hours_served DECIMAL(4,2) NOT NULL,
  description TEXT,
  verified_by VARCHAR REFERENCES users(id),
  verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer certifications/training
CREATE TABLE volunteer_certifications (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id),
  name VARCHAR(100) NOT NULL,
  issuing_organization VARCHAR(100),
  issued_date DATE,
  expiration_date DATE,
  certificate_number VARCHAR(100),
  document_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT false,
  verified_by VARCHAR REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Volunteer communication/notifications
CREATE TABLE volunteer_communications (
  id SERIAL PRIMARY KEY,
  from_user_id VARCHAR NOT NULL REFERENCES users(id),
  to_volunteer_id INTEGER REFERENCES volunteers(id),
  opportunity_id INTEGER REFERENCES volunteer_opportunities(id),
  type VARCHAR(20) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'sent'
);

-- Volunteer awards/recognition
CREATE TABLE volunteer_awards (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id),
  award_type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  hours_threshold INTEGER,
  years_threshold INTEGER,
  awarded_by VARCHAR NOT NULL REFERENCES users(id),
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_url VARCHAR(500),
  is_public BOOLEAN DEFAULT true
);

-- Volunteer feedback and surveys
CREATE TABLE volunteer_feedback (
  id SERIAL PRIMARY KEY,
  volunteer_id INTEGER NOT NULL REFERENCES volunteers(id),
  opportunity_id INTEGER REFERENCES volunteer_opportunities(id),
  feedback_type VARCHAR(20) NOT NULL,
  rating INTEGER,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'open',
  reviewed_by VARCHAR REFERENCES users(id),
  reviewed_at TIMESTAMP,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample volunteer roles
INSERT INTO volunteer_roles (name, description, required_skills, department) VALUES
('Greeter', 'Welcome visitors and members at church entrances', ARRAY['communication', 'friendly demeanor'], 'Hospitality'),
('Usher', 'Assist with seating and maintain order during services', ARRAY['organization', 'crowd management'], 'Hospitality'),
('Children''s Ministry Helper', 'Assist with children''s programs and activities', ARRAY['childcare', 'patience', 'background check'], 'Children''s Ministry'),
('Sound Technician', 'Operate audio equipment during services', ARRAY['technical skills', 'audio equipment'], 'Technical'),
('Setup/Cleanup Crew', 'Help setup and cleanup before/after events', ARRAY['physical work', 'teamwork'], 'Facilities'),
('Food Service', 'Prepare and serve meals at church events', ARRAY['food handling', 'cooking'], 'Kitchen'),
('Youth Leader', 'Lead and mentor youth programs', ARRAY['youth ministry', 'leadership', 'background check'], 'Youth Ministry'),
('Prayer Team', 'Provide prayer support during services and events', ARRAY['prayer ministry', 'compassion'], 'Prayer'),
('Worship Team', 'Lead worship through music and singing', ARRAY['musical ability', 'worship leadership'], 'Worship'),
('Administrative Support', 'Help with office tasks and data entry', ARRAY['computer skills', 'organization'], 'Administration');