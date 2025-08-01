# SoapBox Super App - Development Guide

## Overview
The SoapBox Super App is a comprehensive faith community platform. Its purpose is to connect churches and believers through technology, serving as a spiritual hub. Key capabilities include daily inspirations, prayer networks, community discussions, sermon management, and AI-powered pastoral tools. The project aims to capture market potential by offering a modern solution for spiritual engagement and church administration.

## User Preferences
Preferred communication style: Simple, everyday language.
Focus on functionality over technical implementation details.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack React Query for server state
- **Routing**: React Router for client-side routing
- **Build Tool**: Vite

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **AI Integration**: OpenAI GPT-4o for pastoral and content features

### Database Architecture
- **ORM**: Drizzle with Neon PostgreSQL
- **Schema Management**: Migration-based with drizzle-kit
- **Performance**: Comprehensive indexing strategy
- **Data Categories**: Users, churches, content, events, prayers, and Bible verses

### Key Features & Design Decisions
- **User Management**: Multi-role authentication (Owner, Admin, Pastor, Member) with church-scoped permissions and 2FA.
- **Church Management**: Multi-church support, event management (RSVP, check-in), member directory, volunteer and ministry management.
- **Spiritual Content**: Daily Bible reading (audio narration), S.O.A.P. journaling, prayer wall (anonymous/public), devotional content.
- **Community Features**: Discussion forums, social feed (spiritual emojis), direct messaging, content sharing.
- **AI-Powered Pastoral Suite**:
    - **Sermon Creation Studio**: Biblical research, AI outline generation, illustration library, theological accuracy enhancement.
    - **Content Distribution Hub**: Multi-platform content transformation, social media post generation, email newsletters, study guide development.
    - **Engagement Analytics Dashboard**: Real-time metrics, sentiment analysis, performance trends, ROI tracking.
- **Enhanced Bible Verse System**: SoapBox Bible cache (52 authentic verses), smart detection for scripture references, categories (Faith, Hope, Love, etc.), fast lookup API with ChatGPT fallback. User manages Bible import separately.
- **UI/UX Decisions**: Radix UI with Tailwind for consistent design, dynamic labeling for forms, spiritual-themed custom icons, gradient color schemes, light/dark mode support, mobile-first responsive design, consistent button styling, and unified visual hierarchy. Chat widget positioned bottom-right for mobile accessibility.
- **System Design Choices**: Unified communication interface, multi-campus support, AI content moderation (four-tier priority, multi-modal analysis, user-empowered edit requests), role-based permissions, comprehensive field validation, dynamic form fields, and automated church verification.

## External Dependencies

- **AI and ML Services**: OpenAI API (GPT-4o model).
- **Communication Services**: SendGrid (email delivery), Push Notifications, Social Media APIs (direct publishing to 11+ platforms).
- **Payment and Donations**: Stripe Integration (secure donation processing, subscription management).
- **Content and Media**: File storage, Audio processing, Image optimization.

## Recent Updates

### Navigation Menu Restoration (July 31, 2025)
- **Issue Resolved**: Fixed incomplete navigation menu missing critical admin and spiritual tools features
- **Root Cause**: Mobile navigation in TopHeader.tsx had outdated navigation structure  
- **Solution**: Created complete SidebarComplete.tsx component and updated TopHeader.tsx mobile navigation
- **Features Restored**: Staff Management, Member Management, Volunteer Management, Background Check Management, Reading Plans, Saved Reflections, Bookmarked Prayers, Engagement Board
- **Impact**: Complete feature access across desktop and mobile interfaces

### Dropdown Menu Z-Index Fix (July 31, 2025)
- **Issue Resolved**: Fixed dropdown menus not appearing properly in social feed posts and SOAP journal entries when dialogs are open
- **Root Cause**: Dropdown menus (z-50) were being covered by dialog overlays (z-50), causing z-index conflicts
- **Solution**: Updated UI components to use higher z-index values:
  - DropdownMenuContent: z-50 → z-[60]
  - DropdownMenuSubContent: z-50 → z-[60]  
  - SelectContent: z-50 → z-[60]
- **Impact**: All dropdown menus now properly appear above dialog modals, improving user interaction flow

### SOAP Entry Functionality Fixes (July 31, 2025)
- **Issue Resolved**: Fixed Amen reaction counter and reflection functionality in SOAP entries
- **Root Cause**: Counter wasn't updating immediately; reflection endpoint had authentication issues
- **Solution**: 
  - Added local state management with immediate UI updates for reaction counts
  - Fixed unified authentication handling in reflection/save endpoints (session + user claims)
  - Enhanced error handling and logging for debugging
- **Features Confirmed**: 
  - Self-reflection capability: Users can reflect on their own SOAP entries for deeper study
  - Progressive spiritual learning: Multiple reflection passes help memorize and internalize scripture
  - Personal growth tracking: Users can revisit and build upon their own insights over time
- **Impact**: Complete SOAP entry interaction functionality with optimistic UI updates and proper authentication

### Production Cleanup (August 1, 2025)
- **Issue Resolved**: Removed technical debt and development artifacts for production readiness
- **Actions Taken**:
  - Deleted 52 development screenshots and debug files from attached_assets
  - Removed 17 development documentation files (phase reports, audit reports, migration plans)
  - Eliminated console.log and debug statements across server and client code
  - Cleaned up test scripts and temporary development files
  - Preserved essential error logging for production monitoring
  - Removed all debug screenshots from attached_assets folder for final production deployment
- **Impact**: Codebase is now production-ready with minimal technical debt and clean file structure

### Database Field Standardization (August 1, 2025)
- **Issue Resolved**: Standardized all database references from `churchId` to `communityId` for consistency
- **Root Cause**: Mixed usage of `churchId` and `communityId` causing field mapping errors and null constraint violations
- **Solution**: 
  - Updated schema definitions across 28 database tables from `church_id` to `community_id`
  - Migrated all SQL queries and storage methods to use consistent field names
  - Fixed route handlers to use correct community association field (`userChurches[0].id`)
  - Updated relations and indexes to match new schema structure
  - Fixed prayer circle creation and reaction systems to use community terminology
- **Features Affected**: Events, SOAP entries, prayers, discussions, member management, staff operations, galleries, prayer circles, and all community-scoped functionality
- **Impact**: Complete elimination of field mapping errors, successful event creation and retrieval, consistent data architecture across entire application

### Prayer System Fixes (August 1, 2025)
- **Issue Resolved**: Fixed non-functional prayer reaction counters and prayer circle creation errors
- **Root Cause**: Missing storage methods for prayer reactions and undefined variable references in prayer circle creation
- **Solution**:
  - Added missing `togglePrayerReaction`, `getPrayerReactions`, and `getUserPrayerReactions` storage methods
  - Fixed prayer circle creation endpoint to properly handle user roles and community associations
  - Updated prayer reaction frontend to use correct API endpoints with optimistic UI updates
  - Standardized all references to use community terminology instead of church terminology
- **Impact**: Prayer reaction buttons now work properly with real-time counter updates, prayer circle creation functions without errors

### Contact and Engagement Board Fixes (August 1, 2025)
- **Issue Resolved**: Fixed contact display showing 0 instead of actual data and non-functional engagement board
- **Root Cause**: `getUserContacts` method was stubbed returning empty arrays; leaderboard API endpoint was broken
- **Solution**:
  - Fixed `getUserContacts` method to properly query database with JOIN for user details
  - Added `/api/user/score` endpoint to return actual user points from user_scores table  
  - Updated contacts page to use correct API endpoint for displaying points
  - Fixed leaderboard API with direct SQL query including proper ranking and scoring
- **Data Verified**: Alan's account correctly shows 6 contacts and 200 total points (no evidence of previous 600+ points)
- **Impact**: Contact page now displays accurate data; engagement board shows proper community rankings

### Profile Statistics and Leaderboard Fixes (August 1, 2025)
- **Issue Resolved**: Fixed profile statistics showing all zeros and leaderboard showing duplicate users
- **Root Cause**: `/api/users/stats` endpoint returned hardcoded zeros; leaderboard had duplicate user entries from multiple community associations
- **Solution**:
  - Updated stats endpoint to query actual database statistics instead of returning zeros
  - Fixed leaderboard query using DISTINCT ON to eliminate user duplicates
  - Updated streak API to pull from user_scores table where real streak data is stored
- **Data Verified**: Alan's profile now shows:
  - 34 prayers offered, 70 discussions created, 6 connections, 51 SOAP entries
  - 12-day current streak properly displayed with animated flame icon
  - Leaderboard shows unique users: Alan M. Safahi (200 pts), Alan Safahi (150 pts), Alan SGA (0 pts)
- **Impact**: Profile statistics display actual user engagement data; leaderboard shows proper community member rankings without duplicates

### Authentication and Enhanced Profile Schema Fixes (August 1, 2025)
- **Issue Resolved**: Fixed login failure with password "Test1234$$" and database schema inconsistencies
- **Root Cause**: Database missing enhanced profile columns (cover_photo_url, age_range, social_links, etc.) causing getUserByEmail to fail; password hash mismatch
- **Solution**:
  - Added all missing enhanced profile columns to users table: age_range, gender, church_affiliation, spiritual_stage, favorite_scriptures, ministry_interests, volunteer_interest, small_group, social_links, public_sharing, spiritual_score, prayer_prompt, growth_goals, current_reading_plan, show_bio_publicly, show_church_affiliation, share_with_group, show_age_range, show_location
  - Updated password hash for alan@soapboxsuperapp.com to correctly match "Test1234$$"
  - Removed debug logging from authentication endpoints
- **Database Schema**: Now fully supports enhanced profile system with 20+ new fields for comprehensive spiritual community engagement
- **Impact**: Authentication system working properly; enhanced profile functionality ready for deployment with full feature support

### Faith-Sensitive Invite-Driven Onboarding System (August 1, 2025)
- **System Implemented**: Complete invite-driven onboarding flow with progressive enhancement approach based on user-provided design document
- **Key Features Delivered**:
  - Streamlined 4-step onboarding process: Account Creation, Role Selection, Spiritual Profile (optional), Welcome & Setup
  - Faith-sensitive design with warm, spiritual messaging and role-based personalization
  - Progressive field collection: mandatory fields (name, email, password, role) → optional spiritual profile data
  - Automatic community association when users join via invite links from pastors/church leaders
  - Enhanced registration endpoint supporting new onboarding data structure with invite token processing
- **Technical Implementation**:
  - Created comprehensive OnboardingFlow.tsx component with step indicators and validation
  - Added `/api/invites/details/:token` endpoint for invite information lookup
  - Updated registration system to handle enhanced profile fields and invite token processing
  - Integrated with existing invitation system for automatic community association
  - Routes: `/onboarding` and `/onboarding/:token` for direct and invite-based access
- **User Experience**: Intuitive tabbed interface with progress tracking, role-based personalization, and skip options for optional fields
- **Impact**: Complete onboarding system ready for faith community deployment with invite-driven user acquisition and streamlined initial setup