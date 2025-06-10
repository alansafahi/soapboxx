import {
  users,
  churches,
  events,
  eventRsvps,
  eventVolunteers,
  eventNotifications,
  eventUpdates,
  eventCheckIns,
  eventRecurrenceRules,
  eventMetrics,
  discussions,
  discussionComments,
  discussionLikes,
  discussionBookmarks,
  prayerRequests,
  prayerResponses,
  prayerBookmarks,
  prayerFollowUps,
  prayerUpdates,
  prayerAssignments,
  userAchievements,
  userActivities,
  userChurches,
  friendships,
  conversations,
  conversationParticipants,
  messages,
  eventBookmarks,
  inspirationBookmarks,
  devotionals,
  weeklySeries,
  sermonMedia,
  checkIns,
  qrCodes,
  mediaFiles,
  mediaCollections,
  mediaCollectionItems,
  type User,
  type UpsertUser,
  type Church,
  type InsertChurch,
  type UserChurch,
  type InsertUserChurch,
  type Event,
  type InsertEvent,
  type EventRsvp,
  type InsertEventRsvp,
  type EventVolunteer,
  type InsertEventVolunteer,
  type EventNotification,
  type InsertEventNotification,
  type EventUpdate,
  type InsertEventUpdate,
  type EventCheckIn,
  type InsertEventCheckIn,
  type EventRecurrenceRule,
  type InsertEventRecurrenceRule,
  type EventMetric,
  type InsertEventMetric,
  type CheckIn,
  type InsertCheckIn,
  type QrCode,
  type InsertQrCode,
  type Discussion,
  type InsertDiscussion,
  type PrayerRequest,
  type InsertPrayerRequest,
  type PrayerFollowUp,
  type InsertPrayerFollowUp,
  type PrayerUpdate,
  type InsertPrayerUpdate,
  type PrayerAssignment,
  type InsertPrayerAssignment,
  type UserAchievement,
  type UserActivity,
  type InsertUserActivity,
  type PrayerResponse,
  type InsertPrayerResponse,
  type DiscussionComment,
  type InsertDiscussionComment,
  type Friendship,
  type InsertFriendship,
  type Conversation,
  type InsertConversation,
  type ConversationParticipant,
  type InsertConversationParticipant,
  type Message,
  type InsertMessage,
  type Devotional,
  type InsertDevotional,
  type WeeklySeries,
  type InsertWeeklySeries,
  type SermonMedia,
  type InsertSermonMedia,
  dailyInspirations,
  userInspirationPreferences,
  userInspirationHistory,
  type DailyInspiration,
  type UserInspirationPreference,
  type InsertUserInspirationPreference,
  type UserInspirationHistory,
  type InsertUserInspirationHistory,
  userScores,
  pointTransactions,
  achievements,
  leaderboards,
  leaderboardEntries,
  streaks,
  challenges,
  challengeParticipants,
  type UserScore,
  type InsertUserScore,
  type PointTransaction,
  type InsertPointTransaction,
  type Achievement,
  type InsertUserAchievement,
  type Leaderboard,
  type InsertLeaderboard,
  type LeaderboardEntry,
  type InsertLeaderboardEntry,
  type Streak,
  type InsertStreak,
  type Challenge,
  type InsertChallenge,
  type ChallengeParticipant,
  type InsertChallengeParticipant,
  communityGroups,
  communityGroupMembers,
  type CommunityGroup,
  type InsertCommunityGroup,
  type CommunityGroupMember,
  type InsertCommunityGroupMember,
  notificationSettings,
  scheduledNotifications,
  notificationDeliveries,
  userDevices,
  scriptureSchedules,
  type NotificationSettings,
  type InsertNotificationSettings,
  type ScheduledNotification,
  type InsertScheduledNotification,
  type NotificationDelivery,
  type InsertNotificationDelivery,
  type UserDevice,
  type InsertUserDevice,
  type ScriptureSchedule,
  type InsertScriptureSchedule,
  type MediaFile,
  type InsertMediaFile,
  type MediaCollection,
  type InsertMediaCollection,
  type MediaCollectionItem,
  type InsertMediaCollectionItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, asc, or, ilike, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  completeOnboarding(userId: string, onboardingData: any): Promise<void>;
  
  // Church operations
  getChurches(): Promise<Church[]>;
  getNearbyChurches(lat?: number, lng?: number, limit?: number): Promise<Church[]>;
  getChurch(id: number): Promise<Church | undefined>;
  createChurch(church: InsertChurch): Promise<Church>;
  updateChurch(id: number, updates: Partial<Church>): Promise<Church>;
  
  // Church team management
  getChurchMembers(churchId: number): Promise<(UserChurch & { user: User })[]>;
  updateMemberRole(churchId: number, userId: string, role: string, permissions?: string[], title?: string, bio?: string): Promise<UserChurch>;
  removeMember(churchId: number, userId: string): Promise<void>;
  
  // Event operations
  getEvents(churchId?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<Event>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
  getUserEvents(userId: string): Promise<Event[]>;
  getUpcomingEvents(churchId?: number, limit?: number): Promise<Event[]>;
  searchEvents(query: string, churchId?: number): Promise<Event[]>;
  
  // Event RSVP operations
  rsvpEvent(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  updateEventRsvp(eventId: number, userId: string, status: string): Promise<EventRsvp>;
  getUserEventRsvp(eventId: number, userId: string): Promise<EventRsvp | undefined>;
  getEventRsvps(eventId: number): Promise<(EventRsvp & { user: User })[]>;
  getEventAttendanceStats(eventId: number): Promise<{ attending: number; tentative: number; declined: number; total: number }>;
  
  // Event volunteer operations
  addEventVolunteer(volunteer: InsertEventVolunteer): Promise<EventVolunteer>;
  removeEventVolunteer(eventId: number, userId: string): Promise<void>;
  getEventVolunteers(eventId: number): Promise<(EventVolunteer & { user: User })[]>;
  
  // Event notifications
  createEventNotification(notification: InsertEventNotification): Promise<EventNotification>;
  getEventNotifications(eventId: number): Promise<EventNotification[]>;
  
  // Event updates
  createEventUpdate(update: InsertEventUpdate): Promise<EventUpdate>;
  getEventUpdates(eventId: number): Promise<EventUpdate[]>;
  
  // Event check-ins
  checkInToEvent(checkIn: InsertEventCheckIn): Promise<EventCheckIn>;
  getEventCheckIns(eventId: number): Promise<(EventCheckIn & { user: User })[]>;
  
  // Event recurrence
  createEventRecurrence(rule: InsertEventRecurrenceRule): Promise<EventRecurrenceRule>;
  getEventRecurrence(eventId: number): Promise<EventRecurrenceRule | undefined>;
  
  // Event metrics
  getEventMetrics(eventId: number): Promise<EventMetric | undefined>;
  updateEventMetrics(eventId: number, metrics: Partial<InsertEventMetric>): Promise<EventMetric>;
  
  // Discussion operations
  getDiscussions(churchId?: number): Promise<Discussion[]>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  likeDiscussion(discussionId: number, userId: string): Promise<void>;
  unlikeDiscussion(discussionId: number, userId: string): Promise<void>;
  getUserDiscussionLike(discussionId: number, userId: string): Promise<boolean>;
  
  // Comment operations
  getDiscussionComments(discussionId: number): Promise<DiscussionComment[]>;
  createDiscussionComment(comment: InsertDiscussionComment): Promise<DiscussionComment>;
  
  // Prayer request operations
  getPrayerRequests(churchId?: number): Promise<PrayerRequest[]>;
  getPrayerRequest(id: number): Promise<PrayerRequest | undefined>;
  createPrayerRequest(prayer: InsertPrayerRequest): Promise<PrayerRequest>;
  prayForRequest(response: InsertPrayerResponse): Promise<PrayerResponse>;
  getUserPrayerResponse(prayerRequestId: number, userId: string): Promise<PrayerResponse | undefined>;
  removePrayerResponse(prayerRequestId: number, userId: string): Promise<void>;
  getPrayerSupportMessages(prayerRequestId: number): Promise<any[]>;
  markPrayerAnswered(id: number): Promise<void>;
  updatePrayerStatus(prayerId: number, status: string, moderationNotes?: string): Promise<PrayerRequest>;
  createPrayerAssignment(assignment: InsertPrayerAssignment): Promise<PrayerAssignment>;
  createPrayerFollowUp(followUp: InsertPrayerFollowUp): Promise<PrayerFollowUp>;
  getAllUsers(): Promise<User[]>;
  
  // User stats and achievements
  getUserStats(userId: string): Promise<{
    attendanceCount: number;
    prayerCount: number;
    connectionCount: number;
    discussionCount: number;
  }>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  trackUserActivity(activity: InsertUserActivity): Promise<void>;
  
  // User church connections
  getUserChurches(userId: string): Promise<Church[]>;
  joinChurch(userId: string, churchId: number): Promise<void>;
  
  // Friend operations
  getFriends(userId: string): Promise<User[]>;
  getFriendRequests(userId: string): Promise<Friendship[]>;
  sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship>;
  respondToFriendRequest(friendshipId: number, status: 'accepted' | 'rejected'): Promise<Friendship>;
  
  // Chat operations
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(conversationId: number, userId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant>;
  getConversationMessages(conversationId: number, userId: string, limit?: number): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(conversationId: number, userId: string): Promise<void>;
  
  // Daily inspiration operations
  getDailyInspiration(userId: string): Promise<DailyInspiration | undefined>;
  getUserInspirationPreferences(userId: string): Promise<UserInspirationPreference | undefined>;
  updateInspirationPreferences(userId: string, preferences: Partial<InsertUserInspirationPreference>): Promise<UserInspirationPreference>;
  markInspirationAsRead(userId: string, inspirationId: number): Promise<void>;
  favoriteInspiration(userId: string, inspirationId: number): Promise<void>;
  unfavoriteInspiration(userId: string, inspirationId: number): Promise<void>;
  shareInspiration(userId: string, inspirationId: number): Promise<void>;
  shareInspirationWithUsers(senderId: string, inspirationId: number, userIds: string[]): Promise<void>;
  
  // Feed operations
  getFeedPosts(userId: string): Promise<any[]>;
  
  // Bookmark operations
  bookmarkDiscussion(userId: string, discussionId: number): Promise<void>;
  unbookmarkDiscussion(userId: string, discussionId: number): Promise<void>;
  bookmarkPrayer(userId: string, prayerId: number): Promise<void>;
  unbookmarkPrayer(userId: string, prayerId: number): Promise<void>;
  bookmarkInspiration(userId: string, inspirationId: number): Promise<void>;
  unbookmarkInspiration(userId: string, inspirationId: number): Promise<void>;
  bookmarkEvent(userId: string, eventId: number): Promise<void>;
  unbookmarkEvent(userId: string, eventId: number): Promise<void>;
  
  // Leaderboard operations
  getUserScore(userId: string): Promise<UserScore | undefined>;
  updateUserScore(userId: string, updates: Partial<InsertUserScore>): Promise<UserScore>;
  addPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  getLeaderboard(type: string, category: string, churchId?: number): Promise<LeaderboardEntry[]>;
  createLeaderboard(leaderboard: InsertLeaderboard): Promise<Leaderboard>;
  updateLeaderboardEntries(leaderboardId: number): Promise<void>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: number): Promise<UserAchievement>;
  getUserStreaks(userId: string): Promise<Streak[]>;
  updateStreak(userId: string, type: string): Promise<Streak>;
  getChallenges(churchId?: number): Promise<Challenge[]>;
  joinChallenge(userId: string, challengeId: number): Promise<ChallengeParticipant>;
  updateChallengeProgress(userId: string, challengeId: number, progress: number): Promise<ChallengeParticipant>;
  
  // Content management operations
  createDevotional(devotional: InsertDevotional): Promise<Devotional>;
  getDevotionals(churchId?: number): Promise<Devotional[]>;
  createWeeklySeries(series: InsertWeeklySeries): Promise<WeeklySeries>;
  getWeeklySeries(churchId?: number): Promise<WeeklySeries[]>;
  createSermonMedia(media: InsertSermonMedia): Promise<SermonMedia>;
  getSermonMedia(churchId?: number): Promise<SermonMedia[]>;

  // Notification system
  getNotificationSettings(userId: string): Promise<NotificationSettings | undefined>;
  upsertNotificationSettings(data: InsertNotificationSettings): Promise<NotificationSettings>;
  
  getScheduledNotifications(churchId?: number): Promise<ScheduledNotification[]>;
  createScheduledNotification(data: InsertScheduledNotification): Promise<ScheduledNotification>;
  updateScheduledNotification(id: number, data: Partial<InsertScheduledNotification>): Promise<ScheduledNotification>;
  deleteScheduledNotification(id: number): Promise<void>;
  
  getScriptureSchedules(churchId?: number): Promise<ScriptureSchedule[]>;
  createScriptureSchedule(data: InsertScriptureSchedule): Promise<ScriptureSchedule>;
  updateScriptureSchedule(id: number, data: Partial<InsertScriptureSchedule>): Promise<ScriptureSchedule>;
  deleteScriptureSchedule(id: number): Promise<void>;
  
  getNotificationDeliveries(notificationId?: number, userId?: string): Promise<NotificationDelivery[]>;
  createNotificationDelivery(data: InsertNotificationDelivery): Promise<NotificationDelivery>;
  updateNotificationDelivery(id: number, data: Partial<InsertNotificationDelivery>): Promise<NotificationDelivery>;

  // Check-in system operations
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getUserCheckIns(userId: string, limit?: number): Promise<CheckIn[]>;
  getUserDailyCheckIn(userId: string, date?: Date): Promise<CheckIn | undefined>;
  getUserCheckInStreak(userId: string): Promise<number>;
  getChurchCheckIns(churchId: number, date?: Date): Promise<(CheckIn & { user: User })[]>;
  
  // QR code operations
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  getQrCode(id: string): Promise<QrCode | undefined>;
  getChurchQrCodes(churchId: number): Promise<QrCode[]>;
  updateQrCode(id: string, updates: Partial<QrCode>): Promise<QrCode>;
  deleteQrCode(id: string): Promise<void>;
  validateQrCode(id: string): Promise<{ valid: boolean; qrCode?: QrCode }>;
  
  // Media management operations
  createMediaFile(mediaFile: InsertMediaFile): Promise<MediaFile>;
  getMediaFiles(churchId?: number): Promise<MediaFile[]>;
  getMediaFile(id: number): Promise<MediaFile | undefined>;
  updateMediaFile(id: number, updates: Partial<MediaFile>): Promise<MediaFile>;
  deleteMediaFile(id: number): Promise<void>;
  
  createMediaCollection(collection: InsertMediaCollection): Promise<MediaCollection>;
  getMediaCollections(churchId?: number): Promise<MediaCollection[]>;
  getMediaCollection(id: number): Promise<MediaCollection | undefined>;
  updateMediaCollection(id: number, updates: Partial<MediaCollection>): Promise<MediaCollection>;
  deleteMediaCollection(id: number): Promise<void>;
  
  addMediaToCollection(collectionId: number, mediaFileId: number): Promise<MediaCollectionItem>;
  removeMediaFromCollection(collectionId: number, mediaFileId: number): Promise<void>;
  getCollectionMedia(collectionId: number): Promise<MediaFile[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    const foundUsers = await db
      .select()
      .from(users)
      .where(
        or(
          ilike(users.firstName, searchTerm),
          ilike(users.lastName, searchTerm),
          ilike(users.email, searchTerm)
        )
      )
      .limit(10);
    return foundUsers;
  }

  async completeOnboarding(userId: string, onboardingData: any): Promise<void> {
    await db
      .update(users)
      .set({
        hasCompletedOnboarding: true,
        onboardingData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Church operations
  async getChurches(): Promise<Church[]> {
    return await db
      .select()
      .from(churches)
      .where(eq(churches.isActive, true))
      .orderBy(asc(churches.name));
  }

  async getNearbyChurches(lat?: number, lng?: number, limit: number = 10): Promise<Church[]> {
    // For simplicity, just return churches ordered by rating if no coordinates provided
    if (!lat || !lng) {
      return await db
        .select()
        .from(churches)
        .where(eq(churches.isActive, true))
        .orderBy(desc(churches.rating))
        .limit(limit);
    }
    
    // In a real implementation, you'd use PostGIS for distance calculations
    return await db
      .select()
      .from(churches)
      .where(eq(churches.isActive, true))
      .orderBy(desc(churches.rating))
      .limit(limit);
  }

  async getChurch(id: number): Promise<Church | undefined> {
    const [church] = await db.select().from(churches).where(eq(churches.id, id));
    return church;
  }

  async createChurch(church: InsertChurch): Promise<Church> {
    const [newChurch] = await db.insert(churches).values(church).returning();
    return newChurch;
  }

  async updateChurch(id: number, updates: Partial<Church>): Promise<Church> {
    const [updatedChurch] = await db
      .update(churches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(churches.id, id))
      .returning();
    return updatedChurch;
  }

  async getChurchMembers(churchId: number): Promise<(UserChurch & { user: User })[]> {
    return await db
      .select({
        id: userChurches.id,
        userId: userChurches.userId,
        churchId: userChurches.churchId,
        role: userChurches.role,
        permissions: userChurches.permissions,
        title: userChurches.title,
        bio: userChurches.bio,
        joinedAt: userChurches.joinedAt,
        isActive: userChurches.isActive,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
          mobileNumber: users.mobileNumber,
          address: users.address,
          city: users.city,
          state: users.state,
          zipCode: users.zipCode,
          country: users.country,
          denomination: users.denomination,
          interests: users.interests,
          hasCompletedOnboarding: users.hasCompletedOnboarding,
          onboardingData: users.onboardingData,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(userChurches)
      .innerJoin(users, eq(userChurches.userId, users.id))
      .where(and(
        eq(userChurches.churchId, churchId),
        eq(userChurches.isActive, true)
      )) as any;
  }

  async updateMemberRole(
    churchId: number, 
    userId: string, 
    role: string, 
    permissions?: string[], 
    title?: string, 
    bio?: string
  ): Promise<UserChurch> {
    const [updatedMember] = await db
      .update(userChurches)
      .set({ 
        role, 
        permissions: permissions || [],
        title,
        bio 
      })
      .where(and(
        eq(userChurches.churchId, churchId),
        eq(userChurches.userId, userId)
      ))
      .returning();
    return updatedMember;
  }

  async removeMember(churchId: number, userId: string): Promise<void> {
    await db
      .update(userChurches)
      .set({ isActive: false })
      .where(and(
        eq(userChurches.churchId, churchId),
        eq(userChurches.userId, userId)
      ));
  }

  // Event operations
  async getEvents(churchId?: number): Promise<Event[]> {
    const query = db
      .select()
      .from(events)
      .where(churchId ? eq(events.churchId, churchId) : undefined)
      .orderBy(asc(events.eventDate));
    
    return await query;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    
    // Track activity
    await this.trackUserActivity({
      userId: event.organizerId,
      activityType: 'event_created',
      entityId: newEvent.id,
      points: 10,
    });
    
    return newEvent;
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db
      .select({
        id: events.id,
        churchId: events.churchId,
        organizerId: events.organizerId,
        title: events.title,
        description: events.description,
        eventDate: events.eventDate,
        endDate: events.endDate,
        location: events.location,
        isOnline: events.isOnline,
        maxAttendees: events.maxAttendees,
        isPublic: events.isPublic,
        category: events.category,
        imageUrl: events.imageUrl,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(events)
      .innerJoin(eventRsvps, eq(events.id, eventRsvps.eventId))
      .where(and(
        eq(eventRsvps.userId, userId),
        eq(eventRsvps.status, 'attending')
      ))
      .orderBy(asc(events.eventDate));
  }

  async rsvpEvent(rsvp: InsertEventRsvp): Promise<EventRsvp> {
    const [newRsvp] = await db
      .insert(eventRsvps)
      .values(rsvp)
      .onConflictDoUpdate({
        target: [eventRsvps.eventId, eventRsvps.userId],
        set: { status: rsvp.status },
      })
      .returning();
    
    // Track activity
    await this.trackUserActivity({
      userId: rsvp.userId,
      activityType: 'event_rsvp',
      entityId: rsvp.eventId,
      points: 5,
    });
    
    return newRsvp;
  }

  async getUserEventRsvp(eventId: number, userId: string): Promise<EventRsvp | undefined> {
    const [rsvp] = await db
      .select()
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, userId)
      ));
    return rsvp;
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getUpcomingEvents(churchId?: number, limit = 10): Promise<Event[]> {
    const now = new Date();
    const query = db
      .select()
      .from(events)
      .where(and(
        churchId ? eq(events.churchId, churchId) : undefined,
        sql`${events.eventDate} >= ${now}`
      ))
      .orderBy(asc(events.eventDate))
      .limit(limit);
    
    return await query;
  }

  async searchEvents(query: string, churchId?: number): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(and(
        churchId ? eq(events.churchId, churchId) : undefined,
        or(
          ilike(events.title, `%${query}%`),
          ilike(events.description, `%${query}%`),
          ilike(events.category, `%${query}%`)
        )
      ))
      .orderBy(asc(events.eventDate));
  }

  async updateEventRsvp(eventId: number, userId: string, status: string): Promise<EventRsvp> {
    const [updatedRsvp] = await db
      .update(eventRsvps)
      .set({ status })
      .where(and(
        eq(eventRsvps.eventId, eventId),
        eq(eventRsvps.userId, userId)
      ))
      .returning();
    return updatedRsvp;
  }

  async getEventRsvps(eventId: number): Promise<(EventRsvp & { user: User })[]> {
    return await db
      .select({
        id: eventRsvps.id,
        eventId: eventRsvps.eventId,
        userId: eventRsvps.userId,
        status: eventRsvps.status,
        createdAt: eventRsvps.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
          mobileNumber: users.mobileNumber,
          address: users.address,
          city: users.city,
          state: users.state,
          zipCode: users.zipCode,
          country: users.country,
          denomination: users.denomination,
          interests: users.interests,
          hasCompletedOnboarding: users.hasCompletedOnboarding,
          onboardingData: users.onboardingData,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(eventRsvps)
      .innerJoin(users, eq(eventRsvps.userId, users.id))
      .where(eq(eventRsvps.eventId, eventId)) as any;
  }

  async getEventAttendanceStats(eventId: number): Promise<{ attending: number; tentative: number; declined: number; total: number }> {
    const [stats] = await db
      .select({
        attending: sql<number>`COUNT(*) FILTER (WHERE ${eventRsvps.status} = 'attending')`,
        tentative: sql<number>`COUNT(*) FILTER (WHERE ${eventRsvps.status} = 'tentative')`,
        declined: sql<number>`COUNT(*) FILTER (WHERE ${eventRsvps.status} = 'declined')`,
        total: count()
      })
      .from(eventRsvps)
      .where(eq(eventRsvps.eventId, eventId));
    
    return {
      attending: Number(stats.attending) || 0,
      tentative: Number(stats.tentative) || 0,
      declined: Number(stats.declined) || 0,
      total: stats.total
    };
  }

  async addEventVolunteer(volunteer: InsertEventVolunteer): Promise<EventVolunteer> {
    const [newVolunteer] = await db.insert(eventVolunteers).values(volunteer).returning();
    
    // Track activity
    await this.trackUserActivity({
      userId: volunteer.userId,
      activityType: 'event_volunteer',
      entityId: volunteer.eventId,
      points: 15,
    });
    
    return newVolunteer;
  }

  async removeEventVolunteer(eventId: number, userId: string): Promise<void> {
    await db
      .delete(eventVolunteers)
      .where(and(
        eq(eventVolunteers.eventId, eventId),
        eq(eventVolunteers.userId, userId)
      ));
  }

  async getEventVolunteers(eventId: number): Promise<(EventVolunteer & { user: User })[]> {
    return await db
      .select({
        id: eventVolunteers.id,
        eventId: eventVolunteers.eventId,
        userId: eventVolunteers.userId,
        role: eventVolunteers.role,
        notes: eventVolunteers.notes,
        createdAt: eventVolunteers.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
          mobileNumber: users.mobileNumber,
          address: users.address,
          city: users.city,
          state: users.state,
          zipCode: users.zipCode,
          country: users.country,
          denomination: users.denomination,
          interests: users.interests,
          hasCompletedOnboarding: users.hasCompletedOnboarding,
          onboardingData: users.onboardingData,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(eventVolunteers)
      .innerJoin(users, eq(eventVolunteers.userId, users.id))
      .where(eq(eventVolunteers.eventId, eventId)) as any;
  }

  async createEventNotification(notification: InsertEventNotification): Promise<EventNotification> {
    const [newNotification] = await db.insert(eventNotifications).values(notification).returning();
    return newNotification;
  }

  async getEventNotifications(eventId: number): Promise<EventNotification[]> {
    return await db
      .select()
      .from(eventNotifications)
      .where(eq(eventNotifications.eventId, eventId))
      .orderBy(desc(eventNotifications.createdAt));
  }

  async createEventUpdate(update: InsertEventUpdate): Promise<EventUpdate> {
    const [newUpdate] = await db.insert(eventUpdates).values(update).returning();
    return newUpdate;
  }

  async getEventUpdates(eventId: number): Promise<EventUpdate[]> {
    return await db
      .select()
      .from(eventUpdates)
      .where(eq(eventUpdates.eventId, eventId))
      .orderBy(desc(eventUpdates.createdAt));
  }

  async checkInToEvent(checkIn: InsertEventCheckIn): Promise<EventCheckIn> {
    const [newCheckIn] = await db.insert(eventCheckIns).values(checkIn).returning();
    
    // Track activity
    await this.trackUserActivity({
      userId: checkIn.userId,
      activityType: 'event_attendance',
      entityId: checkIn.eventId,
      points: 20,
    });
    
    return newCheckIn;
  }

  async getEventCheckIns(eventId: number): Promise<(EventCheckIn & { user: User })[]> {
    return await db
      .select({
        id: eventCheckIns.id,
        eventId: eventCheckIns.eventId,
        userId: eventCheckIns.userId,
        checkInTime: eventCheckIns.checkInTime,
        createdAt: eventCheckIns.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
          bio: users.bio,
          mobileNumber: users.mobileNumber,
          address: users.address,
          city: users.city,
          state: users.state,
          zipCode: users.zipCode,
          country: users.country,
          denomination: users.denomination,
          interests: users.interests,
          hasCompletedOnboarding: users.hasCompletedOnboarding,
          onboardingData: users.onboardingData,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(eventCheckIns)
      .innerJoin(users, eq(eventCheckIns.userId, users.id))
      .where(eq(eventCheckIns.eventId, eventId)) as any;
  }

  async createEventRecurrence(rule: InsertEventRecurrenceRule): Promise<EventRecurrenceRule> {
    const [newRule] = await db.insert(eventRecurrenceRules).values(rule).returning();
    return newRule;
  }

  async getEventRecurrence(eventId: number): Promise<EventRecurrenceRule | undefined> {
    const [rule] = await db
      .select()
      .from(eventRecurrenceRules)
      .where(eq(eventRecurrenceRules.eventId, eventId));
    return rule;
  }

  async getEventMetrics(eventId: number): Promise<EventMetric | undefined> {
    const [metrics] = await db
      .select()
      .from(eventMetrics)
      .where(eq(eventMetrics.eventId, eventId));
    return metrics;
  }

  async updateEventMetrics(eventId: number, metrics: Partial<InsertEventMetric>): Promise<EventMetric> {
    const [updatedMetrics] = await db
      .insert(eventMetrics)
      .values({ eventId, ...metrics })
      .onConflictDoUpdate({
        target: eventMetrics.eventId,
        set: { ...metrics, updatedAt: new Date() }
      })
      .returning();
    return updatedMetrics;
  }

  // Discussion operations
  async getDiscussions(churchId?: number): Promise<Discussion[]> {
    const query = db
      .select()
      .from(discussions)
      .where(
        and(
          eq(discussions.isPublic, true),
          churchId ? eq(discussions.churchId, churchId) : undefined
        )
      )
      .orderBy(desc(discussions.createdAt));
    
    return await query;
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }

  async createDiscussion(discussion: InsertDiscussion): Promise<Discussion> {
    const [newDiscussion] = await db.insert(discussions).values(discussion).returning();
    
    // Track activity
    await this.trackUserActivity({
      userId: discussion.authorId,
      activityType: 'discussion_post',
      entityId: newDiscussion.id,
      points: 10,
    });
    
    return newDiscussion;
  }

  async likeDiscussion(discussionId: number, userId: string): Promise<void> {
    await db.insert(discussionLikes).values({ discussionId, userId });
    
    // Update like count
    await db
      .update(discussions)
      .set({ 
        likeCount: sql`${discussions.likeCount} + 1`
      })
      .where(eq(discussions.id, discussionId));
    
    // Track activity
    await this.trackUserActivity({
      userId,
      activityType: 'discussion_like',
      entityId: discussionId,
      points: 1,
    });
  }

  async unlikeDiscussion(discussionId: number, userId: string): Promise<void> {
    await db
      .delete(discussionLikes)
      .where(and(
        eq(discussionLikes.discussionId, discussionId),
        eq(discussionLikes.userId, userId)
      ));
    
    // Update like count
    await db
      .update(discussions)
      .set({ 
        likeCount: sql`${discussions.likeCount} - 1`
      })
      .where(eq(discussions.id, discussionId));
  }

  async getUserDiscussionLike(discussionId: number, userId: string): Promise<boolean> {
    const [like] = await db
      .select()
      .from(discussionLikes)
      .where(and(
        eq(discussionLikes.discussionId, discussionId),
        eq(discussionLikes.userId, userId)
      ));
    return !!like;
  }

  // Comment operations
  async getDiscussionComments(discussionId: number): Promise<DiscussionComment[]> {
    return await db
      .select()
      .from(discussionComments)
      .where(eq(discussionComments.discussionId, discussionId))
      .orderBy(asc(discussionComments.createdAt));
  }

  async createDiscussionComment(comment: InsertDiscussionComment): Promise<DiscussionComment> {
    const [newComment] = await db.insert(discussionComments).values(comment).returning();
    
    // Update comment count on discussion
    await db
      .update(discussions)
      .set({ 
        commentCount: sql`${discussions.commentCount} + 1`
      })
      .where(eq(discussions.id, comment.discussionId));
    
    // Track activity
    await this.trackUserActivity({
      userId: comment.authorId,
      activityType: 'discussion_comment',
      entityId: comment.discussionId,
      points: 5,
    });
    
    return newComment;
  }

  // Prayer request operations
  async getPrayerRequests(churchId?: number): Promise<PrayerRequest[]> {
    const query = db
      .select()
      .from(prayerRequests)
      .where(
        and(
          eq(prayerRequests.isPublic, true),
          churchId ? eq(prayerRequests.churchId, churchId) : undefined
        )
      )
      .orderBy(desc(prayerRequests.createdAt));
    
    return await query;
  }

  async getPrayerRequest(id: number): Promise<PrayerRequest | undefined> {
    const [prayer] = await db.select().from(prayerRequests).where(eq(prayerRequests.id, id));
    return prayer;
  }

  async createPrayerRequest(prayer: InsertPrayerRequest): Promise<PrayerRequest> {
    const [newPrayer] = await db.insert(prayerRequests).values(prayer).returning();
    
    // Track activity
    await this.trackUserActivity({
      userId: prayer.authorId,
      activityType: 'prayer_request',
      entityId: newPrayer.id,
      points: 10,
    });
    
    return newPrayer;
  }

  async prayForRequest(response: InsertPrayerResponse): Promise<PrayerResponse> {
    const [newResponse] = await db
      .insert(prayerResponses)
      .values(response)
      .onConflictDoNothing()
      .returning();
    
    if (newResponse) {
      // Update prayer count
      await db
        .update(prayerRequests)
        .set({ 
          prayerCount: sql`${prayerRequests.prayerCount} + 1`
        })
        .where(eq(prayerRequests.id, response.prayerRequestId));
      
      // Track activity
      await this.trackUserActivity({
        userId: response.userId,
        activityType: 'prayer_response',
        entityId: response.prayerRequestId,
        points: 5,
      });
    }
    
    return newResponse;
  }

  async getUserPrayerResponse(prayerRequestId: number, userId: string): Promise<PrayerResponse | undefined> {
    const [response] = await db
      .select()
      .from(prayerResponses)
      .where(and(
        eq(prayerResponses.prayerRequestId, prayerRequestId),
        eq(prayerResponses.userId, userId),
        eq(prayerResponses.responseType, 'prayer')
      ));
    return response;
  }

  async removePrayerResponse(prayerRequestId: number, userId: string): Promise<void> {
    // Delete the prayer response
    const deletedResponse = await db
      .delete(prayerResponses)
      .where(and(
        eq(prayerResponses.prayerRequestId, prayerRequestId),
        eq(prayerResponses.userId, userId),
        eq(prayerResponses.responseType, 'prayer')
      ))
      .returning();
    
    if (deletedResponse.length > 0) {
      // Decrease prayer count
      await db
        .update(prayerRequests)
        .set({ 
          prayerCount: sql`GREATEST(${prayerRequests.prayerCount} - 1, 0)`
        })
        .where(eq(prayerRequests.id, prayerRequestId));
    }
  }

  async getPrayerSupportMessages(prayerRequestId: number): Promise<any[]> {
    const responses = await db
      .select({
        id: prayerResponses.id,
        content: prayerResponses.content,
        createdAt: prayerResponses.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(prayerResponses)
      .innerJoin(users, eq(prayerResponses.userId, users.id))
      .where(and(
        eq(prayerResponses.prayerRequestId, prayerRequestId),
        eq(prayerResponses.responseType, 'support'),
        sql`${prayerResponses.content} IS NOT NULL`
      ))
      .orderBy(desc(prayerResponses.createdAt));
    
    return responses;
  }

  async markPrayerAnswered(id: number): Promise<void> {
    await db
      .update(prayerRequests)
      .set({ 
        isAnswered: true,
        answeredAt: new Date(),
      })
      .where(eq(prayerRequests.id, id));
  }

  async updatePrayerStatus(prayerId: number, status: string, moderationNotes?: string): Promise<PrayerRequest> {
    const [updatedPrayer] = await db
      .update(prayerRequests)
      .set({
        status,
        moderationNotes,
        updatedAt: new Date(),
      })
      .where(eq(prayerRequests.id, prayerId))
      .returning();
    return updatedPrayer;
  }

  async createPrayerAssignment(assignment: InsertPrayerAssignment): Promise<PrayerAssignment> {
    const [newAssignment] = await db
      .insert(prayerAssignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async createPrayerFollowUp(followUp: InsertPrayerFollowUp): Promise<PrayerFollowUp> {
    const [newFollowUp] = await db
      .insert(prayerFollowUps)
      .values(followUp)
      .returning();
    return newFollowUp;
  }

  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(asc(users.firstName));
  }

  // User stats and achievements
  async getUserStats(userId: string): Promise<{
    attendanceCount: number;
    prayerCount: number;
    connectionCount: number;
    discussionCount: number;
    inspirationsRead: number;
    prayersOffered: number;
    totalPoints: number;
    currentStreak: number;
    level: number;
    experiencePoints: number;
    nextLevelXP: number;
  }> {
    // Get attendance count (events RSVP'd)
    const [attendanceResult] = await db
      .select({ count: count() })
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.userId, userId),
        eq(eventRsvps.status, 'attending')
      ));

    // Get prayer count (prayers offered by user)
    const [prayerResult] = await db
      .select({ count: count() })
      .from(prayerResponses)
      .where(eq(prayerResponses.userId, userId));

    // Get connections count (unique churches user is part of)
    const [connectionResult] = await db
      .select({ count: count() })
      .from(userChurches)
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.isActive, true)
      ));

    // Get discussions count
    const [discussionResult] = await db
      .select({ count: count() })
      .from(discussions)
      .where(eq(discussions.authorId, userId));

    // Get inspirations read count
    const [inspirationsResult] = await db
      .select({ count: count() })
      .from(userInspirationHistory)
      .where(and(
        eq(userInspirationHistory.userId, userId),
        eq(userInspirationHistory.wasRead, true)
      ));

    // Get prayers offered count (same as prayer count but more descriptive)
    const prayersOffered = prayerResult.count;

    // Calculate total points from user activities
    const [pointsResult] = await db
      .select({ 
        totalPoints: sql<number>`COALESCE(SUM(${userActivities.points}), 0)`.as('totalPoints')
      })
      .from(userActivities)
      .where(eq(userActivities.userId, userId));

    const totalPoints = pointsResult.totalPoints || 0;

    // Calculate current streak (consecutive days with activity)
    const recentActivities = await db
      .select({ 
        createdAt: userActivities.createdAt 
      })
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt))
      .limit(30); // Check last 30 days

    let currentStreak = 0;
    const today = new Date();
    const uniqueDays = new Set();
    
    // Group activities by day and calculate streak
    for (const activity of recentActivities) {
      if (activity.createdAt) {
        const activityDate = new Date(activity.createdAt.toString());
        const dayKey = activityDate.toDateString();
        uniqueDays.add(dayKey);
      }
    }

    const sortedDays = Array.from(uniqueDays).sort((a, b) => new Date(b as string).getTime() - new Date(a as string).getTime());
    
    for (let i = 0; i < sortedDays.length; i++) {
      const dayDate = new Date(sortedDays[i] as string);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (dayDate.toDateString() === expectedDate.toDateString()) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate level and experience
    const level = Math.floor(Math.sqrt(totalPoints / 100)) + 1;
    const currentLevelThreshold = Math.pow(level - 1, 2) * 100;
    const nextLevelThreshold = Math.pow(level, 2) * 100;
    const experiencePoints = totalPoints - currentLevelThreshold;
    const nextLevelXP = nextLevelThreshold - currentLevelThreshold;

    return {
      attendanceCount: attendanceResult.count,
      prayerCount: prayerResult.count,
      connectionCount: connectionResult.count,
      discussionCount: discussionResult.count,
      inspirationsRead: inspirationsResult.count,
      prayersOffered,
      totalPoints,
      currentStreak,
      level,
      experiencePoints,
      nextLevelXP,
    };
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async trackUserActivity(activity: InsertUserActivity): Promise<void> {
    await db.insert(userActivities).values(activity);
    
    // Update achievements based on activity
    if (activity.userId) {
      await this.updateUserAchievements(activity.userId);
    }
  }

  async updateUserAchievements(userId: string): Promise<void> {
    const stats = await this.getUserStats(userId);
    
    const achievementUpdates = [
      {
        type: 'prayer_warrior',
        progress: stats.prayerCount,
        maxProgress: 50,
      },
      {
        type: 'community_builder',
        progress: stats.discussionCount,
        maxProgress: 25,
      },
      {
        type: 'faithful_attendee',
        progress: stats.attendanceCount,
        maxProgress: 20,
      },
      {
        type: 'social_butterfly',
        progress: stats.connectionCount,
        maxProgress: 30,
      },
    ];

    for (const achievement of achievementUpdates) {
      const level = Math.floor(achievement.progress / achievement.maxProgress) + 1;
      const isUnlocked = achievement.progress >= achievement.maxProgress;
      
      // Check if achievement already exists
      const existingAchievement = await db
        .select()
        .from(userAchievements)
        .where(and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementType, achievement.type)
        ))
        .limit(1);

      if (existingAchievement.length > 0) {
        // Update existing achievement
        await db
          .update(userAchievements)
          .set({
            progress: achievement.progress,
            achievementLevel: level,
            isUnlocked,
            unlockedAt: isUnlocked && !existingAchievement[0].isUnlocked ? new Date() : existingAchievement[0].unlockedAt,
            updatedAt: new Date(),
          })
          .where(and(
            eq(userAchievements.userId, userId),
            eq(userAchievements.achievementType, achievement.type)
          ));
      } else {
        // Insert new achievement
        await db
          .insert(userAchievements)
          .values({
            userId,
            achievementType: achievement.type,
            achievementLevel: level,
            progress: achievement.progress,
            maxProgress: achievement.maxProgress,
            isUnlocked,
            unlockedAt: isUnlocked ? new Date() : null,
          });
      }
    }
  }

  // User church connections
  async getUserChurches(userId: string): Promise<Church[]> {
    return await db
      .select({
        id: churches.id,
        name: churches.name,
        denomination: churches.denomination,
        description: churches.description,
        address: churches.address,
        city: churches.city,
        state: churches.state,
        zipCode: churches.zipCode,
        phone: churches.phone,
        email: churches.email,
        website: churches.website,
        logoUrl: churches.logoUrl,
        bio: churches.bio,
        socialLinks: churches.socialLinks,
        communityTags: churches.communityTags,
        latitude: churches.latitude,
        longitude: churches.longitude,
        rating: churches.rating,
        memberCount: churches.memberCount,
        isActive: churches.isActive,
        createdAt: churches.createdAt,
        updatedAt: churches.updatedAt,
      })
      .from(churches)
      .innerJoin(userChurches, eq(churches.id, userChurches.churchId))
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.isActive, true)
      ));
  }

  async joinChurch(userId: string, churchId: number): Promise<void> {
    await db
      .insert(userChurches)
      .values({
        userId,
        churchId,
        role: 'member',
      })
      .onConflictDoUpdate({
        target: [userChurches.userId, userChurches.churchId],
        set: { isActive: true },
      });
      
    // Track activity
    await this.trackUserActivity({
      userId,
      activityType: 'church_joined',
      entityId: churchId,
      points: 20,
    });
  }

  // Friend operations
  async getFriends(userId: string): Promise<User[]> {
    const friendsList = await db
      .select()
      .from(friendships)
      .innerJoin(
        users,
        sql`(${friendships.requesterId} = ${users.id} AND ${friendships.addresseeId} = ${userId}) OR (${friendships.addresseeId} = ${users.id} AND ${friendships.requesterId} = ${userId})`
      )
      .where(
        and(
          eq(friendships.status, 'accepted'),
          sql`${users.id} != ${userId}`
        )
      );

    return friendsList as any;
  }

  async getFriendRequests(userId: string): Promise<Friendship[]> {
    return await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.addresseeId, userId),
          eq(friendships.status, 'pending')
        )
      );
  }

  async sendFriendRequest(requesterId: string, addresseeId: string): Promise<Friendship> {
    const [friendship] = await db
      .insert(friendships)
      .values({
        requesterId,
        addresseeId,
        status: 'pending',
      })
      .returning();

    return friendship;
  }

  async respondToFriendRequest(friendshipId: number, status: 'accepted' | 'rejected'): Promise<Friendship> {
    const [friendship] = await db
      .update(friendships)
      .set({ status, updatedAt: new Date() })
      .where(eq(friendships.id, friendshipId))
      .returning();

    return friendship;
  }

  // Chat operations
  async getConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select({
        id: conversations.id,
        type: conversations.type,
        name: conversations.name,
        description: conversations.description,
        createdBy: conversations.createdBy,
        isActive: conversations.isActive,
        createdAt: conversations.createdAt,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
      .where(
        and(
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.isActive, true),
          eq(conversations.isActive, true)
        )
      )
      .orderBy(desc(conversations.updatedAt));
  }

  async getConversation(conversationId: number, userId: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.isActive, true)
        )
      );

    return conversation?.conversations;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();

    return newConversation;
  }

  async addConversationParticipant(participant: InsertConversationParticipant): Promise<ConversationParticipant> {
    const [newParticipant] = await db
      .insert(conversationParticipants)
      .values(participant)
      .returning();

    return newParticipant;
  }

  async getConversationMessages(conversationId: number, userId: string, limit: number = 50): Promise<Message[]> {
    // First verify user is participant
    const isParticipant = await db
      .select({ id: conversationParticipants.id })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId),
          eq(conversationParticipants.isActive, true)
        )
      );

    if (isParticipant.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isDeleted, false)
        )
      )
      .orderBy(messages.createdAt)
      .limit(limit);
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();

    // Update conversation's updatedAt
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));

    return newMessage;
  }

  async markMessagesAsRead(conversationId: number, userId: string): Promise<void> {
    await db
      .update(conversationParticipants)
      .set({ lastReadAt: new Date() })
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      );
  }

  // Daily inspiration operations
  async getDailyInspiration(userId: string): Promise<DailyInspiration | undefined> {
    // Simple approach - get a random active inspiration
    const [inspiration] = await db
      .select()
      .from(dailyInspirations)
      .where(eq(dailyInspirations.isActive, true))
      .orderBy(sql`RANDOM()`)
      .limit(1);
    
    return inspiration;
  }

  async getUserInspirationPreferences(userId: string): Promise<UserInspirationPreference | undefined> {
    const [preferences] = await db
      .select()
      .from(userInspirationPreferences)
      .where(eq(userInspirationPreferences.userId, userId));
    return preferences;
  }

  async updateInspirationPreferences(
    userId: string, 
    preferences: Partial<InsertUserInspirationPreference>
  ): Promise<UserInspirationPreference> {
    const [updated] = await db
      .insert(userInspirationPreferences)
      .values({
        userId,
        ...preferences,
      })
      .onConflictDoUpdate({
        target: [userInspirationPreferences.userId],
        set: {
          ...preferences,
          updatedAt: new Date(),
        },
      })
      .returning();
    return updated;
  }

  async markInspirationAsRead(userId: string, inspirationId: number): Promise<void> {
    await db
      .insert(userInspirationHistory)
      .values({
        userId,
        inspirationId,
        wasRead: true,
      })
      .onConflictDoUpdate({
        target: [userInspirationHistory.userId, userInspirationHistory.inspirationId],
        set: {
          wasRead: true,
          viewedAt: new Date(),
        },
      });
  }

  async favoriteInspiration(userId: string, inspirationId: number): Promise<void> {
    await db
      .insert(userInspirationHistory)
      .values({
        userId,
        inspirationId,
        wasFavorited: true,
      })
      .onConflictDoUpdate({
        target: [userInspirationHistory.userId, userInspirationHistory.inspirationId],
        set: {
          wasFavorited: true,
        },
      });
  }

  async unfavoriteInspiration(userId: string, inspirationId: number): Promise<void> {
    await db
      .update(userInspirationHistory)
      .set({ wasFavorited: false })
      .where(
        and(
          eq(userInspirationHistory.userId, userId),
          eq(userInspirationHistory.inspirationId, inspirationId)
        )
      );
  }

  async shareInspiration(userId: string, inspirationId: number): Promise<void> {
    // Mark as shared in user history
    await db
      .insert(userInspirationHistory)
      .values({
        userId,
        inspirationId,
        wasShared: true,
      })
      .onConflictDoUpdate({
        target: [userInspirationHistory.userId, userInspirationHistory.inspirationId],
        set: {
          wasShared: true,
        },
      });

    // Get the inspiration details
    const [inspiration] = await db
      .select()
      .from(dailyInspirations)
      .where(eq(dailyInspirations.id, inspirationId));

    if (inspiration) {
      // Create a discussion post sharing the inspiration
      const content = `🌟 **Shared Daily Inspiration: ${inspiration.title}**\n\n${inspiration.content}${inspiration.verse ? `\n\n*"${inspiration.verse}"* - ${inspiration.verseReference}` : ''}`;
      
      await db.insert(discussions).values({
        authorId: userId,
        title: `Daily Inspiration: ${inspiration.title}`,
        content: content,
        category: 'inspiration',
        churchId: null, // Share to general community
      });
    }
  }

  async shareInspirationWithUsers(senderId: string, inspirationId: number, userIds: string[]): Promise<void> {
    // Get the inspiration details
    const [inspiration] = await db
      .select()
      .from(dailyInspirations)
      .where(eq(dailyInspirations.id, inspirationId));

    if (!inspiration) {
      throw new Error('Inspiration not found');
    }
    
    // Create conversations or send messages to each user
    for (const userId of userIds) {
      // Check if a conversation already exists between sender and recipient
      const existingConversation = await db
        .select({ id: conversations.id })
        .from(conversations)
        .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
        .where(
          and(
            eq(conversations.type, 'direct'),
            eq(conversationParticipants.userId, senderId)
          )
        )
        .intersect(
          db.select({ id: conversations.id })
            .from(conversations)
            .innerJoin(conversationParticipants, eq(conversations.id, conversationParticipants.conversationId))
            .where(
              and(
                eq(conversations.type, 'direct'),
                eq(conversationParticipants.userId, userId)
              )
            )
        )
        .limit(1);

      let conversationId: number;

      if (!existingConversation.length) {
        // Create new conversation
        const [newConversation] = await db.insert(conversations)
          .values({
            name: 'Shared Inspiration',
            type: 'direct',
            createdBy: senderId,
          })
          .returning();
        
        conversationId = newConversation.id;

        // Add participants
        await db.insert(conversationParticipants).values([
          { conversationId, userId: senderId },
          { conversationId, userId: userId }
        ]);
      } else {
        conversationId = existingConversation[0].id;
      }

      // Send the inspiration as a message
      const shareText = `🌟 **Shared Daily Inspiration: ${inspiration.title}**\n\n${inspiration.content}${inspiration.verse ? `\n\n*"${inspiration.verse}"* - ${inspiration.verseReference}` : ''}`;
      
      await db.insert(messages).values({
        conversationId,
        senderId,
        content: shareText,
        messageType: 'inspiration_share',
      });
    }

    // Mark as shared in user history
    await db
      .insert(userInspirationHistory)
      .values({
        userId: senderId,
        inspirationId,
        wasShared: true,
      })
      .onConflictDoUpdate({
        target: [userInspirationHistory.userId, userInspirationHistory.inspirationId],
        set: {
          wasShared: true,
        },
      });
  }

  async getFeedPosts(userId: string): Promise<any[]> {
    try {
      const feedPosts: any[] = [];

      // Get discussions with author info and like status
      const discussionsData = await db
        .select({
          id: discussions.id,
          title: discussions.title,
          content: discussions.content,
          authorId: discussions.authorId,
          createdAt: discussions.createdAt,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorEmail: users.email,
          authorProfileImage: users.profileImageUrl,
          churchId: discussions.churchId,
          churchName: churches.name,
        })
        .from(discussions)
        .leftJoin(users, eq(discussions.authorId, users.id))
        .leftJoin(churches, eq(discussions.churchId, churches.id))
        .orderBy(desc(discussions.createdAt))
        .limit(10);

      // Transform discussions for feed
      for (const d of discussionsData) {
        const authorName = d.authorFirstName && d.authorLastName 
          ? `${d.authorFirstName} ${d.authorLastName}`
          : d.authorEmail || 'Unknown User';

        // Check if user bookmarked this discussion
        const [bookmark] = await db
          .select()
          .from(discussionBookmarks)
          .where(and(
            eq(discussionBookmarks.userId, userId),
            eq(discussionBookmarks.discussionId, d.id)
          ))
          .limit(1);

        // Check if user liked this discussion
        const isLiked = await this.getUserDiscussionLike(d.id, userId);

        feedPosts.push({
          id: d.id,
          type: 'discussion',
          title: d.title,
          content: d.content,
          author: {
            id: d.authorId,
            name: authorName,
            profileImage: d.authorProfileImage
          },
          church: d.churchId ? { id: d.churchId, name: d.churchName } : null,
          createdAt: d.createdAt,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          isLiked: isLiked,
          isBookmarked: !!bookmark
        });
      }

      // Get prayer requests with author info
      const prayersData = await db
        .select({
          id: prayerRequests.id,
          title: prayerRequests.title,
          content: prayerRequests.content,
          authorId: prayerRequests.authorId,
          createdAt: prayerRequests.createdAt,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorEmail: users.email,
          authorProfileImage: users.profileImageUrl,
          churchId: prayerRequests.churchId,
          churchName: churches.name,
        })
        .from(prayerRequests)
        .leftJoin(users, eq(prayerRequests.authorId, users.id))
        .leftJoin(churches, eq(prayerRequests.churchId, churches.id))
        .orderBy(desc(prayerRequests.createdAt))
        .limit(10);

      // Transform prayers for feed
      for (const p of prayersData) {
        const authorName = p.authorFirstName && p.authorLastName 
          ? `${p.authorFirstName} ${p.authorLastName}`
          : p.authorEmail || 'Unknown User';

        // Check if user bookmarked this prayer
        const [prayerBookmark] = await db
          .select()
          .from(prayerBookmarks)
          .where(and(
            eq(prayerBookmarks.userId, userId),
            eq(prayerBookmarks.prayerId, p.id)
          ))
          .limit(1);

        // Check if user has prayed for this request (equivalent to liking)
        const prayerResponse = await this.getUserPrayerResponse(p.id, userId);
        const isLiked = !!prayerResponse;

        feedPosts.push({
          id: p.id,
          type: 'prayer',
          title: p.title,
          content: p.content,
          author: {
            id: p.authorId,
            name: authorName,
            profileImage: p.authorProfileImage
          },
          church: p.churchId ? { id: p.churchId, name: p.churchName } : null,
          createdAt: p.createdAt,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          isLiked: isLiked,
          isBookmarked: !!prayerBookmark,
          tags: ['prayer', 'faith']
        });
      }

      // Get daily inspirations
      const inspirationsData = await db
        .select({
          id: dailyInspirations.id,
          title: dailyInspirations.title,
          content: dailyInspirations.content,
          verse: dailyInspirations.verse,
          verseReference: dailyInspirations.verseReference,
          category: dailyInspirations.category,
          createdAt: dailyInspirations.createdAt,
        })
        .from(dailyInspirations)
        .orderBy(desc(dailyInspirations.createdAt))
        .limit(5);

      // Transform inspirations for feed
      for (const i of inspirationsData) {
        // Check if user bookmarked this inspiration
        const [inspirationBookmark] = await db
          .select()
          .from(inspirationBookmarks)
          .where(and(
            eq(inspirationBookmarks.userId, userId),
            eq(inspirationBookmarks.inspirationId, i.id)
          ))
          .limit(1);

        // Check if user favorited this inspiration (equivalent to liking)
        const [inspirationFavorite] = await db
          .select()
          .from(userInspirationHistory)
          .where(and(
            eq(userInspirationHistory.userId, userId),
            eq(userInspirationHistory.inspirationId, i.id),
            eq(userInspirationHistory.wasFavorited, true)
          ))
          .limit(1);

        feedPosts.push({
          id: i.id,
          type: 'inspiration',
          title: i.title,
          content: `${i.content}\n\n"${i.verse}"\n- ${i.verseReference}`,
          author: {
            id: 'system',
            name: 'Daily Inspiration',
            profileImage: null
          },
          church: null,
          createdAt: i.createdAt,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          isLiked: !!inspirationFavorite,
          isBookmarked: !!inspirationBookmark,
          tags: ['inspiration', i.category]
        });
      }

      // Sort all posts by creation date and return
      return feedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    } catch (error) {
      console.error('Error fetching feed posts:', error);
      return [];
    }
  }

  // Bookmark operations
  async bookmarkDiscussion(userId: string, discussionId: number): Promise<void> {
    await db.insert(discussionBookmarks).values({
      userId,
      discussionId,
    }).onConflictDoNothing();
  }

  async unbookmarkDiscussion(userId: string, discussionId: number): Promise<void> {
    await db.delete(discussionBookmarks)
      .where(and(
        eq(discussionBookmarks.userId, userId),
        eq(discussionBookmarks.discussionId, discussionId)
      ));
  }

  async bookmarkPrayer(userId: string, prayerId: number): Promise<void> {
    await db.insert(prayerBookmarks).values({
      userId,
      prayerId,
    }).onConflictDoNothing();
  }

  async unbookmarkPrayer(userId: string, prayerId: number): Promise<void> {
    await db.delete(prayerBookmarks)
      .where(and(
        eq(prayerBookmarks.userId, userId),
        eq(prayerBookmarks.prayerId, prayerId)
      ));
  }

  async bookmarkInspiration(userId: string, inspirationId: number): Promise<void> {
    await db.insert(inspirationBookmarks).values({
      userId,
      inspirationId,
    }).onConflictDoNothing();
  }

  async unbookmarkInspiration(userId: string, inspirationId: number): Promise<void> {
    await db.delete(inspirationBookmarks)
      .where(and(
        eq(inspirationBookmarks.userId, userId),
        eq(inspirationBookmarks.inspirationId, inspirationId)
      ));
  }

  async bookmarkEvent(userId: string, eventId: number): Promise<void> {
    await db.insert(eventBookmarks).values({
      userId,
      eventId,
    }).onConflictDoNothing();
  }

  async unbookmarkEvent(userId: string, eventId: number): Promise<void> {
    await db.delete(eventBookmarks)
      .where(and(
        eq(eventBookmarks.userId, userId),
        eq(eventBookmarks.eventId, eventId)
      ));
  }

  // Leaderboard operations
  async getUserScore(userId: string): Promise<UserScore | undefined> {
    const [userScore] = await db.select().from(userScores).where(eq(userScores.userId, userId));
    return userScore;
  }

  async updateUserScore(userId: string, updates: Partial<InsertUserScore>): Promise<UserScore> {
    const [userScore] = await db
      .insert(userScores)
      .values({
        userId,
        ...updates,
      })
      .onConflictDoUpdate({
        target: userScores.userId,
        set: {
          ...updates,
          updatedAt: new Date(),
        },
      })
      .returning();
    return userScore;
  }

  async addPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction> {
    const [pointTransaction] = await db
      .insert(pointTransactions)
      .values(transaction)
      .returning();

    // Update user score
    await this.updateUserScore(transaction.userId, {
      totalPoints: sql`${userScores.totalPoints} + ${transaction.points}`,
      weeklyPoints: sql`${userScores.weeklyPoints} + ${transaction.points}`,
      monthlyPoints: sql`${userScores.monthlyPoints} + ${transaction.points}`,
    });

    return pointTransaction;
  }

  async getLeaderboard(type: string, category: string, churchId?: number): Promise<LeaderboardEntry[]> {
    let query = db
      .select({
        id: leaderboardEntries.id,
        leaderboardId: leaderboardEntries.leaderboardId,
        userId: leaderboardEntries.userId,
        churchId: leaderboardEntries.churchId,
        rank: leaderboardEntries.rank,
        score: leaderboardEntries.score,
        entityName: leaderboardEntries.entityName,
        lastUpdated: leaderboardEntries.lastUpdated,
      })
      .from(leaderboardEntries)
      .innerJoin(leaderboards, eq(leaderboardEntries.leaderboardId, leaderboards.id))
      .where(
        and(
          eq(leaderboards.type, type),
          eq(leaderboards.category, category),
          eq(leaderboards.isActive, true)
        )
      );

    if (churchId) {
      query = query.where(eq(leaderboards.churchId, churchId));
    }

    return query.orderBy(asc(leaderboardEntries.rank));
  }

  async createLeaderboard(leaderboard: InsertLeaderboard): Promise<Leaderboard> {
    const [newLeaderboard] = await db
      .insert(leaderboards)
      .values(leaderboard)
      .returning();
    return newLeaderboard;
  }

  async updateLeaderboardEntries(leaderboardId: number): Promise<void> {
    const [leaderboard] = await db
      .select()
      .from(leaderboards)
      .where(eq(leaderboards.id, leaderboardId));

    if (!leaderboard) return;

    // Clear existing entries
    await db.delete(leaderboardEntries).where(eq(leaderboardEntries.leaderboardId, leaderboardId));

    // Generate new entries based on leaderboard type and category
    if (leaderboard.type === 'weekly' && leaderboard.category === 'overall') {
      const topUsers = await db
        .select({
          userId: userScores.userId,
          score: userScores.weeklyPoints,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(userScores)
        .innerJoin(users, eq(userScores.userId, users.id))
        .where(eq(userScores.isAnonymous, false))
        .orderBy(desc(userScores.weeklyPoints))
        .limit(100);

      const entries = topUsers.map((user, index) => ({
        leaderboardId,
        userId: user.userId,
        rank: index + 1,
        score: user.score || 0,
        entityName: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.email || 'Anonymous',
      }));

      if (entries.length > 0) {
        await db.insert(leaderboardEntries).values(entries);
      }
    }
    // Add more leaderboard types as needed
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async awardAchievement(userId: string, achievementId: number): Promise<UserAchievement> {
    const [userAchievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
      })
      .onConflictDoNothing()
      .returning();
    return userAchievement;
  }

  async getUserStreaks(userId: string): Promise<Streak[]> {
    return db
      .select()
      .from(streaks)
      .where(and(
        eq(streaks.userId, userId),
        eq(streaks.isActive, true)
      ));
  }

  async updateStreak(userId: string, type: string): Promise<Streak> {
    const [streak] = await db
      .insert(streaks)
      .values({
        userId,
        type,
        currentCount: 1,
        longestCount: 1,
        lastActivityDate: new Date(),
      })
      .onConflictDoUpdate({
        target: [streaks.userId, streaks.type],
        set: {
          currentCount: sql`${streaks.currentCount} + 1`,
          longestCount: sql`GREATEST(${streaks.longestCount}, ${streaks.currentCount} + 1)`,
          lastActivityDate: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return streak;
  }

  async getChallenges(churchId?: number): Promise<Challenge[]> {
    let query = db
      .select()
      .from(challenges)
      .where(eq(challenges.isActive, true));

    if (churchId) {
      query = query.where(eq(challenges.churchId, churchId));
    }

    return query.orderBy(desc(challenges.startDate));
  }

  async joinChallenge(userId: string, challengeId: number): Promise<ChallengeParticipant> {
    const [participant] = await db
      .insert(challengeParticipants)
      .values({
        userId,
        challengeId,
      })
      .onConflictDoNothing()
      .returning();
    return participant;
  }

  async updateChallengeProgress(userId: string, challengeId: number, progress: number): Promise<ChallengeParticipant> {
    const [participant] = await db
      .update(challengeParticipants)
      .set({
        currentProgress: progress,
        isCompleted: sql`${challengeParticipants.currentProgress} >= (SELECT target_count FROM challenges WHERE id = ${challengeId})`,
        completedAt: sql`CASE WHEN ${challengeParticipants.currentProgress} >= (SELECT target_count FROM challenges WHERE id = ${challengeId}) THEN NOW() ELSE NULL END`,
      })
      .where(and(
        eq(challengeParticipants.userId, userId),
        eq(challengeParticipants.challengeId, challengeId)
      ))
      .returning();
    return participant;
  }

  // Content management operations
  async createDevotional(devotional: InsertDevotional): Promise<Devotional> {
    const [newDevotional] = await db
      .insert(devotionals)
      .values(devotional)
      .returning();
    return newDevotional;
  }

  async getDevotionals(churchId?: number): Promise<Devotional[]> {
    let query = db.select().from(devotionals);
    
    if (churchId) {
      query = query.where(eq(devotionals.churchId, churchId));
    }
    
    return query.orderBy(desc(devotionals.createdAt));
  }

  async createWeeklySeries(series: InsertWeeklySeries): Promise<WeeklySeries> {
    const [newSeries] = await db
      .insert(weeklySeries)
      .values(series)
      .returning();
    return newSeries;
  }

  async getWeeklySeries(churchId?: number): Promise<WeeklySeries[]> {
    let query = db.select().from(weeklySeries);
    
    if (churchId) {
      query = query.where(eq(weeklySeries.churchId, churchId));
    }
    
    return query.orderBy(desc(weeklySeries.createdAt));
  }

  async createSermonMedia(media: InsertSermonMedia): Promise<SermonMedia> {
    const [newMedia] = await db
      .insert(sermonMedia)
      .values(media)
      .returning();
    return newMedia;
  }

  async getSermonMedia(churchId?: number): Promise<SermonMedia[]> {
    let query = db.select().from(sermonMedia);
    
    if (churchId) {
      query = query.where(eq(sermonMedia.churchId, churchId));
    }
    
    return query.orderBy(desc(sermonMedia.createdAt));
  }

  // Notification system implementation
  async getNotificationSettings(userId: string): Promise<NotificationSettings | undefined> {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId));
    return settings;
  }

  async upsertNotificationSettings(data: InsertNotificationSettings): Promise<NotificationSettings> {
    const [settings] = await db
      .insert(notificationSettings)
      .values(data)
      .onConflictDoUpdate({
        target: notificationSettings.userId,
        set: {
          ...data,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
  }

  async getScheduledNotifications(churchId?: number): Promise<ScheduledNotification[]> {
    let query = db.select().from(scheduledNotifications);
    
    if (churchId) {
      query = query.where(eq(scheduledNotifications.churchId, churchId));
    }
    
    return query.orderBy(desc(scheduledNotifications.createdAt));
  }

  async createScheduledNotification(data: InsertScheduledNotification): Promise<ScheduledNotification> {
    const [notification] = await db
      .insert(scheduledNotifications)
      .values(data)
      .returning();
    return notification;
  }

  async updateScheduledNotification(id: number, data: Partial<InsertScheduledNotification>): Promise<ScheduledNotification> {
    const [notification] = await db
      .update(scheduledNotifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scheduledNotifications.id, id))
      .returning();
    return notification;
  }

  async deleteScheduledNotification(id: number): Promise<void> {
    await db
      .delete(scheduledNotifications)
      .where(eq(scheduledNotifications.id, id));
  }

  async getScriptureSchedules(churchId?: number): Promise<ScriptureSchedule[]> {
    let query = db.select().from(scriptureSchedules);
    
    if (churchId) {
      query = query.where(eq(scriptureSchedules.churchId, churchId));
    }
    
    return query.orderBy(desc(scriptureSchedules.createdAt));
  }

  async createScriptureSchedule(data: InsertScriptureSchedule): Promise<ScriptureSchedule> {
    const [schedule] = await db
      .insert(scriptureSchedules)
      .values(data)
      .returning();
    return schedule;
  }

  async updateScriptureSchedule(id: number, data: Partial<InsertScriptureSchedule>): Promise<ScriptureSchedule> {
    const [schedule] = await db
      .update(scriptureSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scriptureSchedules.id, id))
      .returning();
    return schedule;
  }

  async deleteScriptureSchedule(id: number): Promise<void> {
    await db
      .delete(scriptureSchedules)
      .where(eq(scriptureSchedules.id, id));
  }

  async getNotificationDeliveries(notificationId?: number, userId?: string): Promise<NotificationDelivery[]> {
    let query = db.select().from(notificationDeliveries);
    
    const conditions = [];
    if (notificationId) {
      conditions.push(eq(notificationDeliveries.notificationId, notificationId));
    }
    if (userId) {
      conditions.push(eq(notificationDeliveries.userId, userId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(notificationDeliveries.createdAt));
  }

  async createNotificationDelivery(data: InsertNotificationDelivery): Promise<NotificationDelivery> {
    const [delivery] = await db
      .insert(notificationDeliveries)
      .values(data)
      .returning();
    return delivery;
  }

  async updateNotificationDelivery(id: number, data: Partial<InsertNotificationDelivery>): Promise<NotificationDelivery> {
    const [delivery] = await db
      .update(notificationDeliveries)
      .set(data)
      .where(eq(notificationDeliveries.id, id))
      .returning();
    return delivery;
  }

  // Check-in system operations
  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    // Calculate streak count for this user
    const streak = await this.getUserCheckInStreak(checkInData.userId);
    const newStreak = streak + 1;
    
    // Calculate points based on streak and check-in type
    let pointsEarned = 10; // Base points
    if (checkInData.checkInType === "Sunday Service") pointsEarned = 25;
    else if (checkInData.checkInType === "Prayer Time") pointsEarned = 15;
    else if (checkInData.isPhysicalAttendance) pointsEarned = 30;
    
    // Streak bonus
    if (newStreak >= 7) pointsEarned += 10;
    if (newStreak >= 30) pointsEarned += 20;

    const [checkIn] = await db
      .insert(checkIns)
      .values({
        ...checkInData,
        streakCount: newStreak,
        pointsEarned,
      })
      .returning();

    // Update user score
    await this.updateUserScore(checkInData.userId, pointsEarned, "check_in", checkIn.id);

    return checkIn;
  }

  async getUserCheckIns(userId: string, limit = 20): Promise<CheckIn[]> {
    return await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.createdAt))
      .limit(limit);
  }

  async getUserDailyCheckIn(userId: string, date = new Date()): Promise<CheckIn | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [checkIn] = await db
      .select()
      .from(checkIns)
      .where(
        and(
          eq(checkIns.userId, userId),
          gte(checkIns.createdAt, startOfDay),
          lte(checkIns.createdAt, endOfDay)
        )
      )
      .orderBy(desc(checkIns.createdAt))
      .limit(1);
    
    return checkIn;
  }

  async getUserCheckInStreak(userId: string): Promise<number> {
    const checkIns = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.createdAt))
      .limit(365); // Look back up to a year

    if (checkIns.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const checkIn of checkIns) {
      const checkInDate = new Date(checkIn.createdAt);
      checkInDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - checkInDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        if (diffDays === 1 || streak === 0) {
          streak++;
          currentDate = checkInDate;
        }
      } else {
        break;
      }
    }

    return streak;
  }

  async getChurchCheckIns(churchId: number, date = new Date()): Promise<(CheckIn & { user: User })[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select({
        id: checkIns.id,
        userId: checkIns.userId,
        churchId: checkIns.churchId,
        eventId: checkIns.eventId,
        checkInType: checkIns.checkInType,
        mood: checkIns.mood,
        moodEmoji: checkIns.moodEmoji,
        notes: checkIns.notes,
        prayerIntent: checkIns.prayerIntent,
        isPhysicalAttendance: checkIns.isPhysicalAttendance,
        qrCodeId: checkIns.qrCodeId,
        location: checkIns.location,
        streakCount: checkIns.streakCount,
        pointsEarned: checkIns.pointsEarned,
        createdAt: checkIns.createdAt,
        updatedAt: checkIns.updatedAt,
        user: users,
      })
      .from(checkIns)
      .innerJoin(users, eq(checkIns.userId, users.id))
      .where(
        and(
          eq(checkIns.churchId, churchId),
          gte(checkIns.createdAt, startOfDay),
          lte(checkIns.createdAt, endOfDay)
        )
      )
      .orderBy(desc(checkIns.createdAt));
  }

  // QR code operations
  async createQrCode(qrCodeData: InsertQrCode): Promise<QrCode> {
    const [qrCode] = await db
      .insert(qrCodes)
      .values(qrCodeData)
      .returning();
    return qrCode;
  }

  async getQrCode(id: string): Promise<QrCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.id, id));
    return qrCode;
  }

  async getChurchQrCodes(churchId: number): Promise<QrCode[]> {
    return await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.churchId, churchId))
      .orderBy(desc(qrCodes.createdAt));
  }

  async updateQrCode(id: string, updates: Partial<QrCode>): Promise<QrCode> {
    const [qrCode] = await db
      .update(qrCodes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(qrCodes.id, id))
      .returning();
    return qrCode;
  }

  async deleteQrCode(id: string): Promise<void> {
    await db
      .delete(qrCodes)
      .where(eq(qrCodes.id, id));
  }

  async validateQrCode(id: string): Promise<{ valid: boolean; qrCode?: QrCode }> {
    const qrCode = await this.getQrCode(id);
    
    if (!qrCode) {
      return { valid: false };
    }

    const now = new Date();
    const isActive = qrCode.isActive;
    const notExpired = !qrCode.expiresAt || qrCode.expiresAt > now;
    const withinUsageLimit = !qrCode.maxUses || qrCode.usageCount < qrCode.maxUses;

    const valid = isActive && notExpired && withinUsageLimit;

    if (valid) {
      // Increment usage count
      await this.updateQrCode(id, {
        usageCount: qrCode.usageCount + 1,
      });
    }

    return { valid, qrCode };
  }

  // Media management operations
  async createMediaFile(mediaFileData: InsertMediaFile): Promise<MediaFile> {
    const [mediaFile] = await db
      .insert(mediaFiles)
      .values(mediaFileData)
      .returning();
    return mediaFile;
  }

  async getMediaFiles(churchId?: number): Promise<MediaFile[]> {
    let query = db.select().from(mediaFiles);
    
    if (churchId) {
      query = query.where(eq(mediaFiles.churchId, churchId));
    }
    
    return query.orderBy(desc(mediaFiles.createdAt));
  }

  async getMediaFile(id: number): Promise<MediaFile | undefined> {
    const [mediaFile] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id));
    return mediaFile;
  }

  async updateMediaFile(id: number, updates: Partial<MediaFile>): Promise<MediaFile> {
    const [mediaFile] = await db
      .update(mediaFiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(mediaFiles.id, id))
      .returning();
    return mediaFile;
  }

  async deleteMediaFile(id: number): Promise<void> {
    await db
      .delete(mediaFiles)
      .where(eq(mediaFiles.id, id));
  }

  async createMediaCollection(collectionData: InsertMediaCollection): Promise<MediaCollection> {
    const [collection] = await db
      .insert(mediaCollections)
      .values(collectionData)
      .returning();
    return collection;
  }

  async getMediaCollections(churchId?: number): Promise<MediaCollection[]> {
    let query = db.select().from(mediaCollections);
    
    if (churchId) {
      query = query.where(eq(mediaCollections.churchId, churchId));
    }
    
    return query.orderBy(desc(mediaCollections.createdAt));
  }

  async getMediaCollection(id: number): Promise<MediaCollection | undefined> {
    const [collection] = await db
      .select()
      .from(mediaCollections)
      .where(eq(mediaCollections.id, id));
    return collection;
  }

  async updateMediaCollection(id: number, updates: Partial<MediaCollection>): Promise<MediaCollection> {
    const [collection] = await db
      .update(mediaCollections)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(mediaCollections.id, id))
      .returning();
    return collection;
  }

  async deleteMediaCollection(id: number): Promise<void> {
    await db
      .delete(mediaCollections)
      .where(eq(mediaCollections.id, id));
  }

  async addMediaToCollection(collectionId: number, mediaFileId: number): Promise<MediaCollectionItem> {
    const [item] = await db
      .insert(mediaCollectionItems)
      .values({
        collectionId,
        mediaFileId,
      })
      .returning();
    return item;
  }

  async removeMediaFromCollection(collectionId: number, mediaFileId: number): Promise<void> {
    await db
      .delete(mediaCollectionItems)
      .where(
        and(
          eq(mediaCollectionItems.collectionId, collectionId),
          eq(mediaCollectionItems.mediaFileId, mediaFileId)
        )
      );
  }

  async getCollectionMedia(collectionId: number): Promise<MediaFile[]> {
    return await db
      .select({
        id: mediaFiles.id,
        churchId: mediaFiles.churchId,
        uploadedBy: mediaFiles.uploadedBy,
        fileName: mediaFiles.fileName,
        originalName: mediaFiles.originalName,
        fileType: mediaFiles.fileType,
        mimeType: mediaFiles.mimeType,
        fileSize: mediaFiles.fileSize,
        filePath: mediaFiles.filePath,
        publicUrl: mediaFiles.publicUrl,
        thumbnailUrl: mediaFiles.thumbnailUrl,
        category: mediaFiles.category,
        title: mediaFiles.title,
        description: mediaFiles.description,
        tags: mediaFiles.tags,
        isPublic: mediaFiles.isPublic,
        isApproved: mediaFiles.isApproved,
        approvedBy: mediaFiles.approvedBy,
        approvedAt: mediaFiles.approvedAt,
        downloadCount: mediaFiles.downloadCount,
        viewCount: mediaFiles.viewCount,
        duration: mediaFiles.duration,
        dimensions: mediaFiles.dimensions,
        metadata: mediaFiles.metadata,
        status: mediaFiles.status,
        createdAt: mediaFiles.createdAt,
        updatedAt: mediaFiles.updatedAt,
      })
      .from(mediaFiles)
      .innerJoin(mediaCollectionItems, eq(mediaFiles.id, mediaCollectionItems.mediaFileId))
      .where(eq(mediaCollectionItems.collectionId, collectionId))
      .orderBy(desc(mediaCollectionItems.addedAt));
  }
}

export const storage = new DatabaseStorage();
