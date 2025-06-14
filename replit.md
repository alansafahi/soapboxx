# SoapBox Super App - Development Guide

## Overview
SoapBox Super App is a comprehensive faith community platform that connects churches and believers through modern technology. The application serves as a spiritual hub featuring daily inspirations, prayer networks, community discussions, sermon management, and AI-powered pastoral tools.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack React Query for server state
- **Routing**: React Router for client-side routing
- **Build Tool**: Vite for fast development and building

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **AI Integration**: OpenAI GPT-4o for pastoral and content features

### Database Architecture
- **ORM**: Drizzle with Neon PostgreSQL
- **Schema Management**: Migration-based with drizzle-kit
- **Performance**: Comprehensive indexing strategy for high-traffic queries
- **Data Categories**: Users, churches, content, events, prayers, and Bible verses

## Key Components

### Core Platform Features
1. **User Management System**
   - Multi-role authentication (Owner, Admin, Pastor, Member, etc.)
   - Church-scoped permissions with hierarchical access control
   - Two-factor authentication with TOTP support

2. **Church Management Portal**
   - Multi-church support with regional administration
   - Event management with RSVP and check-in systems
   - Member directory with privacy controls
   - Volunteer coordination and ministry management

3. **Spiritual Content Systems**
   - Daily Bible reading with audio narration
   - S.O.A.P. (Scripture, Observation, Application, Prayer) journaling
   - Prayer wall with anonymous and public options
   - Devotional content management

4. **Community Features**
   - Discussion forums with moderation capabilities
   - Social feed with spiritual emoji reactions (🙏, ✝️, 🕊️, etc.)
   - Direct messaging between members
   - Content sharing and engagement tracking

### AI-Powered Pastoral Suite
1. **Sermon Creation Studio** (`/sermon-studio`)
   - Biblical research assistant with commentary integration
   - AI-powered sermon outline generation
   - Illustration library with relevance scoring
   - Content enhancement for theological accuracy

2. **Content Distribution Hub** (`/content-distribution`)
   - Multi-platform content transformation
   - Social media post generation (Facebook, Twitter, Instagram, etc.)
   - Email newsletter creation with automated campaigns
   - Small group study guide development

3. **Engagement Analytics Dashboard** (`/engagement-analytics`)
   - Real-time engagement metrics tracking
   - Feedback sentiment analysis with AI insights
   - Performance trends and optimization recommendations
   - ROI tracking for pastoral time investment

### Enhanced Bible Verse System
- **Database**: 1000+ categorized Bible verses across 12 spiritual themes
- **Smart Detection**: Auto-population of scripture references in text areas
- **Categories**: Anxiety, Core, Faith, Forgiveness, Gratitude, Hope, Joy, Love, Peace, Purpose, Strength, Wisdom
- **API**: Fast lookup and topic-based search capabilities

## Data Flow

### Authentication Flow
1. User registration with email verification
2. Church assignment and role-based permissions
3. Session management with secure cookie storage
4. Multi-factor authentication for enhanced security

### Content Creation Flow
1. User creates content (posts, prayers, events)
2. Role-based moderation and approval process
3. Publishing to appropriate community scopes
4. Engagement tracking and analytics collection

### AI Pastoral Workflow
1. Pastor inputs sermon topic or content requirements
2. AI research assistant provides biblical context and commentary
3. Automated outline generation with customizable parameters
4. Content distribution across multiple platforms
5. Engagement analytics with actionable insights

## External Dependencies

### AI and ML Services
- **OpenAI API**: GPT-4o model for content generation and analysis
- **Contextual Processing**: Liturgical calendar and world events integration
- **Sentiment Analysis**: Feedback processing and community insights

### Communication Services
- **SendGrid**: Email delivery for notifications and newsletters
- **Push Notifications**: Smart scheduling with quiet hours support
- **Social Media APIs**: Direct publishing to 11+ platforms

### Payment and Donations
- **Stripe Integration**: Secure donation processing
- **Subscription Management**: Premium feature access
- **Financial Reporting**: Automated tax documentation

### Content and Media
- **File Storage**: Sermon media and user-generated content
- **Audio Processing**: Bible narration and sermon recordings
- **Image Optimization**: Profile pictures and event media

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20 with replit.dev hosting
- **Database**: Neon PostgreSQL serverless
- **Build Process**: Vite development server on port 5000
- **Hot Reload**: Automatic code reloading for development

### Production Deployment
- **Target**: Autoscale deployment with load balancing
- **Build Command**: `npm run build` (Vite + esbuild)
- **Start Command**: `npm run start` (production Node.js)
- **Port Configuration**: Internal 5000, external 80
- **Environment**: Production-optimized with compression and caching

### Database Management
- **Migrations**: Drizzle-kit for schema changes
- **Performance**: Indexed queries for sub-200ms response times
- **Backup**: Automated backups with export capabilities
- **Monitoring**: Query performance and error tracking

## Recent Changes
- June 14, 2025: Implemented comprehensive bulk communication system for church leadership
  - Multi-channel messaging: email, push notifications, in-app alerts, SMS framework
  - Emergency broadcast system with immediate delivery to all church members
  - Professional message templates for announcements, emergencies, and prayer requests
  - Role-based access control limited to pastors and church leadership
  - Integrated into Admin Portal navigation for better organization and discoverability
  - Fixed JSON parsing errors and added multiple target audience options (roles/departments)
- June 14, 2025: Fixed Prayer Wall functionality and filtering
  - Added sample prayer requests to populate empty Prayer Wall
  - Fixed urgent prayer filtering to properly show prayers marked as urgent
  - Resolved JSON encoding issues preventing prayer request submissions
  - Prayer Wall now displays 8+ prayer requests across all categories properly
- June 13, 2025: Enhanced Scripture lookup system with smart matching strategies
  - Added individual verse Matthew 11:28 to database for better coverage
  - Improved partial reference matching (e.g., "Matthew 11:28" finds "Matthew 11:28-30")
  - Enhanced error messages with helpful suggestions instead of technical warnings
  - Removed lookup button and changed "Bible Version" to "Look Up With" for cleaner UX

## Changelog
- June 13, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.
Focus on functionality over technical implementation details.