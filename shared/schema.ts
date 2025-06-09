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
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  imageUrl: varchar("image_url"),
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
  role: varchar("role", { length: 50 }).default("member"), // member, admin, pastor
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
  parentId: integer("parent_id").references(() => discussionComments.id),
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
  replyToId: integer("reply_to_id").references(() => messages.id),
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
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

export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;

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

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
});
