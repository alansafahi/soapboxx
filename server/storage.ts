import {
  users,
  churches,
  events,
  eventRsvps,
  discussions,
  discussionComments,
  discussionLikes,
  prayerRequests,
  prayerResponses,
  userAchievements,
  userActivities,
  userChurches,
  friendships,
  conversations,
  conversationParticipants,
  messages,
  type User,
  type UpsertUser,
  type Church,
  type InsertChurch,
  type Event,
  type InsertEvent,
  type Discussion,
  type InsertDiscussion,
  type PrayerRequest,
  type InsertPrayerRequest,
  type EventRsvp,
  type InsertEventRsvp,
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
  dailyInspirations,
  userInspirationPreferences,
  userInspirationHistory,
  type DailyInspiration,
  type UserInspirationPreference,
  type InsertUserInspirationPreference,
  type UserInspirationHistory,
  type InsertUserInspirationHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, asc, or, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  completeOnboarding(userId: string, onboardingData: any): Promise<void>;
  
  // Church operations
  getChurches(): Promise<Church[]>;
  getNearbyChurches(lat?: number, lng?: number, limit?: number): Promise<Church[]>;
  getChurch(id: number): Promise<Church | undefined>;
  createChurch(church: InsertChurch): Promise<Church>;
  
  // Event operations
  getEvents(churchId?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  getUserEvents(userId: string): Promise<Event[]>;
  rsvpEvent(rsvp: InsertEventRsvp): Promise<EventRsvp>;
  getUserEventRsvp(eventId: number, userId: string): Promise<EventRsvp | undefined>;
  
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
  markPrayerAnswered(id: number): Promise<void>;
  
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
        eq(prayerResponses.userId, userId)
      ));
    return response;
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

  // User stats and achievements
  async getUserStats(userId: string): Promise<{
    attendanceCount: number;
    prayerCount: number;
    connectionCount: number;
    discussionCount: number;
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
      const dayDate = new Date(sortedDays[i]);
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
        imageUrl: churches.imageUrl,
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
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        bio: users.bio,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
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

    return friendsList;
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
}

export const storage = new DatabaseStorage();
