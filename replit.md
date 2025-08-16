# SoapBox Super App

## Overview
The SoapBox Super App is a comprehensive faith community platform designed to connect churches and believers through technology. It serves as a spiritual hub offering daily inspirations, prayer networks, community discussions, sermon management, and AI-powered pastoral tools. The project aims to provide a modern solution for spiritual engagement and church administration, capturing market potential in the faith technology sector.

### Production Ready Features (August 16, 2025)
**CRITICAL SECURITY LOCKDOWN - SYSTEM DISABLED (August 16, 2025)**
- **EMERGENCY SECURITY MEASURE**: Complete authentication system lockdown activated due to critical cross-user authentication vulnerability affecting multiple users across different browsers and machines.
- **Cross-User Authentication Crisis**: User "Chapin" automatically logged in as "Alan" profile across different browsers/machines - SEVERE SECURITY BREACH requiring immediate system shutdown.
- **All Authentication BLOCKED**: Emergency mode permanently activated - no users can login until root cause is completely identified and fixed. All sessions terminated and users blocked from re-authentication.
- **Session Auto-Repair Vulnerability**: Identified automatic session recovery mechanism that was causing cross-user authentication. Server-side authentication middleware was automatically creating sessions for users who should not have access.
- **Complete System Lockdown**: All users permanently blocked from authentication, all sessions deleted, automatic session recreation disabled, emergency mode set to permanent until manual security review and fix.
- **CLIENT-SIDE LOCKDOWN**: All automatic authentication checks disabled in useAuth.ts and immediateAuth.ts to prevent any client-side authentication attempts.
- **CURRENT STATUS**: System is completely secure but unusable - no login possible until vulnerability is fully resolved and authentication system is redesigned.

**Previous Enhancement: Chat Widget UX Optimization (August 16, 2025)**
- **Mobile Navigation Fix**: Removed floating chat widget that was overlapping with SOAP icon in mobile navigation. Relocated chat functionality to "Help & Support" section under Profile dropdown for better UX and cleaner design.
- **Integrated Help Center**: Created comprehensive help page with multiple support options including integrated chat modal, FAQ links, documentation access, and emergency contact information. Support hours clearly displayed with business hours for live chat.
- **Navigation Cleanup**: Eliminated visual conflicts on mobile devices while maintaining full chat functionality through Profile > Help & Support menu option

**Previous Enhancement: Production Code Cleanup & Navigation Optimization (August 15, 2025)**
- **Production Code Cleanup**: Removed all debug console logs, test alerts, and development-only code paths. Fixed TypeScript errors and optimized codebase for production deployment. Redirected redundant /discussions route to /community to eliminate duplicate functionality.
- **Mobile Navigation Streamline**: Updated bottom navigation to focus on core daily-use features - removed Events and Profile (accessible via top header), added S.O.A.P. as 4th primary navigation item alongside Home, Community, and Prayer for optimal spiritual engagement flow
- **SOAP Counter Persistence Fix**: Resolved Amen reaction counter persistence issue in SOAP journal posts by updating database queries to properly include reaction counts from soapReactions table in both getPublicSoapEntries and getSoapEntries functions
- **UI Consistency Achievement**: Completed icon-only button design across all social feed components (regular posts, SOAP journals, enhanced community feed) with uniform hover tooltips and grouped button layouts for professional appearance
- **Mobile Responsive Design**: Made My Communities page fully mobile responsive with adaptive layouts, responsive cards (1 col mobile, 2 tablet, 3 desktop), mobile-optimized sorting toggle, responsive typography, and proper mobile spacing
- **Navigation Cleanup**: Removed redundant `/admin?tab=community-admin` route references throughout codebase, standardizing on direct `/community-administration?communityId=X` routing for cleaner architecture and better UX
- **Navigation Streamline**: Abolished redundant `/discussions` route completely - all links now redirect to `/community`. Renamed navigation items: "Community" → "Group Chat" (user's joined groups), "Communities" → "Communities" (directory of available churches/ministries)
- **Settings Icon Fix**: Updated all settings icons to navigate directly to community-specific administration pages using proper community IDs rather than generic admin portal tabs
- **Navigation Rebranding**: Changed "Sermon Studio" to "Content Creation" across all navigation menus to better reflect dual-purpose functionality (sermons + Sunday School lessons)
- **Authentication System Enhancement**: Resolved JSON parsing errors by implementing robust error handling for HTML responses from failed API calls. Enhanced authentication middleware with multiple fallback mechanisms to handle session synchronization issues.
- **Community Form UX Enhancement**: Reordered community creation form fields to show "Community Type" above "Community Name" for better user flow. Made the name field dynamic so it displays "Church Name", "Ministry Name", or "Group Name" based on the selected community type, with appropriate placeholders for each type.

**Professional Sunday School Curriculum (August 15, 2025)**
- **Complete Reading Plan System**: 62 active reading plans across three subscription tiers (Disciple, Servant, Torchbearer) with authentic scripture integration
- **Enhanced Reflection Questions**: All reading plans feature scripture-specific, varied reflection questions that provide meaningful personal application
- **Missing Content Resolution**: Fixed "No daily content available" issues by restoring complete content for all major plans
- **AI-Powered Personalization**: EMI-driven custom reading plan generation with OpenAI GPT-4o integration  
- **Bible Translation Support**: Dynamic translation system supporting 13 active translations via Bible-API.com
- **Faith-Based Gamification System**: Complete SoapBox Points reward system with spiritually meaningful values (Prayer: 5pts, Amen: 3pts, Fire: 2pts, Heart: 1pt)
- **Community Engagement Features**: Enhanced discussion reactions, popup notifications, and leaderboard integration for community building
- **Production-Ready Codebase**: All TypeScript errors resolved (638 → 0), debug logging removed, authentication patterns standardized, ready for deployment
- **Enhanced Pricing Strategy**: Updated pricing page with actual reading plan counts (Disciple: 28, Servant: 53, Torchbearer: 69) and premium Torchbearer features including DIVINE volunteer management tools to drive subscription upgrades
- **Professional Sunday School Lesson Planning**: ✓ FULLY IMPLEMENTED & CUSTOMIZED - Enhanced with curriculum-quality standards matching published materials from major Christian publishers. Features story-specific activity generation with detailed teacher scripts, classroom management strategies, educational objectives, biblical accuracy, assessment methods, family engagement components, accessibility adaptations, and troubleshooting guidance. Activities are now fully customized to each specific Bible story/topic and tailored to exact age groups (preschool: 5-7 min activities, elementary: 8-12 min, middle: 12-18 min, high: 15-25 min) and class durations (short: 30-35 min, medium: 45-50 min, long: 60-75 min). System generates comprehensive, age-appropriate lesson plans with publisher-grade quality and teacher-ready materials that reference specific Bible characters, events, and narrative details.

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
- **AI-Powered Pastoral Suite**: Sermon Creation Studio with professional-quality Sunday School lesson planning that matches published curriculum standards. Features comprehensive 4-step workflow (Research → Plan → Activities → Lesson → Enhancement) with detailed teacher scripts, classroom management guidance, educational objectives, biblical accuracy verification, assessment methods, family engagement components, and accessibility adaptations. Content Distribution Hub with age-appropriate messaging, Engagement Analytics Dashboard.
- **Enhanced Bible Verse System**: SoapBox Bible cache, smart detection for scripture references, fast lookup API with centralized Bible Translation Configuration System.
- **Comprehensive Verification System**: Tiered verification (Email/SMS), Twilio integration for SMS, rate limiting, and user-friendly modals.
- **Comprehensive 120-Question Spiritual Assessment**: Advanced assessment with validity checks, 12 spiritual gift categories, and Likert scale scoring for spiritual profiling and ministry placement.
- **UI/UX Decisions**: Radix UI with Tailwind for consistent design, dynamic labeling, spiritual-themed custom icons, gradient color schemes, light/dark mode support, mobile-first responsive design, and unified visual hierarchy. Enhanced language selection with flag indicators.
- **System Design Choices**: Unified communication interface, multi-campus support, AI content moderation, role-based permissions, comprehensive field validation, dynamic form fields, and automated church verification.
- **Invite-Driven Onboarding**: Streamlined 4-step process including account creation, role selection, spiritual profile, and welcome setup, with automatic community association via invite links and email verification.

## External Dependencies

- **AI and ML Services**: OpenAI API (GPT-4o model).
- **Communication Services**: SendGrid (email delivery), Push Notifications, Social Media APIs.
- **Payment and Donations**: Stripe Integration (secure donation processing, subscription management).
- **Content and Media**: File storage, Audio processing, Image optimization.