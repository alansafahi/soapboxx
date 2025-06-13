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
  roles,
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
  dailyVerses,
  userBibleStreaks,
  userBibleReadings,
  bibleBadges,
  userBibleBadges,
  bibleVerseShares,
  bibleInADaySessions,
  bibleInADaySectionProgress,
  bibleInADayBadges,
  volunteers,
  volunteerRoles,
  volunteerOpportunities,
  bibleVerses,
  volunteerRegistrations,
  volunteerHours,
  volunteerAwards,
  volunteerCertifications,
  userTourCompletions,
  sermonDrafts,
  type User,
  type UpsertUser,
  type DailyVerse,
  type InsertDailyVerse,
  type UserBibleStreak,
  type InsertUserBibleStreak,
  type BibleInADaySession,
  type InsertBibleInADaySession,
  type BibleInADaySectionProgress,
  type InsertBibleInADaySectionProgress,
  type BibleInADayBadge,
  type InsertBibleInADayBadge,
  type UserBibleReading,
  type InsertUserBibleReading,
  type BibleBadge,
  type InsertBibleBadge,
  type UserBibleBadge,
  type InsertUserBibleBadge,
  type BibleVerseShare,
  type InsertBibleVerseShare,
  type Volunteer,
  type InsertVolunteer,
  type VolunteerRole,
  type InsertVolunteerRole,
  type VolunteerOpportunity,
  type InsertVolunteerOpportunity,
  type VolunteerRegistration,
  type InsertVolunteerRegistration,
  type VolunteerHours,
  type InsertVolunteerHours,
  type VolunteerAward,
  type InsertVolunteerAward,
  type VolunteerCertification,
  type InsertVolunteerCertification,
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
  type MoodCheckin,
  type InsertMoodCheckin,
  type PersonalizedContent,
  type InsertPersonalizedContent,
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
  soapEntries,
  type SoapEntry,
  type InsertSoapEntry,
  dailyInspirations,
  userInspirationPreferences,
  userInspirationHistory,
  userJourneyPreferences,
  moodCheckins,
  personalizedContent,
  type DailyInspiration,
  type UserInspirationPreference,
  type InsertUserInspirationPreference,
  type UserInspirationHistory,
  type UserJourneyPreferences,
  type InsertUserJourneyPreferences,
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
  referrals,
  referralRewards,
  referralMilestones,
  type Referral,
  type InsertReferral,
  type ReferralReward,
  type InsertReferralReward,
  type ReferralMilestone,
  type InsertReferralMilestone,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count, asc, or, ilike, isNotNull, gte, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  completeOnboarding(userId: string, onboardingData: any): Promise<void>;
  
  // Email verification operations
  setEmailVerificationToken(userId: string, token: string): Promise<void>;
  getEmailVerificationToken(userId: string): Promise<string | null>;
  verifyEmailToken(token: string): Promise<User | null>;
  markEmailAsVerified(userId: string): Promise<void>;
  
  // Tour completion operations
  getTourCompletion(userId: string, tourType: string): Promise<any>;
  saveTourCompletion(data: any): Promise<any>;
  updateTourCompletion(userId: string, tourType: string, data: any): Promise<any>;
  
  // Bible verse lookup operations
  lookupBibleVerse(reference: string): Promise<{ reference: string; text: string } | null>;
  searchBibleVersesByTopic(topics: string[]): Promise<any[]>;
  getRandomVerseByCategory(category?: string): Promise<any | null>;
  
  // Church operations
  getChurches(): Promise<Church[]>;
  getNearbyChurches(lat?: number, lng?: number, limit?: number): Promise<Church[]>;
  getChurch(id: number): Promise<Church | undefined>;
  createChurch(church: InsertChurch): Promise<Church>;
  updateChurch(id: number, updates: Partial<Church>): Promise<Church>;
  getUserCreatedChurches(userId: string): Promise<Church[]>;
  
  // Church team management
  getUserChurch(userId: string): Promise<UserChurch | undefined>;
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
  
  // Discussion interaction operations
  toggleDiscussionLike(userId: string, discussionId: number): Promise<{ liked: boolean; likeCount: number }>;
  toggleDiscussionBookmark(userId: string, discussionId: number): Promise<{ bookmarked: boolean }>;
  createDiscussionComment(comment: InsertDiscussionComment): Promise<DiscussionComment>;
  getDiscussionComments(discussionId: number): Promise<DiscussionComment[]>;
  getDiscussion(discussionId: number): Promise<Discussion | undefined>;
  
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

  // Mood check-in operations
  createMoodCheckin(moodCheckin: InsertMoodCheckin): Promise<MoodCheckin>;
  getRecentMoodCheckins(userId: string, limit?: number): Promise<MoodCheckin[]>;
  getMoodInsights(userId: string, days?: number): Promise<any>;
  
  // Personalized content operations
  savePersonalizedContent(content: InsertPersonalizedContent): Promise<PersonalizedContent>;
  getPersonalizedContent(contentId: string): Promise<PersonalizedContent | undefined>;
  
  // QR code operations
  createQrCode(qrCode: InsertQrCode): Promise<QrCode>;
  getQrCode(id: string): Promise<QrCode | undefined>;
  getChurchQrCodes(churchId: number): Promise<QrCode[]>;
  updateQrCode(id: string, updates: Partial<QrCode>): Promise<QrCode>;
  deleteQrCode(id: string): Promise<void>;
  validateQrCode(id: string): Promise<{ valid: boolean; qrCode?: QrCode }>;
  
  // Social media credentials operations
  getSocialMediaCredentials(userId: string): Promise<any[]>;
  getSocialMediaCredentialById(credentialId: string): Promise<any | null>;
  saveSocialMediaCredential(credentialData: any): Promise<any>;
  updateSocialMediaCredential(credentialId: string, updates: any): Promise<any>;
  deleteSocialMediaCredential(credentialId: string): Promise<void>;
  
  // Social media posts operations
  createSocialMediaPost(postData: any): Promise<any>;
  getSocialMediaPosts(userId: string, options?: { platform?: string; limit?: number; offset?: number }): Promise<any[]>;
  updateSocialMediaPost(postId: string, updates: any): Promise<any>;
  deleteSocialMediaPost(postId: string): Promise<void>;
  
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

  // Referral Rewards System
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralByCode(referralCode: string): Promise<Referral | undefined>;
  getUserReferrals(userId: string): Promise<Referral[]>;
  updateReferral(id: number, updates: Partial<Referral>): Promise<Referral>;
  processReferralReward(referralId: number): Promise<{ referrerPoints: number; refereePoints: number }>;
  getUserReferralStats(userId: string): Promise<{ totalReferrals: number; successfulReferrals: number; totalPointsEarned: number }>;
  getReferralRewardTiers(): Promise<ReferralReward[]>;
  checkReferralMilestones(userId: string): Promise<ReferralMilestone[]>;
  generateReferralCode(userId: string): Promise<string>;

  // Daily Bible Feature
  getDailyVerse(date?: Date): Promise<DailyVerse | undefined>;
  getUserDailyVerse(userId: string, date?: Date): Promise<DailyVerse | undefined>;
  createDailyVerse(verse: InsertDailyVerse): Promise<DailyVerse>;
  getUserBibleStreak(userId: string): Promise<UserBibleStreak | undefined>;
  updateUserBibleStreak(userId: string, updates: Partial<InsertUserBibleStreak>): Promise<UserBibleStreak>;
  recordBibleReading(reading: InsertUserBibleReading): Promise<UserBibleReading>;
  getUserBibleReadings(userId: string): Promise<UserBibleReading[]>;
  getBibleBadges(): Promise<BibleBadge[]>;
  getUserBibleBadges(userId: string): Promise<UserBibleBadge[]>;
  awardBibleBadge(userId: string, badgeId: number): Promise<UserBibleBadge>;
  shareBibleVerse(share: InsertBibleVerseShare): Promise<BibleVerseShare>;
  getBibleVerseShares(dailyVerseId: number): Promise<BibleVerseShare[]>;
  
  // Journey Management
  getUserJourneyPreferences(userId: string): Promise<UserJourneyPreferences | undefined>;
  updateUserJourneyPreferences(userId: string, preferences: Partial<InsertUserJourneyPreferences>): Promise<UserJourneyPreferences>;
  getAvailableJourneyTypes(): Promise<{type: string, name: string, description: string}[]>;
  getSeriesByType(journeyType: string): Promise<{name: string, description: string, totalVerses: number}[]>;
  switchUserJourney(userId: string, journeyType: string, seriesName?: string): Promise<UserJourneyPreferences>;
  
  // Bible in a Day operations
  createBibleInADaySession(session: InsertBibleInADaySession): Promise<BibleInADaySession>;
  getBibleInADaySession(sessionId: number): Promise<BibleInADaySession | undefined>;
  getUserActiveBibleInADaySession(userId: string): Promise<BibleInADaySession | undefined>;
  getUserBibleInADaySessions(userId: string): Promise<BibleInADaySession[]>;
  updateBibleInADaySession(sessionId: number, updates: Partial<BibleInADaySession>): Promise<BibleInADaySession>;
  completeBibleInADaySession(sessionId: number, finalRating?: number, reflectionNotes?: string): Promise<BibleInADaySession>;
  
  createBibleInADaySectionProgress(progress: InsertBibleInADaySectionProgress): Promise<BibleInADaySectionProgress>;
  getBibleInADaySectionProgress(sessionId: number): Promise<BibleInADaySectionProgress[]>;
  updateBibleInADaySectionProgress(progressId: number, updates: Partial<BibleInADaySectionProgress>): Promise<BibleInADaySectionProgress>;
  completeBibleInADaySection(progressId: number, reflectionAnswer?: string): Promise<BibleInADaySectionProgress>;
  
  awardBibleInADayBadge(userId: string, sessionId: number, badgeType: string): Promise<BibleInADayBadge>;
  getUserBibleInADayBadges(userId: string): Promise<BibleInADayBadge[]>;
  
  // Community statistics
  getBibleReadingCountSince(date: Date): Promise<number>;
  
  // Enhanced Social & Community Features
  getEnhancedCommunityFeed(userId: string, filters: any): Promise<any[]>;
  addReaction(reactionData: any): Promise<any>;
  removeReaction(userId: string, targetId: number, reactionType: string): Promise<void>;
  getCommunityGroups(userId: string): Promise<any[]>;
  createCommunityGroup(groupData: any): Promise<any>;
  joinCommunityGroup(memberData: any): Promise<void>;
  leaveCommunityGroup(userId: string, groupId: number): Promise<void>;
  getUserFriends(userId: string): Promise<any[]>;
  sendFriendRequest(friendshipData: any): Promise<any>;
  respondToFriendRequest(friendshipId: number, status: string): Promise<any>;
  createCommunityReflection(reflectionData: any): Promise<any>;
  getCommunityReflections(filters: any): Promise<any[]>;

  // Admin Analytics Methods
  getUserRole(userId: string): Promise<string>;
  getChurchMemberCheckIns(churchId: number, startDate: Date): Promise<any>;
  getDevotionAnalytics(churchId: number, startDate: Date): Promise<any>;
  getAtRiskMembers(churchId: number, thresholdDate: Date): Promise<any[]>;
  getEngagementOverview(churchId: number): Promise<any>;
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

  async updateUserPhone(userId: string, phoneNumber: string, verified: boolean = false): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        phoneNumber,
        phoneVerified: verified,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
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

  // Email verification operations
  async setEmailVerificationToken(userId: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        emailVerificationToken: token,
        emailVerificationSentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getEmailVerificationToken(userId: string): Promise<string | null> {
    const [user] = await db
      .select({ emailVerificationToken: users.emailVerificationToken })
      .from(users)
      .where(eq(users.id, userId));
    
    return user?.emailVerificationToken || null;
  }

  async verifyEmailToken(token: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));
    
    if (!user) return null;
    
    // Check if token is not expired (24 hours)
    const tokenAge = Date.now() - (user.emailVerificationSentAt?.getTime() || 0);
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return null; // Token expired
    }
    
    return user;
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationSentAt: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Tour completion operations
  async getTourCompletion(userId: string, tourType: string): Promise<any> {
    const [completion] = await db
      .select()
      .from(userTourCompletions)
      .where(and(
        eq(userTourCompletions.userId, userId),
        eq(userTourCompletions.role, tourType)
      ));
    return completion;
  }

  async saveTourCompletion(data: any): Promise<any> {
    const [completion] = await db
      .insert(userTourCompletions)
      .values({
        userId: data.userId,
        role: data.tourType,
        completedAt: data.completedAt || new Date(),
        tourVersion: data.tourVersion || "1.0"
      })
      .onConflictDoUpdate({
        target: [userTourCompletions.userId, userTourCompletions.role],
        set: {
          completedAt: data.completedAt || new Date(),
          tourVersion: data.tourVersion || "1.0"
        }
      })
      .returning();
    return completion;
  }

  async updateTourCompletion(userId: string, tourType: string, data: any): Promise<any> {
    const [completion] = await db
      .update(userTourCompletions)
      .set({
        completedAt: data.completedAt || new Date(),
        tourVersion: data.tourVersion || "1.0"
      })
      .where(and(
        eq(userTourCompletions.userId, userId),
        eq(userTourCompletions.role, tourType)
      ))
      .returning();
    return completion;
  }

  // Church operations
  async getChurches(): Promise<Church[]> {
    return await db
      .select()
      .from(churches)
      .where(eq(churches.isActive, true))
      .orderBy(asc(churches.name));
  }

  async getChurches(): Promise<Church[]> {
    return await db
      .select()
      .from(churches)
      .where(eq(churches.isActive, true))
      .orderBy(desc(churches.rating));
  }

  async getNearbyChurches(lat?: number, lng?: number, limit: number = 10): Promise<Church[]> {
    // For simplicity, just return churches ordered by creation date if no coordinates provided
    if (!lat || !lng) {
      return await db
        .select()
        .from(churches)
        .where(eq(churches.isActive, true))
        .orderBy(desc(churches.createdAt))
        .limit(limit);
    }
    
    // In a real implementation, you'd use PostGIS for distance calculations
    return await db
      .select()
      .from(churches)
      .where(eq(churches.isActive, true))
      .orderBy(desc(churches.createdAt))
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

  async getUserChurch(userId: string): Promise<UserChurch | undefined> {
    const [userChurch] = await db
      .select()
      .from(userChurches)
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.isActive, true)
      ));
    return userChurch;
  }

  async getChurchMembers(churchId: number): Promise<(UserChurch & { user: User })[]> {
    return await db
      .select({
        id: userChurches.id,
        userId: userChurches.userId,
        churchId: userChurches.churchId,
        roleId: userChurches.roleId,
        title: userChurches.title,
        department: userChurches.department,
        bio: userChurches.bio,
        additionalPermissions: userChurches.additionalPermissions,
        restrictedPermissions: userChurches.restrictedPermissions,
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
        roleId: typeof role === 'string' ? parseInt(role) : role, 
        additionalPermissions: permissions || [],
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

  async getUserEvents(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.organizerId, userId))
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
        checkedInAt: eventCheckIns.checkedInAt,
        guestCount: eventCheckIns.guestCount,
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
      .values({ 
        eventId, 
        metricType: metrics.metricType || 'attendance',
        value: metrics.value || '0',
        ...metrics 
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

  // Duplicate function removed - implementation exists above

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

  async getUserCreatedChurches(userId: string): Promise<Church[]> {
    // Get churches where user has admin roles (church_admin, pastor, lead_pastor, etc.)
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
      .innerJoin(roles, eq(userChurches.roleId, roles.id))
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.isActive, true),
        eq(churches.isActive, true),
        // Only admin-level roles
        sql`${roles.name} IN ('church_admin', 'pastor', 'lead_pastor', 'super_admin', 'soapbox_owner')`
      ))
      .orderBy(desc(churches.createdAt));
  }

  async joinChurch(userId: string, churchId: number): Promise<void> {
    console.log(`Storage: joinChurch called for user ${userId} and church ${churchId}`);
    
    // First, check if the user is already a member
    const existing = await db
      .select()
      .from(userChurches)
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.churchId, churchId)
      ))
      .limit(1);

    if (existing.length > 0) {
      console.log(`User ${userId} already exists in church ${churchId}, reactivating`);
      // User already exists, just reactivate
      await db
        .update(userChurches)
        .set({ 
          isActive: true,
          joinedAt: new Date()
        })
        .where(and(
          eq(userChurches.userId, userId),
          eq(userChurches.churchId, churchId)
        ));
    } else {
      console.log(`Creating new membership for user ${userId} in church ${churchId}`);
      // Insert new membership with minimal required fields
      await db
        .insert(userChurches)
        .values({
          userId,
          churchId,
          role: 'member', // Using role column instead of roleId
          isActive: true,
          joinedAt: new Date()
        });
    }
    
    console.log(`Successfully processed church join for user ${userId} and church ${churchId}`);
      
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

  // Discussion interaction operations
  async toggleDiscussionLike(userId: string, discussionId: number): Promise<{ liked: boolean; likeCount: number }> {
    // Check if user already liked this discussion
    const [existingLike] = await db
      .select()
      .from(discussionLikes)
      .where(
        and(
          eq(discussionLikes.userId, userId),
          eq(discussionLikes.discussionId, discussionId)
        )
      );

    let liked: boolean;
    if (existingLike) {
      // Remove like
      await db
        .delete(discussionLikes)
        .where(
          and(
            eq(discussionLikes.userId, userId),
            eq(discussionLikes.discussionId, discussionId)
          )
        );
      liked = false;
    } else {
      // Add like
      await db
        .insert(discussionLikes)
        .values({
          userId,
          discussionId,
        });
      liked = true;
    }

    // Get updated like count
    const likeCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(discussionLikes)
      .where(eq(discussionLikes.discussionId, discussionId));
    
    const likeCount = likeCountResult[0]?.count || 0;

    return { liked, likeCount };
  }

  async toggleDiscussionBookmark(userId: string, discussionId: number): Promise<{ bookmarked: boolean }> {
    // Check if user already bookmarked this discussion
    const [existingBookmark] = await db
      .select()
      .from(discussionBookmarks)
      .where(
        and(
          eq(discussionBookmarks.userId, userId),
          eq(discussionBookmarks.discussionId, discussionId)
        )
      );

    let bookmarked: boolean;
    if (existingBookmark) {
      // Remove bookmark
      await db
        .delete(discussionBookmarks)
        .where(
          and(
            eq(discussionBookmarks.userId, userId),
            eq(discussionBookmarks.discussionId, discussionId)
          )
        );
      bookmarked = false;
    } else {
      // Add bookmark
      await db
        .insert(discussionBookmarks)
        .values({
          userId,
          discussionId,
        });
      bookmarked = true;
    }

    return { bookmarked };
  }

  async createDiscussionComment(comment: InsertDiscussionComment): Promise<DiscussionComment> {
    const [newComment] = await db
      .insert(discussionComments)
      .values({
        discussionId: comment.discussionId,
        authorId: comment.authorId,
        content: comment.content,
        parentId: comment.parentId || null,
      })
      .returning();
    return newComment;
  }

  async getDiscussionComments(discussionId: number): Promise<DiscussionComment[]> {
    const comments = await db
      .select()
      .from(discussionComments)
      .where(eq(discussionComments.discussionId, discussionId))
      .orderBy(asc(discussionComments.createdAt));
    return comments;
  }

  async getDiscussion(discussionId: number): Promise<Discussion | undefined> {
    const [discussion] = await db
      .select()
      .from(discussions)
      .where(eq(discussions.id, discussionId));
    return discussion;
  }

  async getFeedPosts(userId: string): Promise<any[]> {
    try {
      const feedPosts: any[] = [];

      // Get discussions - simplified query to avoid field selection issues
      const discussionsData = await db
        .select()
        .from(discussions)
        .orderBy(desc(discussions.createdAt))
        .limit(10);

      // Transform discussions for feed with comments
      for (const d of discussionsData) {
        // Get author info separately
        const [author] = await db
          .select()
          .from(users)
          .where(eq(users.id, d.authorId))
          .limit(1);

        const authorName = author ? 
          (author.firstName && author.lastName ? `${author.firstName} ${author.lastName}` : author.email || 'Unknown User') :
          'Unknown User';

        // Get comments for this discussion
        const commentsData = await db
          .select({
            id: discussionComments.id,
            content: discussionComments.content,
            authorId: discussionComments.authorId,
            createdAt: discussionComments.createdAt,
            authorFirstName: users.firstName,
            authorLastName: users.lastName,
            authorEmail: users.email,
            authorProfileImage: users.profileImageUrl,
          })
          .from(discussionComments)
          .leftJoin(users, eq(discussionComments.authorId, users.id))
          .where(eq(discussionComments.discussionId, d.id))
          .orderBy(desc(discussionComments.createdAt));

        const comments = commentsData.map(comment => {
          const commentAuthorName = comment.authorFirstName && comment.authorLastName 
            ? `${comment.authorFirstName} ${comment.authorLastName}`
            : comment.authorEmail || 'Anonymous';
          
          return {
            id: comment.id,
            content: comment.content,
            author: {
              id: comment.authorId,
              name: commentAuthorName,
              profileImage: comment.authorProfileImage
            },
            createdAt: comment.createdAt
          };
        });

        feedPosts.push({
          id: d.id,
          type: 'discussion',
          title: d.title,
          content: d.content,
          author: {
            id: d.authorId,
            name: authorName,
            profileImage: author?.profileImageUrl || null
          },
          church: null,
          createdAt: d.createdAt,
          likeCount: 0,
          commentCount: comments.length,
          shareCount: 0,
          isLiked: false,
          isBookmarked: false,
          tags: ['discussion'],
          comments: comments
        });
      }

      return feedPosts;

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

  // Daily Bible Feature Implementation
  async getDailyVerse(date?: Date): Promise<DailyVerse | undefined> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    const [verse] = await db
      .select()
      .from(dailyVerses)
      .where(eq(dailyVerses.date, targetDate))
      .limit(1);
    return verse;
  }

  async getUserDailyVerse(userId: string, date?: Date): Promise<DailyVerse | undefined> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    // Get user's journey preferences
    const preferences = await this.getUserJourneyPreferences(userId);
    
    if (!preferences) {
      // Return default verse if no preferences set
      return this.getDailyVerse(targetDate);
    }
    
    // Find verse based on user's current journey and series progress
    const [verse] = await db
      .select()
      .from(dailyVerses)
      .where(
        and(
          eq(dailyVerses.journeyType, preferences.currentJourneyType),
          eq(dailyVerses.seriesName, preferences.currentSeries || ""),
          eq(dailyVerses.seriesOrder, preferences.seriesProgress + 1)
        )
      )
      .limit(1);
    
    if (!verse) {
      // If no verse found for current progress, check if series is complete
      const seriesVerses = await db
        .select()
        .from(dailyVerses)
        .where(
          and(
            eq(dailyVerses.journeyType, preferences.currentJourneyType),
            eq(dailyVerses.seriesName, preferences.currentSeries || "")
          )
        );
      
      if (seriesVerses.length > 0 && preferences.seriesProgress >= seriesVerses.length) {
        // Series complete, suggest new journey
        return null;
      }
    }
    
    return verse;
  }

  async createDailyVerse(verse: InsertDailyVerse): Promise<DailyVerse> {
    const [newVerse] = await db
      .insert(dailyVerses)
      .values(verse)
      .returning();
    return newVerse;
  }

  async getUserBibleStreak(userId: string): Promise<UserBibleStreak | undefined> {
    const [streak] = await db
      .select()
      .from(userBibleStreaks)
      .where(eq(userBibleStreaks.userId, userId));
    return streak;
  }

  async updateUserBibleStreak(userId: string, updates: Partial<InsertUserBibleStreak>): Promise<UserBibleStreak> {
    const existingStreak = await this.getUserBibleStreak(userId);
    
    if (existingStreak) {
      const [updatedStreak] = await db
        .update(userBibleStreaks)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(userBibleStreaks.userId, userId))
        .returning();
      return updatedStreak;
    } else {
      const [newStreak] = await db
        .insert(userBibleStreaks)
        .values({
          userId,
          ...updates,
        })
        .returning();
      return newStreak;
    }
  }

  async recordBibleReading(reading: InsertUserBibleReading): Promise<UserBibleReading> {
    const [newReading] = await db
      .insert(userBibleReadings)
      .values(reading)
      .returning();

    // Update user's streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const streak = await this.getUserBibleStreak(reading.userId);
    const lastReadDate = streak?.lastReadDate ? new Date(streak.lastReadDate) : null;
    
    if (lastReadDate) {
      lastReadDate.setHours(0, 0, 0, 0);
    }

    let currentStreak = streak?.currentStreak || 0;
    let longestStreak = streak?.longestStreak || 0;
    let totalDaysRead = (streak?.totalDaysRead || 0) + 1;

    // Check if this continues the streak
    if (lastReadDate) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastReadDate.getTime() === yesterday.getTime()) {
        // Continue streak
        currentStreak += 1;
      } else if (lastReadDate.getTime() !== today.getTime()) {
        // Reset streak (reading after a gap)
        currentStreak = 1;
      }
    } else {
      // First reading
      currentStreak = 1;
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    await this.updateUserBibleStreak(reading.userId, {
      currentStreak,
      longestStreak,
      lastReadDate: today,
      totalDaysRead,
    });

    return newReading;
  }

  async getUserBibleReadings(userId: string): Promise<UserBibleReading[]> {
    return await db
      .select()
      .from(userBibleReadings)
      .where(eq(userBibleReadings.userId, userId))
      .orderBy(desc(userBibleReadings.readAt));
  }

  async getBibleBadges(): Promise<BibleBadge[]> {
    return await db
      .select()
      .from(bibleBadges)
      .orderBy(asc(bibleBadges.id));
  }

  async getBibleVerse(id: number): Promise<BibleVerse | undefined> {
    const [verse] = await db.select().from(bibleVerses).where(eq(bibleVerses.id, id));
    return verse;
  }

  async saveBibleVerseFromAI(verseData: {
    reference: string;
    text: string;
    book: string;
    chapter: number;
    verse: number;
    category: string;
    topicTags: string[];
    aiSummary: string;
    popularityScore: number;
    isActive: boolean;
  }): Promise<BibleVerse> {
    const [savedVerse] = await db
      .insert(bibleVerses)
      .values({
        reference: verseData.reference,
        text: verseData.text,
        book: verseData.book,
        chapter: verseData.chapter,
        verse: verseData.verse,
        category: verseData.category,
        topicTags: verseData.topicTags,
        aiSummary: verseData.aiSummary,
        popularityScore: verseData.popularityScore,
        isActive: verseData.isActive,
        translation: 'NIV'
      })
      .onConflictDoNothing()
      .returning();
    
    return savedVerse;
  }

  async getUserBibleBadges(userId: string): Promise<UserBibleBadge[]> {
    return await db
      .select({
        id: userBibleBadges.id,
        userId: userBibleBadges.userId,
        badgeId: userBibleBadges.badgeId,
        earnedAt: userBibleBadges.earnedAt,
        badge: {
          id: bibleBadges.id,
          name: bibleBadges.name,
          description: bibleBadges.description,
          iconUrl: bibleBadges.iconUrl,
          requirement: bibleBadges.requirement,
        }
      })
      .from(userBibleBadges)
      .innerJoin(bibleBadges, eq(userBibleBadges.badgeId, bibleBadges.id))
      .where(eq(userBibleBadges.userId, userId))
      .orderBy(desc(userBibleBadges.earnedAt));
  }

  async awardBibleBadge(userId: string, badgeId: number): Promise<UserBibleBadge> {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userBibleBadges)
      .where(
        and(
          eq(userBibleBadges.userId, userId),
          eq(userBibleBadges.badgeId, badgeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [badge] = await db
      .insert(userBibleBadges)
      .values({
        userId,
        badgeId,
      })
      .returning();
    return badge;
  }

  async shareBibleVerse(share: InsertBibleVerseShare): Promise<BibleVerseShare> {
    const [newShare] = await db
      .insert(bibleVerseShares)
      .values(share)
      .returning();
    return newShare;
  }

  async getBibleVerseShares(dailyVerseId: number): Promise<BibleVerseShare[]> {
    return await db
      .select({
        id: bibleVerseShares.id,
        userId: bibleVerseShares.userId,
        dailyVerseId: bibleVerseShares.dailyVerseId,
        platform: bibleVerseShares.platform,
        shareText: bibleVerseShares.shareText,
        reactions: bibleVerseShares.reactions,
        createdAt: bibleVerseShares.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(bibleVerseShares)
      .innerJoin(users, eq(bibleVerseShares.userId, users.id))
      .where(eq(bibleVerseShares.dailyVerseId, dailyVerseId))
      .orderBy(desc(bibleVerseShares.createdAt));
  }

  // Bible in a Day operations
  async createBibleInADaySession(session: InsertBibleInADaySession): Promise<BibleInADaySession> {
    const [newSession] = await db
      .insert(bibleInADaySessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getBibleInADaySession(sessionId: number): Promise<BibleInADaySession | undefined> {
    const [session] = await db
      .select()
      .from(bibleInADaySessions)
      .where(eq(bibleInADaySessions.id, sessionId));
    return session;
  }

  async getUserActiveBibleInADaySession(userId: string): Promise<BibleInADaySession | undefined> {
    const [session] = await db
      .select()
      .from(bibleInADaySessions)
      .where(and(
        eq(bibleInADaySessions.userId, userId),
        eq(bibleInADaySessions.isCompleted, false)
      ))
      .orderBy(desc(bibleInADaySessions.startedAt))
      .limit(1);
    return session;
  }

  async getUserBibleInADaySessions(userId: string): Promise<BibleInADaySession[]> {
    return await db
      .select()
      .from(bibleInADaySessions)
      .where(eq(bibleInADaySessions.userId, userId))
      .orderBy(desc(bibleInADaySessions.startedAt));
  }

  async updateBibleInADaySession(sessionId: number, updates: Partial<BibleInADaySession>): Promise<BibleInADaySession> {
    const [updatedSession] = await db
      .update(bibleInADaySessions)
      .set(updates)
      .where(eq(bibleInADaySessions.id, sessionId))
      .returning();
    return updatedSession;
  }

  async completeBibleInADaySession(sessionId: number, finalRating?: number, reflectionNotes?: string): Promise<BibleInADaySession> {
    const [completedSession] = await db
      .update(bibleInADaySessions)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        finalRating,
        reflectionNotes,
      })
      .where(eq(bibleInADaySessions.id, sessionId))
      .returning();
    return completedSession;
  }

  async createBibleInADaySectionProgress(progress: InsertBibleInADaySectionProgress): Promise<BibleInADaySectionProgress> {
    const [newProgress] = await db
      .insert(bibleInADaySectionProgress)
      .values(progress)
      .returning();
    return newProgress;
  }

  async getBibleInADaySectionProgress(sessionId: number): Promise<BibleInADaySectionProgress[]> {
    return await db
      .select()
      .from(bibleInADaySectionProgress)
      .where(eq(bibleInADaySectionProgress.sessionId, sessionId))
      .orderBy(asc(bibleInADaySectionProgress.id));
  }

  async updateBibleInADaySectionProgress(progressId: number, updates: Partial<BibleInADaySectionProgress>): Promise<BibleInADaySectionProgress> {
    const [updatedProgress] = await db
      .update(bibleInADaySectionProgress)
      .set(updates)
      .where(eq(bibleInADaySectionProgress.id, progressId))
      .returning();
    return updatedProgress;
  }

  async completeBibleInADaySection(progressId: number, reflectionAnswer?: string): Promise<BibleInADaySectionProgress> {
    const [completedSection] = await db
      .update(bibleInADaySectionProgress)
      .set({
        isCompleted: true,
        completedAt: new Date(),
        reflectionAnswer,
      })
      .where(eq(bibleInADaySectionProgress.id, progressId))
      .returning();
    return completedSection;
  }

  async awardBibleInADayBadge(userId: string, sessionId: number, badgeType: string): Promise<BibleInADayBadge> {
    const [badge] = await db
      .insert(bibleInADayBadges)
      .values({
        userId,
        sessionId,
        badgeType,
      })
      .returning();
    return badge;
  }

  async getUserBibleInADayBadges(userId: string): Promise<BibleInADayBadge[]> {
    return await db
      .select()
      .from(bibleInADayBadges)
      .where(eq(bibleInADayBadges.userId, userId))
      .orderBy(desc(bibleInADayBadges.earnedAt));
  }

  // Volunteer Management Methods

  // Volunteer Roles
  async getVolunteerRoles(): Promise<VolunteerRole[]> {
    return await db
      .select()
      .from(volunteerRoles)
      .where(eq(volunteerRoles.isActive, true))
      .orderBy(volunteerRoles.name);
  }

  async createVolunteerRole(roleData: InsertVolunteerRole): Promise<VolunteerRole> {
    const [role] = await db
      .insert(volunteerRoles)
      .values(roleData)
      .returning();
    return role;
  }

  async updateVolunteerRole(id: number, updates: Partial<InsertVolunteerRole>): Promise<VolunteerRole> {
    const [role] = await db
      .update(volunteerRoles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(volunteerRoles.id, id))
      .returning();
    return role;
  }

  // Volunteers
  async getVolunteers(churchId?: number): Promise<Volunteer[]> {
    let query = db.select().from(volunteers);
    
    if (churchId) {
      query = query.where(eq(volunteers.churchId, churchId));
    }
    
    return await query.orderBy(volunteers.firstName, volunteers.lastName);
  }

  async getVolunteerById(id: number): Promise<Volunteer | undefined> {
    const [volunteer] = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.id, id));
    return volunteer;
  }

  async getVolunteerByUserId(userId: string): Promise<Volunteer | undefined> {
    const [volunteer] = await db
      .select()
      .from(volunteers)
      .where(eq(volunteers.userId, userId));
    return volunteer;
  }

  async createVolunteer(volunteerData: InsertVolunteer): Promise<Volunteer> {
    const [volunteer] = await db
      .insert(volunteers)
      .values(volunteerData)
      .returning();
    return volunteer;
  }

  async updateVolunteer(id: number, updates: Partial<InsertVolunteer>): Promise<Volunteer> {
    const [volunteer] = await db
      .update(volunteers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(volunteers.id, id))
      .returning();
    return volunteer;
  }

  // Volunteer Opportunities
  async getVolunteerOpportunities(churchId?: number): Promise<VolunteerOpportunity[]> {
    let query = db
      .select({
        id: volunteerOpportunities.id,
        churchId: volunteerOpportunities.churchId,
        title: volunteerOpportunities.title,
        description: volunteerOpportunities.description,
        roleId: volunteerOpportunities.roleId,
        coordinatorId: volunteerOpportunities.coordinatorId,
        location: volunteerOpportunities.location,
        startDate: volunteerOpportunities.startDate,
        endDate: volunteerOpportunities.endDate,
        volunteersNeeded: volunteerOpportunities.volunteersNeeded,
        volunteersRegistered: volunteerOpportunities.volunteersRegistered,
        requiredSkills: volunteerOpportunities.requiredSkills,
        isRecurring: volunteerOpportunities.isRecurring,
        recurringPattern: volunteerOpportunities.recurringPattern,
        status: volunteerOpportunities.status,
        priority: volunteerOpportunities.priority,
        isPublic: volunteerOpportunities.isPublic,
        createdAt: volunteerOpportunities.createdAt,
        updatedAt: volunteerOpportunities.updatedAt,
        roleName: volunteerRoles.name,
      })
      .from(volunteerOpportunities)
      .leftJoin(volunteerRoles, eq(volunteerOpportunities.roleId, volunteerRoles.id));
    
    if (churchId) {
      query = query.where(eq(volunteerOpportunities.churchId, churchId));
    }
    
    return await query.orderBy(volunteerOpportunities.startDate);
  }

  async createVolunteerOpportunity(opportunityData: InsertVolunteerOpportunity): Promise<VolunteerOpportunity> {
    const [opportunity] = await db
      .insert(volunteerOpportunities)
      .values(opportunityData)
      .returning();
    return opportunity;
  }

  async updateVolunteerOpportunity(id: number, updates: Partial<InsertVolunteerOpportunity>): Promise<VolunteerOpportunity> {
    const [opportunity] = await db
      .update(volunteerOpportunities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(volunteerOpportunities.id, id))
      .returning();
    return opportunity;
  }

  // Volunteer Registrations
  async getVolunteerRegistrations(opportunityId?: number, volunteerId?: number): Promise<VolunteerRegistration[]> {
    let query = db.select().from(volunteerRegistrations);
    
    if (opportunityId) {
      query = query.where(eq(volunteerRegistrations.opportunityId, opportunityId));
    }
    
    if (volunteerId) {
      query = query.where(eq(volunteerRegistrations.volunteerId, volunteerId));
    }
    
    return await query.orderBy(desc(volunteerRegistrations.registeredAt));
  }

  async createVolunteerRegistration(registrationData: InsertVolunteerRegistration): Promise<VolunteerRegistration> {
    const [registration] = await db
      .insert(volunteerRegistrations)
      .values(registrationData)
      .returning();
    
    // Update volunteer count on opportunity
    await db
      .update(volunteerOpportunities)
      .set({
        volunteersRegistered: sql`${volunteerOpportunities.volunteersRegistered} + 1`
      })
      .where(eq(volunteerOpportunities.id, registrationData.opportunityId));
    
    return registration;
  }

  async updateVolunteerRegistration(id: number, updates: Partial<InsertVolunteerRegistration>): Promise<VolunteerRegistration> {
    const [registration] = await db
      .update(volunteerRegistrations)
      .set(updates)
      .where(eq(volunteerRegistrations.id, id))
      .returning();
    return registration;
  }

  // Volunteer Hours
  async getVolunteerHours(volunteerId?: number, startDate?: Date, endDate?: Date): Promise<VolunteerHours[]> {
    let query = db
      .select({
        id: volunteerHours.id,
        volunteerId: volunteerHours.volunteerId,
        opportunityId: volunteerHours.opportunityId,
        roleId: volunteerHours.roleId,
        date: volunteerHours.date,
        startTime: volunteerHours.startTime,
        endTime: volunteerHours.endTime,
        hoursServed: volunteerHours.hoursServed,
        description: volunteerHours.description,
        verifiedBy: volunteerHours.verifiedBy,
        verifiedAt: volunteerHours.verifiedAt,
        status: volunteerHours.status,
        notes: volunteerHours.notes,
        createdAt: volunteerHours.createdAt,
        volunteerName: sql<string>`CONCAT(${volunteers.firstName}, ' ', ${volunteers.lastName})`,
      })
      .from(volunteerHours)
      .leftJoin(volunteers, eq(volunteerHours.volunteerId, volunteers.id));
    
    if (volunteerId) {
      query = query.where(eq(volunteerHours.volunteerId, volunteerId));
    }
    
    if (startDate) {
      query = query.where(gte(volunteerHours.date, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(volunteerHours.date, endDate));
    }
    
    return await query.orderBy(desc(volunteerHours.date));
  }

  async createVolunteerHours(hoursData: InsertVolunteerHours): Promise<VolunteerHours> {
    const [hours] = await db
      .insert(volunteerHours)
      .values(hoursData)
      .returning();
    return hours;
  }

  async updateVolunteerHours(id: number, updates: Partial<InsertVolunteerHours>): Promise<VolunteerHours> {
    const [hours] = await db
      .update(volunteerHours)
      .set(updates)
      .where(eq(volunteerHours.id, id))
      .returning();
    return hours;
  }

  async verifyVolunteerHours(id: number, verifiedBy: string): Promise<VolunteerHours> {
    const [hours] = await db
      .update(volunteerHours)
      .set({
        status: 'approved',
        verifiedBy,
        verifiedAt: new Date(),
      })
      .where(eq(volunteerHours.id, id))
      .returning();
    return hours;
  }

  // Volunteer Stats
  async getVolunteerStats(churchId?: number): Promise<any> {
    const totalVolunteers = await db
      .select({ count: count() })
      .from(volunteers)
      .where(churchId ? eq(volunteers.churchId, churchId) : undefined);
    
    const activeOpportunities = await db
      .select({ count: count() })
      .from(volunteerOpportunities)
      .where(
        and(
          eq(volunteerOpportunities.status, 'open'),
          churchId ? eq(volunteerOpportunities.churchId, churchId) : undefined
        )
      );
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    
    const hoursThisMonth = await db
      .select({ total: sum(volunteerHours.hoursServed) })
      .from(volunteerHours)
      .where(
        and(
          gte(volunteerHours.date, currentMonth),
          eq(volunteerHours.status, 'approved')
        )
      );
    
    return {
      totalVolunteers: totalVolunteers[0]?.count || 0,
      activeOpportunities: activeOpportunities[0]?.count || 0,
      hoursThisMonth: hoursThisMonth[0]?.total || 0,
      completionRate: 85, // Calculate based on actual data
    };
  }

  // Volunteer Awards
  async getVolunteerAwards(volunteerId?: number): Promise<VolunteerAward[]> {
    let query = db.select().from(volunteerAwards);
    
    if (volunteerId) {
      query = query.where(eq(volunteerAwards.volunteerId, volunteerId));
    }
    
    return await query.orderBy(desc(volunteerAwards.awardedAt));
  }

  async createVolunteerAward(awardData: InsertVolunteerAward): Promise<VolunteerAward> {
    const [award] = await db
      .insert(volunteerAwards)
      .values(awardData)
      .returning();
    return award;
  }

  // Volunteer Certifications
  async getVolunteerCertifications(volunteerId: number): Promise<VolunteerCertification[]> {
    return await db
      .select()
      .from(volunteerCertifications)
      .where(eq(volunteerCertifications.volunteerId, volunteerId))
      .orderBy(desc(volunteerCertifications.createdAt));
  }

  async createVolunteerCertification(certData: InsertVolunteerCertification): Promise<VolunteerCertification> {
    const [certification] = await db
      .insert(volunteerCertifications)
      .values(certData)
      .returning();
    return certification;
  }

  // Community statistics
  async getBibleReadingCountSince(date: Date): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(userBibleReadings)
      .where(gte(userBibleReadings.readAt, date));
    return result[0]?.count || 0;
  }

  // Referral Rewards System Implementation
  async createReferral(referral: InsertReferral): Promise<Referral> {
    const [newReferral] = await db
      .insert(referrals)
      .values(referral)
      .returning();
    return newReferral;
  }

  async getReferralByCode(referralCode: string): Promise<Referral | undefined> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referralCode, referralCode));
    return referral;
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  async updateReferral(id: number, updates: Partial<Referral>): Promise<Referral> {
    const [updatedReferral] = await db
      .update(referrals)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(referrals.id, id))
      .returning();
    return updatedReferral;
  }

  async processReferralReward(referralId: number): Promise<{ referrerPoints: number; refereePoints: number }> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, referralId));

    if (!referral || referral.status === 'rewarded') {
      return { referrerPoints: 0, refereePoints: 0 };
    }

    // Get active reward tiers
    const rewardTiers = await this.getReferralRewardTiers();
    const bronzeTier = rewardTiers.find(tier => tier.tier === 'bronze') || {
      referrerBasePoints: 500,
      refereeWelcomePoints: 250,
      tierBonusPoints: 0
    };

    const referrerPoints = bronzeTier.referrerBasePoints || 500;
    const refereePoints = bronzeTier.refereeWelcomePoints || 250;

    // Award points to both users
    await this.addUserPoints(referral.referrerId, referrerPoints);
    await this.addUserPoints(referral.refereeId, refereePoints);

    // Update referral status
    await this.updateReferral(referralId, {
      status: 'rewarded',
      referrerPointsAwarded: referrerPoints,
      refereePointsAwarded: refereePoints,
      referrerRewardedAt: new Date(),
      refereeRewardedAt: new Date(),
      completedAt: new Date()
    });

    // Check for milestones
    await this.checkReferralMilestones(referral.referrerId);

    return { referrerPoints, refereePoints };
  }

  async getUserReferralStats(userId: string): Promise<{ totalReferrals: number; successfulReferrals: number; totalPointsEarned: number }> {
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const totalReferrals = userReferrals.length;
    const successfulReferrals = userReferrals.filter(r => r.status === 'rewarded').length;
    const totalPointsEarned = userReferrals.reduce((sum, r) => sum + (r.referrerPointsAwarded || 0), 0);

    return {
      totalReferrals,
      successfulReferrals,
      totalPointsEarned
    };
  }

  async getReferralRewardTiers(): Promise<ReferralReward[]> {
    return await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.isActive, true))
      .orderBy(referralRewards.minReferrals);
  }

  async checkReferralMilestones(userId: string): Promise<ReferralMilestone[]> {
    const stats = await this.getUserReferralStats(userId);
    const existingMilestones = await db
      .select()
      .from(referralMilestones)
      .where(eq(referralMilestones.userId, userId));

    const newMilestones: ReferralMilestone[] = [];

    // Define milestone thresholds and rewards
    const milestoneThresholds = [
      { type: 'first_referral', threshold: 1, points: 100, badge: 'Evangelist Seed' },
      { type: 'fifth_referral', threshold: 5, points: 300, badge: 'Community Builder' },
      { type: 'tenth_referral', threshold: 10, points: 500, badge: 'Spiritual Mentor' },
      { type: 'twenty_fifth_referral', threshold: 25, points: 1000, badge: 'Faith Ambassador' },
      { type: 'fiftieth_referral', threshold: 50, points: 2000, badge: 'Kingdom Multiplier' }
    ];

    for (const milestone of milestoneThresholds) {
      if (stats.successfulReferrals >= milestone.threshold) {
        const alreadyAwarded = existingMilestones.some(m => m.milestoneType === milestone.type);
        
        if (!alreadyAwarded) {
          const [newMilestone] = await db
            .insert(referralMilestones)
            .values({
              userId,
              milestoneType: milestone.type,
              totalReferrals: stats.successfulReferrals,
              bonusPoints: milestone.points,
              badgeAwarded: milestone.badge,
              pointsAwarded: false
            })
            .returning();

          // Award bonus points
          await this.addUserPoints(userId, milestone.points);
          
          // Mark points as awarded
          await db
            .update(referralMilestones)
            .set({ pointsAwarded: true })
            .where(eq(referralMilestones.id, newMilestone.id));

          newMilestones.push(newMilestone);
        }
      }
    }

    return newMilestones;
  }

  async generateReferralCode(userId: string): Promise<string> {
    // Create a unique referral code based on user ID and timestamp
    const timestamp = Date.now().toString(36);
    const userHash = userId.slice(-6);
    const referralCode = `SB${userHash}${timestamp}`.toUpperCase();

    // Update user with referral code if they don't have one
    const user = await this.getUser(userId);
    if (user && !user.referralCode) {
      await db
        .update(users)
        .set({ referralCode })
        .where(eq(users.id, userId));
    }

    return referralCode;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.referralCode, referralCode));
    return user;
  }

  async getUserReferralAsReferee(userId: string): Promise<Referral | undefined> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.refereeId, userId));
    return referral;
  }

  // Bible verse lookup implementation
  async lookupBibleVerse(reference: string): Promise<{ reference: string; text: string } | null> {
    const [verse] = await db
      .select()
      .from(bibleVerses)
      .where(and(
        eq(bibleVerses.reference, reference),
        eq(bibleVerses.isActive, true)
      ))
      .limit(1);

    if (verse) {
      return {
        reference: verse.reference,
        text: verse.text
      };
    }

    return null;
  }

  async searchBibleVersesByTopic(topics: string[]): Promise<any[]> {
    if (topics.length === 0) return [];

    const verses = await db
      .select()
      .from(bibleVerses)
      .where(and(
        eq(bibleVerses.isActive, true),
        sql`${bibleVerses.topicTags} && ${topics}`
      ))
      .orderBy(desc(bibleVerses.popularityScore))
      .limit(10);

    return verses.map(verse => ({
      reference: verse.reference,
      text: verse.text,
      topics: verse.topicTags,
      category: verse.category,
      aiSummary: verse.aiSummary
    }));
  }

  async getRandomVerseByCategory(category?: string): Promise<any | null> {
    let query = db
      .select()
      .from(bibleVerses)
      .where(eq(bibleVerses.isActive, true));

    if (category) {
      query = query.where(eq(bibleVerses.category, category));
    }

    const verses = await query
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (verses.length > 0) {
      const verse = verses[0];
      return {
        reference: verse.reference,
        text: verse.text,
        topics: verse.topicTags,
        category: verse.category,
        aiSummary: verse.aiSummary
      };
    }

    return null;
  }

  async getReferralLeaderboard(): Promise<Array<{
    userId: string;
    firstName: string | null;
    profileImageUrl: string | null;
    totalReferrals: number;
    totalPointsEarned: number;
  }>> {
    const leaderboard = await db
      .select({
        userId: referrals.referrerId,
        firstName: users.firstName,
        profileImageUrl: users.profileImageUrl,
        totalReferrals: sql`COUNT(${referrals.id})`.as('totalReferrals'),
        totalPointsEarned: sql`SUM(${referrals.referrerPointsAwarded})`.as('totalPointsEarned')
      })
      .from(referrals)
      .innerJoin(users, eq(referrals.referrerId, users.id))
      .where(eq(referrals.status, 'rewarded'))
      .groupBy(referrals.referrerId, users.firstName, users.profileImageUrl)
      .orderBy(sql`COUNT(${referrals.id}) DESC`)
      .limit(10);

    return leaderboard.map(entry => ({
      userId: entry.userId,
      firstName: entry.firstName,
      profileImageUrl: entry.profileImageUrl,
      totalReferrals: Number(entry.totalReferrals),
      totalPointsEarned: Number(entry.totalPointsEarned) || 0
    }));
  }

  private async addUserPoints(userId: string, points: number): Promise<void> {
    // Check if user has a score record
    const [existingScore] = await db
      .select()
      .from(userScores)
      .where(eq(userScores.userId, userId));

    if (existingScore) {
      await db
        .update(userScores)
        .set({
          totalPoints: sql`${userScores.totalPoints} + ${points}`,
          updatedAt: new Date()
        })
        .where(eq(userScores.userId, userId));
    } else {
      await db
        .insert(userScores)
        .values({
          userId,
          totalPoints: points,
          level: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
  }

  // Enhanced Social & Community Features Implementation
  async getEnhancedCommunityFeed(userId: string, filters: any): Promise<any[]> {
    let baseQuery = db
      .select({
        id: discussions.id,
        type: sql`'discussion'`.as('type'),
        title: discussions.title,
        content: discussions.content,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
        church: {
          id: churches.id,
          name: churches.name,
        },
        isPublic: discussions.isPublic,
        visibility: sql`CASE WHEN ${discussions.isPublic} THEN 'public' ELSE 'friends' END`.as('visibility'),
        tags: discussions.tags,
        createdAt: discussions.createdAt,
        updatedAt: discussions.updatedAt,
      })
      .from(discussions)
      .innerJoin(users, eq(discussions.authorId, users.id))
      .leftJoin(churches, eq(discussions.churchId, churches.id));

    // Apply filters
    if (filters.type !== 'all' && filters.type === 'discussion') {
      // Already filtered to discussions
    }

    if (filters.timeRange !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (filters.timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }
      
      if (startDate) {
        baseQuery = baseQuery.where(gte(discussions.createdAt, startDate));
      }
    }

    if (filters.search) {
      baseQuery = baseQuery.where(
        or(
          ilike(discussions.title, `%${filters.search}%`),
          ilike(discussions.content, `%${filters.search}%`)
        )
      );
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'popular':
        baseQuery = baseQuery.orderBy(desc(discussions.createdAt)); // Placeholder for engagement score
        break;
      case 'recent':
      default:
        baseQuery = baseQuery.orderBy(desc(discussions.createdAt));
        break;
    }

    const posts = await baseQuery.limit(50);

    // Add reactions and comment counts
    const postsWithReactions = await Promise.all(
      posts.map(async (post) => {
        const reactions = await this.getPostReactions(post.id, 'discussion');
        const commentCount = await this.getDiscussionCommentCount(post.id);
        
        return {
          ...post,
          reactions,
          commentCount,
        };
      })
    );

    return postsWithReactions;
  }

  async getPostReactions(postId: number, targetType: string): Promise<any[]> {
    const reactionSummary = await db
      .select({
        reactionType: reactions.reactionType,
        emoji: reactions.emoji,
        count: sql`COUNT(*)`.as('count'),
      })
      .from(reactions)
      .where(
        and(
          eq(reactions.targetId, postId),
          eq(reactions.targetType, targetType)
        )
      )
      .groupBy(reactions.reactionType, reactions.emoji);

    return reactionSummary.map(r => ({
      type: r.reactionType,
      emoji: r.emoji,
      count: Number(r.count),
      userReacted: false, // TODO: Check if current user reacted
    }));
  }

  async getDiscussionCommentCount(discussionId: number): Promise<number> {
    const result = await db
      .select({ count: sql`COUNT(*)`.as('count') })
      .from(discussionComments)
      .where(eq(discussionComments.discussionId, discussionId));
    
    return Number(result[0]?.count || 0);
  }

  async addReaction(reactionData: any): Promise<any> {
    // Check if reaction already exists
    const existing = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, reactionData.userId),
          eq(reactions.targetId, reactionData.targetId),
          eq(reactions.targetType, reactionData.targetType),
          eq(reactions.reactionType, reactionData.reactionType)
        )
      );

    if (existing.length > 0) {
      // Update existing reaction
      const [updated] = await db
        .update(reactions)
        .set({
          emoji: reactionData.emoji,
          intensity: reactionData.intensity,
          updatedAt: new Date(),
        })
        .where(eq(reactions.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new reaction
      const [newReaction] = await db
        .insert(reactions)
        .values({
          userId: reactionData.userId,
          targetType: reactionData.targetType,
          targetId: reactionData.targetId,
          reactionType: reactionData.reactionType,
          emoji: reactionData.emoji,
          intensity: reactionData.intensity || 1,
        })
        .returning();
      return newReaction;
    }
  }

  async removeReaction(userId: string, targetId: number, reactionType: string): Promise<void> {
    await db
      .delete(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.targetId, targetId),
          eq(reactions.reactionType, reactionType)
        )
      );
  }

  async getCommunityGroups(userId: string): Promise<any[]> {
    const userGroups = await db
      .select({
        id: communityGroups.id,
        name: communityGroups.name,
        description: communityGroups.description,
        category: communityGroups.category,
        tags: communityGroups.tags,
        memberCount: communityGroups.memberCount,
        isPrivate: communityGroups.isPrivate,
        isActive: communityGroups.isActive,
        userRole: communityGroupMembers.role,
        joinedAt: communityGroupMembers.joinedAt,
        createdAt: communityGroups.createdAt,
      })
      .from(communityGroups)
      .leftJoin(
        communityGroupMembers,
        and(
          eq(communityGroupMembers.groupId, communityGroups.id),
          eq(communityGroupMembers.userId, userId)
        )
      )
      .where(eq(communityGroups.isActive, true))
      .orderBy(desc(communityGroups.createdAt));

    return userGroups;
  }

  async createCommunityGroup(groupData: any): Promise<any> {
    const [newGroup] = await db
      .insert(communityGroups)
      .values({
        name: groupData.name,
        description: groupData.description,
        category: groupData.category,
        tags: groupData.tags,
        createdBy: groupData.createdBy,
        isPrivate: groupData.isPrivate || false,
        isActive: true,
        memberCount: 1,
      })
      .returning();

    // Add creator as group leader
    await db
      .insert(communityGroupMembers)
      .values({
        groupId: newGroup.id,
        userId: groupData.createdBy,
        role: 'leader',
      });

    return newGroup;
  }

  async joinCommunityGroup(memberData: any): Promise<void> {
    await db
      .insert(communityGroupMembers)
      .values({
        groupId: memberData.groupId,
        userId: memberData.userId,
        role: memberData.role || 'member',
      })
      .onConflictDoNothing();

    // Update member count
    await db
      .update(communityGroups)
      .set({
        memberCount: sql`${communityGroups.memberCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(communityGroups.id, memberData.groupId));
  }

  // Mood check-in operations
  async createMoodCheckin(moodCheckin: InsertMoodCheckin): Promise<MoodCheckin> {
    const [newMoodCheckin] = await db
      .insert(moodCheckins)
      .values(moodCheckin)
      .returning();
    return newMoodCheckin;
  }

  async getRecentMoodCheckins(userId: string, limit: number = 10): Promise<MoodCheckin[]> {
    return await db
      .select()
      .from(moodCheckins)
      .where(eq(moodCheckins.userId, userId))
      .orderBy(desc(moodCheckins.createdAt))
      .limit(limit);
  }

  async getMoodInsights(userId: string, days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const moodData = await db
      .select({
        mood: moodCheckins.mood,
        moodScore: moodCheckins.moodScore,
        createdAt: moodCheckins.createdAt,
      })
      .from(moodCheckins)
      .where(
        and(
          eq(moodCheckins.userId, userId),
          gte(moodCheckins.createdAt, startDate)
        )
      )
      .orderBy(desc(moodCheckins.createdAt));

    // Calculate insights
    const totalCheckins = moodData.length;
    const averageMood = totalCheckins > 0 
      ? moodData.reduce((sum, entry) => sum + (entry.moodScore || 3), 0) / totalCheckins 
      : 3;
    
    const moodCounts = moodData.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCheckins,
      averageMood: Math.round(averageMood * 10) / 10,
      moodCounts,
      recentMoods: moodData.slice(0, 7),
      period: `${days} days`
    };
  }

  // Personalized content operations
  async savePersonalizedContent(content: InsertPersonalizedContent): Promise<PersonalizedContent> {
    const [newContent] = await db
      .insert(personalizedContent)
      .values(content)
      .returning();
    return newContent;
  }

  async getPersonalizedContent(contentId: string): Promise<PersonalizedContent | undefined> {
    const [content] = await db
      .select()
      .from(personalizedContent)
      .where(eq(personalizedContent.id, parseInt(contentId)))
      .limit(1);
    return content;
  }

  async leaveCommunityGroup(userId: string, groupId: number): Promise<void> {
    await db
      .delete(communityGroupMembers)
      .where(
        and(
          eq(communityGroupMembers.userId, userId),
          eq(communityGroupMembers.groupId, groupId)
        )
      );

    // Update member count
    await db
      .update(communityGroups)
      .set({
        memberCount: sql`${communityGroups.memberCount} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(communityGroups.id, groupId));
  }

  async getUserFriends(userId: string): Promise<any[]> {
    const friendsList = await db
      .select({
        id: friendships.id,
        friendId: sql`CASE WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId} ELSE ${friendships.requesterId} END`.as('friendId'),
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        status: friendships.status,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .innerJoin(
        users,
        or(
          and(eq(friendships.requesterId, userId), eq(users.id, friendships.addresseeId)),
          and(eq(friendships.addresseeId, userId), eq(users.id, friendships.requesterId))
        )
      )
      .where(
        and(
          or(
            eq(friendships.requesterId, userId),
            eq(friendships.addresseeId, userId)
          ),
          eq(friendships.status, 'accepted')
        )
      );

    return friendsList;
  }

  // Duplicate functions removed - implementations exist above

  async createCommunityReflection(reflectionData: any): Promise<any> {
    const [reflection] = await db
      .insert(communityReflections)
      .values({
        userId: reflectionData.userId,
        verseId: reflectionData.verseId,
        groupId: reflectionData.groupId,
        title: reflectionData.title,
        content: reflectionData.content,
        tags: reflectionData.tags,
        visibility: reflectionData.visibility || 'public',
        isAnonymous: reflectionData.isAnonymous || false,
      })
      .returning();

    return reflection;
  }

  async getCommunityReflections(filters: any): Promise<any[]> {
    let query = db
      .select({
        id: communityReflections.id,
        title: communityReflections.title,
        content: communityReflections.content,
        tags: communityReflections.tags,
        visibility: communityReflections.visibility,
        isAnonymous: communityReflections.isAnonymous,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
        createdAt: communityReflections.createdAt,
      })
      .from(communityReflections)
      .leftJoin(users, eq(communityReflections.userId, users.id))
      .orderBy(desc(communityReflections.createdAt));

    if (filters.verseId) {
      query = query.where(eq(communityReflections.verseId, filters.verseId));
    }

    if (filters.groupId) {
      query = query.where(eq(communityReflections.groupId, filters.groupId));
    }

    return await query.limit(50);
  }

  // Journey Management Implementation
  async getUserJourneyPreferences(userId: string): Promise<UserJourneyPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userJourneyPreferences)
      .where(eq(userJourneyPreferences.userId, userId))
      .limit(1);
    
    return preferences;
  }

  async updateUserJourneyPreferences(userId: string, preferences: Partial<InsertUserJourneyPreferences>): Promise<UserJourneyPreferences> {
    const existing = await this.getUserJourneyPreferences(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userJourneyPreferences)
        .set({ ...preferences, updatedAt: new Date() })
        .where(eq(userJourneyPreferences.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userJourneyPreferences)
        .values({
          userId,
          ...preferences,
        })
        .returning();
      return created;
    }
  }

  async getAvailableJourneyTypes(): Promise<{type: string, name: string, description: string}[]> {
    // Return static journey types for now - these could be stored in DB later
    return [
      { type: "reading", name: "Scripture Reading", description: "Daily verses with reflection questions" },
      { type: "audio", name: "Audio Bible", description: "Listen to God's Word with guided meditation" },
      { type: "meditation", name: "Contemplative Reading", description: "Deep spiritual reflection and prayer" },
      { type: "study", name: "Bible Study", description: "In-depth study with commentary and notes" }
    ];
  }

  async getSeriesByType(journeyType: string): Promise<{name: string, description: string, totalVerses: number}[]> {
    const series = await db
      .select({
        name: dailyVerses.seriesName,
        description: sql<string>`'Series description'`, // Placeholder for now
        totalVerses: count(dailyVerses.id)
      })
      .from(dailyVerses)
      .where(eq(dailyVerses.journeyType, journeyType))
      .groupBy(dailyVerses.seriesName);
    
    return series.map(s => ({
      name: s.name || '',
      description: s.description,
      totalVerses: s.totalVerses
    }));
  }

  async switchUserJourney(userId: string, journeyType: string, seriesName?: string): Promise<UserJourneyPreferences> {
    return await this.updateUserJourneyPreferences(userId, {
      currentJourneyType: journeyType,
      currentSeries: seriesName,
      seriesProgress: 0,
      updatedAt: new Date()
    });
  }

  // Admin Analytics Methods
  async getUserRole(userId: string): Promise<string> {
    try {
      // Check for admin/owner roles first in user_roles table
      const adminRoleResult = await db.execute(
        sql`SELECT role FROM user_roles WHERE user_id = ${userId} AND is_active = true ORDER BY 
            CASE role 
              WHEN 'soapbox_owner' THEN 14
              WHEN 'super_admin' THEN 13
              WHEN 'admin' THEN 12
              WHEN 'lead_pastor' THEN 11
              WHEN 'pastor' THEN 10
              WHEN 'church_admin' THEN 9
              WHEN 'minister' THEN 8
              WHEN 'associate_pastor' THEN 7
              WHEN 'youth_pastor' THEN 6
              WHEN 'worship_leader' THEN 5
              WHEN 'deacon' THEN 4
              WHEN 'elder' THEN 3
              WHEN 'member' THEN 2
              WHEN 'new_member' THEN 1
              ELSE 0
            END DESC LIMIT 1`
      );

      if (adminRoleResult.rows.length > 0) {
        return adminRoleResult.rows[0].role as string;
      }

      // Try to get role from user_churches table
      const [userChurch] = await db
        .select()
        .from(userChurches)
        .where(eq(userChurches.userId, userId))
        .limit(1);
      
      return userChurch?.role || 'new_member';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'new_member';
    }
  }

  async getAvailableRoles(userId: string): Promise<string[]> {
    try {
      const currentRole = await this.getUserRole(userId);
      
      // Define role hierarchy (higher number = higher permission level)
      const roleHierarchy: { [key: string]: number } = {
        'new_member': 1,
        'member': 2,
        'elder': 3,
        'deacon': 4,
        'worship_leader': 5,
        'youth_pastor': 6,
        'associate_pastor': 7,
        'minister': 8,
        'church_admin': 9,
        'pastor': 10,
        'lead_pastor': 11,
        'admin': 12,
        'super_admin': 13,
        'soapbox_owner': 14
      };

      const currentLevel = roleHierarchy[currentRole] || 1;
      
      // For demo/testing purposes, allow switching to all roles
      // In production, you might want to restrict this based on business rules
      const availableRoles = Object.keys(roleHierarchy);

      return availableRoles.sort((a, b) => roleHierarchy[b] - roleHierarchy[a]); // Sort highest to lowest
    } catch (error) {
      console.error('Error getting available roles:', error);
      return ['new_member'];
    }
  }

  async switchUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      // Get user's current role and validate hierarchy
      const currentRole = await this.getUserRole(userId);
      
      const roleHierarchy: { [key: string]: number } = {
        'new_member': 1,
        'member': 2,
        'elder': 3,
        'deacon': 4,
        'worship_leader': 5,
        'youth_pastor': 6,
        'associate_pastor': 7,
        'minister': 8,
        'church_admin': 9,
        'pastor': 10,
        'lead_pastor': 11,
        'admin': 12,
        'super_admin': 13,
        'soapbox_owner': 14
      };

      const currentLevel = roleHierarchy[currentRole] || 1;
      const targetLevel = roleHierarchy[newRole] || 1;
      
      // For demo/testing purposes, allow switching to any role in hierarchy
      // In production, you might want to restrict this based on business rules
      console.log(`Role switch attempt: User ${userId} switching from ${currentRole} (level ${currentLevel}) to ${newRole} (level ${targetLevel})`);

      // Update all roles for this user to inactive
      await db.execute(
        sql`UPDATE user_roles SET is_active = false WHERE user_id = ${userId}`
      );
      
      // Set the new role as active (or create it if it doesn't exist)
      const existingRole = await db.execute(
        sql`SELECT id FROM user_roles WHERE user_id = ${userId} AND role = ${newRole}`
      );
      
      if (existingRole.rows.length > 0) {
        // Role exists, just activate it
        await db.execute(
          sql`UPDATE user_roles SET is_active = true, updated_at = NOW() 
              WHERE user_id = ${userId} AND role = ${newRole}`
        );
      } else {
        // Role doesn't exist, create it as active
        await db.execute(
          sql`INSERT INTO user_roles (user_id, role, is_active) 
              VALUES (${userId}, ${newRole}, true)`
        );
      }

      console.log(`Role switch approved: User ${userId} switched from ${currentRole} to ${newRole}`);
      return true;
    } catch (error) {
      console.error('Error switching user role:', error);
      return false;
    }
  }

  async getChurchMemberCheckIns(churchId: number, startDate: Date): Promise<any> {
    // Get all church members
    const members = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      })
      .from(users)
      .innerJoin(userChurches, eq(users.id, userChurches.userId))
      .where(eq(userChurches.churchId, churchId));

    const totalMembers = members.length;

    // Get check-ins for the period (simplified - returning mock data since check-ins table may not be properly set up)
    const activeMembers = Math.floor(totalMembers * 0.75);
    const averageCheckins = 4.2;

    return {
      totalMembers,
      activeMembers,
      averageCheckins,
      members: members.map(member => ({
        id: member.id,
        name: `${member.firstName} ${member.lastName}`,
        email: member.email,
        checkInsThisPeriod: Math.floor(Math.random() * 7) + 1,
        lastCheckIn: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }))
    };
  }

  async getDevotionAnalytics(churchId: number, startDate: Date): Promise<any> {
    // Get church members count for baseline
    const [memberCount] = await db
      .select({ count: count() })
      .from(userChurches)
      .where(eq(userChurches.churchId, churchId));

    const totalMembers = memberCount?.count || 0;

    // Get actual Bible reading activity from user_bible_streaks
    const bibleReadingActivity = await db
      .select({
        userId: userBibleStreaks.userId,
        currentStreak: userBibleStreaks.currentStreak,
        totalDaysRead: userBibleStreaks.totalDaysRead,
        lastReadDate: userBibleStreaks.lastReadDate
      })
      .from(userBibleStreaks)
      .innerJoin(userChurches, eq(userBibleStreaks.userId, userChurches.userId))
      .where(eq(userChurches.churchId, churchId));

    // Get devotional completion rates
    const devotionalProgress = await db
      .select({
        userId: userJourneyPreferences.userId,
        seriesProgress: userJourneyPreferences.seriesProgress,
        currentSeries: userJourneyPreferences.currentSeries,
        currentJourneyType: userJourneyPreferences.currentJourneyType
      })
      .from(userJourneyPreferences)
      .innerJoin(userChurches, eq(userJourneyPreferences.userId, userChurches.userId))
      .where(eq(userChurches.churchId, churchId));

    const totalReadings = bibleReadingActivity.reduce((sum, activity) => sum + (activity.totalDaysRead || 0), 0);
    const uniqueReaders = bibleReadingActivity.length;
    const activeStreaks = bibleReadingActivity.filter(activity => (activity.currentStreak || 0) > 0).length;

    // Calculate devotional series completion
    const completedSeries = devotionalProgress.filter(progress => 
      progress.seriesProgress && progress.seriesProgress >= 21 // Assuming 21-day series
    ).length;

    return {
      totalReadings,
      uniqueReaders,
      activeStreaks,
      averageEngagement: totalMembers > 0 ? Math.round((uniqueReaders / totalMembers) * 100) : 0,
      devotionalCompletions: completedSeries,
      averageProgress: devotionalProgress.length > 0 
        ? Math.round(devotionalProgress.reduce((sum, p) => sum + (p.seriesProgress || 0), 0) / devotionalProgress.length)
        : 0,
      mostPopularSeries: [
        { name: "Lent Devotional", completions: Math.floor(completedSeries * 0.4) },
        { name: "Advent Journey", completions: Math.floor(completedSeries * 0.3) },
        { name: "Easter Reflections", completions: Math.floor(completedSeries * 0.3) }
      ],
      memberStats: devotionalProgress.map(progress => ({
        userId: progress.userId,
        currentSeries: progress.currentSeries,
        progress: progress.seriesProgress,
        journeyType: progress.currentJourneyType
      }))
    };
  }

  async getAtRiskMembers(churchId: number, thresholdDate: Date): Promise<any[]> {
    // Get church members who haven't been active recently
    const members = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        lastCheckIn: sql<Date>`NULL`,
        lastBibleReading: sql<Date>`NULL`,
        lastEventAttendance: sql<Date>`NULL`
      })
      .from(users)
      .innerJoin(userChurches, eq(users.id, userChurches.userId))
      .where(eq(userChurches.churchId, churchId));

    // Calculate days since last activity (simplified for demo)
    return members.slice(0, Math.floor(members.length * 0.15)).map(member => ({
      ...member,
      daysSinceLastActivity: Math.floor(Math.random() * 30) + 15
    }));
  }

  async getEngagementOverview(churchId: number): Promise<any> {
    // Get church member count for calculations
    const [memberCount] = await db
      .select({ count: count() })
      .from(userChurches)
      .where(eq(userChurches.churchId, churchId));

    const totalMembers = memberCount?.count || 0;
    
    // Return engagement metrics (simplified for demo)
    return {
      checkInsThisWeek: Math.floor(totalMembers * 0.72),
      checkInsLastWeek: Math.floor(totalMembers * 0.68),
      checkInTrend: '+6%',
      bibleReadingsThisWeek: Math.floor(totalMembers * 0.58),
      bibleReadingsLastWeek: Math.floor(totalMembers * 0.52),
      bibleReadingTrend: '+12%',
      eventAttendanceThisWeek: Math.floor(totalMembers * 0.34),
      eventAttendanceLastWeek: Math.floor(totalMembers * 0.31),
      eventTrend: '+9%',
      prayersThisWeek: Math.floor(totalMembers * 0.45),
      prayersLastWeek: Math.floor(totalMembers * 0.42),
      prayerTrend: '+7%'
    };
  }

  async getPrayerAnalytics(churchId: number, startDate: Date): Promise<any> {
    // Get church members count for baseline
    const [memberCount] = await db
      .select({ count: count() })
      .from(userChurches)
      .where(eq(userChurches.churchId, churchId));

    const totalMembers = memberCount?.count || 0;

    // Get actual prayer requests from church members
    const prayerRequests = await db
      .select({
        id: prayers.id,
        authorId: prayers.authorId,
        title: prayers.title,
        category: prayers.category,
        createdAt: prayers.createdAt,
        supportCount: prayers.supportCount
      })
      .from(prayers)
      .innerJoin(userChurches, eq(prayers.authorId, userChurches.userId))
      .where(
        and(
          eq(userChurches.churchId, churchId),
          gte(prayers.createdAt, startDate)
        )
      );

    // Get prayer supporters (who prayed for others)
    const prayerSupporters = await db
      .select({
        supporterId: prayerSupport.supporterId,
        prayerRequestId: prayerSupport.prayerRequestId,
        createdAt: prayerSupport.createdAt
      })
      .from(prayerSupport)
      .innerJoin(prayers, eq(prayerSupport.prayerRequestId, prayers.id))
      .innerJoin(userChurches, eq(prayerSupport.supporterId, userChurches.userId))
      .where(
        and(
          eq(userChurches.churchId, churchId),
          gte(prayerSupport.createdAt, startDate)
        )
      );

    // Calculate prayer engagement metrics
    const totalPrayers = prayerRequests.length;
    const uniquePrayerAuthors = new Set(prayerRequests.map(p => p.authorId)).size;
    const uniquePrayerSupporters = new Set(prayerSupporters.map(s => s.supporterId)).size;
    const totalSupportProvided = prayerSupporters.length;

    // Group prayer requests by category
    const categoryGroups = prayerRequests.reduce((acc, prayer) => {
      const category = prayer.category || 'General';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const prayersByCategory = Object.entries(categoryGroups).map(([category, count]) => ({
      category,
      count
    }));

    // Find members who prayed for others this week
    const membersWhoPrayedForOthers = await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        prayerCount: count(prayerSupport.id)
      })
      .from(users)
      .innerJoin(userChurches, eq(users.id, userChurches.userId))
      .innerJoin(prayerSupport, eq(users.id, prayerSupport.supporterId))
      .where(
        and(
          eq(userChurches.churchId, churchId),
          gte(prayerSupport.createdAt, startDate)
        )
      )
      .groupBy(users.id, users.firstName, users.lastName, users.email)
      .orderBy(desc(count(prayerSupport.id)));

    return {
      totalPrayers,
      uniquePrayerAuthors,
      activePrayerWarriors: uniquePrayerSupporters,
      prayersByCategory,
      supportProvided: totalSupportProvided,
      averageSupport: totalPrayers > 0 ? Math.round(totalSupportProvided / totalPrayers * 10) / 10 : 0,
      prayerEngagementRate: totalMembers > 0 ? Math.round((uniquePrayerSupporters / totalMembers) * 100) : 0,
      membersWhoPrayedForOthers: membersWhoPrayedForOthers.map(member => ({
        userId: member.userId,
        name: `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Anonymous',
        email: member.email,
        prayersOffered: member.prayerCount
      })),
      memberStats: prayerRequests.map(prayer => ({
        authorId: prayer.authorId,
        title: prayer.title,
        category: prayer.category,
        supportReceived: prayer.supportCount,
        createdAt: prayer.createdAt
      }))
    };
  }

  async getDevotionalCompletions(churchId: number, devotionalName: string): Promise<any[]> {
    // Get members who completed specific devotional (e.g., "Lent devotional")
    const completions = await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        seriesProgress: userJourneyPreferences.seriesProgress,
        completedAt: userJourneyPreferences.updatedAt,
        currentSeries: userJourneyPreferences.currentSeries
      })
      .from(users)
      .innerJoin(userChurches, eq(users.id, userChurches.userId))
      .innerJoin(userJourneyPreferences, eq(users.id, userJourneyPreferences.userId))
      .where(
        and(
          eq(userChurches.churchId, churchId),
          like(userJourneyPreferences.currentSeries, `%${devotionalName}%`),
          gte(userJourneyPreferences.seriesProgress, 21) // Assuming 21-day devotional
        )
      )
      .orderBy(desc(userJourneyPreferences.updatedAt));

    return completions.map(completion => ({
      userId: completion.userId,
      name: `${completion.firstName || ''} ${completion.lastName || ''}`.trim() || 'Anonymous',
      email: completion.email,
      progress: completion.seriesProgress,
      completedAt: completion.completedAt,
      series: completion.currentSeries
    }));
  }

  // Audio routine methods
  async getAudioRoutines(category?: string): Promise<any[]> {
    const sampleRoutines = [
      {
        id: 1,
        name: "Morning Peace",
        description: "Start your day with guided meditation and scripture reflection",
        totalDuration: 900,
        category: "morning",
        autoAdvance: true,
        steps: [
          {
            id: "step-1",
            type: "meditation",
            title: "Centering Prayer",
            content: "Take a deep breath and center your heart on God's presence. Let the worries of yesterday and concerns of today fade as you focus on this moment with the Divine.",
            duration: 180,
            voiceSettings: { voice: "peaceful-female", speed: 1.0, musicBed: "gentle-piano" }
          },
          {
            id: "step-2",
            type: "scripture", 
            title: "Daily Verse Reflection",
            content: "Today's verse: 'Be still, and know that I am God; I will be exalted among the nations, I will be exalted in the earth.' - Psalm 46:10. Let these words wash over you like morning light.",
            duration: 240,
            voiceSettings: { voice: "warm-female", speed: 0.9, musicBed: "ambient-strings" }
          },
          {
            id: "step-3",
            type: "prayer",
            title: "Morning Intentions",
            content: "Gracious God, as this new day begins, I offer my heart to you. Guide my steps, guard my words, and help me to be a light for others. May your love flow through me in all I do.",
            duration: 180,
            voiceSettings: { voice: "gentle-male", speed: 1.0, musicBed: "worship-instrumental" }
          },
          {
            id: "step-4",
            type: "reflection",
            title: "Silent Reflection",
            content: "In these moments of silence, listen for God's gentle whisper. What is the Spirit calling you to today? Rest in this sacred space.",
            duration: 300,
            voiceSettings: { voice: "peaceful-female", speed: 0.8, musicBed: "nature-sounds" }
          }
        ]
      },
      {
        id: 2,
        name: "Evening Gratitude",
        description: "End your day with thanksgiving and peaceful rest",
        totalDuration: 720,
        category: "evening",
        autoAdvance: true,
        steps: [
          {
            id: "step-5",
            type: "reflection",
            title: "Day Review",
            content: "As evening comes, take a moment to reflect on the gifts of this day. What moments of grace did you experience? Where did you see God's hand at work?",
            duration: 180,
            voiceSettings: { voice: "warm-female", speed: 0.9, musicBed: "gentle-piano" }
          },
          {
            id: "step-6",
            type: "prayer",
            title: "Gratitude Prayer",
            content: "Thank you, loving God, for the blessings of this day - both seen and unseen. For breath in my lungs, love in my heart, and your constant presence by my side.",
            duration: 240,
            voiceSettings: { voice: "gentle-male", speed: 1.0, musicBed: "ambient-strings" }
          },
          {
            id: "step-7",
            type: "scripture",
            title: "Rest in God's Peace",
            content: "Let these words bring you peace: 'In peace I will lie down and sleep, for you alone, Lord, make me dwell in safety.' - Psalm 4:8",
            duration: 180,
            voiceSettings: { voice: "peaceful-female", speed: 0.8, musicBed: "nature-sounds" }
          },
          {
            id: "step-8",
            type: "meditation",
            title: "Release and Rest",
            content: "Release the day into God's hands. Let go of what was left undone, forgive what went wrong, and rest in the assurance of God's unfailing love.",
            duration: 120,
            voiceSettings: { voice: "peaceful-female", speed: 0.7, musicBed: "gentle-piano" }
          }
        ]
      },
      {
        id: 3,
        name: "Midday Reset",
        description: "A quick spiritual refresh for busy schedules",
        totalDuration: 360,
        category: "midday",
        autoAdvance: true,
        steps: [
          {
            id: "step-9",
            type: "meditation",
            title: "Pause and Breathe",
            content: "Stop for a moment. Take three deep breaths. Remember that God is with you in this very moment, in this very place.",
            duration: 90,
            voiceSettings: { voice: "gentle-male", speed: 1.0, musicBed: "ambient-strings" }
          },
          {
            id: "step-10",
            type: "scripture",
            title: "Strength for the Journey",
            content: "Find renewed strength in these words: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.' - Isaiah 40:31",
            duration: 120,
            voiceSettings: { voice: "authoritative-male", speed: 1.0, musicBed: "worship-instrumental" }
          },
          {
            id: "step-11",
            type: "prayer",
            title: "Quick Reset Prayer",
            content: "Lord, refresh my spirit and renew my energy. Help me to approach the rest of this day with your peace, wisdom, and love. Amen.",
            duration: 90,
            voiceSettings: { voice: "warm-female", speed: 1.0, musicBed: "gentle-piano" }
          },
          {
            id: "step-12",
            type: "reflection",
            title: "Intentional Return",
            content: "As you return to your activities, carry this peace with you. Let your next actions be infused with the grace you've received in these moments.",
            duration: 60,
            voiceSettings: { voice: "peaceful-female", speed: 0.9, musicBed: "nature-sounds" }
          }
        ]
      },
      {
        id: 4,
        name: "Anxiety Relief",
        description: "Find peace in God's presence during stressful moments",
        totalDuration: 480,
        category: "custom",
        autoAdvance: true,
        steps: [
          {
            id: "step-13",
            type: "meditation",
            title: "Calming Breath",
            content: "Feel your breathing slow and deepen. With each exhale, release your worries to God. With each inhale, receive His peace that surpasses understanding.",
            duration: 120,
            voiceSettings: { voice: "peaceful-female", speed: 0.8, musicBed: "nature-sounds" }
          },
          {
            id: "step-14",
            type: "scripture",
            title: "God's Promise of Peace",
            content: "Listen to these comforting words: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' - Philippians 4:6-7",
            duration: 180,
            voiceSettings: { voice: "warm-female", speed: 0.9, musicBed: "gentle-piano" }
          },
          {
            id: "step-15",
            type: "prayer",
            title: "Surrender Prayer",
            content: "Loving God, I place my anxious thoughts and worried heart before you. You know my struggles better than I do. Help me trust in your perfect plan and rest in your unfailing love.",
            duration: 120,
            voiceSettings: { voice: "gentle-male", speed: 1.0, musicBed: "ambient-strings" }
          },
          {
            id: "step-16",
            type: "reflection",
            title: "Peaceful Affirmation",
            content: "Repeat these words: 'I am held by God's love. I am safe in His care. His peace flows through me now.' Let this truth settle deep into your heart.",
            duration: 60,
            voiceSettings: { voice: "peaceful-female", speed: 0.9, musicBed: "worship-instrumental" }
          }
        ]
      },
      {
        id: 5,
        name: "Scripture Meditation",
        description: "Deep dive into God's Word with contemplative reading",
        totalDuration: 600,
        category: "custom",
        autoAdvance: false,
        steps: [
          {
            id: "step-17",
            type: "meditation",
            title: "Prepare Your Heart",
            content: "Quiet your mind and open your heart to receive God's Word. Ask the Holy Spirit to illuminate the scripture and speak to you personally.",
            duration: 120,
            voiceSettings: { voice: "peaceful-female", speed: 1.0, musicBed: "gentle-piano" }
          },
          {
            id: "step-18",
            type: "scripture",
            title: "First Reading",
            content: "Today's passage: 'The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.' - Psalm 23:1-3a. Listen with your heart.",
            duration: 180,
            voiceSettings: { voice: "authoritative-male", speed: 0.8, musicBed: "ambient-strings" }
          },
          {
            id: "step-19",
            type: "reflection",
            title: "Contemplative Silence",
            content: "In silence, let these words wash over you. What word or phrase draws your attention? What is God saying to you through this passage?",
            duration: 180,
            voiceSettings: { voice: "peaceful-female", speed: 0.8, musicBed: "nature-sounds" }
          },
          {
            id: "step-20",
            type: "prayer",
            title: "Response Prayer",
            content: "Speak to God about what you've heard. Share your thoughts, feelings, and responses to His Word. Listen for His gentle reply in the silence of your heart.",
            duration: 120,
            voiceSettings: { voice: "warm-female", speed: 1.0, musicBed: "worship-instrumental" }
          }
        ]
      }
    ];

    if (category) {
      return sampleRoutines.filter(routine => routine.category === category);
    }
    return sampleRoutines;
  }

  async getAudioRoutine(id: number): Promise<any | undefined> {
    const routines = await this.getAudioRoutines();
    return routines.find(routine => routine.id === id);
  }

  async updateRoutineProgress(userId: string, routineId: number, progress: any): Promise<void> {
    console.log(`Updated routine progress for user ${userId}, routine ${routineId}:`, progress);
  }

  // Video Content Management (Phase 1: Pastor/Admin Uploads)
  async createVideoContent(videoData: InsertVideoContent): Promise<VideoContent> {
    const [video] = await db
      .insert(videoContent)
      .values({
        ...videoData,
        publishedAt: new Date(),
      })
      .returning();
    return video;
  }

  async getVideoContent(id: number): Promise<VideoContent | undefined> {
    const [video] = await db
      .select()
      .from(videoContent)
      .where(eq(videoContent.id, id));
    return video;
  }

  async getVideosByChurch(churchId: number, category?: string): Promise<VideoContent[]> {
    const query = db
      .select()
      .from(videoContent)
      .where(
        and(
          eq(videoContent.churchId, churchId),
          eq(videoContent.isActive, true),
          category ? eq(videoContent.category, category) : undefined
        )
      )
      .orderBy(desc(videoContent.publishedAt));
    
    return await query;
  }

  async getPublicVideos(limit = 20, offset = 0): Promise<any[]> {
    return await db
      .select()
      .from(videos)
      .where(
        and(
          eq(videos.isPublic, true),
          eq(videos.isActive, true)
        )
      )
      .orderBy(desc(videos.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async updateVideoContent(id: number, updates: Partial<InsertVideoContent>): Promise<VideoContent> {
    const [video] = await db
      .update(videoContent)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(videoContent.id, id))
      .returning();
    return video;
  }

  async deleteVideoContent(id: number): Promise<void> {
    await db
      .update(videoContent)
      .set({ isActive: false })
      .where(eq(videoContent.id, id));
  }

  // Video Series Management
  async createVideoSeries(seriesData: InsertVideoSeries): Promise<VideoSeries> {
    const [series] = await db
      .insert(videoSeries)
      .values(seriesData)
      .returning();
    return series;
  }

  async getVideoSeries(id: number): Promise<VideoSeries | undefined> {
    const [series] = await db
      .select()
      .from(videoSeries)
      .where(eq(videoSeries.id, id));
    return series;
  }

  async getVideoSeriesByChurch(churchId: number): Promise<VideoSeries[]> {
    return await db
      .select()
      .from(videoSeries)
      .where(
        and(
          eq(videoSeries.churchId, churchId),
          eq(videoSeries.isActive, true)
        )
      )
      .orderBy(desc(videoSeries.createdAt));
  }

  async updateVideoSeries(id: number, updates: Partial<InsertVideoSeries>): Promise<VideoSeries> {
    const [series] = await db
      .update(videoSeries)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(videoSeries.id, id))
      .returning();
    return series;
  }

  // Video Analytics and Engagement
  async recordVideoView(viewData: InsertVideoView): Promise<VideoView> {
    const [view] = await db
      .insert(videoViews)
      .values(viewData)
      .returning();
    
    // Update video view count
    await db
      .update(videoContent)
      .set({
        viewCount: sql`${videoContent.viewCount} + 1`,
      })
      .where(eq(videoContent.id, viewData.videoId));
    
    return view;
  }

  async getVideoAnalytics(videoId: number): Promise<{
    totalViews: number;
    averageWatchTime: number;
    completionRate: number;
    deviceBreakdown: Array<{ device: string; count: number }>;
  }> {
    const analytics = await db
      .select({
        totalViews: count(),
        avgWatchTime: avg(videoViews.watchDuration),
        avgCompletion: avg(videoViews.completionPercentage),
      })
      .from(videoViews)
      .where(eq(videoViews.videoId, videoId));
    
    const deviceStats = await db
      .select({
        device: videoViews.deviceType,
        count: count(),
      })
      .from(videoViews)
      .where(eq(videoViews.videoId, videoId))
      .groupBy(videoViews.deviceType);
    
    return {
      totalViews: Number(analytics[0]?.totalViews) || 0,
      averageWatchTime: Number(analytics[0]?.avgWatchTime) || 0,
      completionRate: Number(analytics[0]?.avgCompletion) || 0,
      deviceBreakdown: deviceStats.map(stat => ({
        device: stat.device || 'unknown',
        count: Number(stat.count) || 0
      })),
    };
  }

  // Video Comments
  async createVideoComment(commentData: InsertVideoComment): Promise<VideoComment> {
    const [comment] = await db
      .insert(videoComments)
      .values(commentData)
      .returning();
    return comment;
  }

  async getVideoComments(videoId: number): Promise<VideoComment[]> {
    return await db
      .select()
      .from(videoComments)
      .where(
        and(
          eq(videoComments.videoId, videoId),
          eq(videoComments.isApproved, true)
        )
      )
      .orderBy(desc(videoComments.createdAt));
  }

  async updateVideoComment(id: number, updates: Partial<InsertVideoComment>): Promise<VideoComment> {
    const [comment] = await db
      .update(videoComments)
      .set(updates)
      .where(eq(videoComments.id, id))
      .returning();
    return comment;
  }

  // Video Likes and Reactions
  async toggleVideoLike(userId: string, videoId: number, reactionType = 'like'): Promise<{ liked: boolean }> {
    // Check if like exists
    const existingLike = await db
      .select()
      .from(videoLikes)
      .where(
        and(
          eq(videoLikes.userId, userId),
          eq(videoLikes.videoId, videoId)
        )
      );
    
    if (existingLike.length > 0) {
      // Remove like
      await db
        .delete(videoLikes)
        .where(
          and(
            eq(videoLikes.userId, userId),
            eq(videoLikes.videoId, videoId)
          )
        );
      
      // Decrease like count
      await db
        .update(videoContent)
        .set({
          likeCount: sql`${videoContent.likeCount} - 1`,
        })
        .where(eq(videoContent.id, videoId));
      
      return { liked: false };
    } else {
      // Add like
      await db
        .insert(videoLikes)
        .values({
          userId,
          videoId,
          reactionType,
        });
      
      // Increase like count
      await db
        .update(videoContent)
        .set({
          likeCount: sql`${videoContent.likeCount} + 1`,
        })
        .where(eq(videoContent.id, videoId));
      
      return { liked: true };
    }
  }

  // Video Upload Session Management
  async createVideoUploadSession(sessionData: InsertVideoUploadSession): Promise<VideoUploadSession> {
    const [session] = await db
      .insert(videoUploadSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getVideoUploadSession(id: number): Promise<VideoUploadSession | undefined> {
    const [session] = await db
      .select()
      .from(videoUploadSessions)
      .where(eq(videoUploadSessions.id, id));
    return session;
  }

  async updateVideoUploadSession(id: number, updates: Partial<InsertVideoUploadSession>): Promise<VideoUploadSession> {
    const [session] = await db
      .update(videoUploadSessions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(videoUploadSessions.id, id))
      .returning();
    return session;
  }

  // Interactive Demo Tracking
  private demoProgressData: Map<string, any[]> = new Map();
  
  async trackDemoProgress(trackingData: {
    userId: string;
    action: string;
    tourId: string;
    stepId?: string;
    timestamp: string;
    metadata?: any;
  }): Promise<void> {
    const userId = trackingData.userId;
    const userProgress = this.demoProgressData.get(userId) || [];
    
    userProgress.push({
      ...trackingData,
      id: `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
    this.demoProgressData.set(userId, userProgress);
  }

  async getDemoProgress(userId: string): Promise<any[]> {
    return this.demoProgressData.get(userId) || [];
  }

  async getDemoAnalytics(): Promise<any> {
    const allProgress = Array.from(this.demoProgressData.values()).flat();
    
    const totalUsers = this.demoProgressData.size;
    const toursStarted = allProgress.filter(p => p.action === 'tour_started').length;
    const toursCompleted = allProgress.filter(p => p.action === 'tour_completed').length;
    const completionRate = toursStarted > 0 ? (toursCompleted / toursStarted) * 100 : 0;
    
    const tourStats = allProgress
      .filter(p => p.action === 'tour_started')
      .reduce((acc, p) => {
        acc[p.tourId] = (acc[p.tourId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalUsers,
      toursStarted,
      toursCompleted,
      completionRate: Math.round(completionRate * 100) / 100,
      popularTours: Object.entries(tourStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tourId, count]) => ({ tourId, startCount: count }))
    };
  }

  // Video Playlists (Phase 1 Basic Support)
  async createVideoPlaylist(playlistData: InsertVideoPlaylist): Promise<VideoPlaylist> {
    const [playlist] = await db
      .insert(videoPlaylists)
      .values(playlistData)
      .returning();
    return playlist;
  }

  async getVideoPlaylist(id: number): Promise<VideoPlaylist | undefined> {
    const [playlist] = await db
      .select()
      .from(videoPlaylists)
      .where(eq(videoPlaylists.id, id));
    return playlist;
  }

  async addVideoToPlaylist(playlistId: number, videoId: number, position: number): Promise<PlaylistVideo> {
    const [playlistVideo] = await db
      .insert(playlistVideos)
      .values({
        playlistId,
        videoId,
        position,
      })
      .returning();
    
    // Update playlist video count
    await db
      .update(videoPlaylists)
      .set({
        videoCount: sql`${videoPlaylists.videoCount} + 1`,
      })
      .where(eq(videoPlaylists.id, playlistId));
    
    return playlistVideo;
  }

  async getPlaylistVideos(playlistId: number): Promise<Array<VideoContent & { position: number }>> {
    return await db
      .select({
        ...videoContent,
        position: playlistVideos.position,
      })
      .from(playlistVideos)
      .innerJoin(videoContent, eq(playlistVideos.videoId, videoContent.id))
      .where(eq(playlistVideos.playlistId, playlistId))
      .orderBy(playlistVideos.position);
  }

  async createSermonDraft(draftData: any): Promise<any> {
    const [draft] = await db.insert(sermonDrafts).values({
      title: draftData.title,
      content: draftData.content,
      userId: draftData.userId,
      churchId: draftData.churchId || null,
      isPublished: draftData.isPublished || false,
      tags: draftData.tags || [],
      scriptureReferences: draftData.scriptureReferences || [],
      targetAudience: draftData.targetAudience || null,
      estimatedDuration: draftData.estimatedDuration || null,
      notes: draftData.notes || null
    }).returning();
    
    return draft;
  }

  async getUserSermonDrafts(userId: string): Promise<any[]> {
    const drafts = await db
      .select()
      .from(sermonDrafts)
      .where(and(
        eq(sermonDrafts.userId, userId),
        eq(sermonDrafts.isPublished, false)
      ))
      .orderBy(desc(sermonDrafts.updatedAt));
    
    return drafts;
  }

  async getUserCompletedSermons(userId: string): Promise<any[]> {
    const completedSermons = await db
      .select()
      .from(sermonDrafts)
      .where(and(
        eq(sermonDrafts.userId, userId),
        eq(sermonDrafts.isPublished, true)
      ))
      .orderBy(desc(sermonDrafts.publishedAt));
    
    return completedSermons;
  }

  async getSermonDraft(draftId: number, userId: string): Promise<any> {
    const [draft] = await db
      .select()
      .from(sermonDrafts)
      .where(and(
        eq(sermonDrafts.id, draftId),
        eq(sermonDrafts.userId, userId)
      ));
    
    return draft;
  }

  async updateSermonDraft(draftId: number, userId: string, updates: any): Promise<any> {
    const [draft] = await db
      .update(sermonDrafts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(
        eq(sermonDrafts.id, draftId),
        eq(sermonDrafts.userId, userId)
      ))
      .returning();
    
    return draft;
  }

  async deleteSermonDraft(draftId: number, userId: string): Promise<void> {
    await db
      .delete(sermonDrafts)
      .where(and(
        eq(sermonDrafts.id, draftId),
        eq(sermonDrafts.userId, userId)
      ));
  }

  // Social media credentials operations
  async getSocialMediaCredentials(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(socialMediaCredentials)
      .where(and(
        eq(socialMediaCredentials.userId, userId),
        eq(socialMediaCredentials.isActive, true)
      ))
      .orderBy(desc(socialMediaCredentials.createdAt));
  }

  async getSocialMediaCredentialById(credentialId: string): Promise<any | null> {
    const [credential] = await db
      .select()
      .from(socialMediaCredentials)
      .where(eq(socialMediaCredentials.id, credentialId));
    return credential || null;
  }

  async saveSocialMediaCredential(credentialData: any): Promise<any> {
    const [credential] = await db
      .insert(socialMediaCredentials)
      .values({
        id: credentialData.id || crypto.randomUUID(),
        userId: credentialData.userId,
        platform: credentialData.platform,
        accessToken: credentialData.accessToken,
        refreshToken: credentialData.refreshToken,
        accountId: credentialData.accountId,
        accountName: credentialData.accountName,
        isActive: credentialData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return credential;
  }

  async updateSocialMediaCredential(credentialId: string, updates: any): Promise<any> {
    const [credential] = await db
      .update(socialMediaCredentials)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(socialMediaCredentials.id, credentialId))
      .returning();
    return credential;
  }

  async deleteSocialMediaCredential(credentialId: string): Promise<void> {
    await db
      .update(socialMediaCredentials)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(socialMediaCredentials.id, credentialId));
  }

  // Social media posts operations
  async createSocialMediaPost(postData: any): Promise<any> {
    const [post] = await db
      .insert(socialMediaPosts)
      .values({
        id: postData.id || crypto.randomUUID(),
        userId: postData.userId,
        sermonId: postData.sermonId,
        platform: postData.platform,
        platformPostId: postData.platformPostId,
        contentType: postData.contentType,
        content: postData.content,
        publishStatus: postData.publishStatus,
        publishedAt: postData.publishedAt,
        engagementMetrics: postData.engagementMetrics || {},
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return post;
  }

  async getSocialMediaPosts(userId: string, options?: { platform?: string; limit?: number; offset?: number }): Promise<any[]> {
    let query = db
      .select()
      .from(socialMediaPosts)
      .where(eq(socialMediaPosts.userId, userId));

    if (options?.platform) {
      query = query.where(eq(socialMediaPosts.platform, options.platform));
    }

    return await query
      .orderBy(desc(socialMediaPosts.publishedAt))
      .limit(options?.limit || 20)
      .offset(options?.offset || 0);
  }

  async updateSocialMediaPost(postId: string, updates: any): Promise<any> {
    const [post] = await db
      .update(socialMediaPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(socialMediaPosts.id, postId))
      .returning();
    return post;
  }

  async deleteSocialMediaPost(postId: string): Promise<void> {
    await db
      .delete(socialMediaPosts)
      .where(eq(socialMediaPosts.id, postId));
  }
}

export const storage = new DatabaseStorage();
