# SoapBox Super App

## Overview
The SoapBox Super App is a comprehensive faith community platform designed to connect churches and believers through technology. It serves as a spiritual hub offering daily inspirations, prayer networks, community discussions, sermon management, and AI-powered pastoral tools. The project aims to provide a modern solution for spiritual engagement and church administration, capturing market potential in the faith technology sector.

## Recent Changes
**August 16, 2025 - Topics System Implementation & UX Clarity Improvements**
- Implemented new Topics system to replace "Discussions" throughout the application
- Enhanced TopicsPage.tsx with single "Discussions" tab for threaded conversations
- Removed confusing "Posts" tab from Topics page to eliminate UX ambiguity with Social Feed
- Updated terminology: "Posts" → "Discussions", "New Post" → "Start Discussion" in Topics context
- Connected Topics to real backend API (/api/discussions) with proper data transformation
- Added visual enhancements: "New" badges, last replier info, improved discussion cards
- Implemented category filtering (Bible Study, Youth, Prayer Requests, etc.)
- Added mobile floating action button (FAB) for ergonomic discussion creation
- Fixed all navigation references: Desktop sidebar, mobile hamburger menu, and bottom nav now show "Topics"
- Enhanced centralized navigation system with proper mobile/desktop filtering
- Resolved all TypeScript compilation errors and backend connection issues

**August 16, 2025 - Critical Debugging and Restoration Complete**
- Successfully resolved all TypeScript compilation errors (570+ errors reduced to 0)
- Fixed database schema field name mismatches (snake_case vs camelCase)
- Resolved HTTP header configuration issues blocking app startup
- Restored full application functionality with authentication working
- User "SBdemo" successfully authenticating and app running smoothly
- All backend storage operations now properly typed and functional

## User Preferences
Preferred communication style: Simple, everyday language.
Focus on functionality over technical implementation details.
Language support priority: Farsi and Armenian above Arabic, Korean above Japanese, Hindi at end.
Visual enhancements: Flag icons for language selection.
Future consideration: Implement same language list on main website (soapboxsuperapp.com).
Code quality emphasis: No hardcoded values in production - all user preferences, settings, and configurations must be dynamically loaded from database/user profiles. Bible translation preferences are completely dynamic (user can change at any moment) - system must always use current user selection, never assume specific translations. Centralized configuration systems for all lookup lists (Bible translations, languages, etc.) maintained in `/shared/` directory.

## System Architecture

### Frontend
- **Framework**: React with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: React Router
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with secure cookies
- **AI Integration**: OpenAI GPT-4o

### EMI (Enhanced Mood Indicators) Logic
- **Conditional Display**: EMI appears only when user has Torchbearer subscription AND no recent EMI data (within 24 hours)
- **Smart Context Awareness**: Leverages existing EMI data from recent check-ins rather than always prompting
- **Subscription Tier Alignment**: EMI collection only occurs when AI personalization is available, preventing user confusion
- **User Experience**: Clear messaging explains when EMI is active, when recent data is being used, or when upgrade is needed

### Database
- **ORM**: Drizzle with Neon PostgreSQL
- **Schema Management**: Migration-based with drizzle-kit
- **Performance**: Comprehensive indexing strategy
- **Data Categories**: Users, churches, content, events, prayers, and Bible verses

### Key Features & Design Decisions
- **User Management**: Multi-role authentication (Owner, Admin, Pastor, Member) with church-scoped permissions and 2FA.
- **Church Management**: Multi-church support, event management (RSVP, check-in), member directory, volunteer and ministry management.
- **Spiritual Content**: Daily Bible reading (audio narration), S.O.A.P. journaling, prayer wall, devotional content.
- **Community Features**: Discussion forums, social feed, direct messaging, content sharing.
- **AI-Powered Pastoral Suite**: Sermon Creation Studio with professional-quality Sunday School lesson planning (4-step workflow: Research → Plan → Activities → Lesson → Enhancement, with detailed teacher scripts, classroom management, educational objectives, biblical accuracy, assessment, family engagement, and accessibility). Content Distribution Hub with age-appropriate messaging, Engagement Analytics Dashboard.
- **Enhanced Bible Verse System**: SoapBox Bible cache, smart detection for scripture references, fast lookup API with centralized Bible Translation Configuration System.
- **Comprehensive Verification System**: Tiered verification (Email/SMS), Twilio integration for SMS, rate limiting, and user-friendly modals.
- **Comprehensive 120-Question Spiritual Assessment**: Advanced assessment with validity checks, 12 spiritual gift categories, and Likert scale scoring for spiritual profiling and ministry placement.
- **UI/UX Decisions**: Radix UI with Tailwind for consistent design, dynamic labeling, spiritual-themed custom icons, gradient color schemes, light/dark mode support, mobile-first responsive design, and unified visual hierarchy. Enhanced language selection with flag indicators. Chat functionality under "Help & Support" in Profile dropdown.
- **System Design Choices**: Unified communication interface, multi-campus support, AI content moderation, role-based permissions, comprehensive field validation, dynamic form fields, and automated church verification.
- **Invite-Driven Onboarding**: Streamlined 4-step process including account creation, role selection, spiritual profile, and welcome setup, with automatic community association via invite links and email verification.
- **Gamification**: Complete SoapBox Points reward system with spiritually meaningful values.
- **Reading Plans**: 62 active reading plans across three subscription tiers with scripture integration and enhanced reflection questions.

## External Dependencies

- **AI and ML Services**: OpenAI API (GPT-4o model).
- **Communication Services**: SendGrid (email delivery), Push Notifications.
- **Payment and Donations**: Stripe Integration (secure donation processing, subscription management).
- **Content and Media**: File storage, Audio processing, Image optimization.
- **Bible API**: Bible-API.com (for dynamic translation support).
- **Twilio**: For SMS verification.