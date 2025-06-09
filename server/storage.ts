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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  }> {
    // Get attendance count (events RSVP'd)
    const [attendanceResult] = await db
      .select({ count: count() })
      .from(eventRsvps)
      .where(and(
        eq(eventRsvps.userId, userId),
        eq(eventRsvps.status, 'attending')
      ));

    // Get prayer requests count
    const [prayerResult] = await db
      .select({ count: count() })
      .from(prayerRequests)
      .where(eq(prayerRequests.authorId, userId));

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

    return {
      attendanceCount: attendanceResult.count,
      prayerCount: prayerResult.count,
      connectionCount: connectionResult.count,
      discussionCount: discussionResult.count,
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
}

export const storage = new DatabaseStorage();
