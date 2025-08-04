import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
  unique,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Note: Bible verse caching removed - using API.Bible direct lookup with ChatGPT fallback

// Prayer analytics and badges schema
// Enhanced Mood Indicators (EMI) - Centralized mood system
export const enhancedMoodIndicators = pgTable("enhanced_mood_indicators", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  emoji: varchar("emoji", { length: 10 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Spiritual States, Emotional Well-being, Life Circumstances, etc.
  subcategory: varchar("subcategory", { length: 100 }), // Faith & Worship, Growth & Transformation, etc.
  description: text("description"),
  colorHex: varchar("color_hex", { length: 7 }), // #FFFFFF format
  moodScore: integer("mood_score").notNull(), // 1-5 scale for mood intensity
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const answeredPrayerTestimonies = pgTable("answered_prayer_testimonies", {
  id: serial("id").primaryKey(),
  prayerId: integer("prayer_id").notNull().references(() => prayerRequests.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  userName: varchar("user_name", { length: 255 }).notNull(),
  testimony: text("testimony").notNull(),
  answeredAt: timestamp("answered_at").defaultNow(),
  category: varchar("category", { length: 50 }),
  isPublic: boolean("is_public").default(true),
  moderationStatus: varchar("moderation_status", { length: 20 }).default("approved"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const answeredPrayerReactions = pgTable("answered_prayer_reactions", {
  id: serial("id").primaryKey(),
  testimonyId: integer("testimony_id").notNull().references(() => answeredPrayerTestimonies.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // praise, heart, fire
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userTestimonyReactionUnique: unique().on(table.userId, table.testimonyId, table.reactionType),
}));

export const prayerReactions = pgTable("prayer_reactions", {
  id: serial("id").primaryKey(),
  prayerRequestId: integer("prayer_request_id").notNull().references(() => prayerRequests.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // heart, pray, amen
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userPrayerReactionUnique: unique().on(table.userId, table.prayerRequestId, table.reactionType),
}));

// Prayer response likes (for liking individual comments on prayer requests)
export const prayerResponseLikes = pgTable("prayer_response_likes", {
  id: serial("id").primaryKey(),
  prayerResponseId: integer("prayer_response_id").notNull().references(() => prayerResponses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userResponseLikeUnique: unique().on(table.userId, table.prayerResponseId),
}));

export const answeredPrayerComments = pgTable("answered_prayer_comments", {
  id: serial("id").primaryKey(),
  testimonyId: integer("testimony_id").notNull().references(() => answeredPrayerTestimonies.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  userName: varchar("user_name", { length: 255 }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prayerBadges = pgTable("prayer_badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 10 }).notNull(),
  category: varchar("category", { length: 20 }).notNull(), // prayer, community, growth, service
  requirement: jsonb("requirement").notNull(), // { type: 'prayer_count', value: 50, timeframe: 'week' }
  color: varchar("color", { length: 50 }).notNull(),
  reward: text("reward"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadgeProgress = pgTable("user_badge_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => prayerBadges.id),
  currentProgress: integer("current_progress").default(0),
  maxProgress: integer("max_progress").notNull(),
  isUnlocked: boolean("is_unlocked").default(false),
  unlockedAt: timestamp("unlocked_at"),
  lastProgressUpdate: timestamp("last_progress_update").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userBadgeUnique: unique().on(table.userId, table.badgeId),
}));

// Simple notifications table for user notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // prayer, event, message, etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Enhanced User Profile Table - Community Engagement & AI Features
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  password: varchar("password"), // Hashed password for standard auth
  role: varchar("role").default("member"), // User role for permissions
  
  // Basic Profile
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: text("profile_image_url"), // Changed to text to support base64 images
  coverPhotoUrl: text("cover_photo_url"), // Profile banner/cover image
  bio: text("bio"), // Short spiritual testimony or bio
  mobileNumber: varchar("mobile_number"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default("United States"),
  
  // Core Demographic & Spiritual Profile
  ageRange: varchar("age_range", { length: 20 }), // 18-24, 25-34, 35-44, 45-54, 55-64, 65+
  gender: varchar("gender", { length: 20 }), // Optional: male, female, prefer_not_to_say
  churchAffiliation: varchar("church_affiliation"), // Church name or campus
  denomination: varchar("denomination"), // Baptist, Methodist, Catholic, Non-denominational, etc.
  spiritualStage: varchar("spiritual_stage", { length: 30 }), // exploring_faith, new_believer, active_disciple, leader, elder
  
  // Social Engagement Features
  favoriteScriptures: jsonb("favorite_scriptures"), // Array of favorite Bible verses (can be strings or objects with text)
  ministryInterests: text("ministry_interests").array(), // youth, worship, missions, media, teaching, etc.
  volunteerInterest: boolean("volunteer_interest").default(false), // Willing to volunteer
  smallGroup: varchar("small_group"), // Current small group involvement
  socialLinks: jsonb("social_links"), // {facebook: "", instagram: "", twitter: ""}
  
  // Spiritual Gifts Assessment
  spiritualGifts: text("spiritual_gifts").array(), // Array of identified spiritual gifts
  spiritualProfile: jsonb("spiritual_profile"), // Full assessment results including profileLabel, servingStyle, etc.
  
  // Growth & Impact Tracking
  publicSharing: boolean("public_sharing").default(false), // Allow public SOAP sharing
  spiritualScore: integer("spiritual_score").default(0), // Gamified spiritual engagement score
  
  // AI-Powered Features
  prayerPrompt: text("prayer_prompt"), // Current "How can we pray for you?" prompt
  growthGoals: text("growth_goals").array(), // Personal spiritual growth goals
  currentReadingPlan: varchar("current_reading_plan"), // Active Bible reading plan
  languagePreference: varchar("language_preference", { length: 50 }), // User's preferred language
  customLanguage: varchar("custom_language", { length: 100 }), // Custom language when "Other" is selected
  bibleTranslationPreference: varchar("bible_translation_preference", { length: 50 }).default("NIV"), // Preferred Bible translation
  smallGroupParticipation: varchar("small_group_participation", { length: 50 }).default("interested"), // Small group interest level
  
  // Privacy Settings (granular control)
  showBioPublicly: boolean("show_bio_publicly").default(true),
  showChurchAffiliation: boolean("show_church_affiliation").default(true),
  shareWithGroup: boolean("share_with_group").default(true),
  showAgeRange: boolean("show_age_range").default(false),
  showLocation: boolean("show_location").default(false),
  showMobile: boolean("show_mobile").default(false),
  showGender: boolean("show_gender").default(false),
  showDenomination: boolean("show_denomination").default(true),
  showSpiritualGifts: boolean("show_spiritual_gifts").default(true),
  
  // Legacy fields maintained for compatibility
  interests: text("interests").array(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  onboardingData: jsonb("onboarding_data"), // Store wizard responses
  
  // Spiritual Assessment Fields
  spiritualMaturityLevel: varchar("spiritual_maturity_level", { length: 20 }), // beginner, growing, mature
  contentPreferences: jsonb("content_preferences"), // Detailed content preferences from assessment
  baselineEMIState: jsonb("baseline_emi_state"), // Initial EMI check-in data
  welcomeContentGenerated: boolean("welcome_content_generated").default(false),
  onboardingSpiritualAssessment: jsonb("onboarding_spiritual_assessment"), // Full assessment responses
  referredBy: varchar("referred_by"), // ID of user who referred this user
  referralCode: varchar("referral_code").unique(), // This user's unique referral code
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorMethod: varchar("two_factor_method"), // 'totp', 'email', 'sms'
  totpSecret: varchar("totp_secret"), // Encrypted TOTP secret
  backupCodes: text("backup_codes").array(), // Encrypted backup codes
  twoFactorSetupAt: timestamp("two_factor_setup_at"),
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: varchar("email_verification_token"),
  emailVerificationSentAt: timestamp("email_verification_sent_at"),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLoginAt: timestamp("last_login_at"),
  hasCompletedTour: boolean("has_completed_tour").default(false),
  
  // Enhanced profile verification fields for prayer circle guardrails
  phoneVerified: boolean("phone_verified").default(false),
  smsVerificationCode: varchar("sms_verification_code"),
  smsVerificationExpires: timestamp("sms_verification_expires"),
  smsVerificationAttempts: integer("sms_verification_attempts").default(0),
  profileCompleteness: integer("profile_completeness").default(0), // Percentage 0-100
  verificationStatus: varchar("verification_status", { length: 20 }).default("pending"), // pending, verified, incomplete
  verificationNotes: text("verification_notes"), // Admin notes for verification
  realNameVerified: boolean("real_name_verified").default(false), // Manual verification flag
  independentCircleLimit: integer("independent_circle_limit").default(2), // Configurable limit per user
  isDiscoverable: boolean("is_discoverable").default(true), // Privacy control for user search
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communities table (formerly Churches)
export const communities = pgTable("communities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).default("church"), // church, ministry, group, school, other
  denomination: varchar("denomination", { length: 100 }),
  // customDenomination: varchar("custom_denomination", { length: 255 }), // For "Other" denomination entries - Column doesn't exist in database
  description: text("description"),
  bio: text("bio"), // Extended biography/about section
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  logoUrl: varchar("logo_url"), // Community logo/image
  size: varchar("size", { length: 50 }), // Weekly attendance category
  establishedYear: integer("established_year"), // Year the community was established
  parentChurchName: varchar("parent_church_name", { length: 255 }), // Parent organization name
  missionStatement: text("mission_statement"), // Community mission statement
  hoursOfOperation: jsonb("hours_of_operation"), // Operating hours for each day of the week
  officeHours: text("office_hours"), // Office hours text format
  worshipTimes: text("worship_times"), // Worship service times text format
  additionalTimes: jsonb("additional_times"), // Additional service times (array of objects)
  socialLinks: jsonb("social_links"), // Facebook, Instagram, Twitter, YouTube, etc.
  // Fields below don't exist in actual database - removing to match schema
  communityTags: text("community_tags").array(), // Custom tags for community categorization
  latitude: real("latitude"),
  longitude: real("longitude"),
  rating: real("rating").default(0),
  memberCount: integer("member_count").default(0),
  // weeklyAttendance: integer("weekly_attendance"), // Average weekly attendance - Column doesn't exist in database
  isActive: boolean("is_active").default(true),
  isClaimed: boolean("is_claimed").default(false), // Track if community has been claimed by admin
  adminEmail: varchar("admin_email", { length: 255 }), // Email of designated admin for claiming
  adminPhone: varchar("admin_phone", { length: 20 }), // Phone of designated admin for claiming
  createdBy: varchar("created_by", { length: 255 }), // ID of user who created the community
  isDemo: boolean("is_demo").default(true), // Mark as demo community unless imported from production CSV
  verificationStatus: varchar("verification_status", { length: 20 }).default("verified"), // pending, verified, rejected
  verifiedAt: timestamp("verified_at").defaultNow(), // Auto-approve for now
  verifiedBy: varchar("verified_by").references(() => users.id), // ID of admin who verified
  rejectionReason: text("rejection_reason"), // Reason for rejection if status is rejected
  hideAddress: boolean("hide_address").default(false), // Hide address from public view (Ministries/Groups privacy)
  hidePhone: boolean("hide_phone").default(false), // Hide phone from public view (Ministries/Groups privacy)
  privacySetting: varchar("privacy_setting", { length: 30 }).default("public").notNull(), // public, private, church_members_only
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy churches table alias for backward compatibility
export const churches = communities;

// Roles table - defines system roles with their capabilities
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // owner, super_admin, church_admin, etc.
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  level: integer("level").notNull(), // 1-9, where 1 is highest (owner), 9 is lowest (member)
  scope: varchar("scope", { length: 20 }).notNull(), // system, church, ministry
  permissions: text("permissions").array().notNull(), // Array of permission strings
  icon: varchar("icon", { length: 50 }), // Icon identifier for UI
  color: varchar("color", { length: 20 }), // Color for role display
  canManageRoles: text("can_manage_roles").array(), // Which roles this role can manage
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permissions table - defines all available permissions in the system
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 150 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // content, users, system, church, events, etc.
  resource: varchar("resource", { length: 50 }), // posts, prayers, events, users, etc.
  action: varchar("action", { length: 50 }), // create, read, update, delete, approve, moderate
  scope: varchar("scope", { length: 20 }).default("church"), // system, church, ministry, own
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User-Community connections with role-based access (formerly User-Church)
export const userCommunities = pgTable("user_communities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  role: varchar("role").default("member"), // Direct role assignment (simpler approach)
  roleId: integer("role_id").references(() => roles.id), // Optional reference to roles table
  title: varchar("title", { length: 100 }), // Custom title like "Youth Leader", "Worship Director"
  department: varchar("department", { length: 100 }), // Youth Ministry, Music Ministry, etc.
  bio: text("bio"), // Role-specific bio
  additionalPermissions: text("additional_permissions").array(), // Extra permissions beyond role
  restrictedPermissions: text("restricted_permissions").array(), // Permissions to remove from role
  assignedBy: varchar("assigned_by").references(() => users.id), // Who assigned this role
  assignedAt: timestamp("assigned_at").defaultNow(),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false), // Mark primary community for user
  expiresAt: timestamp("expires_at"), // Optional role expiration
}, (table) => ({
  userCommunityUnique: unique().on(table.userId, table.communityId),
}));

// Legacy userChurches table alias for backward compatibility
export const userChurches = userCommunities;

// User Preferences and Settings for UX Improvements
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  language: varchar("language", { length: 10 }).default("en"), // ISO language codes
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  theme: varchar("theme", { length: 20 }).default("light"), // light, dark, auto
  fontSize: varchar("font_size", { length: 10 }).default("medium"), // small, medium, large
  readingSpeed: varchar("reading_speed", { length: 10 }).default("normal"), // slow, normal, fast
  audioEnabled: boolean("audio_enabled").default(true),
  audioSpeed: real("audio_speed").default(1.0),
  familyMode: boolean("family_mode").default(false), // Child-friendly content
  offlineMode: boolean("offline_mode").default(false),
  syncEnabled: boolean("sync_enabled").default(true),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Push Notification Preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dailyReading: boolean("daily_reading").default(true),
  prayerReminders: boolean("prayer_reminders").default(true),
  communityUpdates: boolean("community_updates").default(true),
  eventReminders: boolean("event_reminders").default(true),
  weeklyCheckins: boolean("weekly_checkins").default(true),
  engagementReminders: boolean("engagement_reminders").default(true),
  smsNotifications: boolean("sms_notifications").default(false), // Opt-in SMS
  emailNotifications: boolean("email_notifications").default(true),
  webPushEnabled: boolean("web_push_enabled").default(false),
  friendActivity: boolean("friend_activity").default(false),
  dailyReadingTime: varchar("daily_reading_time").default("08:00"), // HH:MM format
  prayerTimes: text("prayer_times").array().default([]), // Array of HH:MM times
  quietHours: jsonb("quiet_hours"), // Start/end times for no notifications
  weekendPreferences: jsonb("weekend_preferences"), // Different settings for weekends
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Web Push Subscriptions
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dhKey: text("p256dh_key").notNull(),
  authKey: text("auth_key").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userEndpointUnique: unique().on(table.userId, table.endpoint),
}));

// Weekly Check-ins
export const weeklyCheckins = pgTable("weekly_checkins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  week: varchar("week").notNull(), // Format: 2024-W01
  spiritualGrowth: integer("spiritual_growth").notNull(),
  prayerLife: integer("prayer_life").notNull(),
  bibleReading: integer("bible_reading").notNull(),
  communityConnection: integer("community_connection").notNull(),
  serviceOpportunities: integer("service_opportunities").notNull(),
  emotionalWellbeing: integer("emotional_wellbeing").notNull(),
  gratitude: text("gratitude").array(),
  struggles: text("struggles").array(),
  prayerRequests: text("prayer_requests").array(),
  goals: text("goals").array(),
  reflectionNotes: text("reflection_notes"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userWeekUnique: unique().on(table.userId, table.week),
}));

// Offline Content Storage
export const offlineContent = pgTable("offline_content", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentType: varchar("content_type", { length: 50 }).notNull(), // verse, devotional, audio, commentary
  contentId: varchar("content_id").notNull(), // Reference to the actual content
  contentData: jsonb("content_data").notNull(), // Full content stored for offline access
  downloadedAt: timestamp("downloaded_at").defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at"),
  fileSize: integer("file_size"), // Size in bytes
  priority: integer("priority").default(0), // Higher priority content kept longer
  expiresAt: timestamp("expires_at"), // Auto-cleanup old content
  isStarred: boolean("is_starred").default(false), // User-marked favorites
});

// Cross-Platform Sync Data
export const syncData = pgTable("sync_data", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceId: varchar("device_id").notNull(),
  deviceType: varchar("device_type", { length: 20 }).notNull(), // mobile, tablet, desktop, web
  platform: varchar("platform", { length: 20 }).notNull(), // ios, android, windows, mac, web
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  syncToken: varchar("sync_token").notNull(),
  readingProgress: jsonb("reading_progress"), // Current reading positions
  bookmarks: jsonb("bookmarks"), // Saved verses and positions
  notes: jsonb("notes"), // User notes and highlights
  preferences: jsonb("preferences"), // Device-specific preferences
  isActive: boolean("is_active").default(true),
});

// AI Personalization Data
export const userPersonalization = pgTable("user_personalization", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  readingPatterns: jsonb("reading_patterns"), // Times, frequency, preferred books
  topicInterests: text("topic_interests").array(), // Biblical topics of interest
  difficultyLevel: varchar("difficulty_level", { length: 20 }).default("intermediate"),
  readingGoals: jsonb("reading_goals"), // Personal reading objectives
  engagementScore: real("engagement_score").default(0), // AI-calculated engagement
  contentRecommendations: jsonb("content_recommendations"), // AI-generated suggestions
  learningStyle: varchar("learning_style", { length: 20 }).default("mixed"), // visual, auditory, reading
  spiritualMaturity: varchar("spiritual_maturity", { length: 20 }).default("growing"), // new, growing, mature
  lastRecommendationUpdate: timestamp("last_recommendation_update"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social Media Credentials for Direct Publishing
export const socialMediaCredentials = pgTable("social_media_credentials", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  platform: varchar("platform", { length: 20 }).notNull(), // facebook, twitter, instagram, linkedin
  credentialType: varchar("credential_type", { length: 30 }).notNull(), // oauth_token, api_key, app_password
  accessToken: text("access_token"), // Encrypted OAuth access token
  refreshToken: text("refresh_token"), // Encrypted OAuth refresh token
  tokenExpiresAt: timestamp("token_expires_at"),
  platformUserId: varchar("platform_user_id"), // User/Page ID on the platform
  platformUsername: varchar("platform_username"), // @username or page name
  scope: text("scope").array(), // Permissions granted
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique("unique_user_platform").on(table.userId, table.platform),
  index("social_credentials_user_idx").on(table.userId),
  index("social_credentials_community_idx").on(table.communityId),
]);

// Social Media Publishing History
export const socialMediaPosts = pgTable("social_media_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sermonId: integer("sermon_id").references(() => sermonDrafts.id),
  platform: varchar("platform", { length: 20 }).notNull(),
  platformPostId: varchar("platform_post_id"), // ID from the social media platform
  contentType: varchar("content_type", { length: 20 }).notNull(), // post, story, video, image
  content: text("content").notNull(),
  hashtags: text("hashtags").array(),
  scheduledFor: timestamp("scheduled_for"),
  publishedAt: timestamp("published_at"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, scheduled, published, failed
  errorMessage: text("error_message"),
  engagement: jsonb("engagement"), // likes, shares, comments counts
  lastEngagementUpdate: timestamp("last_engagement_update"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("social_posts_user_idx").on(table.userId),
  index("social_posts_sermon_idx").on(table.sermonId),
  index("social_posts_platform_idx").on(table.platform),
  index("social_posts_status_idx").on(table.status),
]);

// Content Translations for Multilingual Support
export const contentTranslations = pgTable("content_translations", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // verse, devotional, commentary
  contentId: varchar("content_id").notNull(),
  language: varchar("language", { length: 10 }).notNull(),
  translatedTitle: text("translated_title"),
  translatedContent: text("translated_content").notNull(),
  translatedBy: varchar("translated_by"), // Translator/source
  translationSource: varchar("translation_source", { length: 100 }), // Bible version, etc.
  qualityScore: real("quality_score"), // AI or human review score
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Family-Friendly Content Versions
export const familyContent = pgTable("family_content", {
  id: serial("id").primaryKey(),
  originalContentId: varchar("original_content_id").notNull(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  ageGroup: varchar("age_group", { length: 20 }).notNull(), // preschool, elementary, teen
  simplifiedTitle: text("simplified_title"),
  simplifiedContent: text("simplified_content").notNull(),
  illustrations: jsonb("illustrations"), // Image URLs and descriptions
  audioUrl: varchar("audio_url"), // Child-friendly narration
  interactiveElements: jsonb("interactive_elements"), // Games, quizzes, activities
  parentalNotes: text("parental_notes"), // Discussion guides for parents
  lessonObjectives: text("lesson_objectives").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Friend/Connection System
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  addresseeId: varchar("addressee_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, declined, blocked
  requestMessage: text("request_message"),
  connectionType: varchar("connection_type", { length: 30 }).default("friend"), // friend, prayer_partner, mentor, mentee
  closenessLevel: integer("closeness_level").default(1), // 1-5 scale for relationship strength
  sharedInterests: text("shared_interests").array(),
  lastInteraction: timestamp("last_interaction"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  friendshipUnique: unique().on(table.requesterId, table.addresseeId),
}));

// Community Groups for Topic-based Discussions
export const communityGroups = pgTable("community_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // bible_study, prayer, youth, worship, etc.
  type: varchar("type", { length: 30 }).notNull().default("open"), // open, closed, private
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  coverImageUrl: varchar("cover_image_url"),
  rules: text("rules"),
  tags: text("tags").array(),
  memberCount: integer("member_count").default(0),
  maxMembers: integer("max_members"),
  requiresApproval: boolean("requires_approval").default(false),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"), // Privacy settings, notification preferences, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Community Group Memberships
export const communityGroupMembers = pgTable("community_group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => communityGroups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).default("member"), // member, moderator, admin
  permissions: text("permissions").array(),
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  groupMemberUnique: unique().on(table.groupId, table.userId),
}));

// Enhanced Reactions System with Emoji Support
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetType: varchar("target_type", { length: 30 }).notNull(), // post, prayer, discussion, verse_share, etc.
  targetId: integer("target_id").notNull(),
  reactionType: varchar("reaction_type", { length: 30 }).notNull(), // like, love, pray, amen, heart, fire, etc.
  emoji: varchar("emoji", { length: 10 }), // Store actual emoji character
  intensity: integer("intensity").default(1), // 1-5 for reaction strength
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userTargetReactionUnique: unique().on(table.userId, table.targetType, table.targetId, table.reactionType),
}));

// Community Reflections for Enhanced Sharing
export const communityReflections = pgTable("community_reflections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  targetType: varchar("target_type", { length: 30 }).notNull(), // verse, prayer, discussion
  targetId: integer("target_id").notNull(),
  reflection: text("reflection").notNull(),
  isPublic: boolean("is_public").default(true),
  tags: text("tags").array(),
  moodTone: varchar("mood_tone", { length: 30 }), // grateful, hopeful, seeking, peaceful, etc.
  groupId: integer("group_id").references(() => communityGroups.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Real-time Engagement Tracking
export const engagementSessions = pgTable("engagement_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionType: varchar("session_type", { length: 30 }).notNull(), // reading, praying, discussion, group_chat
  targetType: varchar("target_type", { length: 30 }), // verse, prayer, group, discussion
  targetId: integer("target_id"),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"), // Store session-specific data
});

// Live Activity Feed for Real-time Updates
export const activityFeed = pgTable("activity_feed", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // shared_verse, joined_group, prayer_answered, etc.
  targetType: varchar("target_type", { length: 30 }),
  targetId: integer("target_id"),
  groupId: integer("group_id").references(() => communityGroups.id),
  visibility: varchar("visibility", { length: 20 }).default("public"), // public, friends, group
  content: text("content"),
  metadata: jsonb("metadata"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events table - Enhanced for comprehensive management
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  address: text("address"),
  isOnline: boolean("is_online").default(false),
  onlineLink: varchar("online_link"),
  maxAttendees: integer("max_attendees"),
  minAttendees: integer("min_attendees"),
  isPublic: boolean("is_public").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  category: varchar("category", { length: 50 }), // service, bible_study, community_service, social, youth, worship, outreach
  subcategory: varchar("subcategory", { length: 50 }), // More specific categorization
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  status: varchar("status", { length: 20 }).default("scheduled"), // draft, scheduled, ongoing, completed, cancelled
  imageUrl: varchar("image_url"),
  attachments: jsonb("attachments"), // Array of file URLs and metadata
  tags: text("tags").array(),
  ageGroups: text("age_groups").array(), // children, youth, adults, seniors, all
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  registrationDeadline: timestamp("registration_deadline"),
  cancellationDeadline: timestamp("cancellation_deadline"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: jsonb("recurring_pattern"), // Pattern details for recurring events
  parentEventId: integer("parent_event_id").references((): any => events.id), // For recurring event instances
  reminderSettings: jsonb("reminder_settings"), // Notification timing preferences
  customFields: jsonb("custom_fields"), // Flexible additional data
  notes: text("notes"), // Internal organizer notes
  publicNotes: text("public_notes"), // Notes visible to attendees
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs - Enhanced with more detailed tracking
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("attending"), // attending, maybe, not_attending, pending_approval, waitlisted
  responseDate: timestamp("response_date").defaultNow(),
  guestCount: integer("guest_count").default(0),
  guestNames: text("guest_names").array(),
  specialRequests: text("special_requests"),
  checkedIn: boolean("checked_in").default(false),
  checkedInAt: timestamp("checked_in_at"),
  checkedInBy: varchar("checked_in_by").references(() => users.id),
  feedback: text("feedback"), // Post-event feedback
  rating: integer("rating"), // 1-5 star rating
  remindersSent: integer("reminders_sent").default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
  customResponses: jsonb("custom_responses"), // Responses to custom RSVP questions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userEventUnique: unique().on(table.userId, table.eventId),
}));

// Event volunteer roles and assignments
export const eventVolunteers = pgTable("event_volunteers", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 100 }).notNull(), // setup, cleanup, registration, tech, worship, childcare, security
  description: text("description"),
  timeCommitment: varchar("time_commitment", { length: 100 }), // e.g., "2 hours before event"
  requirements: text("requirements"),
  status: varchar("status", { length: 20 }).default("assigned"), // assigned, confirmed, completed, no_show
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event notifications and reminders
export const eventNotifications = pgTable("event_notifications", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  notificationType: varchar("notification_type", { length: 50 }).notNull(), // reminder, update, cancellation, rsvp_confirmation
  message: text("message").notNull(),
  channelType: varchar("channel_type", { length: 20 }).notNull(), // email, sms, push, in_app
  status: varchar("status", { length: 20 }).default("pending"), // pending, sent, delivered, failed
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event updates and announcements
export const eventUpdates = pgTable("event_updates", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  updateType: varchar("update_type", { length: 30 }).notNull(), // general, schedule_change, location_change, cancellation, important
  isPublic: boolean("is_public").default(true),
  notifyAttendees: boolean("notify_attendees").default(false),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event check-in tracking
export const eventCheckIns = pgTable("event_check_ins", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  checkedInAt: timestamp("checked_in_at").defaultNow(),
  checkedInBy: varchar("checked_in_by").notNull().references(() => users.id),
  checkInMethod: varchar("check_in_method", { length: 20 }).default("manual"), // manual, qr_code, nfc, self_service
  notes: text("notes"),
  guestCount: integer("guest_count").default(0),
});

// Event recurring patterns
export const eventRecurrenceRules = pgTable("event_recurrence_rules", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  frequency: varchar("frequency", { length: 20 }).notNull(), // daily, weekly, monthly, yearly, custom
  interval: integer("interval").default(1), // Every X frequency (e.g., every 2 weeks)
  daysOfWeek: text("days_of_week").array(), // For weekly: ['monday', 'wednesday', 'friday']
  dayOfMonth: integer("day_of_month"), // For monthly: specific day of month
  weekOfMonth: integer("week_of_month"), // For monthly: 1st, 2nd, 3rd, 4th, -1 (last)
  monthsOfYear: text("months_of_year").array(), // For yearly
  endType: varchar("end_type", { length: 20 }).notNull(), // never, after_count, by_date
  endAfterCount: integer("end_after_count"), // Number of occurrences
  endByDate: timestamp("end_by_date"),
  exceptions: jsonb("exceptions"), // Dates to skip
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event analytics and metrics
export const eventMetrics = pgTable("event_metrics", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  metricType: varchar("metric_type", { length: 50 }).notNull(), // attendance, engagement, feedback_score, cost_per_attendee
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }), // count, percentage, dollars, hours
  recordedAt: timestamp("recorded_at").defaultNow(),
  recordedBy: varchar("recorded_by").references(() => users.id),
  notes: text("notes"),
});

// Community discussions
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }), // general, prayer, bible_study, events
  isPublic: boolean("is_public").default(true),
  audience: varchar("audience", { length: 20 }).default("public"), // 'public', 'church', 'private'
  moodTag: varchar("mood_tag", { length: 255 }), // Facebook-style mood/activity tag (supports multiple moods)
  suggestedVerses: jsonb("suggested_verses"), // AI-generated Bible verse suggestions
  attachedMedia: jsonb("attached_media"), // Array of uploaded media files
  linkedVerse: jsonb("linked_verse"), // User-selected Bible verse to link with post
  isPinned: boolean("is_pinned").default(false), // Featured posts from pastors/admins
  pinnedBy: varchar("pinned_by").references(() => users.id), // Who pinned this post
  pinnedAt: timestamp("pinned_at"), // When it was pinned
  pinnedUntil: timestamp("pinned_until"), // Optional expiration for pin
  pinCategory: varchar("pin_category", { length: 30 }), // 'announcement', 'sermon', 'weekly_encouragement', 'call_to_action'
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  // Content moderation fields
  isHidden: boolean("is_hidden").default(false), // Hidden by moderation
  hiddenReason: varchar("hidden_reason", { length: 255 }), // Reason for hiding
  hiddenBy: varchar("hidden_by").references(() => users.id), // Who hid the content
  hiddenAt: timestamp("hidden_at"), // When it was hidden
  // Data expiration privacy fields
  expiresAt: timestamp("expires_at"), // When content should be hidden for privacy
  expiredAt: timestamp("expired_at"), // When content was actually marked as expired (soft deletion)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discussion comments  
export const discussionComments = pgTable("discussion_comments", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull().references(() => discussions.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: integer("parent_id").references((): any => discussionComments.id),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discussion likes
export const discussionLikes = pgTable("discussion_likes", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull().references(() => discussions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer requests
export const prayerRequests = pgTable("prayer_requests", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  isAnswered: boolean("is_answered").default(false),
  answeredAt: timestamp("answered_at"),
  prayerCount: integer("prayer_count").default(0),
  isPublic: boolean("is_public").default(true), // Legacy field - kept for backward compatibility
  privacyLevel: varchar("privacy_level", { length: 20 }).default("public"), // public, community, prayer_team, pastor_only
  category: varchar("category", { length: 50 }), // health, family, guidance, gratitude, other
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, flagged, archived
  moderationNotes: text("moderation_notes"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  priority: varchar("priority", { length: 10 }).default("normal"), // urgent, high, normal, low
  followUpDate: timestamp("follow_up_date"),
  lastFollowUpAt: timestamp("last_follow_up_at"),
  isUrgent: boolean("is_urgent").default(false),
  tags: text("tags").array(),
  attachmentUrl: text("attachment_url"), // Photo attachment URL (base64 or file path)
  // Data expiration privacy fields
  expiresAt: timestamp("expires_at"), // When content should be hidden for privacy
  expiredAt: timestamp("expired_at"), // When content was actually marked as expired (soft deletion)
  allowsExpiration: boolean("allows_expiration").default(false), // User permission for content expiration
  expirationReminderSent: boolean("expiration_reminder_sent").default(false), // Track reminder notifications
  // Content moderation fields
  isHidden: boolean("is_hidden").default(false), // Hidden by moderation
  hiddenReason: varchar("hidden_reason", { length: 255 }), // Reason for hiding
  hiddenBy: varchar("hidden_by").references(() => users.id), // Who hid the content
  hiddenAt: timestamp("hidden_at"), // When it was hidden
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prayer responses (people praying for a request)
export const prayerResponses = pgTable("prayer_responses", {
  id: serial("id").primaryKey(),
  prayerRequestId: integer("prayer_request_id").notNull().references(() => prayerRequests.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  responseType: varchar("response_type", { length: 20 }).default("prayed"), // "prayed" or "support"
  content: text("content"), // Support message content (null for simple "prayed" responses)
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer follow-ups for admin tracking
export const prayerFollowUps = pgTable("prayer_follow_ups", {
  id: serial("id").primaryKey(),
  prayerRequestId: integer("prayer_request_id").notNull().references(() => prayerRequests.id),
  adminId: varchar("admin_id").notNull().references(() => users.id),
  followUpType: varchar("follow_up_type", { length: 20 }).notNull(), // check_in, update, encouragement, resolved
  notes: text("notes"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer updates from members
export const prayerUpdates = pgTable("prayer_updates", {
  id: serial("id").primaryKey(),
  prayerRequestId: integer("prayer_request_id").notNull().references(() => prayerRequests.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  updateType: varchar("update_type", { length: 20 }).notNull(), // progress, answered, testimony, request_change
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer assignments for pastoral care
export const prayerAssignments = pgTable("prayer_assignments", {
  id: serial("id").primaryKey(),
  prayerRequestId: integer("prayer_request_id").notNull().references(() => prayerRequests.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  assignedTo: varchar("assigned_to").notNull().references(() => users.id),
  role: varchar("role", { length: 30 }).notNull(), // pastor, prayer_team, counselor
  notes: text("notes"),
  status: varchar("status", { length: 20 }).default("active"), // active, completed, transferred
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer circles for group prayer focus
export const prayerCircles = pgTable("prayer_circles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  communityId: integer("community_id").references(() => communities.id), // Optional for independent circles
  createdBy: varchar("created_by").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(true),
  memberLimit: integer("member_limit").default(50), // Optional limit
  focusAreas: text("focus_areas").array().default([]), // healing, family, missions, etc.
  meetingSchedule: text("meeting_schedule"), // Optional meeting info
  isIndependent: boolean("is_independent").default(false), // Independent prayer circles
  type: varchar("type", { length: 20 }).default("church"), // church, independent
  status: varchar("status", { length: 20 }).default("active"), // active, pending_moderation, suspended
  moderationNotes: text("moderation_notes"), // For reporting and moderation
  // Enhanced guardrails and features
  inviteCode: varchar("invite_code", { length: 8 }).unique(), // For easy sharing
  connectToChurchRequested: boolean("connect_to_church_requested").default(false), // User wants church connection
  requestedCommunityId: integer("requested_community_id").references(() => communities.id), // Requested church affiliation
  guestPastorEmail: varchar("guest_pastor_email", { length: 255 }), // Optional guest pastor invitation
  answeredPrayersCount: integer("answered_prayers_count").default(0), // Track answered prayers
  reportCount: integer("report_count").default(0), // Track reports for moderation
  lastActivityAt: timestamp("last_activity_at").defaultNow(), // Track engagement
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prayer circle membership tracking
export const prayerCircleMembers = pgTable("prayer_circle_members", {
  id: serial("id").primaryKey(),
  prayerCircleId: integer("prayer_circle_id").notNull().references(() => prayerCircles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 20 }).default("member"), // member, leader, facilitator
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => [
  unique().on(table.prayerCircleId, table.userId),
]);

// Prayer circle reports for moderation
export const prayerCircleReports = pgTable("prayer_circle_reports", {
  id: serial("id").primaryKey(),
  prayerCircleId: integer("prayer_circle_id").notNull().references(() => prayerCircles.id),
  reportedBy: varchar("reported_by").notNull().references(() => users.id),
  reason: varchar("reason", { length: 50 }).notNull(), // inappropriate_content, spam, false_information, harassment, other
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, reviewed, resolved, dismissed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken", { length: 50 }), // warning, suspension, removal, none
  createdAt: timestamp("created_at").defaultNow(),
});

// Prayer circle updates/answered prayers tracking
export const prayerCircleUpdates = pgTable("prayer_circle_updates", {
  id: serial("id").primaryKey(),
  prayerCircleId: integer("prayer_circle_id").notNull().references(() => prayerCircles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  updateType: varchar("update_type", { length: 20 }).notNull(), // answered, update, request
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  isAnswered: boolean("is_answered").default(false),
  prayerCount: integer("prayer_count").default(0), // Number of people praying
  createdAt: timestamp("created_at").defaultNow(),
});

// User achievements/badges
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementType: varchar("achievement_type", { length: 50 }).notNull(), // community_builder, prayer_warrior, social_butterfly, etc.
  achievementLevel: integer("achievement_level").default(1),
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress").notNull(),
  isUnlocked: boolean("is_unlocked").default(false),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userAchievementUnique: unique().on(table.userId, table.achievementType),
}));

// User activity tracking
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // discussion_post, comment, prayer_request, event_rsvp, etc.
  entityId: integer("entity_id"), // ID of the related entity (discussion, event, etc.)
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily inspirations table
export const dailyInspirations = pgTable("daily_inspirations", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  verse: varchar("verse", { length: 200 }),
  verseReference: varchar("verse_reference", { length: 100 }),
  category: varchar("category", { length: 50 }).notNull(), // hope, faith, love, strength, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Devotionals table
export const devotionals = pgTable("devotionals", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content").notNull(),
  verse: varchar("verse", { length: 500 }),
  verseReference: varchar("verse_reference", { length: 100 }),
  category: varchar("category", { length: 50 }).notNull(),
  tags: text("tags").array(),
  seriesId: integer("series_id").references(() => weeklySeries.id),
  scheduledDate: timestamp("scheduled_date"),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weekly series table
export const weeklySeries = pgTable("weekly_series", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  frequency: varchar("frequency", { length: 20 }).default("weekly"), // weekly, daily, custom
  isActive: boolean("is_active").default(true),
  totalDevotionals: integer("total_devotionals").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sermon media table
export const sermonMedia = pgTable("sermon_media", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  mediaType: varchar("media_type", { length: 20 }).notNull(), // audio, video, document
  mediaUrl: varchar("media_url"),
  fileSize: integer("file_size"), // in bytes
  duration: integer("duration"), // in seconds for audio/video
  thumbnailUrl: varchar("thumbnail_url"),
  speaker: varchar("speaker", { length: 100 }),
  date: timestamp("date").notNull(),
  series: varchar("series", { length: 100 }),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(true),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bible Reading Plans
export const readingPlans = pgTable("reading_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // topical, chronological, book_study, devotional
  duration: integer("duration").notNull(), // days
  difficulty: varchar("difficulty", { length: 20 }).default("beginner"), // beginner, intermediate, advanced
  category: varchar("category", { length: 50 }).notNull(), // peace, anxiety, purpose, new_testament, etc.
  imageUrl: varchar("image_url"),
  isPublic: boolean("is_public").default(true),
  isActive: boolean("is_active").default(true),
  authorId: varchar("author_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const readingPlanDays = pgTable("reading_plan_days", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => readingPlans.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  scriptureReference: varchar("scripture_reference", { length: 200 }).notNull(),
  scriptureText: text("scripture_text"),
  devotionalContent: text("devotional_content"),
  reflectionQuestion: text("reflection_question"),
  prayerPrompt: text("prayer_prompt"),
  additionalVerses: text("additional_verses").array(), // Array of additional verse references
  tags: text("tags").array(),
  isOptional: boolean("is_optional").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  planDayUnique: unique().on(table.planId, table.dayNumber),
}));

export const userReadingProgress = pgTable("user_reading_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => readingPlans.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  reflectionText: text("reflection_text"),
  prayerText: text("prayer_text"),
  emotionalReactionId: integer("emotional_reaction_id").references(() => enhancedMoodIndicators.id), // EMI reference
  emotionalReaction: varchar("emotional_reaction", { length: 50 }), // Legacy field for backward compatibility
  personalInsights: text("personal_insights"),
  soapEntryId: integer("soap_entry_id").references(() => soapEntries.id), // Link to SOAP journal entry
  readingTimeMinutes: integer("reading_time_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userPlanDayUnique: unique().on(table.userId, table.planId, table.dayNumber),
}));

export const userReadingPlanSubscriptions = pgTable("user_reading_plan_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").notNull().references(() => readingPlans.id, { onDelete: "cascade" }),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  currentDay: integer("current_day").default(1),
  isActive: boolean("is_active").default(true),
  reminderFrequency: varchar("reminder_frequency", { length: 20 }).default("daily"), // daily, weekly, none
  preferredReadingTime: varchar("preferred_reading_time", { length: 20 }), // morning, afternoon, evening
  consecutiveDays: integer("consecutive_days").default(0),
  totalDaysCompleted: integer("total_days_completed").default(0),
  lastReadAt: timestamp("last_read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userPlanUnique: unique().on(table.userId, table.planId),
}));

// User inspiration preferences
export const userInspirationPreferences = pgTable("user_inspiration_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  preferredCategories: text("preferred_categories").array(), // Array of categories user prefers
  deliveryTime: varchar("delivery_time", { length: 10 }).default("08:00"), // Preferred time for daily inspiration
  isEnabled: boolean("is_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userInspirationUnique: unique().on(table.userId),
}));

// User inspiration history
export const userInspirationHistory = pgTable("user_inspiration_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  inspirationId: integer("inspiration_id").notNull().references(() => dailyInspirations.id),
  wasRead: boolean("was_read").default(false),
  wasFavorited: boolean("was_favorited").default(false),
  wasShared: boolean("was_shared").default(false),
  viewedAt: timestamp("viewed_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userInspirationUnique: unique().on(table.userId, table.inspirationId),
}));

// Bookmark tables
export const discussionBookmarks = pgTable("discussion_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  discussionId: integer("discussion_id").notNull().references(() => discussions.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userDiscussionUnique: unique().on(table.userId, table.discussionId),
}));

export const prayerBookmarks = pgTable("prayer_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  prayerId: integer("prayer_id").notNull().references(() => prayerRequests.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userPrayerUnique: unique().on(table.userId, table.prayerId),
}));

export const eventBookmarks = pgTable("event_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventId: integer("event_id").notNull().references(() => events.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userEventUnique: unique().on(table.userId, table.eventId),
}));

// Contacts system for user connections and invitations
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  contactUserId: varchar("contact_user_id").references(() => users.id),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  name: varchar("name", { length: 255 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending, connected, blocked
  contactType: varchar("contact_type", { length: 20 }).default("friend"), // friend, family, church_member
  isActive: boolean("is_active").default(true),
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userContactUnique: unique().on(table.userId, table.contactUserId),
}));

// Invitations system for user referrals
export const invitations = pgTable("invitations", {
  id: serial("id").primaryKey(),
  inviterId: varchar("inviter_id").notNull().references(() => users.id),
  email: varchar("email", { length: 255 }).notNull(),
  inviteCode: varchar("invite_code", { length: 50 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, accepted, expired
  sentAt: timestamp("sent_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  inviteCodeUnique: unique().on(table.inviteCode),
  emailInviterUnique: unique().on(table.email, table.inviterId),
}));

// Check-ins table for spiritual and event attendance tracking
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  eventId: integer("event_id").references(() => events.id),
  checkInType: varchar("check_in_type", { length: 50 }).notNull(),
  mood: varchar("mood", { length: 20 }),
  moodEmoji: varchar("mood_emoji", { length: 10 }),
  notes: text("notes"),
  prayerIntent: text("prayer_intent"),
  isPhysicalAttendance: boolean("is_physical_attendance").default(false),
  qrCodeId: varchar("qr_code_id"),
  location: varchar("location"),
  streakCount: integer("streak_count").default(1),
  pointsEarned: integer("points_earned").default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
});

// Detailed mood check-ins with AI personalization triggers
export const moodCheckins = pgTable("mood_checkins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  checkInId: integer("check_in_id").references(() => checkIns.id), // Link to daily check-in
  moodIds: integer("mood_ids").array(), // EMI reference IDs
  mood: varchar("mood", { length: 200 }).notNull(), // Legacy field: Multiple mood selections: joyful, peaceful, anxious, lonely, determined, etc.
  moodEmoji: varchar("mood_emoji", { length: 10 }).notNull(), // 😇 😊 😐 😔 😭
  moodScore: integer("mood_score").notNull(), // 1-5 scale
  notes: text("notes"), // User reflection on mood
  triggers: text("triggers").array(), // What influenced this mood
  copingStrategies: text("coping_strategies").array(), // What helps them feel better
  energyLevel: integer("energy_level"), // 1-5 scale
  socialConnection: integer("social_connection"), // 1-5 how connected they feel
  spiritualConnection: integer("spiritual_connection"), // 1-5 closeness to God
  shareable: boolean("shareable").default(false), // Can be shared with church staff
  communityId: integer("community_id").references(() => communities.id),
  aiContentGenerated: boolean("ai_content_generated").default(false), // Track if AI content was created
  createdAt: timestamp("created_at").defaultNow(),
});

// AI-Generated Personalized Content Recommendations
export const personalizedContent = pgTable("personalized_content", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  moodCheckinId: integer("mood_checkin_id").references(() => moodCheckins.id),
  checkInId: integer("check_in_id").references(() => checkIns.id),
  contentType: varchar("content_type", { length: 50 }).notNull(), // verse, devotional, prayer, article, meditation
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  reason: text("reason"), // Why this content was recommended
  confidence: real("confidence").default(0.5), // AI confidence score 0-1
  priority: integer("priority").default(1), // 1-5 recommendation priority
  estimatedReadTime: integer("estimated_read_time"), // Minutes
  difficulty: varchar("difficulty", { length: 20 }).default("intermediate"),
  topics: text("topics").array(), // Related spiritual topics
  scriptureReferences: text("scripture_references").array(),
  actionable: boolean("actionable").default(false), // Includes specific actions/prayers
  viewed: boolean("viewed").default(false),
  helpful: boolean("helpful"), // User feedback
  helpfulFeedback: text("helpful_feedback"), // Why it was/wasn't helpful
  createdAt: timestamp("created_at").defaultNow(),
});

// QR codes for physical check-in locations
export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey(), // unique QR code identifier
  communityId: integer("community_id").notNull().references(() => communities.id),
  eventId: integer("event_id").references(() => events.id), // null for general church location
  name: varchar("name", { length: 100 }).notNull(), // "Main Sanctuary", "Youth Room", etc.
  description: text("description"),
  location: varchar("location").notNull(),
  isActive: boolean("is_active").default(true),
  maxUsesPerDay: integer("max_uses_per_day"), // optional limit
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inspirationBookmarks = pgTable("inspiration_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  inspirationId: integer("inspiration_id").notNull().references(() => dailyInspirations.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userInspirationBookmarkUnique: unique().on(table.userId, table.inspirationId),
}));

// S.O.A.P. (Scripture, Observation, Application, Prayer) Management System
export const soapEntries = pgTable("soap_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  scripture: text("scripture").notNull(), // The Bible verse or passage
  scriptureReference: varchar("scripture_reference", { length: 100 }), // e.g., "John 3:16"
  observation: text("observation").notNull(), // What does the passage say?
  application: text("application").notNull(), // How does this apply to my life?
  prayer: text("prayer").notNull(), // Personal prayer based on the scripture
  moodTag: varchar("mood_tag", { length: 255 }), // peaceful, struggling, inspired, grateful, etc.
  isPublic: boolean("is_public").default(false), // Share with prayer wall/feed
  isSharedWithGroup: boolean("is_shared_with_group").default(false),
  isSharedWithPastor: boolean("is_shared_with_pastor").default(false),
  aiAssisted: boolean("ai_assisted").default(false), // Was AI used to help create this?
  aiSuggestions: jsonb("ai_suggestions"), // Store AI suggestions used
  tags: text("tags").array(), // Additional topic tags
  devotionalDate: timestamp("devotional_date").defaultNow(), // When this devotion was for
  streakDay: integer("streak_day").default(1), // Day in consecutive S.O.A.P. streak
  estimatedReadTime: integer("estimated_read_time"), // Minutes spent on this entry
  isFeatured: boolean("is_featured").default(false), // Pastor can feature entries
  featuredBy: varchar("featured_by").references(() => users.id),
  featuredAt: timestamp("featured_at"),
  commentCount: integer("comment_count").default(0), // Track comment count
  // Content moderation fields
  isHidden: boolean("is_hidden").default(false), // Hidden by moderation
  hiddenReason: varchar("hidden_reason", { length: 255 }), // Reason for hiding
  hiddenBy: varchar("hidden_by").references(() => users.id), // Who hid the content
  hiddenAt: timestamp("hidden_at"), // When it was hidden
  // Data expiration privacy fields
  expiresAt: timestamp("expires_at"), // When content should be hidden for privacy
  allowsExpiration: boolean("allows_expiration").default(false), // Whether user has enabled expiration feature
  expiredAt: timestamp("expired_at"), // When content was actually marked as expired (soft deletion)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("soap_entries_user_idx").on(table.userId),
  index("soap_entries_community_idx").on(table.communityId),
  index("soap_entries_date_idx").on(table.devotionalDate),
  index("soap_entries_public_idx").on(table.isPublic),
  index("soap_entries_expires_idx").on(table.expiresAt), // Index for expiration queries
]);

// SOAP Comments  
export const soapComments = pgTable("soap_comments", {
  id: serial("id").primaryKey(),
  soapId: integer("soap_id").notNull().references(() => soapEntries.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: integer("parent_id").references((): any => soapComments.id),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SOAP Reactions - For "Amen", likes, and other spiritual reactions
export const soapReactions = pgTable("soap_reactions", {
  id: serial("id").primaryKey(),
  soapId: integer("soap_id").notNull().references(() => soapEntries.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  reactionType: varchar("reaction_type", { length: 20 }).notNull(), // "amen", "like", "heart", etc.
  emoji: varchar("emoji", { length: 10 }), // Optional emoji representation
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userSoapReactionUnique: unique().on(table.userId, table.soapId, table.reactionType),
}));

// SOAP Bookmarks - Dedicated table for saved SOAP reflections
export const soapBookmarks = pgTable("soap_bookmarks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  soapId: integer("soap_id").notNull().references(() => soapEntries.id),
  bookmarkType: varchar("bookmark_type", { length: 20 }).default("saved"), // saved, favorite, archived
  notes: text("notes"), // Optional user notes for their saved reflection
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userSoapBookmarkUnique: unique().on(table.userId, table.soapId),
}));

// Enhanced friend relationships are defined above

// Chat conversations
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 20 }).notNull().default("direct"), // direct, group
  name: varchar("name", { length: 255 }), // for group chats
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversation participants
export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 20 }).default("member"), // member, admin, clergy
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at"),
  isActive: boolean("is_active").default(true),
});

// Chat messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"), // text, image, file, system
  replyToId: integer("reply_to_id").references((): any => messages.id),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leaderboard and gamification tables
export const userScores = pgTable("user_scores", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalPoints: integer("total_points").default(0),
  weeklyPoints: integer("weekly_points").default(0),
  monthlyPoints: integer("monthly_points").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  weekStartDate: timestamp("week_start_date").defaultNow(),
  monthStartDate: timestamp("month_start_date").defaultNow(),
  faithfulnessScore: integer("faithfulness_score").default(0),
  prayerChampionPoints: integer("prayer_champion_points").default(0),
  serviceHours: integer("service_hours").default(0),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userScoreUnique: unique().on(table.userId),
}));

export const pointTransactions = pgTable("point_transactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  points: integer("points").notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  description: text("description"),
  multiplier: integer("multiplier").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  badgeIcon: varchar("badge_icon", { length: 50 }),
  pointsRequired: integer("points_required").default(0),
  category: varchar("category", { length: 50 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  criteria: text("criteria"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leaderboards = pgTable("leaderboards", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  communityId: integer("community_id").references(() => communities.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  settings: text("settings"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leaderboardEntries = pgTable("leaderboard_entries", {
  id: serial("id").primaryKey(),
  leaderboardId: integer("leaderboard_id").notNull().references(() => leaderboards.id),
  userId: varchar("user_id").references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  rank: integer("rank").notNull(),
  score: integer("score").notNull(),
  entityName: varchar("entity_name", { length: 100 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => ({
  leaderboardUserUnique: unique().on(table.leaderboardId, table.userId),
  leaderboardCommunityUnique: unique().on(table.leaderboardId, table.communityId),
}));

// AI Scripture History for preventing repetition in SOAP generation
export const aiScriptureHistory = pgTable("ai_scripture_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  scriptureReference: varchar("scripture_reference", { length: 100 }).notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
}, (table) => ({
  userScriptureUnique: unique().on(table.userId, table.scriptureReference),
}));

export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(),
  currentCount: integer("current_count").default(0),
  longestCount: integer("longest_count").default(0),
  lastActivityDate: timestamp("last_activity_date"),
  startDate: timestamp("start_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userStreakUnique: unique().on(table.userId, table.type),
}));

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  targetPoints: integer("target_points").default(0),
  targetActivity: varchar("target_activity", { length: 50 }),
  targetCount: integer("target_count").default(0),
  rewardPoints: integer("reward_points").default(0),
  communityId: integer("community_id").references(() => communities.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentProgress: integer("current_progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => ({
  challengeUserUnique: unique().on(table.challengeId, table.userId),
}));

// Tour completion tracking
export const userTourCompletions = pgTable("user_tour_completions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  tourVersion: varchar("tour_version", { length: 20 }).default("1.0"),
}, (table) => ({
  userRoleUnique: unique().on(table.userId, table.role),
}));

// Enhanced community groups are defined above

// Push notification system
export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  pushEnabled: boolean("push_enabled").default(true),
  emailEnabled: boolean("email_enabled").default(true),
  scriptureNotifications: boolean("scripture_notifications").default(true),
  eventNotifications: boolean("event_notifications").default(true),
  messageNotifications: boolean("message_notifications").default(true),
  prayerNotifications: boolean("prayer_notifications").default(true),
  scriptureTime: varchar("scripture_time", { length: 5 }).default("06:00"), // HH:MM format
  timezone: varchar("timezone", { length: 50 }).default("America/Los_Angeles"),
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }).default("22:00"),
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }).default("07:00"),
  weekendNotifications: boolean("weekend_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const scheduledNotifications = pgTable("scheduled_notifications", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  type: varchar("type", { length: 20 }).notNull(), // scripture, event, message, prayer, emergency, reminder, birthday, anniversary
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Los_Angeles"),
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent, emergency
  targetAudience: varchar("target_audience", { length: 20 }).default("all"), // all, members, leaders, group, location, age_group, ministry, attendance
  targetGroupId: integer("target_group_id").references(() => communityGroups.id),
  targetLocation: varchar("target_location", { length: 100 }), // Campus or location targeting
  targetAgeGroup: varchar("target_age_group", { length: 20 }), // youth, adults, seniors
  targetMinistry: varchar("target_ministry", { length: 50 }), // choir, volunteers, small_groups
  targetAttendance: varchar("target_attendance", { length: 20 }), // regular, newcomers, inactive
  targetTags: text("target_tags").array(), // Custom user tags
  targetUserIds: text("target_user_ids").array(), // specific user IDs
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern", { length: 20 }), // daily, weekly, monthly, yearly
  recurringDays: text("recurring_days").array(), // ['monday', 'tuesday'] for weekly
  recurringInterval: integer("recurring_interval").default(1), // Every X days/weeks/months
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, sent, cancelled, failed
  sentAt: timestamp("sent_at"),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickCount: integer("click_count").default(0),
  responseCount: integer("response_count").default(0),
  mediaUrls: text("media_urls").array(), // Images, videos, audio attachments
  interactiveElements: text("interactive_elements"), // JSON for polls, surveys, RSVP buttons
  abTestGroup: varchar("ab_test_group", { length: 10 }), // A, B, control
  weatherDependent: boolean("weather_dependent").default(false),
  weatherConditions: text("weather_conditions").array(), // rain, snow, severe
  autoOptimize: boolean("auto_optimize").default(false), // AI-optimized send times
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationDeliveries = pgTable("notification_deliveries", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").notNull().references(() => scheduledNotifications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  deliveryMethod: varchar("delivery_method", { length: 20 }).notNull(), // push, email, sms
  status: varchar("status", { length: 20 }).default("pending"), // pending, sent, delivered, failed, opened
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  failureReason: text("failure_reason"),
  deviceToken: varchar("device_token", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userDevices = pgTable("user_devices", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  deviceToken: varchar("device_token", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull(), // ios, android, web
  deviceInfo: text("device_info"), // JSON string with device details
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scriptureSchedules = pgTable("scripture_schedules", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  scriptures: text("scriptures").array().notNull(), // Array of scripture references
  targetAudience: varchar("target_audience", { length: 20 }).default("all"),
  targetGroupId: integer("target_group_id").references(() => communityGroups.id),
  targetLocation: varchar("target_location", { length: 100 }),
  targetAgeGroup: varchar("target_age_group", { length: 20 }),
  targetMinistry: varchar("target_ministry", { length: 50 }),
  targetTags: text("target_tags").array(),
  scheduleTime: varchar("schedule_time", { length: 5 }).notNull(), // HH:MM format
  timezone: varchar("timezone", { length: 50 }).default("America/Los_Angeles"),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  currentIndex: integer("current_index").default(0), // Track current scripture
  personalizedContent: boolean("personalized_content").default(false),
  includeReflection: boolean("include_reflection").default(false),
  audioEnabled: boolean("audio_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User segmentation and tagging
export const userTags = pgTable("user_tags", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tag: varchar("tag", { length: 50 }).notNull(),
  value: text("value"), // Optional tag value
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User engagement analytics
export const userEngagementMetrics = pgTable("user_engagement_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  notificationsReceived: integer("notifications_received").default(0),
  notificationsOpened: integer("notifications_opened").default(0),
  notificationsClicked: integer("notifications_clicked").default(0),
  averageOpenTime: integer("average_open_time"), // seconds after receiving
  lastEngagement: timestamp("last_engagement"),
  engagementScore: integer("engagement_score").default(0), // 0-100
  preferredNotificationTypes: text("preferred_notification_types").array(),
  optOutCategories: text("opt_out_categories").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sermon drafts storage
export const sermonDrafts = pgTable("sermon_drafts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: jsonb("content").notNull(), // Stores outline, research, illustrations, enhancement
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  tags: text("tags").array(),
  sermonDate: timestamp("sermon_date"),
  scriptureReferences: text("scripture_references").array(),
  targetAudience: varchar("target_audience", { length: 50 }),
  estimatedDuration: integer("estimated_duration"), // minutes
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("sermon_drafts_user_idx").on(table.userId),
  index("sermon_drafts_community_idx").on(table.communityId),
  index("sermon_drafts_published_idx").on(table.isPublished),
]);

// Insert schemas
export const insertSermonDraftSchema = createInsertSchema(sermonDrafts);
export type InsertSermonDraft = z.infer<typeof insertSermonDraftSchema>;
export type SelectSermonDraft = typeof sermonDrafts.$inferSelect;

// A/B Testing for notifications
export const notificationAbTests = pgTable("notification_ab_tests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  communityId: integer("community_id").references(() => communities.id),
  testType: varchar("test_type", { length: 20 }).notNull(), // subject, content, time, frequency
  variantA: text("variant_a").notNull(), // JSON configuration
  variantB: text("variant_b").notNull(), // JSON configuration
  controlGroup: text("control_group"), // JSON configuration
  targetAudience: text("target_audience").notNull(),
  status: varchar("status", { length: 20 }).default("draft"), // draft, running, completed, paused
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  sampleSize: integer("sample_size"),
  confidenceLevel: integer("confidence_level").default(95),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  results: text("results"), // JSON with test results
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Emergency broadcast system
export const emergencyBroadcasts = pgTable("emergency_broadcasts", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // info, warning, alert, critical
  targetLocations: text("target_locations").array(), // Specific campus/location targeting
  targetRadius: integer("target_radius"), // Geographic radius in miles
  overrideSettings: boolean("override_settings").default(true), // Override user notification preferences
  sendImmediately: boolean("send_immediately").default(true),
  scheduledFor: timestamp("scheduled_for"),
  channels: text("channels").array(), // push, sms, email, app_alert
  status: varchar("status", { length: 20 }).default("draft"), // draft, sent, cancelled
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  acknowledgedCount: integer("acknowledged_count").default(0),
  metadata: text("metadata"), // Additional emergency data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Weather-based notification triggers
export const weatherTriggers = pgTable("weather_triggers", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(), // City, State or coordinates
  conditions: text("conditions").array().notNull(), // rain, snow, temperature, wind, etc.
  threshold: text("threshold"), // JSON with condition thresholds
  notificationTemplate: text("notification_template").notNull(),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interactive notification responses
export const notificationResponses = pgTable("notification_responses", {
  id: serial("id").primaryKey(),
  notificationId: integer("notification_id").notNull().references(() => scheduledNotifications.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  responseType: varchar("response_type", { length: 20 }).notNull(), // poll_vote, rsvp, survey_response, prayer_response
  responseData: text("response_data"), // JSON with response details
  respondedAt: timestamp("responded_at").defaultNow(),
});

// Family relationships and household management
export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  familyName: varchar("family_name", { length: 255 }).notNull(),
  headOfHouseholdId: varchar("head_of_household_id").references(() => users.id),
  address: varchar("address", { length: 500 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 10 }),
  homePhone: varchar("home_phone", { length: 20 }),
  familyPhoto: varchar("family_photo", { length: 255 }),
  communityId: integer("community_id").references(() => communities.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const familyMembers = pgTable("family_members", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id").notNull().references(() => families.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  relationship: varchar("relationship", { length: 50 }).notNull(), // parent, child, spouse, guardian, dependent
  isPrimaryContact: boolean("is_primary_contact").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Member attendance tracking
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  serviceDate: timestamp("service_date").notNull(),
  serviceType: varchar("service_type", { length: 50 }).notNull(), // sunday_service, wednesday_service, special_event
  checkedInAt: timestamp("checked_in_at").defaultNow(),
  checkedInBy: varchar("checked_in_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Member lifecycle events
export const memberEvents = pgTable("member_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  eventType: varchar("event_type", { length: 50 }).notNull(), // baptism, confirmation, wedding, birth, death, graduation, anniversary
  eventDate: timestamp("event_date").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  celebrant: varchar("celebrant", { length: 255 }), // Pastor or officiant
  witnesses: text("witnesses").array(),
  photos: text("photos").array(),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pastoral care and visits
export const pastoralCareRecords = pgTable("pastoral_care_records", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id").notNull().references(() => users.id),
  pastorId: varchar("pastor_id").notNull().references(() => users.id),
  visitType: varchar("visit_type", { length: 50 }).notNull(), // home_visit, hospital_visit, counseling, phone_call, spiritual_guidance
  visitDate: timestamp("visit_date").notNull(),
  duration: integer("duration"), // minutes
  location: varchar("location", { length: 255 }),
  purpose: text("purpose"),
  summary: text("summary"),
  followUpNeeded: boolean("follow_up_needed").default(false),
  followUpDate: timestamp("follow_up_date"),
  privacy: varchar("privacy", { length: 20 }).default("confidential"), // public, private, confidential
  communityId: integer("community_id").references(() => communities.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Member skills and ministry involvement
export const memberSkills = pgTable("member_skills", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  skillCategory: varchar("skill_category", { length: 50 }).notNull(), // music, technology, teaching, counseling, maintenance, administration
  skillName: varchar("skill_name", { length: 100 }).notNull(),
  proficiencyLevel: varchar("proficiency_level", { length: 20 }).default("beginner"), // beginner, intermediate, advanced, expert
  yearsOfExperience: integer("years_of_experience"),
  certifications: text("certifications").array(),
  willingness: varchar("willingness", { length: 20 }).default("available"), // available, maybe, not_available
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ministry leadership and roles
export const ministryRoles = pgTable("ministry_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  ministryName: varchar("ministry_name", { length: 100 }).notNull(),
  role: varchar("role", { length: 100 }).notNull(), // leader, co_leader, member, volunteer
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  responsibilities: text("responsibilities").array(),
  timeCommitment: varchar("time_commitment", { length: 100 }), // weekly hours or description
  communityId: integer("community_id").references(() => communities.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Member giving and stewardship
export const givingRecords = pgTable("giving_records", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  givingType: varchar("giving_type", { length: 50 }).notNull(), // tithe, offering, special_project, mission, building_fund
  method: varchar("method", { length: 50 }).notNull(), // cash, check, online, bank_transfer, card
  giftDate: timestamp("gift_date").notNull(),
  designation: varchar("designation", { length: 255 }),
  isRecurring: boolean("is_recurring").default(false),
  recurringFrequency: varchar("recurring_frequency", { length: 20 }), // weekly, monthly, yearly
  taxDeductible: boolean("tax_deductible").default(true),
  acknowledgmentSent: boolean("acknowledgment_sent").default(false),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Member onboarding process
export const memberOnboarding = pgTable("member_onboarding", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentStep: integer("current_step").default(1),
  totalSteps: integer("total_steps").default(7),
  steps: text("steps"), // JSON array of onboarding steps
  stepProgress: text("step_progress"), // JSON object tracking completion
  assignedMentor: varchar("assigned_mentor").references(() => users.id),
  startDate: timestamp("start_date").defaultNow(),
  completedDate: timestamp("completed_date"),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  communityId: integer("community_id").references(() => communities.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Member communication log
export const memberCommunications = pgTable("member_communications", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id").notNull().references(() => users.id),
  communicationType: varchar("communication_type", { length: 50 }).notNull(), // email, phone, text, mail, in_person
  direction: varchar("direction", { length: 10 }).notNull(), // inbound, outbound
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  sentBy: varchar("sent_by").references(() => users.id),
  sentAt: timestamp("sent_at").notNull(),
  deliveryStatus: varchar("delivery_status", { length: 20 }).default("sent"), // sent, delivered, read, failed
  responseReceived: boolean("response_received").default(false),
  followUpRequired: boolean("follow_up_required").default(false),
  communityId: integer("community_id").references(() => communities.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Confession & Counseling Scheduling
export const counselingSessions = pgTable("counseling_sessions", {
  id: serial("id").primaryKey(),
  memberId: varchar("member_id").notNull().references(() => users.id),
  counselorId: varchar("counselor_id").notNull().references(() => users.id),
  sessionType: varchar("session_type", { length: 30 }).notNull(), // confession, counseling, crisis_prayer, spiritual_guidance
  scheduledTime: timestamp("scheduled_time").notNull(),
  duration: integer("duration").default(60), // minutes
  location: varchar("location", { length: 255 }),
  isVirtual: boolean("is_virtual").default(false),
  meetingLink: varchar("meeting_link", { length: 500 }),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, confirmed, completed, cancelled, no_show
  notes: text("notes"),
  followUpNeeded: boolean("follow_up_needed").default(false),
  confidential: boolean("confidential").default(true),
  communityId: integer("community_id").references(() => communities.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy volunteer opportunities (for existing event sign-ups)
export const legacyVolunteerOpportunities = pgTable("legacy_volunteer_opportunities", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requiredSkills: text("required_skills").array(),
  maxVolunteers: integer("max_volunteers"),
  currentSignUps: integer("current_sign_ups").default(0),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  location: varchar("location", { length: 255 }),
  contactPersonId: varchar("contact_person_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const volunteerSignUps = pgTable("volunteer_sign_ups", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => legacyVolunteerOpportunities.id),
  volunteerId: varchar("volunteer_id").notNull().references(() => users.id),
  signUpDate: timestamp("sign_up_date").defaultNow(),
  status: varchar("status", { length: 20 }).default("signed_up"), // signed_up, confirmed, completed, cancelled
  notes: text("notes"),
  hoursServed: real("hours_served"),
  feedback: text("feedback"),
  communityId: integer("community_id").references(() => communities.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventSignUps = pgTable("event_sign_ups", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  memberId: varchar("member_id").notNull().references(() => users.id),
  signUpType: varchar("sign_up_type", { length: 30 }).notNull(), // greeter, usher, setup, cleanup, food_service, childcare
  role: varchar("role", { length: 100 }),
  requirements: text("requirements"),
  signUpDate: timestamp("sign_up_date").defaultNow(),
  status: varchar("status", { length: 20 }).default("confirmed"), // confirmed, completed, cancelled
  notes: text("notes"),
  communityId: integer("community_id").references(() => communities.id),
});

// Livestream & Sermon Archive
export const livestreams = pgTable("livestreams", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  streamKey: varchar("stream_key", { length: 255 }),
  streamUrl: varchar("stream_url", { length: 500 }),
  embedCode: text("embed_code"),
  scheduledStart: timestamp("scheduled_start"),
  actualStart: timestamp("actual_start"),
  actualEnd: timestamp("actual_end"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, live, ended, archived
  viewerCount: integer("viewer_count").default(0),
  maxViewers: integer("max_viewers").default(0),
  chatEnabled: boolean("chat_enabled").default(true),
  recordingEnabled: boolean("recording_enabled").default(true),
  recordingUrl: varchar("recording_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  tags: text("tags").array(),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sermonArchive = pgTable("sermon_archive", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  speaker: varchar("speaker", { length: 255 }).notNull(),
  sermonDate: timestamp("sermon_date").notNull(),
  series: varchar("series", { length: 255 }),
  scripture: varchar("scripture", { length: 255 }),
  description: text("description"),
  videoUrl: varchar("video_url", { length: 500 }),
  audioUrl: varchar("audio_url", { length: 500 }),
  transcriptUrl: varchar("transcript_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  duration: integer("duration"), // seconds
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),
  tags: text("tags").array(),
  category: varchar("category", { length: 50 }).default("sermon"), // sermon, teaching, testimony, special
  isPublic: boolean("is_public").default(true),
  featured: boolean("featured").default(false),
  communityId: integer("community_id").references(() => communities.id),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const devotionalMedia = pgTable("devotional_media", {
  id: serial("id").primaryKey(),
  devotionalId: integer("devotional_id").references(() => devotionals.id),
  mediaType: varchar("media_type", { length: 20 }).notNull(), // video, audio, image, document
  mediaUrl: varchar("media_url", { length: 500 }).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  duration: integer("duration"), // seconds for audio/video
  fileSize: integer("file_size"), // bytes
  mimeType: varchar("mime_type", { length: 100 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  isEmbedded: boolean("is_embedded").default(false),
  embedCode: text("embed_code"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Bible Feature Tables
export const dailyVerses = pgTable("daily_verses", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  verseReference: varchar("verse_reference", { length: 100 }).notNull(), // e.g., "John 3:16"
  verseText: text("verse_text").notNull(),
  verseTextNiv: text("verse_text_niv"),
  verseTextKjv: text("verse_text_kjv"),
  verseTextEsv: text("verse_text_esv"),
  verseTextNlt: text("verse_text_nlt"),
  theme: varchar("theme", { length: 200 }), // e.g., "Peace in Uncertainty"
  reflectionPrompt: text("reflection_prompt"),
  guidedPrayer: text("guided_prayer"),
  backgroundImageUrl: varchar("background_image_url"),
  audioUrl: varchar("audio_url"),
  journeyType: varchar("journey_type", { length: 50 }).default("reading"), // reading, audio, meditation, study
  seriesName: varchar("series_name", { length: 200 }), // e.g., "Psalms of Peace", "Parables of Jesus"
  seriesOrder: integer("series_order").default(1), // Position within series
  difficulty: varchar("difficulty", { length: 20 }).default("beginner"), // beginner, intermediate, advanced
  estimatedMinutes: integer("estimated_minutes").default(5),
  tags: text("tags").array(), // ["hope", "faith", "courage"]
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User journey preferences and progress
export const userJourneyPreferences = pgTable("user_journey_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentJourneyType: varchar("current_journey_type", { length: 50 }).default("reading"), // reading, audio, meditation, study
  preferredTime: varchar("preferred_time", { length: 20 }), // morning, afternoon, evening
  currentSeries: varchar("current_series", { length: 200 }), // Which series they're following
  seriesProgress: integer("series_progress").default(0), // How far in the series
  lastCompletedDate: timestamp("last_completed_date"),
  autoAdvanceSeries: boolean("auto_advance_series").default(true),
  notificationEnabled: boolean("notification_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userBibleStreaks = pgTable("user_bible_streaks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastReadDate: timestamp("last_read_date"),
  totalDaysRead: integer("total_days_read").default(0),
  versesMemorized: integer("verses_memorized").default(0),
  graceDaysUsed: integer("grace_days_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userBibleReadings = pgTable("user_bible_readings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dailyVerseId: integer("daily_verse_id").notNull().references(() => dailyVerses.id),
  readAt: timestamp("read_at").defaultNow(),
  reflectionText: text("reflection_text"),
  emotionalReaction: varchar("emotional_reaction", { length: 50 }), // "fire", "pray", "heart", "peace"
  audioListened: boolean("audio_listened").default(false),
  shared: boolean("shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bibleBadges = pgTable("bible_badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url"),
  requirement: jsonb("requirement"), // {"type": "streak", "value": 7}
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBibleBadges = pgTable("user_bible_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => bibleBadges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

export const bibleVerseShares = pgTable("bible_verse_shares", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dailyVerseId: integer("daily_verse_id").notNull().references(() => dailyVerses.id),
  platform: varchar("platform", { length: 50 }), // "soapbox", "facebook", "twitter", "instagram"
  shareText: text("share_text"),
  reactions: integer("reactions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// D.I.V.I.N.E. Phase 2: Enterprise Ready - Multi-Campus Support
export const campuses = pgTable("campuses", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  name: varchar("name", { length: 100 }).notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  country: varchar("country", { length: 50 }).default("United States"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  website: varchar("website", { length: 255 }),
  email: varchar("email", { length: 255 }),
  campusAdminName: varchar("campus_admin_name", { length: 255 }),
  campusAdminEmail: varchar("campus_admin_email", { length: 255 }),
  campusAdminMobile: varchar("campus_admin_mobile", { length: 20 }),
  primaryContactId: varchar("primary_contact_id").references(() => users.id),
  capacity: integer("capacity"),
  isActive: boolean("is_active").default(true),
  settings: jsonb("settings"), // Campus-specific settings and configurations
  timeZone: varchar("time_zone", { length: 50 }).default("America/New_York"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// D.I.V.I.N.E. Phase 3A: Cross-Campus Member Management
export const memberCampusAssignments = pgTable("member_campus_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  campusId: integer("campus_id").notNull().references(() => campuses.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  isPrimaryCampus: boolean("is_primary_campus").default(false),
  membershipStatus: varchar("membership_status", { length: 50 }).default("active"), // active, inactive, transferred, pending
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  transferredFrom: integer("transferred_from").references(() => campuses.id),
  transferReason: text("transfer_reason"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campus-specific roles for members
export const campusMemberRoles = pgTable("campus_member_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  campusId: integer("campus_id").notNull().references(() => campuses.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  roleTitle: varchar("role_title", { length: 100 }).notNull(), // "Campus Coordinator", "Ministry Leader", etc.
  roleDescription: text("role_description"),
  permissions: text("permissions").array(), // ["events", "members", "communications"]
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  assignedBy: varchar("assigned_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Member transfer history tracking
export const memberTransferHistory = pgTable("member_transfer_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  fromCampusId: integer("from_campus_id").references(() => campuses.id),
  toCampusId: integer("to_campus_id").notNull().references(() => campuses.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  transferReason: text("transfer_reason"),
  transferType: varchar("transfer_type", { length: 50 }).default("manual"), // manual, automatic, request
  requestedBy: varchar("requested_by").references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  transferDate: timestamp("transfer_date").defaultNow(),
  previousRoles: jsonb("previous_roles"), // Store roles from previous campus
  notes: text("notes"),
  status: varchar("status", { length: 50 }).default("completed"), // pending, approved, rejected, completed
  createdAt: timestamp("created_at").defaultNow(),
});

// Campus administrators for multi-campus management
export const campusAdministrators = pgTable("campus_administrators", {
  id: serial("id").primaryKey(),
  campusId: integer("campus_id").notNull().references(() => campuses.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  permissions: text("permissions").array(), // ["volunteer_management", "event_planning", "reports", "settings"]
  isActive: boolean("is_active").default(true),
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Volunteer campus assignments for multi-campus volunteer management
export const volunteerCampusAssignments = pgTable("volunteer_campus_assignments", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  campusId: integer("campus_id").notNull().references(() => campuses.id),
  isPrimaryCampus: boolean("is_primary_campus").default(false),
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Background check providers for enterprise integration
export const backgroundCheckProviders = pgTable("background_check_providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // MinistrySafe, Checkr, ProtectMyMinistry
  apiEndpoint: varchar("api_endpoint", { length: 500 }),
  apiKey: varchar("api_key", { length: 255 }), // Encrypted storage
  webhookUrl: varchar("webhook_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  supportedCheckTypes: text("supported_check_types").array(),
  averageProcessingDays: integer("average_processing_days").default(7),
  costPerCheck: decimal("cost_per_check", { precision: 6, scale: 2 }),
  settings: jsonb("settings"), // Provider-specific configuration
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Background check requirements by role
export const backgroundCheckRequirements = pgTable("background_check_requirements", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => volunteerRoles.id),
  opportunityId: integer("opportunity_id").references(() => volunteerOpportunities.id),
  checkType: varchar("check_type", { length: 50 }).notNull(), // basic, comprehensive, child_protection, fingerprint
  providerId: integer("provider_id").references(() => backgroundCheckProviders.id),
  renewalMonths: integer("renewal_months").default(24), // How often to renew
  isRequired: boolean("is_required").default(true),
  gracePeriodDays: integer("grace_period_days").default(30), // Days after expiration before blocking
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced volunteer metrics for analytics
export const volunteerMetrics = pgTable("volunteer_metrics", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  campusId: integer("campus_id").references(() => campuses.id),
  date: timestamp("date").notNull(),
  hoursLogged: decimal("hours_logged", { precision: 8, scale: 2 }).default("0"),
  engagementScore: decimal("engagement_score", { precision: 5, scale: 2 }), // 0-100 calculated score
  activitiesCompleted: integer("activities_completed").default(0),
  eventsAttended: integer("events_attended").default(0),
  trainingSessionsCompleted: integer("training_sessions_completed").default(0),
  feedbackRating: decimal("feedback_rating", { precision: 3, scale: 2 }), // Average feedback rating
  impactScore: decimal("impact_score", { precision: 5, scale: 2 }), // Calculated impact metric
  notes: text("notes"),
  recordedBy: varchar("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Ministry analytics for leadership dashboard
export const ministryAnalytics = pgTable("ministry_analytics", {
  id: serial("id").primaryKey(),
  ministryName: varchar("ministry_name", { length: 100 }).notNull(),
  campusId: integer("campus_id").references(() => campuses.id),
  period: varchar("period", { length: 20 }).notNull(), // daily, weekly, monthly, quarterly, yearly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  volunteerCount: integer("volunteer_count").default(0),
  activeVolunteers: integer("active_volunteers").default(0),
  newVolunteers: integer("new_volunteers").default(0),
  retainedVolunteers: integer("retained_volunteers").default(0),
  totalHours: decimal("total_hours", { precision: 10, scale: 2 }).default("0"),
  averageHoursPerVolunteer: decimal("average_hours_per_volunteer", { precision: 8, scale: 2 }),
  completionRate: decimal("completion_rate", { precision: 5, scale: 2 }), // Percentage of tasks completed
  satisfactionScore: decimal("satisfaction_score", { precision: 3, scale: 2 }), // Average satisfaction rating
  impactMetrics: jsonb("impact_metrics"), // Custom ministry-specific metrics
  notes: text("notes"),
  generatedBy: varchar("generated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dashboard configurations for personalized ministry leader views
export const dashboardConfigurations = pgTable("dashboard_configurations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  dashboardType: varchar("dashboard_type", { length: 50 }).notNull(), // ministry_leader, campus_admin, volunteer_coordinator
  layoutSettings: jsonb("layout_settings"), // Widget positions, sizes, preferences
  widgets: text("widgets").array(), // Active widgets: ["volunteer_overview", "engagement_metrics", "upcoming_events"]
  filters: jsonb("filters"), // Default filters for reports and views
  refreshInterval: integer("refresh_interval").default(300), // Seconds
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ministry leader communication tracking
export const ministryLeaderCommunications = pgTable("ministry_leader_communications", {
  id: serial("id").primaryKey(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientIds: text("recipient_ids").array(), // Multiple volunteers can receive same message
  campusId: integer("campus_id").references(() => campuses.id),
  subject: varchar("subject", { length: 200 }).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 30 }).notNull(), // announcement, training_reminder, schedule_update, appreciation
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  scheduledFor: timestamp("scheduled_for"),
  deliveredAt: timestamp("delivered_at"),
  readCount: integer("read_count").default(0),
  responseCount: integer("response_count").default(0),
  attachments: text("attachments").array(),
  tags: text("tags").array(), // For categorization and filtering
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contact submissions from marketing website
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isChurchLeader: boolean("is_church_leader").default(false),
  status: varchar("status", { length: 50 }).default("new"), // new, contacted, qualified, closed
  source: varchar("source", { length: 50 }).default("website"), // website, referral, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations for customer support
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userName: varchar("user_name", { length: 255 }),
  userEmail: varchar("user_email", { length: 255 }),
  status: varchar("status", { length: 50 }).default("active"), // active, closed, escalated
  source: varchar("source", { length: 50 }).default("website"), // website, whatsapp, email
  assignedAgent: varchar("assigned_agent", { length: 255 }),
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages within conversations
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => chatConversations.id),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  sender: varchar("sender", { length: 20 }).notNull(), // user, agent, system
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"), // text, system, file, template
  isRead: boolean("is_read").default(false),
  metadata: jsonb("metadata"), // Additional data like user agent, IP, etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("chat_messages_conversation_idx").on(table.conversationId),
  index("chat_messages_session_idx").on(table.sessionId),
  index("chat_messages_created_idx").on(table.createdAt),
]);

// Type definitions for contacts and invitations
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

export const insertContactSchema = createInsertSchema(contacts);
export const insertInvitationSchema = createInsertSchema(invitations);
export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions);

// Chat conversation types
export const insertChatConversationSchema = createInsertSchema(chatConversations);
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

// Chat message types  
export const insertChatMessageSchema = createInsertSchema(chatMessages);
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// D.I.V.I.N.E. Phase 2 Enterprise Types
export type Campus = typeof campuses.$inferSelect;
export type InsertCampus = typeof campuses.$inferInsert;
export type CampusAdministrator = typeof campusAdministrators.$inferSelect;
export type InsertCampusAdministrator = typeof campusAdministrators.$inferInsert;
export type VolunteerCampusAssignment = typeof volunteerCampusAssignments.$inferSelect;
export type InsertVolunteerCampusAssignment = typeof volunteerCampusAssignments.$inferInsert;

// D.I.V.I.N.E. Phase 3A: Cross-Campus Member Management Types
export type MemberCampusAssignment = typeof memberCampusAssignments.$inferSelect;
export type InsertMemberCampusAssignment = typeof memberCampusAssignments.$inferInsert;
export type CampusMemberRole = typeof campusMemberRoles.$inferSelect;
export type InsertCampusMemberRole = typeof campusMemberRoles.$inferInsert;
export type MemberTransferHistory = typeof memberTransferHistory.$inferSelect;
export type InsertMemberTransferHistory = typeof memberTransferHistory.$inferInsert;
export type BackgroundCheckProvider = typeof backgroundCheckProviders.$inferSelect;
export type InsertBackgroundCheckProvider = typeof backgroundCheckProviders.$inferInsert;
export type BackgroundCheckRequirement = typeof backgroundCheckRequirements.$inferSelect;
export type InsertBackgroundCheckRequirement = typeof backgroundCheckRequirements.$inferInsert;
export type VolunteerMetric = typeof volunteerMetrics.$inferSelect;
export type InsertVolunteerMetric = typeof volunteerMetrics.$inferInsert;
export type MinistryAnalytics = typeof ministryAnalytics.$inferSelect;
export type InsertMinistryAnalytics = typeof ministryAnalytics.$inferInsert;
export type DashboardConfiguration = typeof dashboardConfigurations.$inferSelect;
export type InsertDashboardConfiguration = typeof dashboardConfigurations.$inferInsert;
export type MinistryLeaderCommunication = typeof ministryLeaderCommunications.$inferSelect;
export type InsertMinistryLeaderCommunication = typeof ministryLeaderCommunications.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  userChurches: many(userChurches),
  discussions: many(discussions),
  discussionComments: many(discussionComments),
  discussionLikes: many(discussionLikes),
  events: many(events),
  eventRsvps: many(eventRsvps),
  prayerRequests: many(prayerRequests),
  prayerResponses: many(prayerResponses),
  userAchievements: many(userAchievements),
  userActivities: many(userActivities),
  requestedFriendships: many(friendships, { relationName: "requester" }),
  receivedFriendships: many(friendships, { relationName: "addressee" }),
  conversations: many(conversations),
  conversationParticipants: many(conversationParticipants),
  messages: many(messages),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  creator: one(users, {
    fields: [conversations.createdBy],
    references: [users.id],
  }),
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
  }),
}));

export const communitiesRelations = relations(communities, ({ many }) => ({
  userCommunities: many(userCommunities),
  events: many(events),
  discussions: many(discussions),
  prayerRequests: many(prayerRequests),
}));

// Legacy churches relations alias for backward compatibility
export const churchesRelations = communitiesRelations;

export const userCommunitiesRelations = relations(userCommunities, ({ one }) => ({
  user: one(users, {
    fields: [userCommunities.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [userCommunities.communityId],
    references: [communities.id],
  }),
}));

// Legacy userChurches relations alias for backward compatibility
export const userChurchesRelations = userCommunitiesRelations;

export const eventsRelations = relations(events, ({ one, many }) => ({
  community: one(communities, {
    fields: [events.communityId],
    references: [communities.id],
  }),
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  eventRsvps: many(eventRsvps),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  author: one(users, {
    fields: [discussions.authorId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [discussions.communityId],
    references: [communities.id],
  }),
  comments: many(discussionComments),
  likes: many(discussionLikes),
}));

export const discussionCommentsRelations = relations(discussionComments, ({ one, many }) => ({
  discussion: one(discussions, {
    fields: [discussionComments.discussionId],
    references: [discussions.id],
  }),
  author: one(users, {
    fields: [discussionComments.authorId],
    references: [users.id],
  }),
  parent: one(discussionComments, {
    fields: [discussionComments.parentId],
    references: [discussionComments.id],
  }),
  replies: many(discussionComments),
}));

export const discussionLikesRelations = relations(discussionLikes, ({ one }) => ({
  discussion: one(discussions, {
    fields: [discussionLikes.discussionId],
    references: [discussions.id],
  }),
  user: one(users, {
    fields: [discussionLikes.userId],
    references: [users.id],
  }),
}));

export const prayerRequestsRelations = relations(prayerRequests, ({ one, many }) => ({
  author: one(users, {
    fields: [prayerRequests.authorId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [prayerRequests.communityId],
    references: [communities.id],
  }),
  prayerResponses: many(prayerResponses),
}));

export const prayerResponsesRelations = relations(prayerResponses, ({ one }) => ({
  prayerRequest: one(prayerRequests, {
    fields: [prayerResponses.prayerRequestId],
    references: [prayerRequests.id],
  }),
  user: one(users, {
    fields: [prayerResponses.userId],
    references: [users.id],
  }),
}));

export const prayerCirclesRelations = relations(prayerCircles, ({ one, many }) => ({
  community: one(communities, {
    fields: [prayerCircles.communityId],
    references: [communities.id],
  }),
  creator: one(users, {
    fields: [prayerCircles.createdBy],
    references: [users.id],
  }),
  members: many(prayerCircleMembers),
}));

export const prayerCircleMembersRelations = relations(prayerCircleMembers, ({ one }) => ({
  prayerCircle: one(prayerCircles, {
    fields: [prayerCircleMembers.prayerCircleId],
    references: [prayerCircles.id],
  }),
  user: one(users, {
    fields: [prayerCircleMembers.userId],
    references: [users.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
}));

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));

export const dailyInspirationsRelations = relations(dailyInspirations, ({ many }) => ({
  userHistory: many(userInspirationHistory),
}));

export const userInspirationPreferencesRelations = relations(userInspirationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userInspirationPreferences.userId],
    references: [users.id],
  }),
}));

export const userInspirationHistoryRelations = relations(userInspirationHistory, ({ one }) => ({
  user: one(users, {
    fields: [userInspirationHistory.userId],
    references: [users.id],
  }),
  inspiration: one(dailyInspirations, {
    fields: [userInspirationHistory.inspirationId],
    references: [dailyInspirations.id],
  }),
}));

// Export types for core tables
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Mood check-in types
export type MoodCheckin = typeof moodCheckins.$inferSelect;
export type InsertMoodCheckin = typeof moodCheckins.$inferInsert;

// Enhanced Mood Indicators (EMI) types
export type EnhancedMoodIndicator = typeof enhancedMoodIndicators.$inferSelect;
export type InsertEnhancedMoodIndicator = typeof enhancedMoodIndicators.$inferInsert;

// Personalized content types
export type PersonalizedContent = typeof personalizedContent.$inferSelect;
export type InsertPersonalizedContent = typeof personalizedContent.$inferInsert;

// Insert schemas for mood features
export const insertMoodCheckinSchema = createInsertSchema(moodCheckins).omit({ id: true, createdAt: true });

// Enhanced Mood Indicators (EMI) Zod Schema
export const insertEnhancedMoodIndicatorSchema = createInsertSchema(enhancedMoodIndicators).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertPersonalizedContentSchema = createInsertSchema(personalizedContent).omit({ id: true, createdAt: true });

// Bible in a Day sessions
export const bibleInADaySessions = pgTable("bible_in_a_day_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  currentSectionIndex: integer("current_section_index").default(0),
  totalTimeSpent: integer("total_time_spent").default(0), // in minutes
  targetDuration: integer("target_duration").default(60), // in minutes
  isCompleted: boolean("is_completed").default(false),
  reflectionNotes: text("reflection_notes"),
  finalRating: integer("final_rating"), // 1-5 stars
  sessionType: varchar("session_type", { length: 20 }).default("fast_track"), // fast_track, deep_dive, audio_only
});

// Bible in a Day section progress
export const bibleInADaySectionProgress = pgTable("bible_in_a_day_section_progress", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => bibleInADaySessions.id),
  sectionKey: varchar("section_key", { length: 50 }).notNull(), // creation, fall_promise, christ, church_future
  sectionTitle: varchar("section_title", { length: 100 }).notNull(),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent").default(0), // in minutes
  reflectionAnswer: text("reflection_answer"),
  isCompleted: boolean("is_completed").default(false),
});

// Bible in a Day completion badges
export const bibleInADayBadges = pgTable("bible_in_a_day_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").notNull().references(() => bibleInADaySessions.id),
  badgeType: varchar("badge_type", { length: 50 }).notNull(), // fast_track_finisher, full_immersion_finisher, first_timer, repeat_reader
  earnedAt: timestamp("earned_at").defaultNow(),
  shareCount: integer("share_count").default(0),
});

// Daily Bible Feature Types
export type DailyVerse = typeof dailyVerses.$inferSelect;
export type InsertDailyVerse = typeof dailyVerses.$inferInsert;
export type UserJourneyPreferences = typeof userJourneyPreferences.$inferSelect;
export type InsertUserJourneyPreferences = typeof userJourneyPreferences.$inferInsert;

// Bible in a Day Types
export type BibleInADaySession = typeof bibleInADaySessions.$inferSelect;
export type InsertBibleInADaySession = typeof bibleInADaySessions.$inferInsert;
export type BibleInADaySectionProgress = typeof bibleInADaySectionProgress.$inferSelect;
export type InsertBibleInADaySectionProgress = typeof bibleInADaySectionProgress.$inferInsert;
export type BibleInADayBadge = typeof bibleInADayBadges.$inferSelect;
export type InsertBibleInADayBadge = typeof bibleInADayBadges.$inferInsert;
export type UserBibleStreak = typeof userBibleStreaks.$inferSelect;
export type InsertUserBibleStreak = typeof userBibleStreaks.$inferInsert;
export type UserBibleReading = typeof userBibleReadings.$inferSelect;
export type InsertUserBibleReading = typeof userBibleReadings.$inferInsert;
export type BibleBadge = typeof bibleBadges.$inferSelect;
export type InsertBibleBadge = typeof bibleBadges.$inferInsert;
export type UserBibleBadge = typeof userBibleBadges.$inferSelect;
export type InsertUserBibleBadge = typeof userBibleBadges.$inferInsert;
export type BibleVerseShare = typeof bibleVerseShares.$inferSelect;
export type InsertBibleVerseShare = typeof bibleVerseShares.$inferInsert;

// S.O.A.P. Entry Types
export type SoapEntry = typeof soapEntries.$inferSelect;
export type InsertSoapEntry = typeof soapEntries.$inferInsert;

// SOAP Reaction Types
export type SoapReaction = typeof soapReactions.$inferSelect;
export type InsertSoapReaction = typeof soapReactions.$inferInsert;

// SOAP Bookmark Types
export type SoapBookmark = typeof soapBookmarks.$inferSelect;
export type InsertSoapBookmark = typeof soapBookmarks.$inferInsert;

// S.O.A.P. Zod Schema
export const insertSoapEntrySchema = createInsertSchema(soapEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  devotionalDate: z.union([z.date(), z.string()]).transform((val) => {
    if (typeof val === 'string') {
      return new Date(val);
    }
    return val;
  }),
});

// SOAP Bookmark Zod Schema
export const insertSoapBookmarkSchema = createInsertSchema(soapBookmarks).omit({
  id: true,
  createdAt: true,
});

// Daily Bible Zod Schemas
export const insertDailyVerseSchema = createInsertSchema(dailyVerses);
export const insertUserBibleStreakSchema = createInsertSchema(userBibleStreaks);
export const insertUserBibleReadingSchema = createInsertSchema(userBibleReadings).omit({ id: true, createdAt: true });
export const insertBibleBadgeSchema = createInsertSchema(bibleBadges);
export const insertUserBibleBadgeSchema = createInsertSchema(userBibleBadges);
export const insertBibleVerseShareSchema = createInsertSchema(bibleVerseShares).omit({ id: true, createdAt: true });

// Bible in a Day Zod Schemas
export const insertBibleInADaySessionSchema = createInsertSchema(bibleInADaySessions).omit({ id: true, startedAt: true });
export const insertBibleInADaySectionProgressSchema = createInsertSchema(bibleInADaySectionProgress).omit({ id: true, startedAt: true });

// Referral Rewards System
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  refereeId: varchar("referee_id").notNull().references(() => users.id),
  referralCode: varchar("referral_code").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // pending, completed, rewarded
  referrerPointsAwarded: integer("referrer_points_awarded").default(0),
  refereePointsAwarded: integer("referee_points_awarded").default(0),
  referrerRewardedAt: timestamp("referrer_rewarded_at"),
  refereeRewardedAt: timestamp("referee_rewarded_at"),
  completedAt: timestamp("completed_at"), // When referee completed onboarding
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral reward tiers and bonuses
export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  tier: varchar("tier", { length: 20 }).notNull(), // bronze, silver, gold, platinum
  minReferrals: integer("min_referrals").notNull(),
  referrerBasePoints: integer("referrer_base_points").default(500), // Base points for each successful referral
  refereeWelcomePoints: integer("referee_welcome_points").default(250), // Welcome bonus for new users
  tierBonusPoints: integer("tier_bonus_points").default(0), // Additional bonus for reaching tier
  bonusDescription: text("bonus_description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referral milestones and special rewards
export const referralMilestones = pgTable("referral_milestones", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  milestoneType: varchar("milestone_type", { length: 50 }).notNull(), // first_referral, fifth_referral, tenth_referral, etc.
  totalReferrals: integer("total_referrals").notNull(),
  bonusPoints: integer("bonus_points").notNull(),
  badgeAwarded: varchar("badge_awarded", { length: 100 }),
  achievedAt: timestamp("achieved_at").defaultNow(),
  pointsAwarded: boolean("points_awarded").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ServeWell™ - World-Class Volunteer Management System

// Spiritual gifts taxonomy for divine appointment matching
export const spiritualGifts = pgTable("spiritual_gifts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // administration, leadership, teaching, mercy, etc.
  category: varchar("category", { length: 30 }).notNull(), // ministry, spiritual, natural
  description: text("description").notNull(),
  scriptureReference: varchar("scripture_reference", { length: 100 }),
  assessmentQuestions: text("assessment_questions").array(),
  isActive: boolean("is_active").default(true),
});

// Enhanced volunteer roles with ministry focus
export const volunteerRoles = pgTable("volunteer_roles", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // worship, children, youth, hospitality, tech, admin
  department: varchar("department", { length: 50 }),
  requiredSkills: text("required_skills").array(),
  spiritualGifts: text("spiritual_gifts").array(), // Aligned spiritual gifts
  backgroundCheckRequired: boolean("background_check_required").default(false),
  minimumAge: integer("minimum_age").default(16),
  commitment: varchar("commitment", { length: 50 }), // weekly, monthly, event-based
  hoursPerWeek: integer("hours_per_week"),
  requiredTraining: text("required_training").array(),
  isLeadershipRole: boolean("is_leadership_role").default(false),
  maxVolunteers: integer("max_volunteers"),
  currentVolunteers: integer("current_volunteers").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced volunteer profiles with spiritual focus
export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").references(() => communities.id),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  emergencyContactName: varchar("emergency_contact_name", { length: 100 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  languagePreference: varchar("language_preference", { length: 50 }).default("English"),
  preferredBibleTranslation: varchar("preferred_bible_translation", { length: 10 }).default("NIV"),
  
  // Enhanced spiritual and skill matching
  skills: text("skills").array(), // Technical and natural skills
  interests: text("interests").array(), // Ministry interests
  spiritualGifts: text("spiritual_gifts").array(), // Assessed spiritual gifts
  spiritualGiftsScore: jsonb("spiritual_gifts_score"), // Gift assessment scores
  ministryPassion: text("ministry_passion").array(), // Areas of calling
  personalityType: varchar("personality_type", { length: 20 }), // For team compatibility
  servingStyle: varchar("serving_style", { length: 30 }), // hands_on, behind_scenes, leadership, support
  
  // Availability and constraints
  availability: jsonb("availability"), // {monday: [{start: "09:00", end: "17:00"}], ...}
  timeCommitmentLevel: varchar("time_commitment_level", { length: 20 }).default("moderate"), // low, moderate, high
  maxHoursPerWeek: integer("max_hours_per_week"),
  preferredMinistries: text("preferred_ministries").array(),
  
  // Compliance and safety
  backgroundCheck: boolean("background_check").default(false),
  backgroundCheckDate: timestamp("background_check_date"),
  backgroundCheckStatus: varchar("background_check_status", { length: 20 }), // pending, approved, rejected, expired
  backgroundCheckProvider: varchar("background_check_provider", { length: 50 }),
  orientation: boolean("orientation").default(false),
  orientationDate: timestamp("orientation_date"),
  
  // Kingdom impact tracking
  totalHoursServed: decimal("total_hours_served", { precision: 8, scale: 2 }).default("0"),
  livesTouched: integer("lives_touched").default(0), // Impact metric
  kingdomImpactScore: integer("kingdom_impact_score").default(0),
  lastServedDate: timestamp("last_served_date"),
  servingStreakDays: integer("serving_streak_days").default(0),
  
  // AI matching optimization
  aiMatchingData: jsonb("ai_matching_data"), // ML features for smart matching
  successfulPlacements: integer("successful_placements").default(0),
  volunteerSatisfactionScore: real("volunteer_satisfaction_score"), // 1-5 from feedback
  
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, pending, on_break
  joinedAt: timestamp("joined_at").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Volunteer role assignments
export const volunteerRoleAssignments = pgTable("volunteer_role_assignments", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  roleId: integer("role_id").notNull().references(() => volunteerRoles.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  notes: text("notes"),
});

// Volunteer opportunities/events
export const volunteerOpportunities = pgTable("volunteer_opportunities", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  roleId: integer("role_id").references(() => volunteerRoles.id),
  coordinatorId: varchar("coordinator_id").references(() => users.id),
  location: varchar("location", { length: 500 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  volunteersNeeded: integer("volunteers_needed").default(1),
  volunteersRegistered: integer("volunteers_registered").default(0),
  requiredSkills: text("required_skills").array(),
  preferredSkills: text("preferred_skills").array(),
  spiritualGifts: text("spiritual_gifts").array(),
  timeCommitment: varchar("time_commitment", { length: 500 }),
  timeCommitmentLevel: varchar("time_commitment_level", { length: 500 }),
  maxHoursPerWeek: integer("max_hours_per_week"),
  ministry: varchar("ministry", { length: 300 }),
  category: varchar("category", { length: 300 }),
  responsibilities: text("responsibilities").array(),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: jsonb("recurring_pattern"), // {frequency: "weekly", interval: 1, daysOfWeek: [1,3,5]}
  recurringDays: text("recurring_days").array(),
  teamSize: integer("team_size"),
  teamRoles: text("team_roles").array(),
  leadershipRequired: boolean("leadership_required").default(false),
  performanceMetrics: text("performance_metrics").array(),
  trainingRequired: boolean("training_required").default(false),
  orientationRequired: boolean("orientation_required").default(false),
  mentorshipProvided: boolean("mentorship_provided").default(false),
  backgroundCheckLevel: varchar("background_check_level", { length: 150 }),
  status: varchar("status", { length: 20 }).default("open"), // open, closed, cancelled, completed
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
  backgroundCheckRequired: boolean("background_check_required").default(false),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Volunteer registrations for opportunities
export const volunteerRegistrations = pgTable("volunteer_registrations", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id").notNull().references(() => volunteerOpportunities.id),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  registeredAt: timestamp("registered_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("registered"), // registered, confirmed, cancelled, no_show, completed
  notes: text("notes"),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  hoursServed: decimal("hours_served", { precision: 4, scale: 2 }),
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5 stars
});

// Volunteer hour tracking
export const volunteerHours = pgTable("volunteer_hours", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  opportunityId: integer("opportunity_id").references(() => volunteerOpportunities.id),
  roleId: integer("role_id").references(() => volunteerRoles.id),
  date: timestamp("date").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  hoursServed: decimal("hours_served", { precision: 4, scale: 2 }).notNull(),
  description: text("description"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});



// Volunteer feedback and surveys
export const volunteerFeedback = pgTable("volunteer_feedback", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  opportunityId: integer("opportunity_id").references(() => volunteerOpportunities.id),
  feedbackType: varchar("feedback_type", { length: 20 }).notNull(), // experience, suggestion, complaint, compliment
  rating: integer("rating"), // 1-5 stars
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  status: varchar("status", { length: 20 }).default("open"), // open, reviewed, resolved, closed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI-Powered Divine Appointment Matching System
export const volunteerMatches = pgTable("volunteer_matches", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  opportunityId: integer("opportunity_id").notNull().references(() => volunteerOpportunities.id),
  matchScore: real("match_score").notNull(), // 0-1 confidence score
  matchReasons: text("match_reasons").array(), // spiritual_gifts, skills, availability, passion
  spiritualFitScore: real("spiritual_fit_score"), // Spiritual gifts alignment
  skillFitScore: real("skill_fit_score"), // Technical skills match
  availabilityScore: real("availability_score"), // Schedule compatibility
  passionScore: real("passion_score"), // Ministry interest alignment
  divineAppointmentScore: real("divine_appointment_score"), // AI-calculated "meant to be" score
  aiRecommendation: varchar("ai_recommendation", { length: 20 }), // highly_recommended, recommended, consider, not_recommended
  aiExplanation: text("ai_explanation"), // Human-readable explanation
  volunteerResponse: varchar("volunteer_response", { length: 20 }), // accepted, declined, interested, not_interested
  respondedAt: timestamp("responded_at"),
  placementSuccess: boolean("placement_success"), // Track accuracy for learning
  createdAt: timestamp("created_at").defaultNow(),
});

// Background Check Integration & Compliance
export const backgroundChecks = pgTable("background_checks", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  provider: varchar("provider", { length: 50 }).notNull(), // MinistrySafe, Checkr, ProtectMyMinistry
  externalId: varchar("external_id", { length: 100 }), // Provider's tracking ID
  checkType: varchar("check_type", { length: 30 }).notNull(), // basic, comprehensive, child_protection
  status: varchar("status", { length: 20 }).default("pending"), // pending, in_progress, approved, rejected, expired
  requestedAt: timestamp("requested_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  results: jsonb("results"), // Provider-specific results data
  cost: decimal("cost", { precision: 6, scale: 2 }),
  notes: text("notes"),
  renewalReminder: boolean("renewal_reminder").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Volunteer Certifications & Training
export const volunteerCertifications = pgTable("volunteer_certifications", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  certificationType: varchar("certification_type", { length: 50 }).notNull(), // CPR, First_Aid, Child_Protection, Ministry_Training
  certificationName: varchar("certification_name", { length: 100 }).notNull(),
  issuingOrganization: varchar("issuing_organization", { length: 100 }),
  certificationNumber: varchar("certification_number", { length: 50 }),
  issuedDate: timestamp("issued_date"),
  expiresDate: timestamp("expires_date"),
  status: varchar("status", { length: 20 }).default("active"), // active, expired, suspended, revoked
  documentUrl: varchar("document_url", { length: 255 }), // Stored certificate
  renewalReminderSent: boolean("renewal_reminder_sent").default(false),
  isRequired: boolean("is_required").default(false), // For specific roles
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Volunteer Appreciation & Recognition
export const volunteerAwards = pgTable("volunteer_awards", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  awardType: varchar("award_type", { length: 50 }).notNull(), // service_hours, leadership, impact, appreciation
  awardName: varchar("award_name", { length: 100 }).notNull(),
  description: text("description"),
  hoursThreshold: integer("hours_threshold"), // Hours required for award
  impactMetric: varchar("impact_metric", { length: 30 }), // lives_touched, events_served, teams_led
  badgeIcon: varchar("badge_icon", { length: 50 }),
  awardedBy: varchar("awarded_by").references(() => users.id),
  awardedAt: timestamp("awarded_at").defaultNow(),
  isPublic: boolean("is_public").default(true),
  notificationSent: boolean("notification_sent").default(false),
});

// Ministry Team Communication Channels
export const volunteerCommunications = pgTable("volunteer_communications", {
  id: serial("id").primaryKey(),
  ministryId: varchar("ministry", { length: 50 }).notNull(), // worship, children, youth, etc.
  communityId: integer("community_id").references(() => communities.id),
  messageType: varchar("message_type", { length: 30 }).notNull(), // announcement, reminder, appreciation, urgent
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientType: varchar("recipient_type", { length: 20 }), // all_volunteers, role_specific, individual
  targetRoles: text("target_roles").array(), // Specific volunteer roles
  targetVolunteers: text("target_volunteers").array(), // Individual volunteer IDs
  channels: text("channels").array(), // in_app, email, sms, push
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  deliveredCount: integer("delivered_count").default(0),
  readCount: integer("read_count").default(0),
  responseCount: integer("response_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ServeWell™ Enhanced Volunteer Management Types
export type SpiritualGift = typeof spiritualGifts.$inferSelect;
export type InsertSpiritualGift = typeof spiritualGifts.$inferInsert;
export type VolunteerRole = typeof volunteerRoles.$inferSelect;
export type InsertVolunteerRole = typeof volunteerRoles.$inferInsert;
export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = typeof volunteers.$inferInsert;
export type VolunteerRoleAssignment = typeof volunteerRoleAssignments.$inferSelect;
export type InsertVolunteerRoleAssignment = typeof volunteerRoleAssignments.$inferInsert;
export type VolunteerOpportunity = typeof volunteerOpportunities.$inferSelect;
export type InsertVolunteerOpportunity = typeof volunteerOpportunities.$inferInsert;
export type VolunteerRegistration = typeof volunteerRegistrations.$inferSelect;
export type InsertVolunteerRegistration = typeof volunteerRegistrations.$inferInsert;
export type VolunteerHours = typeof volunteerHours.$inferSelect;
export type InsertVolunteerHours = typeof volunteerHours.$inferInsert;
export type VolunteerMatch = typeof volunteerMatches.$inferSelect;
export type InsertVolunteerMatch = typeof volunteerMatches.$inferInsert;
export type BackgroundCheck = typeof backgroundChecks.$inferSelect;
export type InsertBackgroundCheck = typeof backgroundChecks.$inferInsert;
export type VolunteerCertification = typeof volunteerCertifications.$inferSelect;
export type InsertVolunteerCertification = typeof volunteerCertifications.$inferInsert;
export type VolunteerCommunication = typeof volunteerCommunications.$inferSelect;
export type InsertVolunteerCommunication = typeof volunteerCommunications.$inferInsert;
export type VolunteerAward = typeof volunteerAwards.$inferSelect;
export type InsertVolunteerAward = typeof volunteerAwards.$inferInsert;
export type VolunteerFeedback = typeof volunteerFeedback.$inferSelect;
export type InsertVolunteerFeedback = typeof volunteerFeedback.$inferInsert;

// ServeWell™ Enhanced Volunteer Management Zod Schemas
export const insertSpiritualGiftSchema = createInsertSchema(spiritualGifts).omit({ id: true });
export const insertVolunteerRoleSchema = createInsertSchema(volunteerRoles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerSchema = createInsertSchema(volunteers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerRoleAssignmentSchema = createInsertSchema(volunteerRoleAssignments).omit({ id: true, assignedAt: true });
export const insertVolunteerOpportunitySchema = createInsertSchema(volunteerOpportunities).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerRegistrationSchema = createInsertSchema(volunteerRegistrations).omit({ id: true, registeredAt: true });
export const insertVolunteerHoursSchema = createInsertSchema(volunteerHours).omit({ id: true, createdAt: true });
export const insertVolunteerMatchSchema = createInsertSchema(volunteerMatches).omit({ id: true, createdAt: true });
export const insertBackgroundCheckSchema = createInsertSchema(backgroundChecks).omit({ id: true, createdAt: true });
export const insertVolunteerCertificationSchema = createInsertSchema(volunteerCertifications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerCommunicationSchema = createInsertSchema(volunteerCommunications).omit({ id: true, createdAt: true });
export const insertVolunteerAwardSchema = createInsertSchema(volunteerAwards).omit({ id: true, awardedAt: true });
export const insertVolunteerFeedbackSchema = createInsertSchema(volunteerFeedback).omit({ id: true, createdAt: true });
export const insertBibleInADayBadgeSchema = createInsertSchema(bibleInADayBadges).omit({ id: true, earnedAt: true });

// Event management types
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = typeof eventRsvps.$inferInsert;
export type EventVolunteer = typeof eventVolunteers.$inferSelect;
export type InsertEventVolunteer = typeof eventVolunteers.$inferInsert;
export type EventNotification = typeof eventNotifications.$inferSelect;
export type InsertEventNotification = typeof eventNotifications.$inferInsert;
export type EventUpdate = typeof eventUpdates.$inferSelect;
export type InsertEventUpdate = typeof eventUpdates.$inferInsert;
export type EventCheckIn = typeof eventCheckIns.$inferSelect;
export type InsertEventCheckIn = typeof eventCheckIns.$inferInsert;
export type EventRecurrenceRule = typeof eventRecurrenceRules.$inferSelect;
export type InsertEventRecurrenceRule = typeof eventRecurrenceRules.$inferInsert;
export type EventMetric = typeof eventMetrics.$inferSelect;
export type InsertEventMetric = typeof eventMetrics.$inferInsert;

// Event form schemas
export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEventForm = z.infer<typeof insertEventSchema>;

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEventRsvpForm = z.infer<typeof insertEventRsvpSchema>;

export const insertEventVolunteerSchema = createInsertSchema(eventVolunteers).omit({
  id: true,
  createdAt: true,
});
export type InsertEventVolunteerForm = z.infer<typeof insertEventVolunteerSchema>;

export const insertEventUpdateSchema = createInsertSchema(eventUpdates).omit({
  id: true,
  createdAt: true,
});
export type InsertEventUpdateForm = z.infer<typeof insertEventUpdateSchema>;

export type InsertChurch = typeof churches.$inferInsert;
export type Church = typeof churches.$inferSelect;

export type InsertDiscussion = typeof discussions.$inferInsert;
export type Discussion = typeof discussions.$inferSelect;

export type InsertDiscussionComment = typeof discussionComments.$inferInsert;
export type DiscussionComment = typeof discussionComments.$inferSelect;

export type InsertPrayerRequest = typeof prayerRequests.$inferInsert;
export type PrayerRequest = typeof prayerRequests.$inferSelect;

export type InsertPrayerResponse = typeof prayerResponses.$inferInsert;
export type PrayerResponse = typeof prayerResponses.$inferSelect;

export type InsertPrayerCircle = typeof prayerCircles.$inferInsert;
export type PrayerCircle = typeof prayerCircles.$inferSelect;

export type InsertPrayerCircleMember = typeof prayerCircleMembers.$inferInsert;
export type PrayerCircleMember = typeof prayerCircleMembers.$inferSelect;

// Check-in system types
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;
export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = typeof qrCodes.$inferInsert;

export const insertQrCodeSchema = createInsertSchema(qrCodes).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertQrCodeForm = z.infer<typeof insertQrCodeSchema>;

export type InsertUserActivity = typeof userActivities.$inferInsert;
export type UserActivity = typeof userActivities.$inferSelect;

export type InsertUserChurch = typeof userChurches.$inferInsert;
export type UserChurch = typeof userChurches.$inferSelect;

export type InsertFriendship = typeof friendships.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;

export type InsertConversation = typeof conversations.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;

export type InsertConversationParticipant = typeof conversationParticipants.$inferInsert;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;

export type InsertMessage = typeof messages.$inferInsert;
export type Message = typeof messages.$inferSelect;

export type InsertDailyInspiration = typeof dailyInspirations.$inferInsert;
export type DailyInspiration = typeof dailyInspirations.$inferSelect;

export type InsertUserInspirationPreference = typeof userInspirationPreferences.$inferInsert;
export type UserInspirationPreference = typeof userInspirationPreferences.$inferSelect;

export type InsertUserInspirationHistory = typeof userInspirationHistory.$inferInsert;
export type UserInspirationHistory = typeof userInspirationHistory.$inferSelect;

export type InsertCommunityGroup = typeof communityGroups.$inferInsert;
export type CommunityGroup = typeof communityGroups.$inferSelect;

export type InsertCommunityGroupMember = typeof communityGroupMembers.$inferInsert;
export type CommunityGroupMember = typeof communityGroupMembers.$inferSelect;

// Notification system type definitions
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = typeof notificationSettings.$inferInsert;

export type ScheduledNotification = typeof scheduledNotifications.$inferSelect;
export type InsertScheduledNotification = typeof scheduledNotifications.$inferInsert;

export type NotificationDelivery = typeof notificationDeliveries.$inferSelect;
export type InsertNotificationDelivery = typeof notificationDeliveries.$inferInsert;

export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserDevice = typeof userDevices.$inferInsert;

// Referral system type definitions
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;

export type ReferralMilestone = typeof referralMilestones.$inferSelect;
export type InsertReferralMilestone = typeof referralMilestones.$inferInsert;

// Referral form schemas
export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReferralForm = z.infer<typeof insertReferralSchema>;

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertReferralRewardForm = z.infer<typeof insertReferralRewardSchema>;

export const insertReferralMilestoneSchema = createInsertSchema(referralMilestones).omit({
  id: true,
  createdAt: true,
});
export type InsertReferralMilestoneForm = z.infer<typeof insertReferralMilestoneSchema>;

export type ScriptureSchedule = typeof scriptureSchedules.$inferSelect;
export type InsertScriptureSchedule = typeof scriptureSchedules.$inferInsert;

// Enhanced Social & Community Feature Types (duplicates removed)

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = typeof reactions.$inferInsert;

export type CommunityReflection = typeof communityReflections.$inferSelect;
export type InsertCommunityReflection = typeof communityReflections.$inferInsert;

export type EngagementSession = typeof engagementSessions.$inferSelect;
export type InsertEngagementSession = typeof engagementSessions.$inferInsert;

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = typeof activityFeed.$inferInsert;

// Advanced Church Management Tables

// Member Analytics and Engagement Tracking
export const memberEngagementMetrics = pgTable("member_engagement_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  metricType: varchar("metric_type", { length: 50 }).notNull(), // attendance, prayer, reading, giving, volunteering, events
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 20 }), // hours, count, dollars, percentage
  period: varchar("period", { length: 20 }).notNull(), // daily, weekly, monthly, yearly
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  metadata: jsonb("metadata"), // Additional metric details
  recordedBy: varchar("recorded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const spiritualGrowthTracking = pgTable("spiritual_growth_tracking", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  communityId: integer("community_id").notNull().references(() => communities.id),
  growthCategory: varchar("growth_category", { length: 50 }).notNull(), // baptism, discipleship, leadership, service, faith_milestone
  milestone: varchar("milestone", { length: 100 }).notNull(),
  description: text("description"),
  achievedDate: timestamp("achieved_date").notNull(),
  verifiedBy: varchar("verified_by").references(() => users.id),
  notes: text("notes"),
  attachments: text("attachments").array(), // Photos, certificates, documents
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bulk Communication System
export const communicationCampaigns = pgTable("communication_campaigns", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // email, sms, push, announcement, newsletter
  status: varchar("status", { length: 20 }).default("draft"), // draft, scheduled, sending, sent, cancelled
  targetAudience: jsonb("target_audience"), // Complex targeting rules
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  templateId: integer("template_id"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  totalRecipients: integer("total_recipients").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
  clickCount: integer("click_count").default(0),
  responseCount: integer("response_count").default(0),
  bounceCount: integer("bounce_count").default(0),
  unsubscribeCount: integer("unsubscribe_count").default(0),
  attachments: text("attachments").array(),
  trackingEnabled: boolean("tracking_enabled").default(true),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: jsonb("recurring_pattern"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communicationTemplates = pgTable("communication_templates", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // email, sms, push, announcement
  category: varchar("category", { length: 50 }), // welcome, event, prayer, announcement, newsletter
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  variables: text("variables").array(), // {{first_name}}, {{church_name}}, etc.
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Event Management
export const eventCapacityManagement = pgTable("event_capacity_management", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  totalCapacity: integer("total_capacity"),
  currentAttendees: integer("current_attendees").default(0),
  waitlistEnabled: boolean("waitlist_enabled").default(false),
  waitlistCount: integer("waitlist_count").default(0),
  overBookingAllowed: boolean("over_booking_allowed").default(false),
  overBookingPercentage: integer("over_booking_percentage").default(0),
  ageGroupCapacities: jsonb("age_group_capacities"), // {adults: 100, children: 50, infants: 20}
  accessibilityCapacity: integer("accessibility_capacity"),
  currentAccessibilityCount: integer("current_accessibility_count").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recurringEventSeries = pgTable("recurring_event_series", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  seriesName: varchar("series_name", { length: 255 }).notNull(),
  description: text("description"),
  eventTemplate: jsonb("event_template").notNull(), // Base event data
  recurrencePattern: jsonb("recurrence_pattern").notNull(), // {type: 'weekly', days: ['sunday'], interval: 1}
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  maxOccurrences: integer("max_occurrences"),
  currentOccurrences: integer("current_occurrences").default(0),
  isActive: boolean("is_active").default(true),
  autoPublish: boolean("auto_publish").default(true),
  advanceNotice: integer("advance_notice").default(14), // Days in advance to create events
  lastGenerated: timestamp("last_generated"),
  nextGeneration: timestamp("next_generation"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Volunteer Management System
export const enhancedVolunteerRoles = pgTable("enhanced_volunteer_roles", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 50 }), // worship, children, youth, hospitality, tech, admin
  requirements: text("requirements").array(), // Skills, training, background check
  timeCommitment: varchar("time_commitment", { length: 50 }), // weekly, monthly, event-based
  hoursPerWeek: integer("hours_per_week"),
  isLeadershipRole: boolean("is_leadership_role").default(false),
  requiredTraining: text("required_training").array(),
  backgroundCheckRequired: boolean("background_check_required").default(false),
  minimumAge: integer("minimum_age").default(16),
  maximumVolunteers: integer("maximum_volunteers"),
  currentVolunteers: integer("current_volunteers").default(0),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const enhancedVolunteerAssignments = pgTable("enhanced_volunteer_assignments", {
  id: serial("id").primaryKey(),
  volunteerRoleId: integer("volunteer_role_id").notNull().references(() => enhancedVolunteerRoles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  assignedBy: varchar("assigned_by").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, pending, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  trainingCompleted: boolean("training_completed").default(false),
  backgroundCheckCompleted: boolean("background_check_completed").default(false),
  performanceRating: integer("performance_rating"), // 1-5 scale
  feedbackNotes: text("feedback_notes"),
  totalHours: decimal("total_hours", { precision: 8, scale: 2 }).default("0"),
  lastActiveDate: timestamp("last_active_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  volunteerUserUnique: unique().on(table.volunteerRoleId, table.userId),
}));

export const enhancedVolunteerSchedules = pgTable("enhanced_volunteer_schedules", {
  id: serial("id").primaryKey(),
  volunteerAssignmentId: integer("volunteer_assignment_id").notNull().references(() => enhancedVolunteerAssignments.id),
  eventId: integer("event_id").references(() => events.id),
  scheduledDate: timestamp("scheduled_date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: varchar("location", { length: 255 }),
  specialInstructions: text("special_instructions"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, confirmed, completed, cancelled, no_show
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  actualHours: decimal("actual_hours", { precision: 8, scale: 2 }),
  supervisorNotes: text("supervisor_notes"),
  volunteerFeedback: text("volunteer_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Donation and Financial Tracking
export const donationCategories = pgTable("donation_categories", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  code: varchar("code", { length: 20 }), // For accounting integration
  taxDeductible: boolean("tax_deductible").default(true),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  goalAmount: decimal("goal_amount", { precision: 12, scale: 2 }),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0"),
  fiscalYearStart: timestamp("fiscal_year_start"),
  fiscalYearEnd: timestamp("fiscal_year_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  donorId: varchar("donor_id").references(() => users.id), // Can be null for anonymous donations
  categoryId: integer("category_id").notNull().references(() => donationCategories.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  method: varchar("method", { length: 20 }).notNull(), // cash, check, card, bank_transfer, online
  frequency: varchar("frequency", { length: 20 }).default("one_time"), // one_time, weekly, monthly, yearly
  isRecurring: boolean("is_recurring").default(false),
  recurringScheduleId: integer("recurring_schedule_id"),
  transactionId: varchar("transaction_id", { length: 255 }), // External payment processor ID
  checkNumber: varchar("check_number", { length: 50 }),
  donorName: varchar("donor_name", { length: 255 }), // For anonymous or guest donations
  donorEmail: varchar("donor_email", { length: 255 }),
  donorPhone: varchar("donor_phone", { length: 20 }),
  donorAddress: text("donor_address"),
  isAnonymous: boolean("is_anonymous").default(false),
  notes: text("notes"),
  receiptSent: boolean("receipt_sent").default(false),
  receiptSentAt: timestamp("receipt_sent_at"),
  taxReceiptNumber: varchar("tax_receipt_number", { length: 50 }),
  fiscalYear: integer("fiscal_year"),
  donationDate: timestamp("donation_date").notNull(),
  processedBy: varchar("processed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const donationReports = pgTable("donation_reports", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  generatedBy: varchar("generated_by").notNull().references(() => users.id),
  reportType: varchar("report_type", { length: 50 }).notNull(), // annual_statement, monthly_summary, category_breakdown, donor_history
  reportPeriod: varchar("report_period", { length: 50 }).notNull(), // 2024, 2024-01, Q1-2024, etc.
  parameters: jsonb("parameters"), // Filters and options used to generate report
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  totalDonations: integer("total_donations"),
  uniqueDonors: integer("unique_donors"),
  reportData: jsonb("report_data"), // Full report data in JSON format
  fileUrl: varchar("file_url", { length: 500 }), // Link to generated PDF/Excel file
  generatedAt: timestamp("generated_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});



// TypeScript types for church management tables
export type MemberEngagementMetric = typeof memberEngagementMetrics.$inferSelect;
export type InsertMemberEngagementMetric = typeof memberEngagementMetrics.$inferInsert;

export type SpiritualGrowthTracking = typeof spiritualGrowthTracking.$inferSelect;
export type InsertSpiritualGrowthTracking = typeof spiritualGrowthTracking.$inferInsert;

export type CommunicationCampaign = typeof communicationCampaigns.$inferSelect;
export type InsertCommunicationCampaign = typeof communicationCampaigns.$inferInsert;

export type CommunicationTemplate = typeof communicationTemplates.$inferSelect;
export type InsertCommunicationTemplate = typeof communicationTemplates.$inferInsert;

export type EventCapacityManagement = typeof eventCapacityManagement.$inferSelect;
export type InsertEventCapacityManagement = typeof eventCapacityManagement.$inferInsert;

export type RecurringEventSeries = typeof recurringEventSeries.$inferSelect;
export type InsertRecurringEventSeries = typeof recurringEventSeries.$inferInsert;

export type EnhancedVolunteerRole = typeof enhancedVolunteerRoles.$inferSelect;
export type InsertEnhancedVolunteerRole = typeof enhancedVolunteerRoles.$inferInsert;

export type EnhancedVolunteerAssignment = typeof enhancedVolunteerAssignments.$inferSelect;
export type InsertEnhancedVolunteerAssignment = typeof enhancedVolunteerAssignments.$inferInsert;

export type EnhancedVolunteerSchedule = typeof enhancedVolunteerSchedules.$inferSelect;
export type InsertEnhancedVolunteerSchedule = typeof enhancedVolunteerSchedules.$inferInsert;

export type DonationCategory = typeof donationCategories.$inferSelect;
export type InsertDonationCategory = typeof donationCategories.$inferInsert;

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

export type DonationReport = typeof donationReports.$inferSelect;
export type InsertDonationReport = typeof donationReports.$inferInsert;

// Campus types already defined earlier in the file

// Sermon Illustration Types
export interface SermonIllustration {
  title: string;
  story: string;
  application: string;
  source: string;
  relevanceScore: number;
  visualElements: {
    slideTitle: string;
    keyImage: string;
    bulletPoints: string[];
    scriptureConnection: string;
    backgroundSuggestion: string;
    generatedImageUrl?: string;
    imagePrompt?: string;
    audienceStyle?: string;
    themeStyle?: string;
  };
  presentationTips: {
    timing: string;
    delivery: string;
    interaction: string;
  };
}

// Video Content Types for AI Video Generator
export interface AIVideoContent {
  script: string;
  visualCues: string[];
  audioNarration: string;
  bibleReferences: string[];
  duration: number;
  tone: string;
}

export interface VideoGenerationRequest {
  type: string;
  topic: string;
  duration: number;
  targetAudience: string;
  voicePersona: 'pastor-david' | 'sister-maria' | 'teacher-john' | 'evangelist-sarah';
  visualStyle: string;
  userId: string;
  churchId: number;
}

// Zod schemas for validation
export const insertMemberEngagementMetricSchema = createInsertSchema(memberEngagementMetrics).omit({ id: true, createdAt: true });
export const insertSpiritualGrowthTrackingSchema = createInsertSchema(spiritualGrowthTracking).omit({ id: true, createdAt: true });
export const insertCommunicationCampaignSchema = createInsertSchema(communicationCampaigns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommunicationTemplateSchema = createInsertSchema(communicationTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEventCapacityManagementSchema = createInsertSchema(eventCapacityManagement).omit({ id: true, updatedAt: true });
export const insertRecurringEventSeriesSchema = createInsertSchema(recurringEventSeries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnhancedVolunteerRoleSchema = createInsertSchema(enhancedVolunteerRoles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnhancedVolunteerAssignmentSchema = createInsertSchema(enhancedVolunteerAssignments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEnhancedVolunteerScheduleSchema = createInsertSchema(enhancedVolunteerSchedules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDonationCategorySchema = createInsertSchema(donationCategories).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDonationSchema = createInsertSchema(donations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDonationReportSchema = createInsertSchema(donationReports).omit({ id: true, generatedAt: true });
export const insertCampusSchema = createInsertSchema(campuses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCampusAdministratorSchema = createInsertSchema(campusAdministrators).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerCampusAssignmentSchema = createInsertSchema(volunteerCampusAssignments).omit({ id: true, createdAt: true });
export const insertBackgroundCheckProviderSchema = createInsertSchema(backgroundCheckProviders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBackgroundCheckRequirementSchema = createInsertSchema(backgroundCheckRequirements).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerMetricSchema = createInsertSchema(volunteerMetrics).omit({ id: true, createdAt: true });
export const insertMinistryAnalyticsSchema = createInsertSchema(ministryAnalytics).omit({ id: true, createdAt: true });
export const insertDashboardConfigurationSchema = createInsertSchema(dashboardConfigurations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMinistryLeaderCommunicationSchema = createInsertSchema(ministryLeaderCommunications).omit({ id: true, createdAt: true });

// Bible verses handling is now done via API.Bible and ChatGPT fallback only - no database cache

// Social Media Credentials and Posts schemas
export const insertSocialMediaCredentialSchema = createInsertSchema(socialMediaCredentials).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertSocialMediaPostSchema = createInsertSchema(socialMediaPosts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type SocialMediaCredential = typeof socialMediaCredentials.$inferSelect;
export type InsertSocialMediaCredential = typeof socialMediaCredentials.$inferInsert;
export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

// Insert schemas for validation
export const insertChurchSchema = createInsertSchema(churches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  likeCount: true,
  commentCount: true,
});

export const insertPrayerRequestSchema = createInsertSchema(prayerRequests).omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  prayerCount: true,
  isAnswered: true,
  answeredAt: true,
});

export const insertPrayerFollowUpSchema = createInsertSchema(prayerFollowUps).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerUpdateSchema = createInsertSchema(prayerUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerCircleUpdateSchema = createInsertSchema(prayerCircleUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerCircleReportSchema = createInsertSchema(prayerCircleReports).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerAssignmentSchema = createInsertSchema(prayerAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertPrayerCircleSchema = createInsertSchema(prayerCircles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPrayerCircleMemberSchema = createInsertSchema(prayerCircleMembers).omit({
  id: true,
  joinedAt: true,
});

// Enhanced Social & Community Insert Schemas
export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityGroupSchema = createInsertSchema(communityGroups).omit({
  id: true,
  memberCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityGroupMemberSchema = createInsertSchema(communityGroupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityReflectionSchema = createInsertSchema(communityReflections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEngagementSessionSchema = createInsertSchema(engagementSessions).omit({
  id: true,
  startedAt: true,
});

export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({
  id: true,
  createdAt: true,
});

// Prayer management type definitions
export type PrayerFollowUp = typeof prayerFollowUps.$inferSelect;
export type InsertPrayerFollowUp = typeof prayerFollowUps.$inferInsert;

export type PrayerUpdate = typeof prayerUpdates.$inferSelect;
export type InsertPrayerUpdate = typeof prayerUpdates.$inferInsert;

export type PrayerCircleUpdate = typeof prayerCircleUpdates.$inferSelect;
export type InsertPrayerCircleUpdate = typeof prayerCircleUpdates.$inferInsert;

export type PrayerCircleReport = typeof prayerCircleReports.$inferSelect;
export type InsertPrayerCircleReport = typeof prayerCircleReports.$inferInsert;

export type PrayerAssignment = typeof prayerAssignments.$inferSelect;
export type InsertPrayerAssignment = typeof prayerAssignments.$inferInsert;

// Leaderboard type definitions
export type UserScore = typeof userScores.$inferSelect;
export type InsertUserScore = typeof userScores.$inferInsert;

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = typeof pointTransactions.$inferInsert;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;

export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = typeof leaderboards.$inferInsert;

export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboardEntries.$inferInsert;

export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = typeof streaks.$inferInsert;

export type Challenge = typeof challenges.$inferSelect;
export type InsertChallenge = typeof challenges.$inferInsert;

export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;
export type InsertChallengeParticipant = typeof challengeParticipants.$inferInsert;

export type Devotional = typeof devotionals.$inferSelect;
export type InsertDevotional = typeof devotionals.$inferInsert;

export type WeeklySeries = typeof weeklySeries.$inferSelect;
export type InsertWeeklySeries = typeof weeklySeries.$inferInsert;

export type SermonMedia = typeof sermonMedia.$inferSelect;
export type InsertSermonMedia = typeof sermonMedia.$inferInsert;

export const insertDevotionalSchema = createInsertSchema(devotionals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

export const insertWeeklySeriesSchema = createInsertSchema(weeklySeries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalDevotionals: true,
}).extend({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
});

export const insertSermonMediaSchema = createInsertSchema(sermonMedia).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true,
}).extend({
  date: z.string().transform((str) => new Date(str)),
});

// Media files table for comprehensive media management
export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(), // image, video, audio, document, other
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  filePath: varchar("file_path", { length: 500 }).notNull(),
  publicUrl: varchar("public_url", { length: 500 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  category: varchar("category", { length: 100 }), // sermon, worship, event, announcement, etc.
  title: varchar("title", { length: 200 }),
  description: text("description"),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false),
  isApproved: boolean("is_approved").default(false),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),
  duration: integer("duration"), // for audio/video files in seconds
  dimensions: jsonb("dimensions"), // for images/videos {width, height}
  metadata: jsonb("metadata"), // additional file metadata
  status: varchar("status", { length: 20 }).default("active"), // active, archived, deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Media collections/albums for organizing media
export const mediaCollections = pgTable("media_collections", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  coverImageId: integer("cover_image_id").references(() => mediaFiles.id),
  isPublic: boolean("is_public").default(false),
  itemCount: integer("item_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction table for media files in collections
export const mediaCollectionItems = pgTable("media_collection_items", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id").references(() => mediaCollections.id),
  mediaFileId: integer("media_file_id").references(() => mediaFiles.id),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  collectionMediaUnique: unique().on(table.collectionId, table.mediaFileId),
}));

// Gallery images table for Image Gallery feature
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  url: varchar("url", { length: 500 }).notNull(),
  collection: varchar("collection", { length: 100 }).notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gallery image likes
export const galleryImageLikes = pgTable("gallery_image_likes", {
  id: serial("id").primaryKey(),
  imageId: integer("image_id").notNull().references(() => galleryImages.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_user_image_like").on(table.imageId, table.userId),
  index("gallery_image_likes_image_idx").on(table.imageId),
  index("gallery_image_likes_user_idx").on(table.userId),
]);

// Gallery image comments
export const galleryImageComments = pgTable("gallery_image_comments", {
  id: serial("id").primaryKey(),
  imageId: integer("image_id").notNull().references(() => galleryImages.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").default(true),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("gallery_image_comments_image_idx").on(table.imageId),
  index("gallery_image_comments_user_idx").on(table.userId),
]);

// Gallery image saves/favorites
export const galleryImageSaves = pgTable("gallery_image_saves", {
  id: serial("id").primaryKey(),
  imageId: integer("image_id").notNull().references(() => galleryImages.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_user_image_save").on(table.imageId, table.userId),
  index("gallery_image_saves_image_idx").on(table.imageId),
  index("gallery_image_saves_user_idx").on(table.userId),
]);

// Video content table for comprehensive video system
export const videoContent = pgTable("video_content", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  duration: integer("duration"), // Duration in seconds
  category: varchar("category", { length: 100 }).notNull(), // devotional, sermon, testimony, study, prayer, worship
  tags: text("tags").array(),
  bibleReferences: text("bible_references").array(), // Associated scripture references
  speaker: varchar("speaker", { length: 200 }), // Pastor/speaker name
  seriesId: integer("series_id"), // Reference to video series
  episodeNumber: integer("episode_number"), // For series content
  isPublic: boolean("is_public").default(true),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  shareCount: integer("share_count").default(0),
  phase: varchar("phase", { length: 20 }).default("phase1"), // phase1, phase2, phase3, phase4
  generationType: varchar("generation_type", { length: 50 }), // uploaded, ai_generated, hybrid
  voicePersona: varchar("voice_persona", { length: 50 }), // For AI-generated content
  visualStyle: varchar("visual_style", { length: 50 }), // For AI-generated visuals
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("video_content_community_idx").on(table.communityId),
  index("video_content_category_idx").on(table.category),
  index("video_content_speaker_idx").on(table.speaker),
  index("video_content_phase_idx").on(table.phase),
]);

// Video series table for organizing related videos
export const videoSeries = pgTable("video_series", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  category: varchar("category", { length: 100 }).notNull(),
  totalVideos: integer("total_videos").default(0),
  totalDuration: integer("total_duration").default(0), // Total duration in seconds
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video watch history and analytics
export const videoViews = pgTable("video_views", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoContent.id),
  userId: varchar("user_id").references(() => users.id),
  watchDuration: integer("watch_duration").default(0), // Seconds watched
  completionPercentage: real("completion_percentage").default(0),
  deviceType: varchar("device_type", { length: 50 }), // mobile, desktop, tablet
  quality: varchar("quality", { length: 20 }), // 720p, 1080p, etc.
  watchedAt: timestamp("watched_at").defaultNow(),
}, (table) => [
  index("video_views_video_idx").on(table.videoId),
  index("video_views_user_idx").on(table.userId),
]);

// Video comments and engagement
export const videoComments = pgTable("video_comments", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoContent.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // For replies
  isApproved: boolean("is_approved").default(true),
  likeCount: integer("like_count").default(0),
  timestamp: real("timestamp"), // Video timestamp in seconds (for timestamped comments)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("video_comments_video_idx").on(table.videoId),
  index("video_comments_user_idx").on(table.userId),
]);

// Video likes and reactions
export const videoLikes = pgTable("video_likes", {
  id: serial("id").primaryKey(),
  videoId: integer("video_id").notNull().references(() => videoContent.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  reactionType: varchar("reaction_type", { length: 20 }).default("like"), // like, heart, pray, amen
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("unique_user_video_like").on(table.videoId, table.userId),
  index("video_likes_video_idx").on(table.videoId),
]);

// Video playlists for curated content
export const videoPlaylists = pgTable("video_playlists", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  isPublic: boolean("is_public").default(true),
  videoCount: integer("video_count").default(0),
  totalDuration: integer("total_duration").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Junction table for playlist videos
export const playlistVideos = pgTable("playlist_videos", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull().references(() => videoPlaylists.id),
  videoId: integer("video_id").notNull().references(() => videoContent.id),
  position: integer("position").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  unique("unique_playlist_video").on(table.playlistId, table.videoId),
  index("playlist_videos_playlist_idx").on(table.playlistId),
]);

// Video upload sessions for tracking large file uploads
export const videoUploadSessions = pgTable("video_upload_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedSize: integer("uploaded_size").default(0),
  chunkSize: integer("chunk_size").default(1048576), // 1MB chunks
  status: varchar("status", { length: 20 }).default("pending"), // pending, uploading, processing, completed, failed
  videoId: integer("video_id").references(() => videoContent.id),
  uploadUrl: varchar("upload_url", { length: 500 }),
  processingProgress: real("processing_progress").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("video_upload_sessions_user_idx").on(table.userId),
  index("video_upload_sessions_status_idx").on(table.status),
]);

// Media management type definitions
export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;
export type MediaCollection = typeof mediaCollections.$inferSelect;
export type InsertMediaCollection = typeof mediaCollections.$inferInsert;

// Video system type definitions
export type VideoContentDB = typeof videoContent.$inferSelect;
export type InsertVideoContentDB = typeof videoContent.$inferInsert;

export type VideoSeries = typeof videoSeries.$inferSelect;
export type InsertVideoSeries = typeof videoSeries.$inferInsert;

export type VideoView = typeof videoViews.$inferSelect;
export type InsertVideoView = typeof videoViews.$inferInsert;

// Gallery system type definitions
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

export type GalleryImageLike = typeof galleryImageLikes.$inferSelect;
export type InsertGalleryImageLike = typeof galleryImageLikes.$inferInsert;

export type GalleryImageComment = typeof galleryImageComments.$inferSelect;
export type InsertGalleryImageComment = typeof galleryImageComments.$inferInsert;

export type GalleryImageSave = typeof galleryImageSaves.$inferSelect;
export type InsertGalleryImageSave = typeof galleryImageSaves.$inferInsert;

export type VideoComment = typeof videoComments.$inferSelect;
export type InsertVideoComment = typeof videoComments.$inferInsert;

export type VideoLike = typeof videoLikes.$inferSelect;
export type InsertVideoLike = typeof videoLikes.$inferInsert;

export type VideoPlaylist = typeof videoPlaylists.$inferSelect;
export type InsertVideoPlaylist = typeof videoPlaylists.$inferInsert;

export type PlaylistVideo = typeof playlistVideos.$inferSelect;
export type InsertPlaylistVideo = typeof playlistVideos.$inferInsert;

export type VideoUploadSession = typeof videoUploadSessions.$inferSelect;
export type InsertVideoUploadSession = typeof videoUploadSessions.$inferInsert;

// Content Moderation System
export const contentReports = pgTable("content_reports", {
  id: serial("id").primaryKey(),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  contentType: varchar("content_type", { length: 50 }).notNull(), // discussion, prayer_request, soap_entry, comment
  contentId: integer("content_id").notNull(),
  reason: varchar("reason", { length: 100 }).notNull(), // inappropriate, harassment, spam, misinformation, privacy_violation, other
  description: text("description"),
  originalContent: text("original_content"), // Store original content for moderation review
  contentMetadata: jsonb("content_metadata"), // Store original content metadata (title, author, etc.)
  status: varchar("status", { length: 20 }).default("pending"), // pending, reviewed, resolved, dismissed
  priority: varchar("priority", { length: 10 }).default("medium"), // low, medium, high, critical
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken", { length: 50 }), // none, warning, content_removed, user_suspended, user_banned
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentModerationActions = pgTable("content_moderation_actions", {
  id: serial("id").primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: integer("content_id").notNull(),
  actionType: varchar("action_type", { length: 50 }).notNull(), // ai_flagged, user_reported, content_removed, content_restored, user_warned, user_suspended, user_banned
  reason: text("reason").notNull(),
  moderatorId: varchar("moderator_id").references(() => users.id),
  automatedAction: boolean("automated_action").default(false),
  severity: varchar("severity", { length: 20 }).default("medium"), // low, medium, high, critical
  expiresAt: timestamp("expires_at"), // for temporary suspensions
  metadata: jsonb("metadata"), // additional context, AI confidence scores, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const userModerationHistory = pgTable("user_moderation_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  actionType: varchar("action_type", { length: 50 }).notNull(), // warning, suspension, ban, content_removal
  reason: text("reason").notNull(),
  moderatorId: varchar("moderator_id").references(() => users.id),
  severity: varchar("severity", { length: 20 }).notNull(),
  duration: text("duration"), // for temporary actions (e.g., "3 days", "1 week")
  isActive: boolean("is_active").default(true),
  appealStatus: varchar("appeal_status", { length: 20 }).default("none"), // none, pending, approved, denied
  appealNotes: text("appeal_notes"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const contentModerationSettings = pgTable("content_moderation_settings", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").references(() => communities.id),
  aiModerationEnabled: boolean("ai_moderation_enabled").default(true),
  autoRemoveThreshold: real("auto_remove_threshold").default(0.9), // AI confidence threshold
  requireApprovalForNewUsers: boolean("require_approval_for_new_users").default(false),
  flaggedContentVisibility: varchar("flagged_content_visibility", { length: 20 }).default("hidden"), // visible, hidden, blur
  allowAnonymousReporting: boolean("allow_anonymous_reporting").default(true),
  moderatorNotifications: boolean("moderator_notifications").default(true),
  escalationThreshold: integer("escalation_threshold").default(3), // number of reports before escalation
  customFilters: jsonb("custom_filters"), // church-specific keyword filters
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type definitions for moderation system
export type ContentReport = typeof contentReports.$inferSelect;
export type InsertContentReport = typeof contentReports.$inferInsert;
export type ContentModerationAction = typeof contentModerationActions.$inferSelect;
export type InsertContentModerationAction = typeof contentModerationActions.$inferInsert;
export type UserModerationHistory = typeof userModerationHistory.$inferSelect;
export type InsertUserModerationHistory = typeof userModerationHistory.$inferInsert;
export type ContentModerationSettings = typeof contentModerationSettings.$inferSelect;
export type InsertContentModerationSettings = typeof contentModerationSettings.$inferInsert;

// Content moderation validation schemas
export const insertContentReportSchema = createInsertSchema(contentReports).omit({
  id: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  reviewNotes: true,
  actionTaken: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentModerationActionSchema = createInsertSchema(contentModerationActions).omit({
  id: true,
  createdAt: true,
});

export const insertUserModerationHistorySchema = createInsertSchema(userModerationHistory).omit({
  id: true,
  isActive: true,
  appealStatus: true,
  appealNotes: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertContentModerationSettingsSchema = createInsertSchema(contentModerationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Role and Permission type definitions
export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;


// Create role schemas for validation
export const insertRoleSchema = createInsertSchema(roles);
export const insertPermissionSchema = createInsertSchema(permissions);
export const insertUserChurchSchema = createInsertSchema(userChurches);

export type MediaCollectionItem = typeof mediaCollectionItems.$inferSelect;
export type InsertMediaCollectionItem = typeof mediaCollectionItems.$inferInsert;

// Media management schemas
export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadCount: true,
  viewCount: true,
});

export const insertMediaCollectionSchema = createInsertSchema(mediaCollections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  itemCount: true,
});

export const insertMediaCollectionItemSchema = createInsertSchema(mediaCollectionItems).omit({
  id: true,
  createdAt: true,
});

// UX Improvement Types and Schemas
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;

export type OfflineContent = typeof offlineContent.$inferSelect;
export type InsertOfflineContent = typeof offlineContent.$inferInsert;

export type SyncData = typeof syncData.$inferSelect;
export type InsertSyncData = typeof syncData.$inferInsert;

// Two-Factor Authentication tokens table
export const twoFactorTokens = pgTable("two_factor_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: varchar("token", { length: 10 }).notNull(), // 6-8 digit code
  type: varchar("type", { length: 20 }).notNull(), // 'email', 'sms', 'backup'
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2FA type definitions and schemas
export type TwoFactorToken = typeof twoFactorTokens.$inferSelect;
export type InsertTwoFactorToken = typeof twoFactorTokens.$inferInsert;

export const insertTwoFactorTokenSchema = createInsertSchema(twoFactorTokens).omit({
  id: true,
  createdAt: true,
  usedAt: true,
  attempts: true,
});

export type UserPersonalization = typeof userPersonalization.$inferSelect;
export type InsertUserPersonalization = typeof userPersonalization.$inferInsert;

export type ContentTranslations = typeof contentTranslations.$inferSelect;
export type InsertContentTranslations = typeof contentTranslations.$inferInsert;

export type FamilyContent = typeof familyContent.$inferSelect;
export type InsertFamilyContent = typeof familyContent.$inferInsert;

// UX Improvement Insert Schemas
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOfflineContentSchema = createInsertSchema(offlineContent).omit({
  id: true,
  downloadedAt: true,
});

export const insertSyncDataSchema = createInsertSchema(syncData).omit({
  id: true,
  lastSyncAt: true,
});

export const insertUserPersonalizationSchema = createInsertSchema(userPersonalization).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastRecommendationUpdate: true,
});

export const insertContentTranslationsSchema = createInsertSchema(contentTranslations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFamilyContentSchema = createInsertSchema(familyContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Church Feature Toggle System
export const churchFeatureSettings = pgTable("church_feature_settings", {
  id: serial("id").primaryKey(),
  communityId: integer("community_id").notNull().references(() => communities.id),
  featureCategory: varchar("feature_category", { length: 50 }).notNull(), // 'community', 'spiritual_tools', 'media_contents', 'admin_portal'
  featureName: varchar("feature_name", { length: 50 }).notNull(), // 'prayer_wall', 'donation', 'sermon_studio'
  isEnabled: boolean("is_enabled").default(true),
  configuration: jsonb("configuration"), // Feature-specific settings
  enabledBy: varchar("enabled_by").references(() => users.id), // Who enabled it
  enabledAt: timestamp("enabled_at").defaultNow(),
  lastModified: timestamp("last_modified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  communityFeatureUnique: unique().on(table.communityId, table.featureCategory, table.featureName),
  communityFeatureSettingsIdx: index().on(table.communityId),
  communityFeatureSettingsCategoryIdx: index().on(table.featureCategory),
}));

// Default feature settings for new churches based on size
export const defaultFeatureSettings = pgTable("default_feature_settings", {
  id: serial("id").primaryKey(),
  churchSize: varchar("church_size", { length: 20 }).notNull(), // 'small', 'medium', 'large', 'mega'
  featureCategory: varchar("feature_category", { length: 50 }).notNull(),
  featureName: varchar("feature_name", { length: 50 }).notNull(),
  isEnabledByDefault: boolean("is_enabled_by_default").default(true),
  configuration: jsonb("configuration"), // Default feature-specific settings
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  defaultFeatureUnique: unique().on(table.churchSize, table.featureCategory, table.featureName),
  defaultFeatureSettingsSizeIdx: index().on(table.churchSize),
}));

// Type exports for church feature toggle system
export const insertChurchFeatureSettingSchema = createInsertSchema(churchFeatureSettings).omit({
  id: true,
  createdAt: true,
  enabledAt: true,
  lastModified: true,
});

export const insertDefaultFeatureSettingSchema = createInsertSchema(defaultFeatureSettings).omit({
  id: true,
  createdAt: true,
});

export type ChurchFeatureSetting = typeof churchFeatureSettings.$inferSelect;
export type InsertChurchFeatureSetting = z.infer<typeof insertChurchFeatureSettingSchema>;
export type DefaultFeatureSetting = typeof defaultFeatureSettings.$inferSelect;
export type InsertDefaultFeatureSetting = z.infer<typeof insertDefaultFeatureSettingSchema>;

// Prayer response likes type definitions
export type PrayerResponseLike = typeof prayerResponseLikes.$inferSelect;
export type InsertPrayerResponseLike = typeof prayerResponseLikes.$inferInsert;

// Reading Plans type definitions
export const insertReadingPlanSchema = createInsertSchema(readingPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReadingPlanDaySchema = createInsertSchema(readingPlanDays).omit({
  id: true,
  createdAt: true,
});

export const insertUserReadingProgressSchema = createInsertSchema(userReadingProgress).omit({
  id: true,
  completedAt: true,
  createdAt: true,
});

export const insertUserReadingPlanSubscriptionSchema = createInsertSchema(userReadingPlanSubscriptions).omit({
  id: true,
  startedAt: true,
  createdAt: true,
  updatedAt: true,
});

export type ReadingPlan = typeof readingPlans.$inferSelect;
export type InsertReadingPlan = z.infer<typeof insertReadingPlanSchema>;
export type ReadingPlanDay = typeof readingPlanDays.$inferSelect;
export type InsertReadingPlanDay = z.infer<typeof insertReadingPlanDaySchema>;
export type UserReadingProgress = typeof userReadingProgress.$inferSelect;
export type InsertUserReadingProgress = z.infer<typeof insertUserReadingProgressSchema>;
export type UserReadingPlanSubscription = typeof userReadingPlanSubscriptions.$inferSelect;
export type InsertUserReadingPlanSubscription = z.infer<typeof insertUserReadingPlanSubscriptionSchema>;
