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
});

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
});

// User activity tracking
export const userActivities = pgTable("user_activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // discussion_post, comment, prayer_request, event_rsvp, etc.
  entityId: integer("entity_id"), // ID of the related entity (discussion, event, etc.)
  points: integer("points").default(0),
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
  createdAt: true,
  updatedAt: true,
  likeCount: true,
  commentCount: true,
});

export const insertPrayerRequestSchema = createInsertSchema(prayerRequests).omit({
  id: true,
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
