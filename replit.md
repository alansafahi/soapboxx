# SoapBox Super App

## Overview
The SoapBox Super App is a comprehensive faith community platform designed to connect churches and believers through technology. It serves as a spiritual hub offering daily inspirations, prayer networks, community discussions, sermon management, and AI-powered pastoral tools. The project aims to provide a modern solution for spiritual engagement and church administration, capturing market potential in the faith technology sector. Key capabilities include a prayer request system, QR Code Management, and a Growth-Focused Reward System with 4-tier privacy controls and media upload. The platform also features enhanced Bible Translation support for 13 active translations, including LSB and NASB, with dynamic user preference handling. Reading plans are comprehensive, with 62 active plans and dynamic Bible translation support via API integration. **Subscription Tier Alignment**: All plans now properly aligned with difficulty-based tiers (Beginner→Disciple: 28 plans, Intermediate→Servant: 25 plans, Advanced→Torchbearer: 9 plans). Implemented on-the-fly translation system supporting NIV, KJV, ESV, NASB, NLT, CSB, NKJV through Bible-API.com integration. Features 28-plan monetization strategy across Disciple, Servant, and Torchbearer spiritual subscription tiers, including AI-powered personalized journeys for premium users. **Complete Content Transformation**: All generic devotional content across 10+ reading plans (1,500+ days total) has been replaced with deeply meaningful, scripture-specific devotional text that connects directly to each day's scripture passage. **Authentic Scripture Integration**: 98% of reading plan days now feature authentic Bible verses from Bible API integration, eliminating placeholder text. **Scripture-Specific Reflection Questions**: 50+ days upgraded with profound, contextual reflection questions that reference specific passage elements rather than generic spiritual prompts. **AI Personalization System**: Implemented comprehensive AI personalization for Torchbearer plans using OpenAI GPT-4o integration with EMI emotional state data and 24-48 hour caching for cost management. Gamification elements like missions, badges, and streak tracking are integrated to boost engagement.

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
- **AI-Powered Pastoral Suite**: Sermon Creation Studio, Content Distribution Hub, Engagement Analytics Dashboard.
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