# SoapBox Super App

## Overview
The SoapBox Super App is a comprehensive faith community platform designed to connect churches and believers through technology. It serves as a spiritual hub offering daily inspirations, prayer networks, community discussions, sermon management, and AI-powered pastoral tools. The project aims to provide a modern solution for spiritual engagement and church administration, capturing market potential in the faith technology sector.

**Recent Status**: Successfully implemented and deployed comprehensive SMS verification system with Twilio integration. Fixed all authentication errors, resolved SMS delivery issues (Error 30034), and completed end-to-end SMS verification flow. Users can now successfully verify phone numbers with real SMS codes. System includes 5-attempt limit, 10-minute expiration, 60-second resend cooldown, proper phone number validation, and automatic profile refresh after verification. Fully integrated with profile page for seamless user experience.

**Latest Update**: Successfully completed comprehensive verification circle system implementation. Beautiful purple/gold gradient circles now display around profile images throughout the platform, replacing previous badge system per user preference. ProfileVerificationRing component wraps all avatars with elegant circular indicators showing verification status - purple/gold for leadership roles, green gradients for email/phone verification. Fixed critical issue where LimitedSocialFeed component (used on home page) was missing verification fields and ProfileVerificationRing wrapper. All social feed components now consistently display verification circles. Backend correctly provides verification data (emailVerified, phoneVerified, role), frontend properly renders circular verification indicators, and system works seamlessly across home page, social feeds, and profile displays. Verification circles provide instant visual trust indicators for community members.

## User Preferences
Preferred communication style: Simple, everyday language.
Focus on functionality over technical implementation details.

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
- **Adaptive Spiritual Gifts Assessment**: Two-tier assessment system - Quick 30-question assessment for most users with option to upgrade to comprehensive 120-question deep discovery. Features initial results display with personality labels (Kingdom Champion, Faithful Servant, etc.), expanded assessment unlock for refined rankings (1-20), shadow gifts identification, ministry role matchings, and leadership development insights.
- **UI/UX Decisions**: Radix UI with Tailwind for consistent design, dynamic labeling, spiritual-themed custom icons, gradient color schemes, light/dark mode support, mobile-first responsive design, consistent button styling, and unified visual hierarchy. Chat widget positioned bottom-right.
- **System Design Choices**: Unified communication interface, multi-campus support, AI content moderation (four-tier priority, multi-modal analysis, user-empowered edit requests), role-based permissions, comprehensive field validation, dynamic form fields, and automated church verification.
- **Invite-Driven Onboarding**: Streamlined 4-step process including account creation, role selection, spiritual profile, and welcome setup. Supports automatic community association via invite links and includes email verification with gentle reminders and security protection.

## External Dependencies

- **AI and ML Services**: OpenAI API (GPT-4o model).
- **Communication Services**: SendGrid (email delivery), Push Notifications, Social Media APIs.
- **Payment and Donations**: Stripe Integration (secure donation processing, subscription management).
- **Content and Media**: File storage, Audio processing, Image optimization.
```