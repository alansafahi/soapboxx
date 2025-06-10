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

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  churchId: integer("church_id").notNull().references(() => churches.id),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  isOnline: boolean("is_online").default(false),
  maxAttendees: integer("max_attendees"),
  isPublic: boolean("is_public").default(true),
  category: varchar("category", { length: 50 }), // service, bible_study, community_service, social
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs
export const eventRsvps = pgTable("event_rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("attending"), // attending, maybe, not_attending
  createdAt: timestamp("created_at").defaultNow(),
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
  type: varchar("type", { length: 20 }).notNull(), // scripture, event, message, prayer
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Los_Angeles"),
  targetAudience: varchar("target_audience", { length: 20 }).default("all"), // all, members, leaders, group
  targetGroupId: integer("target_group_id").references(() => communityGroups.id),
  targetUserIds: text("target_user_ids").array(), // specific user IDs
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern", { length: 20 }), // daily, weekly, monthly
  recurringDays: text("recurring_days").array(), // ['monday', 'tuesday'] for weekly
  endDate: timestamp("end_date"),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, sent, cancelled, failed
  sentAt: timestamp("sent_at"),
  sentCount: integer("sent_count").default(0),
  deliveredCount: integer("delivered_count").default(0),
  openedCount: integer("opened_count").default(0),
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
  scheduleTime: varchar("schedule_time", { length: 5 }).notNull(), // HH:MM format
  timezone: varchar("timezone", { length: 50 }).default("America/Los_Angeles"),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  currentIndex: integer("current_index").default(0), // Track current scripture
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type InsertChurch = typeof churches.$inferInsert;
export type Church = typeof churches.$inferSelect;

export type InsertEvent = typeof events.$inferInsert;
export type Event = typeof events.$inferSelect;

export type InsertEventRsvp = typeof eventRsvps.$inferInsert;
export type EventRsvp = typeof eventRsvps.$inferSelect;

export type InsertDiscussion = typeof discussions.$inferInsert;
export type Discussion = typeof discussions.$inferSelect;

export type InsertDiscussionComment = typeof discussionComments.$inferInsert;
export type DiscussionComment = typeof discussionComments.$inferSelect;

export type InsertPrayerRequest = typeof prayerRequests.$inferInsert;
export type PrayerRequest = typeof prayerRequests.$inferSelect;

export type InsertPrayerResponse = typeof prayerResponses.$inferInsert;
export type PrayerResponse = typeof prayerResponses.$inferSelect;



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

export type ScriptureSchedule = typeof scriptureSchedules.$inferSelect;
export type InsertScriptureSchedule = typeof scriptureSchedules.$inferInsert;

// Insert schemas for validation
export const insertChurchSchema = createInsertSchema(churches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
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

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
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
