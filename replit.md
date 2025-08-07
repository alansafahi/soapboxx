# SoapBox Super App

## Overview
The SoapBox Super App is a comprehensive faith community platform designed to connect churches and believers through technology. It serves as a spiritual hub offering daily inspirations, prayer networks, community discussions, sermon management, and AI-powered pastoral tools. The project aims to provide a modern solution for spiritual engagement and church administration, capturing market potential in the faith technology sector.

**Recent Status**: COMPLETED comprehensive points system consolidation with ALL reward values implemented according to comprehensive requirements. Fixed all incorrect point values: Discussion posts (20pts), Prayer requests (25pts), Discussion likes (1pt), S.O.A.P. entries (15pts). Implemented ALL missing reward functions: Contact adding (10pts), First AI usage (10pts), Group creation (50pts), Group joining (10pts), Event volunteering (15pts), Event check-ins (25pts), Referral rewards (500pts each), S.O.A.P. streaks (50pts). Centralized `addPointsToUser` function now handles 100% of point-awarding activities with detailed reason tracking. Database schema fully migrated with `userPoints` table and enhanced `pointTransactions` with entity tracking. Enhanced milestone service integrated with streak detection and achievement unlocking. System provides complete foundation for gamified user engagement with comprehensive reward structure covering all 13 activity categories from requirements document.

**Production Ready**: SoapBox Super App fully optimized for production deployment with complete codebase cleanup. Prayer request system, QR Code Management, and Growth-Focused Reward System all operational with comprehensive 4-tier privacy controls and media upload capabilities. QR Code Management provides complete CRUD operations with role-based permissions. Enhanced reward system implements competitive point structure: Discussions (20), Prayer Requests (25), Events (25), S.O.A.P. Entries (15), Prayer Responses (5), Referrals (500), and First AI Usage (10). Production optimizations include: removed all debugging code, console statements, and development artifacts; cleaned up TypeScript issues; optimized build size (5.6MB); removed test files and temporary assets. System ready for immediate production deployment with clean, optimized codebase.

**Latest Enhancement**: Enhanced Bible Translation system with LSB (Legacy Standard Bible) support. System now supports 13 active translations including the newly added Legacy Standard Bible by Grace Community Church and existing NASB support. Fixed dynamic Bible Translation system with complete SBX-STD-004 compliance. System properly handles user's Bible translation preference as a dynamic value that can change at any moment. Fixed auto-save functionality in Profile Editor (corrected database field mapping). All Scripture lookups use current user preference dynamically. Centralized configuration system supports comprehensive API fallback hierarchy. SOAP Entry Form and all components respect real-time changes to user's Bible translation selection.

**Latest Enhancement**: Implemented comprehensive Growth-Focused Strategy with updated reward system and pricing optimization. Successfully updated all point values: Discussions (20 points), Prayer Requests (25 points), Events Attended (25 points), S.O.A.P. Entries (15 points), Prayer Responses (5 points), and Referral Rewards (500 points for both referrer and referee). Added AI feature tracking with 10-point first-time bonus for AI-assisted S.O.A.P. features including suggestions, enhancement, questions, and AI-assist. Implemented processReferralReward function with updated 500-point referral system and bronze/silver/gold/platinum tier structure. Enhanced all AI endpoints (/api/soap/ai/suggestions, /api/soap/ai/enhance, /api/soap/ai/questions, /api/soap/ai-assist) with first-time usage tracking. **Spiritual Plan Names**: Transformed all pricing with biblical inspiration - Individual Plans: Disciple Plan (Free, "Walk with Christ each day"), Servant Plan ($5/mo, "Serve faithfully and grow deeply"), Torchbearer Plan ($10/mo, "Shine your light further"). Church Plans: Shepherd Plan ($50/mo, "Guide your flock with love and order"), Beacon Plan ($100/mo, "Shine brighter, reach farther"), Kingdom Plan ($250/mo, "Lead with vision, empower the body"). Enhanced three-tier church structure with spiritual iconography (🐑🕯️👑) and progressive features for small churches to mega ministries. Each plan includes detailed spiritual features matching comprehensive specifications from user requirements. Implemented enhanced Credit Boost Pack pricing: Small ($25, 2,500 credits), Medium ($50, 6,000 credits), Large ($100, 12,500 credits) - significantly increased credit amounts while maintaining same prices to improve value proposition and encourage higher-tier purchases. **Enhanced Church Loyalty Rewards**: Updated Pastor Essential plan to include 2,500 loyalty credits every 6 months (increased from 1,000) and Shepherd Advanced to include 5,000 loyalty credits every 6 months (increased from 2,000), providing significantly better value for church subscribers. **Grace-Driven Messaging**: Transformed pricing language to spiritual-focused messaging with biblical taglines, button text changed to aspirational calls like "Begin Your Journey", "Step Deeper", "Strengthen Your Ministry", "Expand Your Reach", and "Transform Your Calling". **Enhanced Gamification**: Added comprehensive gamification database schema with missions, enhanced badges, and streak tracking systems to complement existing reward infrastructure. Created AchievementCelebration UI component with grace-driven messaging for milestone celebrations. Updated all pricing information across simple-landing.tsx, FAQ, comprehensive-knowledge.ts, ChatWidget, and routes.ts for consistency. System now fully aligned with competitive growth strategy, spiritual messaging, and improved user engagement incentives.

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
- **AI-Powered Pastoral Suite**: Sermon Creation Studio, Content Distribution Hub, Engagement Analytics Dashboard.
- **Enhanced Bible Verse System**: SoapBox Bible cache (52 authentic verses), smart detection for scripture references, categories, fast lookup API with centralized Bible Translation Configuration System ensuring consistent translation support across all components.
- **Comprehensive Verification System**: Tiered verification approach - Level 1 (Email OR SMS choice), Level 2 (Both email and SMS), Level 3 (Leadership with additional verification). Complete SMS verification integration with Twilio, phone number validation, rate limiting (3 attempts/hour), 10-minute expiration, resend cooldown, and user-friendly verification modals with real-time countdown timers.
- **Comprehensive 120-Question Spiritual Assessment**: Advanced assessment system with built-in validity checks through redundant questioning and inverse statements to detect social desirability bias and ensure accurate results. Features 12 spiritual gift categories (Leadership, Teaching, Mercy, Administration, Evangelism, Service, Encouragement, Giving, Hospitality, Faith, Wisdom, Prayer) with 10 questions each. Includes inverse statements at strategic points to catch inconsistent responses and validate authenticity. Uses traditional 5-point Likert scale (Strongly Disagree to Strongly Agree) for algorithmic scoring rather than self-identification. Role-based requirements make assessment mandatory for Church Admin roles while optional for general members. Features detailed spiritual profiling, ministry placement recommendations, leadership development pathways, and comprehensive community integration guidance.
- **UI/UX Decisions**: Radix UI with Tailwind for consistent design, dynamic labeling, spiritual-themed custom icons, gradient color schemes, light/dark mode support, mobile-first responsive design, consistent button styling, and unified visual hierarchy. Enhanced language selection with flag indicators and custom language input. Chat widget positioned bottom-right.
- **System Design Choices**: Unified communication interface, multi-campus support, AI content moderation (four-tier priority, multi-modal analysis, user-empowered edit requests), role-based permissions, comprehensive field validation, dynamic form fields, and automated church verification.
- **Invite-Driven Onboarding**: Streamlined 4-step process including account creation, role selection, spiritual profile, and welcome setup. Supports automatic community association via invite links and includes email verification with gentle reminders and security protection.

## External Dependencies

- **AI and ML Services**: OpenAI API (GPT-4o model).
- **Communication Services**: SendGrid (email delivery), Push Notifications, Social Media APIs.
- **Payment and Donations**: Stripe Integration (secure donation processing, subscription management).
- **Content and Media**: File storage, Audio processing, Image optimization.
```