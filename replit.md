# SoapBox Super App

## Overview
The SoapBox Super App is a comprehensive faith community platform designed to connect churches and believers through technology. It serves as a spiritual hub offering daily inspirations, prayer networks, community discussions, sermon management, and AI-powered pastoral tools. The project aims to provide a modern solution for spiritual engagement and church administration, capturing market potential in the faith technology sector.

**Recent Status**: Successfully restructured onboarding flow to prioritize user experience and reduce friction. Moved spiritual assessment from mandatory step 4 to optional end-of-flow choice, allowing users to complete core onboarding (account creation, role selection, profile setup) before deciding on personalized spiritual content. Fixed AI content generation JSON parsing errors and improved user name display handling.

**Latest Update**: Expanded Comprehensive Spiritual Assessment to 120 questions across 12 detailed sections including leadership experience, ministry interests, personality traits, and spiritual gifts indicators. Implemented role-based requirements making the full assessment mandatory for Church Admin roles (Admin, Church Admin, Owner) while keeping it optional for other user roles. Enhanced assessment covers spiritual maturity evaluation, ministry placement recommendations, leadership development insights, and comprehensive spiritual profiling for optimal community integration.

## User Preferences
Preferred communication style: Simple, everyday language.
Focus on functionality over technical implementation details.
Language support priority: Farsi and Armenian above Arabic, Korean above Japanese, Hindi at end.
Visual enhancements: Flag icons for language selection.
Future consideration: Implement same language list on main website (soapboxsuperapp.com).

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
- **Enhanced Bible Verse System**: SoapBox Bible cache (52 authentic verses), smart detection for scripture references, categories, fast lookup API.
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