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
- **Impact**: Codebase is now production-ready with minimal technical debt and clean file structure