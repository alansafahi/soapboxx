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

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  mobileNumber: varchar("mobile_number"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  country: varchar("country").default("United States"),
  denomination: varchar("denomination"),
  interests: text("interests").array(),
  hasCompletedOnboarding: boolean("has_completed_onboarding").default(false),
  onboardingData: jsonb("onboarding_data"), // Store wizard responses
  referredBy: varchar("referred_by"), // ID of user who referred this user
  referralCode: varchar("referral_code").unique(), // This user's unique referral code
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Churches table
export const churches = pgTable("churches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  denomination: varchar("denomination", { length: 100 }),
  description: text("description"),
  bio: text("bio"), // Extended biography/about section
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  logoUrl: varchar("logo_url"), // Changed from imageUrl for clarity
  socialLinks: jsonb("social_links"), // Facebook, Instagram, Twitter, YouTube, etc.
  communityTags: text("community_tags").array(), // Custom tags for community categorization
  latitude: real("latitude"),
  longitude: real("longitude"),
  rating: real("rating").default(0),
  memberCount: integer("member_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User-Church connections (membership)
export const userChurches = pgTable("user_churches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  churchId: integer("church_id").notNull().references(() => churches.id),
  role: varchar("role", { length: 50 }).default("member"), // member, moderator, content_creator, admin, pastor
  permissions: text("permissions").array(), // Custom permissions array
  title: varchar("title", { length: 100 }), // Custom title like "Youth Leader", "Worship Director"
  bio: text("bio"), // Role-specific bio
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  userChurchUnique: unique().on(table.userId, table.churchId),
}));

// Events table - Enhanced for comprehensive management
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  churchId: integer("church_id").notNull().references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }), // general, prayer, bible_study, events
  isPublic: boolean("is_public").default(true),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
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
  churchId: integer("church_id").references(() => churches.id),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  isAnswered: boolean("is_answered").default(false),
  answeredAt: timestamp("answered_at"),
  prayerCount: integer("prayer_count").default(0),
  isPublic: boolean("is_public").default(true),
  category: varchar("category", { length: 50 }), // health, family, guidance, gratitude, other
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, flagged, archived
  moderationNotes: text("moderation_notes"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  priority: varchar("priority", { length: 10 }).default("normal"), // urgent, high, normal, low
  followUpDate: timestamp("follow_up_date"),
  lastFollowUpAt: timestamp("last_follow_up_at"),
  isUrgent: boolean("is_urgent").default(false),
  tags: text("tags").array(),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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

// Check-ins table for spiritual and event attendance tracking
export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  churchId: integer("church_id").references(() => churches.id),
  eventId: integer("event_id").references(() => events.id), // null for general spiritual check-ins
  checkInType: varchar("check_in_type", { length: 50 }).notNull(), // "Sunday Service", "Daily Devotional", "Prayer Time", "Spiritual Check-In", "Custom"
  mood: varchar("mood", { length: 20 }), // "joyful", "peaceful", "grateful", "struggling", "hopeful", etc.
  moodEmoji: varchar("mood_emoji", { length: 10 }), // emoji representation
  notes: text("notes"), // personal reflection or prayer intent
  prayerIntent: text("prayer_intent"), // specific prayer request/intent
  isPhysicalAttendance: boolean("is_physical_attendance").default(false), // true if QR code check-in
  qrCodeId: varchar("qr_code_id"), // reference to QR code used for physical check-in
  location: varchar("location"), // for physical check-ins
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  streakCount: integer("streak_count").default(1), // daily streak counter
  pointsEarned: integer("points_earned").default(5), // gamification points
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// QR codes for physical check-in locations
export const qrCodes = pgTable("qr_codes", {
  id: varchar("id").primaryKey(), // unique QR code identifier
  churchId: integer("church_id").notNull().references(() => churches.id),
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

// Friend relationships
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  addresseeId: varchar("addressee_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, rejected, blocked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
  rank: integer("rank").notNull(),
  score: integer("score").notNull(),
  entityName: varchar("entity_name", { length: 100 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => ({
  leaderboardUserUnique: unique().on(table.leaderboardId, table.userId),
  leaderboardChurchUnique: unique().on(table.leaderboardId, table.churchId),
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
  churchId: integer("church_id").references(() => churches.id),
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

// Community Groups table
export const communityGroups = pgTable("community_groups", {
  id: serial("id").primaryKey(),
  churchId: integer("church_id").notNull().references(() => churches.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }), // youth, adults, seniors, ministry, etc.
  tags: text("tags").array(),
  leaderId: varchar("leader_id").references(() => users.id),
  maxMembers: integer("max_members"),
  isPrivate: boolean("is_private").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const communityGroupMembers = pgTable("community_group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => communityGroups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).default("member"), // member, moderator, leader
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  groupUserUnique: unique().on(table.groupId, table.userId),
}));

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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User engagement analytics
export const userEngagementMetrics = pgTable("user_engagement_metrics", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  churchId: integer("church_id").references(() => churches.id),
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

// A/B Testing for notifications
export const notificationAbTests = pgTable("notification_ab_tests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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

export const churchesRelations = relations(churches, ({ many }) => ({
  userChurches: many(userChurches),
  events: many(events),
  discussions: many(discussions),
  prayerRequests: many(prayerRequests),
}));

export const userChurchesRelations = relations(userChurches, ({ one }) => ({
  user: one(users, {
    fields: [userChurches.userId],
    references: [users.id],
  }),
  church: one(churches, {
    fields: [userChurches.churchId],
    references: [churches.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  church: one(churches, {
    fields: [events.churchId],
    references: [churches.id],
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
  church: one(churches, {
    fields: [discussions.churchId],
    references: [churches.id],
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
  church: one(churches, {
    fields: [prayerRequests.churchId],
    references: [churches.id],
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

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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

// Volunteer Management System

// Volunteer roles
export const volunteerRoles = pgTable("volunteer_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  requiredSkills: text("required_skills").array(),
  department: varchar("department", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Volunteer profiles
export const volunteers = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  churchId: integer("church_id").references(() => churches.id),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  emergencyContactName: varchar("emergency_contact_name", { length: 100 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  skills: text("skills").array(),
  interests: text("interests").array(),
  availability: jsonb("availability"), // {monday: [{start: "09:00", end: "17:00"}], ...}
  backgroundCheck: boolean("background_check").default(false),
  backgroundCheckDate: timestamp("background_check_date"),
  orientation: boolean("orientation").default(false),
  orientationDate: timestamp("orientation_date"),
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, pending
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
  churchId: integer("church_id").references(() => churches.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  roleId: integer("role_id").references(() => volunteerRoles.id),
  coordinatorId: varchar("coordinator_id").references(() => users.id),
  location: varchar("location", { length: 200 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  volunteersNeeded: integer("volunteers_needed").default(1),
  volunteersRegistered: integer("volunteers_registered").default(0),
  requiredSkills: text("required_skills").array(),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: jsonb("recurring_pattern"), // {frequency: "weekly", interval: 1, daysOfWeek: [1,3,5]}
  status: varchar("status", { length: 20 }).default("open"), // open, closed, cancelled, completed
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
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

// Volunteer certifications/training
export const volunteerCertifications = pgTable("volunteer_certifications", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  name: varchar("name", { length: 100 }).notNull(),
  issuingOrganization: varchar("issuing_organization", { length: 100 }),
  issuedDate: timestamp("issued_date"),
  expirationDate: timestamp("expiration_date"),
  certificateNumber: varchar("certificate_number", { length: 100 }),
  documentUrl: varchar("document_url", { length: 500 }),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Volunteer communication/notifications
export const volunteerCommunications = pgTable("volunteer_communications", {
  id: serial("id").primaryKey(),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toVolunteerId: integer("to_volunteer_id").references(() => volunteers.id),
  opportunityId: integer("opportunity_id").references(() => volunteerOpportunities.id),
  type: varchar("type", { length: 20 }).notNull(), // email, sms, notification, announcement
  subject: varchar("subject", { length: 200 }),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
  status: varchar("status", { length: 20 }).default("sent"), // sent, delivered, read, failed
});

// Volunteer awards/recognition
export const volunteerAwards = pgTable("volunteer_awards", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull().references(() => volunteers.id),
  awardType: varchar("award_type", { length: 50 }).notNull(), // service_hours, years_of_service, special_recognition
  title: varchar("title", { length: 100 }).notNull(),
  description: text("description"),
  hoursThreshold: integer("hours_threshold"),
  yearsThreshold: integer("years_threshold"),
  awardedBy: varchar("awarded_by").notNull().references(() => users.id),
  awardedAt: timestamp("awarded_at").defaultNow(),
  certificateUrl: varchar("certificate_url", { length: 500 }),
  isPublic: boolean("is_public").default(true),
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

// Volunteer Management Types
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
export type VolunteerCertification = typeof volunteerCertifications.$inferSelect;
export type InsertVolunteerCertification = typeof volunteerCertifications.$inferInsert;
export type VolunteerCommunication = typeof volunteerCommunications.$inferSelect;
export type InsertVolunteerCommunication = typeof volunteerCommunications.$inferInsert;
export type VolunteerAward = typeof volunteerAwards.$inferSelect;
export type InsertVolunteerAward = typeof volunteerAwards.$inferInsert;
export type VolunteerFeedback = typeof volunteerFeedback.$inferSelect;
export type InsertVolunteerFeedback = typeof volunteerFeedback.$inferInsert;

// Volunteer Management Zod Schemas
export const insertVolunteerRoleSchema = createInsertSchema(volunteerRoles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerSchema = createInsertSchema(volunteers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerRoleAssignmentSchema = createInsertSchema(volunteerRoleAssignments).omit({ id: true, assignedAt: true });
export const insertVolunteerOpportunitySchema = createInsertSchema(volunteerOpportunities).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVolunteerRegistrationSchema = createInsertSchema(volunteerRegistrations).omit({ id: true, registeredAt: true });
export const insertVolunteerHoursSchema = createInsertSchema(volunteerHours).omit({ id: true, createdAt: true });
export const insertVolunteerCertificationSchema = createInsertSchema(volunteerCertifications).omit({ id: true, createdAt: true });
export const insertVolunteerCommunicationSchema = createInsertSchema(volunteerCommunications).omit({ id: true, sentAt: true });
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

// Check-in system types
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = typeof checkIns.$inferInsert;
export type QrCode = typeof qrCodes.$inferSelect;
export type InsertQrCode = typeof qrCodes.$inferInsert;

// Check-in form schemas
export const insertCheckInSchema = createInsertSchema(checkIns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCheckInForm = z.infer<typeof insertCheckInSchema>;

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

export const insertPrayerAssignmentSchema = createInsertSchema(prayerAssignments).omit({
  id: true,
  createdAt: true,
});

// Prayer management type definitions
export type PrayerFollowUp = typeof prayerFollowUps.$inferSelect;
export type InsertPrayerFollowUp = typeof prayerFollowUps.$inferInsert;

export type PrayerUpdate = typeof prayerUpdates.$inferSelect;
export type InsertPrayerUpdate = typeof prayerUpdates.$inferInsert;

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
  churchId: integer("church_id").references(() => churches.id),
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
  churchId: integer("church_id").references(() => churches.id),
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

// Media management type definitions
export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;

export type MediaCollection = typeof mediaCollections.$inferSelect;
export type InsertMediaCollection = typeof mediaCollections.$inferInsert;

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
