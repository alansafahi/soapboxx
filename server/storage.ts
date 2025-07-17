import {
  users,
  notifications,
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
  soapEntries,
  soapComments,
  soapBookmarks,
  reactions,
  prayerRequests,
  prayerResponses,
  prayerBookmarks,
  prayerFollowUps,
  prayerUpdates,
  prayerAssignments,
  prayerCircles,
  prayerCircleMembers,
  prayerCircleReports,
  prayerCircleUpdates,
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
  galleryImages,
  galleryImageLikes,
  galleryImageComments,
  galleryImageSaves,
  dailyVerses,
  userBibleStreaks,
  userBibleReadings,
  // Bible cache tables eliminated
  volunteers,
  contacts,
  invitations,
  volunteerRoles,
  volunteerOpportunities,
  videoContent,
  volunteerRegistrations,
  volunteerHours,
  volunteerAwards,
  volunteerCertifications,
  userTourCompletions,
  sermonDrafts,
  answeredPrayerTestimonies,
  answeredPrayerReactions,
  answeredPrayerComments,
  prayerReactions,
  prayerBadges,
  userBadgeProgress,
  memberCommunications,
  churchFeatureSettings,
  defaultFeatureSettings,
  type User,
  type UpsertUser,
  type ChurchFeatureSetting,
  type InsertChurchFeatureSetting,
  type DefaultFeatureSetting,
  type InsertDefaultFeatureSetting,
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
  type Contact,
  type InsertContact,
  type Invitation,
  type InsertInvitation,
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
  type PrayerCircle,
  type InsertPrayerCircle,
  type PrayerCircleMember,
  type InsertPrayerCircleMember,
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
  type GalleryImage,
  type InsertGalleryImage,
  type GalleryImageLike,
  type InsertGalleryImageLike,
  type GalleryImageComment,
  type InsertGalleryImageComment,
  type GalleryImageSave,
  type InsertGalleryImageSave,

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
  type VideoContentDB,
  type InsertVideoContentDB,
  type Notification,
  type InsertNotification,
  type Reaction,
  type InsertReaction,
  communicationTemplates,
  userPreferences,
  type UserPreferences,
  type InsertUserPreferences,
  notificationPreferences,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  aiScriptureHistory,
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, and, sql, count, asc, or, ilike, isNotNull, gte, lte, inArray, isNull, gt, ne } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  completeOnboarding(userId: string, onboardingData: any): Promise<void>;
  
  // User preferences operations
  getUserPreferences(userId: string): Promise<any>;
  updateUserPreferences(userId: string, preferences: any): Promise<any>;
  getUserNotificationPreferences(userId: string): Promise<any>;
  updateUserNotificationPreferences(userId: string, preferences: any): Promise<any>;
  
  // User statistics and achievements
  getUserStats(userId: string): Promise<any>;
  getUserAchievements(userId: string): Promise<any>;
  
  // Email verification operations
  setEmailVerificationToken(userId: string, token: string): Promise<void>;
  getEmailVerificationToken(userId: string): Promise<string | null>;
  verifyEmailToken(token: string): Promise<User | null>;
  markEmailAsVerified(userId: string): Promise<void>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  verifyUserEmail(userId: string): Promise<void>;
  updateUserVerificationToken(userId: string, token: string): Promise<void>;
  updateUserLastLogin(userId: string): Promise<void>;
  
  // Password reset operations
  storePasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  verifyPasswordResetToken(token: string): Promise<User | undefined>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  clearPasswordResetToken(userId: string): Promise<void>;
  
  // Tour completion operations
  getTourCompletion(userId: string, tourType: string): Promise<any>;
  saveTourCompletion(data: any): Promise<any>;
  updateTourCompletion(userId: string, tourType: string, data: any): Promise<any>;
  
  // Bible verse operations now handled by API.Bible + ChatGPT fallback only
  
  // Church operations
  getChurches(): Promise<Church[]>;
  getNearbyChurches(lat?: number, lng?: number, limit?: number): Promise<Church[]>;
  getChurch(id: number): Promise<Church | undefined>;
  getChurchByAdminEmail(email: string): Promise<Church | undefined>;
  createChurch(church: InsertChurch): Promise<Church>;
  updateChurch(id: number, updates: Partial<Church>): Promise<Church>;
  deleteChurch(id: number): Promise<void>;
  getUserCreatedChurches(userId: string): Promise<Church[]>;
  searchChurches(params: { denomination?: string; location?: string; size?: string; proximity?: number; limit?: number }): Promise<any[]>;
  getChurchDenominations(): Promise<string[]>;
  
  // Church verification operations
  getChurchesByStatus(status?: string): Promise<Church[]>;
  approveChurch(churchId: number, approvedBy: string): Promise<void>;
  rejectChurch(churchId: number, reason: string, rejectedBy: string): Promise<void>;
  
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
  // createEventNotification method removed - use createNotification instead
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

  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  
  // Discussion operations
  getDiscussions(churchId?: number): Promise<Discussion[]>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  likeDiscussion(discussionId: number, userId: string): Promise<void>;
  unlikeDiscussion(discussionId: number, userId: string): Promise<void>;
  getUserDiscussionLike(discussionId: number, userId: string): Promise<boolean>;
  
  // Pinned posts operations for pastors/admins
  pinDiscussion(discussionId: number, pinData: {
    pinnedBy: string;
    pinnedAt: Date;
    pinnedUntil?: Date | null;
    pinCategory?: string;
  }): Promise<Discussion>;
  unpinDiscussion(discussionId: number): Promise<Discussion>;
  getPinnedDiscussions(churchId?: number | null): Promise<Discussion[]>;
  
  // Comment operations
  getDiscussionComments(discussionId: number): Promise<DiscussionComment[]>;
  createDiscussionComment(comment: InsertDiscussionComment): Promise<DiscussionComment>;
  
  // Prayer request operations
  getPrayerRequests(churchId?: number): Promise<PrayerRequest[]>;
  getPrayerRequest(id: number): Promise<PrayerRequest | undefined>;
  createPrayerRequest(prayer: InsertPrayerRequest): Promise<PrayerRequest>;
  deletePrayerRequest(prayerId: number, userId: string): Promise<void>;
  updatePrayerRequestAttachment(prayerId: number, userId: string, attachmentUrl: string): Promise<void>;
  prayForRequest(response: InsertPrayerResponse): Promise<PrayerResponse>;
  getUserPrayerResponse(prayerRequestId: number, userId: string): Promise<PrayerResponse | undefined>;
  removePrayerResponse(prayerRequestId: number, userId: string): Promise<void>;
  getPrayerSupportMessages(prayerRequestId: number): Promise<any[]>;
  markPrayerAnswered(id: number): Promise<void>;
  updatePrayerStatus(prayerId: number, status: string, moderationNotes?: string): Promise<PrayerRequest>;
  createPrayerAssignment(assignment: InsertPrayerAssignment): Promise<PrayerAssignment>;
  createPrayerFollowUp(followUp: InsertPrayerFollowUp): Promise<PrayerFollowUp>;
  getAllUsers(): Promise<User[]>;
  
  // Prayer circle operations
  getPrayerCircles(churchId?: number): Promise<PrayerCircle[]>;
  getPrayerCircle(id: number): Promise<PrayerCircle | undefined>;
  createPrayerCircle(circle: InsertPrayerCircle): Promise<PrayerCircle>;
  updatePrayerCircle(id: number, updates: Partial<PrayerCircle>): Promise<PrayerCircle>;
  deletePrayerCircle(id: number): Promise<void>;
  getUserCreatedCircles(userId: string, independentOnly?: boolean): Promise<PrayerCircle[]>;
  
  // Prayer circle membership operations
  joinPrayerCircle(membership: InsertPrayerCircleMember): Promise<PrayerCircleMember>;
  leavePrayerCircle(circleId: number, userId: string): Promise<void>;
  getPrayerCircleMembers(circleId: number): Promise<(PrayerCircleMember & { user: User })[]>;
  getUserPrayerCircles(userId: string): Promise<(PrayerCircleMember & { prayerCircle: PrayerCircle })[]>;
  isUserInPrayerCircle(circleId: number, userId: string): Promise<boolean>;
  
  // Prayer reaction operations
  togglePrayerReaction(prayerRequestId: number, userId: string, reactionType: string): Promise<{ reacted: boolean }>;
  getPrayerReactions(prayerRequestId: number): Promise<Record<string, number>>;
  getUserPrayerReactions(prayerRequestId: number, userId: string): Promise<string[]>;
  
  // Prayer bookmark operations
  togglePrayerBookmark(prayerId: number, userId: string): Promise<{ bookmarked: boolean }>;
  getUserBookmarkedPrayers(userId: string, churchId?: number): Promise<PrayerRequest[]>;
  
  // Template management operations
  getCommunicationTemplates(userId: string, churchId?: number): Promise<any[]>;
  createCommunicationTemplate(template: any): Promise<any>;
  updateCommunicationTemplate(templateId: number, updates: any): Promise<any>;
  deleteCommunicationTemplate(templateId: number): Promise<void>;
  
  // Communication history operations
  getCommunicationHistory(churchId: number): Promise<any[]>;
  createCommunicationRecord(record: {
    churchId: number;
    sentBy: string;
    subject: string;
    content: string;
    communicationType: string;
    direction: string;
    sentAt: Date;
    deliveryStatus: string;
    recipientCount?: number;
  }): Promise<any>;

  // Church feature toggle operations
  getChurchFeatureSettings(churchId: number): Promise<ChurchFeatureSetting[]>;
  getChurchFeatureSettingById(featureId: number): Promise<ChurchFeatureSetting | null>;
  updateChurchFeatureSetting(setting: InsertChurchFeatureSetting): Promise<ChurchFeatureSetting>;
  enableChurchFeature(churchId: number, category: string, featureName: string, enabledBy: string, configuration?: any): Promise<ChurchFeatureSetting>;
  disableChurchFeature(churchId: number, category: string, featureName: string): Promise<void>;
  isFeatureEnabledForChurch(churchId: number, category: string, featureName: string): Promise<boolean>;
  getDefaultFeatureSettings(churchSize: string): Promise<DefaultFeatureSetting[]>;
  createDefaultFeatureSetting(setting: InsertDefaultFeatureSetting): Promise<DefaultFeatureSetting>;
  initializeChurchFeatures(churchId: number, churchSize: string): Promise<void>;
  
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
  
  // Messaging system operations
  getUnreadMessageCount(userId: string): Promise<number>;
  getUserConversations(userId: string): Promise<any[]>;
  markConversationAsRead(conversationId: string, userId: string): Promise<void>;
  getUserContacts(userId: string): Promise<any[]>;
  ensureConversationParticipant(conversationId: number, userId: string): Promise<void>;
  
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

  // SOAP operations
  addSoapReaction(soapId: number, userId: string, reactionType: string, emoji: string): Promise<void>;
  saveSoapEntry(soapId: number, userId: string): Promise<void>;
  getSavedSoapEntries(userId: string): Promise<any[]>;
  removeSavedSoapEntry(soapId: number, userId: string): Promise<void>;
  isSoapEntrySaved(soapId: number, userId: string): Promise<boolean>;
  createSoapEntry(entry: any): Promise<any>;
  
  // AI Scripture History operations for preventing repetition
  getRecentUserScriptures(userId: string, days?: number): Promise<string[]>;
  recordUserScripture(userId: string, scriptureReference: string): Promise<void>;
  cleanupOldScriptureHistory(days?: number): Promise<void>;
  createLeaderboard(leaderboard: InsertLeaderboard): Promise<Leaderboard>;
  updateLeaderboardEntries(leaderboardId: number): Promise<void>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  awardAchievement(userId: string, achievementId: number): Promise<UserAchievement>;
  getUserStreaks(userId: string): Promise<Streak[]>;
  updateStreak(userId: string, type: string): Promise<Streak>;
  getChallenges(churchId?: number): Promise<Challenge[]>;
  joinChallenge(userId: string, challengeId: number): Promise<ChallengeParticipant>;
  updateChallengeProgress(userId: string, challengeId: number, progress: number): Promise<ChallengeParticipant>;

  // Prayer Analytics & Badges methods
  getBadgeProgress(userId: string): Promise<any[]>;
  getAnsweredPrayers(userId?: string, churchId?: number): Promise<any[]>;
  createAnsweredPrayerTestimony(data: any): Promise<any>;
  reactToAnsweredPrayer(testimonyId: number, userId: string, reactionType: string): Promise<void>;
  getPrayerTrends(filters: any, churchId?: number): Promise<any[]>;
  updateUserProgress(userId: string, activityType: string, entityId?: number): Promise<void>;
  initializeBadges(): Promise<void>;
  
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
  getRecentMoodCheckIns(limit?: number): Promise<any[]>; // For horizontal strip display
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
  
  // Contacts and invitations operations
  getUserContacts(userId: string): Promise<Contact[]>;
  addContact(contact: InsertContact): Promise<Contact>;
  updateContactStatus(contactId: number, status: string): Promise<Contact>;
  removeContact(contactId: number): Promise<void>;
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getUserInvitations(userId: string): Promise<Invitation[]>;
  updateInvitationStatus(inviteCode: string, status: string): Promise<Invitation>;
  getPendingInvitations(userId: string): Promise<Invitation[]>;
  
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
  // Bible storage eliminated - using API.Bible + ChatGPT fallback only
  
  // Journey Management
  getUserJourneyPreferences(userId: string): Promise<UserJourneyPreferences | undefined>;
  updateUserJourneyPreferences(userId: string, preferences: Partial<InsertUserJourneyPreferences>): Promise<UserJourneyPreferences>;
  getAvailableJourneyTypes(): Promise<{type: string, name: string, description: string}[]>;
  getSeriesByType(journeyType: string): Promise<{name: string, description: string, totalVerses: number}[]>;
  switchUserJourney(userId: string, journeyType: string, seriesName?: string): Promise<UserJourneyPreferences>;
  
  // Bible in a Day operations eliminated - using API.Bible + ChatGPT fallback only
  
  // Enhanced Social & Community Features
  getEnhancedCommunityFeed(userId: string, filters: any): Promise<any[]>;
  addReaction(reactionData: any): Promise<any>;
  removeReaction(userId: string, targetId: number, reactionType: string): Promise<void>;
  getReactionCount(targetType: string, targetId: number, reactionType: string): Promise<number>;
  getCommunityGroups(userId: string): Promise<any[]>;
  createCommunityGroup(groupData: any): Promise<any>;
  joinCommunityGroup(memberData: any): Promise<void>;
  leaveCommunityGroup(userId: string, groupId: number): Promise<void>;
  getUserFriends(userId: string): Promise<any[]>;
  sendFriendRequest(friendshipData: any): Promise<any>;
  respondToFriendRequest(friendshipId: number, status: string): Promise<any>;
  createCommunityReflection(reflectionData: any): Promise<any>;
  getCommunityReflections(filters: any): Promise<any[]>;

  // S.O.A.P. Entry Management
  createSoapEntry(entry: InsertSoapEntry): Promise<SoapEntry>;
  getSoapEntries(userId: string, options?: { churchId?: number; isPublic?: boolean; limit?: number; offset?: number }): Promise<SoapEntry[]>;
  getSoapEntry(id: number): Promise<SoapEntry | undefined>;
  updateSoapEntry(id: number, updates: Partial<SoapEntry>): Promise<SoapEntry>;
  deleteSoapEntry(id: number): Promise<void>;
  getUserSoapStreak(userId: string): Promise<number>;
  getPublicSoapEntries(churchId?: number, limit?: number, offset?: number, excludeUserId?: string): Promise<any[]>;
  featureSoapEntry(id: number, featuredBy: string): Promise<SoapEntry>;
  unfeatureSoapEntry(id: number): Promise<SoapEntry>;
  getChurchPastors(churchId: number): Promise<{ id: string; firstName: string; lastName: string; email: string; role: string }[]>;
  getSoapEntriesSharedWithPastor(pastorId: string, churchId: number): Promise<SoapEntry[]>;
  
  // S.O.A.P. Bookmark Management
  saveSoapEntry(soapId: number, userId: string): Promise<void>;
  getSavedSoapEntries(userId: string): Promise<any[]>;
  removeSavedSoapEntry(soapId: number, userId: string): Promise<void>;
  isSoapEntrySaved(soapId: number, userId: string): Promise<boolean>;

  // Admin Analytics Methods
  getUserRole(userId: string): Promise<string>;
  getChurchMemberCheckIns(churchId: number, startDate: Date): Promise<any>;
  getDevotionAnalytics(churchId: number, startDate: Date): Promise<any>;

  // Gallery operations
  getGalleryImages(churchId?: number, filters?: { 
    collection?: string; 
    tags?: string[]; 
    uploadedBy?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<GalleryImage[]>;
  getGalleryImage(imageId: number): Promise<GalleryImage | undefined>;
  uploadGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(imageId: number, updates: Partial<GalleryImage>): Promise<GalleryImage>;
  deleteGalleryImage(imageId: number, userId: string): Promise<void>;
  
  // Gallery interactions
  likeGalleryImage(userId: string, imageId: number): Promise<GalleryImageLike>;
  unlikeGalleryImage(userId: string, imageId: number): Promise<void>;
  isGalleryImageLiked(userId: string, imageId: number): Promise<boolean>;
  getGalleryImageLikes(imageId: number): Promise<GalleryImageLike[]>;
  
  saveGalleryImage(userId: string, imageId: number): Promise<GalleryImageSave>;
  unsaveGalleryImage(userId: string, imageId: number): Promise<void>;
  isGalleryImageSaved(userId: string, imageId: number): Promise<boolean>;
  getUserSavedGalleryImages(userId: string): Promise<GalleryImage[]>;
  
  // Gallery comments
  addGalleryImageComment(comment: InsertGalleryImageComment): Promise<GalleryImageComment>;
  getGalleryImageComments(imageId: number): Promise<GalleryImageComment[]>;
  updateGalleryImageComment(commentId: number, content: string): Promise<GalleryImageComment>;
  deleteGalleryImageComment(commentId: number, userId: string): Promise<void>;
  
  // Gallery collections
  getGalleryCollections(churchId?: number): Promise<{ collection: string; count: number; thumbnail?: string }[]>;
  getUserGalleryUploads(userId: string): Promise<GalleryImage[]>;
  getAtRiskMembers(churchId: number, thresholdDate: Date): Promise<any[]>;
  getEngagementOverview(churchId: number): Promise<any>;

  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  createNotification(notification: InsertNotification): Promise<Notification>;

  // Content expiration privacy operations
  processExpiredContent(): Promise<{ expiredCount: number; processedTypes: string[] }>;
  getExpiringContent(beforeDate: Date): Promise<{ discussions: any[]; prayerRequests: any[]; soapEntries: any[] }>;
  markContentAsExpired(contentType: 'discussion' | 'prayer' | 'soap', contentId: number): Promise<void>;
  restoreExpiredContent(contentType: 'discussion' | 'prayer' | 'soap', contentId: number): Promise<void>;
  getExpiredContentSummary(churchId?: number): Promise<{ totalExpired: number; byType: { [key: string]: number } }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
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
        mobileNumber: phoneNumber,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    try {
      
      // Build update object with proper field validation
      const updateData: any = {};
      
      // Map frontend field names to database schema properly
      if (profileData.firstName !== undefined) updateData.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) updateData.lastName = profileData.lastName;
      if (profileData.email !== undefined) updateData.email = profileData.email;
      if (profileData.mobileNumber !== undefined) updateData.mobileNumber = profileData.mobileNumber;
      if (profileData.address !== undefined) updateData.address = profileData.address;
      if (profileData.city !== undefined) updateData.city = profileData.city;
      if (profileData.state !== undefined) updateData.state = profileData.state;
      if (profileData.zipCode !== undefined) updateData.zipCode = profileData.zipCode;
      if (profileData.country !== undefined) updateData.country = profileData.country;
      if (profileData.bio !== undefined) updateData.bio = profileData.bio;
      if (profileData.profileImageUrl !== undefined) updateData.profileImageUrl = profileData.profileImageUrl;
      if (profileData.denomination !== undefined) updateData.denomination = profileData.denomination;
      if (profileData.interests !== undefined) updateData.interests = profileData.interests;
      
      // Always update timestamp
      updateData.updatedAt = new Date();

      
      const [user] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
        
      if (!user) {
        throw new Error(`User not found with ID: ${userId}`);
      }
      
      return user;
    } catch (error) {
      throw error;
    }
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

  // User preferences operations
  async getUserPreferences(userId: string): Promise<any> {
    
    try {
      const [prefs] = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));
      
      if (!prefs) {
        // Return default preferences if none exist
        const defaultPrefs = {
          language: "en",
          timezone: "UTC",
          theme: "light",
          fontSize: "medium",
          readingSpeed: "normal",
          audioEnabled: true,
          audioSpeed: 1.0,
          familyMode: false,
          offlineMode: false,
          syncEnabled: true,
          notificationsEnabled: true,
        };
        
        // Create default preferences for the user
        const [newPrefs] = await db
          .insert(userPreferences)
          .values({
            userId,
            ...defaultPrefs,
          })
          .returning();
        
        return newPrefs;
      }
      
      return prefs;
    } catch (error) {
      throw error;
    }
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<any> {
    
    try {
      // Map frontend field names to database column names
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      // Map each field correctly
      if (preferences.language !== undefined) updateData.language = preferences.language;
      if (preferences.timezone !== undefined) updateData.timezone = preferences.timezone;
      if (preferences.theme !== undefined) updateData.theme = preferences.theme;
      if (preferences.fontSize !== undefined) updateData.fontSize = preferences.fontSize;
      if (preferences.readingSpeed !== undefined) updateData.readingSpeed = preferences.readingSpeed;
      if (preferences.audioEnabled !== undefined) updateData.audioEnabled = preferences.audioEnabled;
      if (preferences.audioSpeed !== undefined) updateData.audioSpeed = preferences.audioSpeed;
      if (preferences.familyMode !== undefined) updateData.familyMode = preferences.familyMode;
      if (preferences.offlineMode !== undefined) updateData.offlineMode = preferences.offlineMode;
      if (preferences.syncEnabled !== undefined) updateData.syncEnabled = preferences.syncEnabled;
      if (preferences.notificationsEnabled !== undefined) updateData.notificationsEnabled = preferences.notificationsEnabled;
      
      const [updatedPrefs] = await db
        .update(userPreferences)
        .set(updateData)
        .where(eq(userPreferences.userId, userId))
        .returning();
      
      if (!updatedPrefs) {
        // If no existing preferences, create them with defaults
        const defaultPrefs = {
          language: 'en',
          timezone: 'UTC',
          theme: 'light',
          fontSize: 'medium',
          readingSpeed: 'normal',
          audioEnabled: true,
          audioSpeed: 1.0,
          familyMode: false,
          offlineMode: false,
          syncEnabled: true,
          notificationsEnabled: true,
        };
        
        const [newPrefs] = await db
          .insert(userPreferences)
          .values({
            userId,
            ...defaultPrefs,
            ...updateData,
          })
          .returning();
        
        return newPrefs;
      }
      
      return updatedPrefs;
    } catch (error) {
      throw error;
    }
  }

  async getUserNotificationPreferences(userId: string): Promise<any> {
    
    try {
      const [prefs] = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId));
      
      if (!prefs) {
        // Return default notification preferences if none exist
        const defaultPrefs = {
          dailyReading: true,
          prayerReminders: true,
          communityUpdates: true,
          eventReminders: true,
          friendActivity: false,
          dailyReadingTime: "08:00",
          prayerTimes: ["06:00", "12:00", "18:00"],
          quietHours: {
            enabled: false,
            start: "22:00",
            end: "07:00",
          },
          weekendPreferences: {
            differentSchedule: false,
            weekendReadingTime: "09:00",
          },
        };
        
        // Create default notification preferences for the user
        const [newPrefs] = await db
          .insert(notificationPreferences)
          .values({
            userId,
            ...defaultPrefs,
          })
          .returning();
        
        return newPrefs;
      }
      
      return prefs;
    } catch (error) {
      throw error;
    }
  }

  async updateUserNotificationPreferences(userId: string, preferences: any): Promise<any> {
    
    try {
      // Map frontend field names to database column names
      const updateData: any = {
        updatedAt: new Date(),
      };
      
      // Map each field correctly
      if (preferences.dailyReading !== undefined) updateData.dailyReading = preferences.dailyReading;
      if (preferences.prayerReminders !== undefined) updateData.prayerReminders = preferences.prayerReminders;
      if (preferences.communityUpdates !== undefined) updateData.communityUpdates = preferences.communityUpdates;
      if (preferences.eventReminders !== undefined) updateData.eventReminders = preferences.eventReminders;
      if (preferences.friendActivity !== undefined) updateData.friendActivity = preferences.friendActivity;
      if (preferences.dailyReadingTime !== undefined) updateData.dailyReadingTime = preferences.dailyReadingTime;
      if (preferences.prayerTimes !== undefined) updateData.prayerTimes = preferences.prayerTimes;
      if (preferences.quietHours !== undefined) updateData.quietHours = preferences.quietHours;
      if (preferences.weekendPreferences !== undefined) updateData.weekendPreferences = preferences.weekendPreferences;
      
      const [updatedPrefs] = await db
        .update(notificationPreferences)
        .set(updateData)
        .where(eq(notificationPreferences.userId, userId))
        .returning();
      
      if (!updatedPrefs) {
        // If no existing preferences, create them with defaults
        const defaultPrefs = {
          dailyReading: true,
          prayerReminders: true,
          communityUpdates: true,
          eventReminders: true,
          friendActivity: false,
          dailyReadingTime: "08:00",
          prayerTimes: ["06:00", "12:00", "18:00"],
          quietHours: {
            enabled: false,
            start: "22:00",
            end: "07:00",
          },
          weekendPreferences: {
            differentSchedule: false,
            weekendReadingTime: "09:00",
          },
        };
        
        const [newPrefs] = await db
          .insert(notificationPreferences)
          .values({
            userId,
            ...defaultPrefs,
            ...updateData,
          })
          .returning();
        
        return newPrefs;
      }
      
      return updatedPrefs;
    } catch (error) {
      throw error;
    }
  }

  // User statistics operations
  async getUserStats(userId: string): Promise<any> {
    
    try {
      // Count prayers offered (prayer requests created by user)
      const prayerCount = await db
        .select({ count: count() })
        .from(prayerRequests)
        .where(eq(prayerRequests.userId, userId));

      // Count discussions created by user
      const discussionCount = await db
        .select({ count: count() })
        .from(discussions)
        .where(eq(discussions.userId, userId));

      // Count events attended (RSVPs)
      const attendanceCount = await db
        .select({ count: count() })
        .from(eventRsvps)
        .where(and(
          eq(eventRsvps.userId, userId),
          eq(eventRsvps.status, 'attending')
        ));

      // Count user connections/contacts
      const connectionCount = await db
        .select({ count: count() })
        .from(contacts)
        .where(and(
          eq(contacts.userId, userId),
          eq(contacts.status, 'connected')
        ));

      // Count SOAP entries (inspirations read)
      const soapCount = await db
        .select({ count: count() })
        .from(soapEntries)
        .where(eq(soapEntries.userId, userId));

      // Count prayer reactions (prayers offered to others)
      const prayerReactionCount = await db
        .select({ count: count() })
        .from(prayerReactions)
        .where(eq(prayerReactions.userId, userId));

      const stats = {
        prayerCount: prayerCount[0]?.count || 0,
        discussionCount: discussionCount[0]?.count || 0,
        attendanceCount: attendanceCount[0]?.count || 0,
        connectionCount: connectionCount[0]?.count || 0,
        inspirationsRead: soapCount[0]?.count || 0,
        prayersOffered: prayerReactionCount[0]?.count || 0,
      };

      return stats;
    } catch (error) {
      throw error;
    }
  }

  async getUserAchievements(userId: string): Promise<any> {
    
    try {
      // Get user badge progress/achievements
      const achievements = await db
        .select({
          id: userBadgeProgress.id,
          badgeId: userBadgeProgress.badgeId,
          currentProgress: userBadgeProgress.currentProgress,
          maxProgress: userBadgeProgress.maxProgress,
          isUnlocked: userBadgeProgress.isUnlocked,
          unlockedAt: userBadgeProgress.unlockedAt,
          badgeName: prayerBadges.name,
          badgeDescription: prayerBadges.description,
          badgeIcon: prayerBadges.icon,
          badgeColor: prayerBadges.color,
          badgeCategory: prayerBadges.category,
        })
        .from(userBadgeProgress)
        .leftJoin(prayerBadges, eq(userBadgeProgress.badgeId, prayerBadges.id))
        .where(and(
          eq(userBadgeProgress.userId, userId),
          eq(userBadgeProgress.isUnlocked, true)
        ))
        .orderBy(desc(userBadgeProgress.unlockedAt));

      // Transform achievements for frontend
      const transformedAchievements = achievements.map(achievement => ({
        id: achievement.id,
        achievementType: achievement.badgeName,
        achievementLevel: Math.ceil((achievement.currentProgress / achievement.maxProgress) * 100),
        description: achievement.badgeDescription,
        icon: achievement.badgeIcon,
        color: achievement.badgeColor,
        category: achievement.badgeCategory,
        unlockedAt: achievement.unlockedAt,
      }));

      return transformedAchievements;
    } catch (error) {
      // Return empty array if no achievements table exists yet
      return [];
    }
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

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));
    return user;
  }

  async verifyUserEmail(userId: string): Promise<void> {
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

  async updateUserVerificationToken(userId: string, token: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        emailVerificationToken: token,
        emailVerificationSentAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Password reset operations
  async storePasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetExpires: expires,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async verifyPasswordResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.passwordResetToken, token));
    
    if (!user) return undefined;
    
    // Check if token is not expired
    if (!user.passwordResetExpires || new Date() > user.passwordResetExpires) {
      return undefined; // Token expired
    }
    
    return user;
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async clearPasswordResetToken(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        passwordResetToken: null,
        passwordResetExpires: null,
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

  async searchChurches(params: { denomination?: string; location?: string; churchName?: string; size?: string; proximity?: number; limit?: number }): Promise<any[]> {
    try {
      let whereConditions = [
        eq(churches.isActive, true),
        eq(churches.isDemo, false), // Only show production churches, not demo churches
        eq(churches.verificationStatus, 'approved') // Only show approved churches
      ];
      
      // Filter by denomination (only if not "all")
      if (params.denomination && params.denomination !== "all") {
        whereConditions.push(eq(churches.denomination, params.denomination));
      }
      
      // Filter by church name
      if (params.churchName && params.churchName.trim()) {
        const nameTerm = `%${params.churchName.trim()}%`;
        whereConditions.push(
          sql`${churches.name} ILIKE ${nameTerm}`
        );
      }
      
      // Filter by location (search in city, state, or zip code) - only if no specific denomination filter
      if (params.location && params.location.trim() && (!params.denomination || params.denomination === "all")) {
        const locationTerm = `%${params.location.trim()}%`;
        whereConditions.push(
          sql`(${churches.city} ILIKE ${locationTerm} OR ${churches.state} ILIKE ${locationTerm} OR ${churches.zipCode} ILIKE ${locationTerm})`
        );
      }
      
      // Optimized single query with left join for member counts
      const results = await db
        .select({
          id: churches.id,
          name: churches.name,
          denomination: churches.denomination,
          description: churches.description,
          bio: churches.bio,
          address: churches.address,
          city: churches.city,
          state: churches.state,
          zipCode: churches.zipCode,
          website: churches.website,
          phone: churches.phone,
          email: churches.email,
          logoUrl: churches.logoUrl,
          socialLinks: churches.socialLinks,
          communityTags: churches.communityTags,
          latitude: churches.latitude,
          longitude: churches.longitude,
          rating: churches.rating,
          memberCount: churches.memberCount,
          isActive: churches.isActive,
          isClaimed: churches.isClaimed,
          adminEmail: churches.adminEmail,
          isDemo: churches.isDemo,
          createdAt: churches.createdAt,
          updatedAt: churches.updatedAt,
          actualMemberCount: sql<number>`COALESCE(COUNT(${userChurches.churchId}), 0)::int`,
          distance: sql<number>`0` // Placeholder for distance
        })
        .from(churches)
        .leftJoin(userChurches, and(
          eq(userChurches.churchId, churches.id),
          eq(userChurches.isActive, true)
        ))
        .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
        .groupBy(churches.id)
        .orderBy(asc(churches.name))
        .limit(params.limit || 2000);
      
      // Filter by size if specified (exclude "all" value)
      let filteredResults = results;
      if (params.size && params.size !== "all") {
        filteredResults = results.filter(church => {
          const memberCount = church.memberCount || 0;
          switch (params.size) {
            case 'micro': return memberCount >= 1 && memberCount <= 50;
            case 'small': return memberCount >= 51 && memberCount <= 100;
            case 'medium': return memberCount >= 101 && memberCount <= 250;
            case 'large': return memberCount >= 251 && memberCount <= 500;
            case 'very-large': return memberCount >= 501 && memberCount <= 1000;
            case 'mega': return memberCount >= 1001 && memberCount <= 2000;
            case 'giga': return memberCount >= 2001 && memberCount <= 10000;
            case 'meta': return memberCount >= 10001;
            default: return true;
          }
        });
      }
      
      // Sort by proximity (using memberCount as proxy for now, would use actual distance in production)
      filteredResults.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
      
      return filteredResults;
    } catch (error) {
      
      // Fallback to simple query without member counts
      try {
        const simpleResults = await db
          .select()
          .from(churches)
          .where(eq(churches.isActive, true))
          .limit(params.limit || 100);
          
        return simpleResults.map(church => ({
          ...church,
          memberCount: 0,
          distance: 0
        }));
      } catch (fallbackError) {
        return [];
      }
    }
  }

  async getChurchDenominations(): Promise<string[]> {
    const result = await db
      .select({ denomination: churches.denomination })
      .from(churches)
      .where(and(
        eq(churches.isActive, true),
        isNotNull(churches.denomination)
      ))
      .groupBy(churches.denomination)
      .orderBy(asc(churches.denomination));
    
    return result
      .map(row => row.denomination)
      .filter(denomination => denomination !== null && denomination.trim() !== '') as string[];
  }

  // Church verification operations
  async getChurchesByStatus(status?: string): Promise<any[]> {
    let whereCondition;
    
    if (status === 'pending') {
      whereCondition = eq(churches.verificationStatus, 'pending');
    } else if (status === 'approved') {
      whereCondition = eq(churches.verificationStatus, 'approved');
    } else if (status === 'rejected') {
      whereCondition = eq(churches.verificationStatus, 'rejected');
    } else if (status === 'suspended') {
      whereCondition = eq(churches.verificationStatus, 'suspended');
    } else {
      // Return all churches if no status filter
      whereCondition = undefined;
    }
    
    const query = db
      .select({
        id: churches.id,
        name: churches.name,
        denomination: churches.denomination,
        description: churches.description,
        bio: churches.bio,
        address: churches.address,
        city: churches.city,
        state: churches.state,
        zipCode: churches.zipCode,
        phone: churches.phone,
        email: churches.email,
        website: churches.website,
        logoUrl: churches.logoUrl,
        size: churches.size,
        hoursOfOperation: churches.hoursOfOperation,
        socialLinks: churches.socialLinks,
        communityTags: churches.communityTags,
        latitude: churches.latitude,
        longitude: churches.longitude,
        rating: churches.rating,
        memberCount: churches.memberCount,
        isActive: churches.isActive,
        isClaimed: churches.isClaimed,
        adminEmail: churches.adminEmail,
        isDemo: churches.isDemo,
        status: churches.verificationStatus, // Map verificationStatus to status for frontend
        verifiedAt: churches.verifiedAt,
        verifiedBy: churches.verifiedBy,
        rejectionReason: churches.rejectionReason,
        createdAt: churches.createdAt,
        updatedAt: churches.updatedAt,
      })
      .from(churches)
      .orderBy(desc(churches.createdAt));
    
    if (whereCondition) {
      query.where(whereCondition);
    }
    
    return await query;
  }

  async approveChurch(churchId: number, approvedBy: string): Promise<void> {
    await db
      .update(churches)
      .set({
        verificationStatus: 'approved',
        verifiedBy: approvedBy,
        verifiedAt: new Date(),
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(churches.id, churchId));
  }

  async rejectChurch(churchId: number, reason: string, rejectedBy: string): Promise<void> {
    await db
      .update(churches)
      .set({
        verificationStatus: 'rejected',
        verifiedBy: rejectedBy,
        rejectionReason: reason,
        updatedAt: new Date()
      })
      .where(eq(churches.id, churchId));
  }

  async suspendChurch(churchId: number, reason: string, suspendedBy: string): Promise<void> {
    await db
      .update(churches)
      .set({
        verificationStatus: 'suspended',
        verifiedBy: suspendedBy,
        rejectionReason: reason,
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(churches.id, churchId));
  }

  async getChurch(id: number): Promise<Church | undefined> {
    const [church] = await db.select().from(churches).where(eq(churches.id, id));
    return church;
  }

  async getChurchByAdminEmail(email: string): Promise<Church | undefined> {
    const [church] = await db
      .select()
      .from(churches)
      .where(eq(churches.adminEmail, email));
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

  async deleteChurch(id: number): Promise<void> {
    // Soft delete by marking as inactive
    await db
      .update(churches)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(churches.id, id));
  }

  async getUserCreatedChurches(userId: string): Promise<Church[]> {
    return await db
      .select({
        id: churches.id,
        name: churches.name,
        denomination: churches.denomination,
        address: churches.address,
        city: churches.city,
        state: churches.state,
        country: churches.country,
        zipCode: churches.zipCode,
        phone: churches.phone,
        email: churches.email,
        website: churches.website,
        description: churches.description,
        imageUrl: churches.imageUrl,
        capacity: churches.capacity,
        status: churches.status,
        isActive: churches.isActive,
        createdAt: churches.createdAt,
        updatedAt: churches.updatedAt,
        adminEmail: churches.adminEmail,
      })
      .from(churches)
      .innerJoin(userChurches, eq(churches.id, userChurches.churchId))
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.role, 'church_admin'),
        eq(churches.isActive, true),
        eq(userChurches.isActive, true)
      ))
      .orderBy(desc(churches.createdAt));
  }

  async getUserChurch(userId: string): Promise<(UserChurch & { role: string }) | undefined> {
    const [userChurch] = await db
      .select()
      .from(userChurches)
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.isActive, true)
      ))
      .orderBy(userChurches.joinedAt); // Get the first church they joined
    
    if (!userChurch) {
      return undefined;
    }
    
    // Use the role field directly from user_churches table, fall back to roles table if needed
    let roleName = userChurch.role;
    
    if (!roleName && userChurch.roleId) {
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, userChurch.roleId));
      roleName = role?.name;
    }
    
    return {
      ...userChurch,
      role: roleName || 'member'
    };
  }

  async getUserChurchRole(userId: string, churchId: number): Promise<{ role: string } | undefined> {
    const [userChurch] = await db
      .select()
      .from(userChurches)
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.churchId, churchId),
        eq(userChurches.isActive, true)
      ));

    if (!userChurch) {
      return undefined;
    }

    // Use the role field directly from user_churches table, fall back to roles table if needed
    let roleName = userChurch.role;
    
    if (!roleName && userChurch.roleId) {
      const [role] = await db
        .select()
        .from(roles)
        .where(eq(roles.id, userChurch.roleId));
      roleName = role?.name;
    }
    
    return {
      role: roleName || 'member'
    };
  }

  async getChurchFeature(featureId: number): Promise<any> {
    const [feature] = await db
      .select()
      .from(churchFeatures)
      .where(eq(churchFeatures.id, featureId));
    return feature;
  }

  async updateChurchFeature(featureId: number, updates: any): Promise<any> {
    const [updatedFeature] = await db
      .update(churchFeatures)
      .set(updates)
      .where(eq(churchFeatures.id, featureId))
      .returning();
    return updatedFeature;
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

  // createEventNotification method removed - use createNotification instead

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
  async getDiscussions(limit?: number, offset?: number, churchId?: number, currentUserId?: string): Promise<any[]> {
    // Get regular discussions
    const discussionsQuery = db
      .select({
        id: discussions.id,
        authorId: discussions.authorId,
        churchId: discussions.churchId,
        title: discussions.title,
        content: discussions.content,
        category: discussions.category,
        isPublic: discussions.isPublic,
        audience: discussions.audience,
        mood: discussions.mood,
        suggestedVerses: discussions.suggestedVerses,
        attachedMedia: discussions.attachedMedia,
        linkedVerse: discussions.linkedVerse,
        isPinned: discussions.isPinned,
        pinnedBy: discussions.pinnedBy,
        pinnedAt: discussions.pinnedAt,
        pinnedUntil: discussions.pinnedUntil,
        pinCategory: discussions.pinCategory,
        likeCount: discussions.likeCount,
        commentCount: discussions.commentCount,
        createdAt: discussions.createdAt,
        updatedAt: discussions.updatedAt,
        type: sql<string>`'general'`,
        soapData: sql<any>`null`,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(discussions)
      .leftJoin(users, eq(discussions.authorId, users.id))
      .where(
        and(
          eq(discussions.isPublic, true),
          isNull(discussions.expiredAt), // Exclude expired content
          churchId ? eq(discussions.churchId, churchId) : undefined
        )
      )
      .orderBy(desc(discussions.createdAt));

    // Get public SOAP entries
    const soapQuery = db
      .select({
        id: soapEntries.id,
        authorId: soapEntries.userId,
        churchId: soapEntries.churchId,
        title: sql<string>`'S.O.A.P. Reflection'`,
        content: soapEntries.scripture,
        category: sql<string>`'soap_reflection'`,
        isPublic: soapEntries.isPublic,
        audience: sql<string>`'public'`,
        mood: soapEntries.moodTag,
        suggestedVerses: sql<any>`null`,
        attachedMedia: sql<any>`null`,
        linkedVerse: soapEntries.scriptureReference,
        isPinned: sql<boolean>`false`,
        pinnedBy: sql<string>`null`,
        pinnedAt: sql<any>`null`,
        pinnedUntil: sql<any>`null`,
        pinCategory: sql<string>`null`,
        likeCount: sql<number>`0`,
        commentCount: sql<number>`0`,
        createdAt: soapEntries.createdAt,
        updatedAt: soapEntries.updatedAt,
        type: sql<string>`'soap_reflection'`,
        soapData: {
          scripture: soapEntries.scripture,
          scriptureReference: soapEntries.scriptureReference,
          observation: soapEntries.observation,
          application: soapEntries.application,
          prayer: soapEntries.prayer,
        },
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(soapEntries)
      .leftJoin(users, eq(soapEntries.userId, users.id))
      .where(
        and(
          eq(soapEntries.isPublic, true),
          isNull(soapEntries.expiredAt), // Exclude expired content
          churchId ? eq(soapEntries.churchId, churchId) : undefined
        )
      )
      .orderBy(desc(soapEntries.createdAt));

    // Execute both queries
    const [discussionResults, soapResults] = await Promise.all([
      discussionsQuery,
      soapQuery
    ]);

    // Combine and sort by creation date
    const allPosts = [...discussionResults, ...soapResults]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Remove duplicates based on content similarity (for SOAP entries)
    const uniquePosts = allPosts.filter((post, index, array) => {
      // Keep all non-SOAP posts
      if (post.type !== 'soap_reflection') return true;
      
      // For SOAP posts, check if this is the first occurrence of this content
      const firstIndex = array.findIndex(p => 
        p.type === 'soap_reflection' && 
        p.soapData?.scripture === post.soapData?.scripture &&
        p.soapData?.observation === post.soapData?.observation &&
        p.authorId === post.authorId
      );
      return index === firstIndex;
    });
    
    // Apply pagination if specified
    const paginatedPosts = limit ? uniquePosts.slice(offset || 0, (offset || 0) + limit) : uniquePosts;
    
    // Add reaction data to each post
    const postsWithReactions = await Promise.all(
      paginatedPosts.map(async (post) => {
        // Get reaction data aggregated by type
        const reactionData = await db
          .select({
            reactionType: reactions.reactionType,
            emoji: reactions.emoji,
            count: sql<number>`cast(count(*) as integer)`,
          })
          .from(reactions)
          .where(
            and(
              eq(reactions.targetType, post.type === 'soap_reflection' ? 'soap' : 'discussion'),
              eq(reactions.targetId, post.id)
            )
          )
          .groupBy(reactions.reactionType, reactions.emoji);

        // Check if current user has prayed for this post
        let isPraying = false;
        if (currentUserId) {
          const userPrayerReaction = await db
            .select()
            .from(reactions)
            .where(
              and(
                eq(reactions.userId, currentUserId),
                eq(reactions.targetType, post.type === 'soap_reflection' ? 'soap' : 'discussion'),
                eq(reactions.targetId, post.id),
                eq(reactions.reactionType, 'pray')
              )
            )
            .limit(1);
          
          isPraying = userPrayerReaction.length > 0;
        }

        // Get prayer count specifically
        const prayCount = reactionData.find(r => r.reactionType === 'pray')?.count || 0;

        // Format reactions for frontend
        const formattedReactions = reactionData.map(r => ({
          type: r.reactionType,
          emoji: r.emoji,
          count: r.count,
          userReacted: false
        }));

        return {
          ...post,
          reactions: formattedReactions,
          prayCount,
          isPraying,
          _count: {
            likes: formattedReactions.reduce((sum, r) => sum + Number(r.count || 0), 0),
            comments: Number(post.commentCount || 0)
          }
        };
      })
    );

    return postsWithReactions;
  }

  // AI Scripture History operations for preventing repetition
  async getRecentUserScriptures(userId: string, days: number = 30): Promise<string[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentScriptures = await db
      .select({ scriptureReference: aiScriptureHistory.scriptureReference })
      .from(aiScriptureHistory)
      .where(
        and(
          eq(aiScriptureHistory.userId, userId),
          gte(aiScriptureHistory.generatedAt, cutoffDate)
        )
      )
      .orderBy(desc(aiScriptureHistory.generatedAt));
    
    return recentScriptures.map(s => s.scriptureReference);
  }

  async recordUserScripture(userId: string, scriptureReference: string): Promise<void> {
    try {
      await db.insert(aiScriptureHistory).values({
        userId,
        scriptureReference,
        generatedAt: new Date()
      }).onConflictDoUpdate({
        target: [aiScriptureHistory.userId, aiScriptureHistory.scriptureReference],
        set: {
          generatedAt: new Date()
        }
      });
    } catch (error) {
      // If there's a conflict (duplicate), that's fine - just update the timestamp
      await db
        .update(aiScriptureHistory)
        .set({ generatedAt: new Date() })
        .where(
          and(
            eq(aiScriptureHistory.userId, userId),
            eq(aiScriptureHistory.scriptureReference, scriptureReference)
          )
        );
    }
  }

  async cleanupOldScriptureHistory(days: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    await db
      .delete(aiScriptureHistory)
      .where(
        lte(aiScriptureHistory.generatedAt, cutoffDate)
      );
  }

  // SOAP operations
  async addSoapReaction(soapId: number, userId: string, reactionType: string, emoji: string): Promise<{ reacted: boolean; reactionCount: number }> {
    // Check if user already reacted with this type
    const existingReaction = await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.targetType, 'soap'),
          eq(reactions.targetId, soapId),
          eq(reactions.reactionType, reactionType)
        )
      )
      .limit(1);
    
    let reacted: boolean;
    if (existingReaction.length > 0) {
      // Remove existing reaction (toggle off)
      await db
        .delete(reactions)
        .where(
          and(
            eq(reactions.userId, userId),
            eq(reactions.targetType, 'soap'),
            eq(reactions.targetId, soapId),
            eq(reactions.reactionType, reactionType)
          )
        );
      reacted = false;
    } else {
      // Add new reaction (toggle on)
      await db.insert(reactions).values({
        userId,
        targetType: 'soap',
        targetId: soapId,
        reactionType,
        emoji,
        createdAt: new Date()
      });
      reacted = true;
    }
    
    // Get updated reaction count for this type
    const reactionCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reactions)
      .where(
        and(
          eq(reactions.targetType, 'soap'),
          eq(reactions.targetId, soapId),
          eq(reactions.reactionType, reactionType)
        )
      );
    
    const reactionCount = reactionCountResult[0]?.count || 0;
    
    return { reacted, reactionCount };
  }

  async saveSoapEntry(soapId: number, userId: string): Promise<void> {
    // Create a saved entry record using dedicated soapBookmarks table
    await db.insert(soapBookmarks).values({
      userId,
      soapId,
      bookmarkType: 'saved',
      createdAt: new Date()
    }).onConflictDoNothing();
  }

  async getSavedSoapEntries(userId: string): Promise<any[]> {
    // Get user's saved SOAP entries with full SOAP data and author information
    const savedEntries = await db
      .select({
        id: soapEntries.id,
        authorId: soapEntries.userId,
        churchId: soapEntries.churchId,
        title: sql<string>`'S.O.A.P. Reflection'`,
        content: soapEntries.scripture,
        category: sql<string>`'soap_reflection'`,
        isPublic: soapEntries.isPublic,
        audience: sql<string>`'saved'`,
        mood: soapEntries.moodTag,
        suggestedVerses: sql<any>`null`,
        attachedMedia: sql<any>`null`,
        linkedVerse: soapEntries.scriptureReference,
        isPinned: sql<boolean>`false`,
        pinnedBy: sql<string>`null`,
        pinnedAt: sql<any>`null`,
        pinnedUntil: sql<any>`null`,
        pinCategory: sql<string>`null`,
        likeCount: sql<number>`0`,
        commentCount: sql<number>`0`,
        createdAt: soapEntries.createdAt,
        updatedAt: soapEntries.updatedAt,
        type: sql<string>`'soap_reflection'`,
        isSaved: sql<boolean>`true`,
        bookmarkId: soapBookmarks.id,
        bookmarkNotes: soapBookmarks.notes,
        savedAt: soapBookmarks.createdAt,
        soapData: {
          scripture: soapEntries.scripture,
          scriptureReference: soapEntries.scriptureReference,
          observation: soapEntries.observation,
          application: soapEntries.application,
          prayer: soapEntries.prayer,
        },
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(soapBookmarks)
      .innerJoin(soapEntries, eq(soapBookmarks.soapId, soapEntries.id))
      .leftJoin(users, eq(soapEntries.userId, users.id))
      .where(eq(soapBookmarks.userId, userId))
      .orderBy(desc(soapBookmarks.createdAt));

    return savedEntries;
  }

  async removeSavedSoapEntry(soapId: number, userId: string): Promise<void> {
    // Remove the bookmark entry for the specific user and SOAP entry
    await db
      .delete(soapBookmarks)
      .where(and(
        eq(soapBookmarks.soapId, soapId),
        eq(soapBookmarks.userId, userId)
      ));
  }

  async isSoapEntrySaved(soapId: number, userId: string): Promise<boolean> {
    // Check if a SOAP entry is saved by the user
    const bookmark = await db
      .select({ id: soapBookmarks.id })
      .from(soapBookmarks)
      .where(and(
        eq(soapBookmarks.soapId, soapId),
        eq(soapBookmarks.userId, userId)
      ))
      .limit(1);

    return bookmark.length > 0;
  }

  async createSoapEntry(entry: any): Promise<any> {
    const [newEntry] = await db.insert(soapEntries).values(entry).returning();
    return newEntry;
  }

  async getSoapEntry(id: number): Promise<any> {
    const [entry] = await db
      .select()
      .from(soapEntries)
      .where(eq(soapEntries.id, id));
    return entry;
  }

  async deleteSoapEntry(id: number): Promise<void> {
    // Delete related comments first
    await db
      .delete(soapComments)
      .where(eq(soapComments.soapId, id));

    // Delete related reactions
    await db
      .delete(reactions)
      .where(and(
        eq(reactions.targetType, 'soap'),
        eq(reactions.targetId, id)
      ));

    // Delete the SOAP entry
    await db
      .delete(soapEntries)
      .where(eq(soapEntries.id, id));
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

  // Pinned posts operations for pastors/admins
  async pinDiscussion(discussionId: number, pinData: {
    pinnedBy: string;
    pinnedAt: Date;
    pinnedUntil?: Date | null;
    pinCategory?: string;
  }): Promise<Discussion> {
    const [pinnedPost] = await db
      .update(discussions)
      .set({
        isPinned: true,
        pinnedBy: pinData.pinnedBy,
        pinnedAt: pinData.pinnedAt,
        pinnedUntil: pinData.pinnedUntil,
        pinCategory: pinData.pinCategory || 'announcement',
        updatedAt: new Date()
      })
      .where(eq(discussions.id, discussionId))
      .returning();
    
    return pinnedPost;
  }

  async unpinDiscussion(discussionId: number): Promise<Discussion> {
    const [unpinnedPost] = await db
      .update(discussions)
      .set({
        isPinned: false,
        pinnedBy: null,
        pinnedAt: null,
        pinnedUntil: null,
        pinCategory: null,
        updatedAt: new Date()
      })
      .where(eq(discussions.id, discussionId))
      .returning();
    
    return unpinnedPost;
  }

  async getPinnedDiscussions(churchId?: number | null, limit: number = 10): Promise<Discussion[]> {
    let query = db
      .select({
        id: discussions.id,
        authorId: discussions.authorId,
        churchId: discussions.churchId,
        title: discussions.title,
        content: discussions.content,
        category: discussions.category,
        isPublic: discussions.isPublic,
        audience: discussions.audience,
        mood: discussions.mood,
        suggestedVerses: discussions.suggestedVerses,
        attachedMedia: discussions.attachedMedia,
        linkedVerse: discussions.linkedVerse,
        isPinned: discussions.isPinned,
        pinnedBy: discussions.pinnedBy,
        pinnedAt: discussions.pinnedAt,
        pinnedUntil: discussions.pinnedUntil,
        pinCategory: discussions.pinCategory,
        likeCount: discussions.likeCount,
        commentCount: discussions.commentCount,
        createdAt: discussions.createdAt,
        updatedAt: discussions.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(discussions)
      .innerJoin(users, eq(discussions.authorId, users.id))
      .where(
        and(
          eq(discussions.isPinned, true),
          // Only show non-expired pins
          or(
            isNull(discussions.pinnedUntil),
            gt(discussions.pinnedUntil, new Date())
          )
        )
      );

    // Apply church filter if provided
    if (churchId) {
      return await db
        .select({
          id: discussions.id,
          authorId: discussions.authorId,
          churchId: discussions.churchId,
          title: discussions.title,
          content: discussions.content,
          isPinned: discussions.isPinned,
          pinnedAt: discussions.pinnedAt,
          pinnedUntil: discussions.pinnedUntil,
          pinnedBy: discussions.pinnedBy,

          createdAt: discussions.createdAt,
          updatedAt: discussions.updatedAt,
          author: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          }
        })
        .from(discussions)
        .innerJoin(users, eq(discussions.authorId, users.id))
        .where(
          and(
            eq(discussions.isPinned, true),
            eq(discussions.churchId, churchId),
            or(
              isNull(discussions.pinnedUntil),
              gt(discussions.pinnedUntil, new Date())
            )
          )
        )
        .orderBy(desc(discussions.pinnedAt))
        .limit(10);
    }

    return await query
      .orderBy(desc(discussions.pinnedAt))
      .limit(10); // Limit to 10 pinned posts max
  }

  // Comment operations
  async getDiscussionComments(discussionId: number): Promise<any[]> {
    return await db
      .select({
        id: discussionComments.id,
        discussionId: discussionComments.discussionId,
        authorId: discussionComments.authorId,
        content: discussionComments.content,
        parentId: discussionComments.parentId,
        likeCount: discussionComments.likeCount,
        createdAt: discussionComments.createdAt,
        updatedAt: discussionComments.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(discussionComments)
      .leftJoin(users, eq(discussionComments.authorId, users.id))
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

  // SOAP Comment operations
  async getSoapComments(soapId: number): Promise<any[]> {
    return await db
      .select({
        id: soapComments.id,
        soapId: soapComments.soapId,
        authorId: soapComments.authorId,
        content: soapComments.content,
        parentId: soapComments.parentId,
        likeCount: soapComments.likeCount,
        createdAt: soapComments.createdAt,
        updatedAt: soapComments.updatedAt,
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(soapComments)
      .leftJoin(users, eq(soapComments.authorId, users.id))
      .where(eq(soapComments.soapId, soapId))
      .orderBy(asc(soapComments.createdAt));
  }

  async createSoapComment(comment: { soapId: number; authorId: string; content: string }): Promise<any> {
    const [newComment] = await db.insert(soapComments).values(comment).returning();
    
    // Update comment count on SOAP entry
    await db
      .update(soapEntries)
      .set({ 
        commentCount: sql`${soapEntries.commentCount} + 1`
      })
      .where(eq(soapEntries.id, comment.soapId));
    
    // Track activity
    try {
      await this.trackUserActivity({
        userId: comment.authorId,
        activityType: 'soap_comment',
        entityId: comment.soapId,
        points: 5,
      });
    } catch (error) {
    }
    
    return newComment;
  }

  // Prayer request operations
  async getPrayerRequests(churchId?: number): Promise<PrayerRequest[]> {
    const query = db
      .select({
        id: prayerRequests.id,
        title: prayerRequests.title,
        content: prayerRequests.content,
        category: prayerRequests.category,
        isAnonymous: prayerRequests.isAnonymous,
        isPublic: prayerRequests.isPublic,
        isUrgent: prayerRequests.isUrgent,
        isAnswered: prayerRequests.isAnswered,
        authorId: prayerRequests.authorId,
        churchId: prayerRequests.churchId,
        prayerCount: prayerRequests.prayerCount,
        attachmentUrl: prayerRequests.attachmentUrl,
        createdAt: prayerRequests.createdAt,
        updatedAt: prayerRequests.updatedAt,
        expiredAt: prayerRequests.expiredAt,
        // User information for display
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorEmail: users.email,
        authorProfileImageUrl: users.profileImageUrl,
      })
      .from(prayerRequests)
      .leftJoin(users, eq(prayerRequests.authorId, users.id))
      .where(
        and(
          eq(prayerRequests.isPublic, true),
          isNull(prayerRequests.expiredAt), // Exclude expired content
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
    
    // Track activity - don't let this fail the main operation
    try {
      await this.trackUserActivity({
        userId: prayer.authorId,
        activityType: 'prayer_request',
        entityId: newPrayer.id,
        points: 10,
      });
    } catch (error) {
      // Continue without failing the prayer creation
    }
    
    return newPrayer;
  }

  async deletePrayerRequest(prayerId: number, userId: string): Promise<void> {
    // First check if the user is the author of the prayer request
    const [prayerRequest] = await db
      .select()
      .from(prayerRequests)
      .where(eq(prayerRequests.id, prayerId));
    
    if (!prayerRequest) {
      throw new Error('Prayer request not found');
    }
    
    if (prayerRequest.authorId !== userId) {
      throw new Error('Only the author can delete this prayer request');
    }
    
    // Delete related responses first
    await db
      .delete(prayerResponses)
      .where(eq(prayerResponses.prayerRequestId, prayerId));
    
    // Delete related bookmarks
    await db
      .delete(prayerBookmarks)
      .where(eq(prayerBookmarks.prayerId, prayerId));
    
    // Delete related reactions
    await db
      .delete(prayerReactions)
      .where(eq(prayerReactions.prayerRequestId, prayerId));
    
    // Finally delete the prayer request
    await db
      .delete(prayerRequests)
      .where(eq(prayerRequests.id, prayerId));
  }

  async updatePrayerRequestAttachment(prayerId: number, userId: string, attachmentUrl: string): Promise<void> {
    // First verify the user has permission to update this prayer request
    const [prayer] = await db
      .select({ authorId: prayerRequests.authorId })
      .from(prayerRequests)
      .where(eq(prayerRequests.id, prayerId));
    
    if (!prayer || prayer.authorId !== userId) {
      throw new Error('Unauthorized to update this prayer request');
    }
    
    // Update the prayer request with the attachment URL
    await db
      .update(prayerRequests)
      .set({ 
        attachmentUrl: attachmentUrl,
        updatedAt: new Date()
      })
      .where(eq(prayerRequests.id, prayerId));
  }

  async prayForRequest(response: InsertPrayerResponse): Promise<PrayerResponse> {
    const [newResponse] = await db
      .insert(prayerResponses)
      .values(response)
      .onConflictDoNothing()
      .returning();
    
    if (newResponse) {
      // Get prayer request to find author
      const [prayerRequest] = await db
        .select({ authorId: prayerRequests.authorId })
        .from(prayerRequests)
        .where(eq(prayerRequests.id, response.prayerRequestId));
      
      if (prayerRequest) {
        // Calculate proper prayer count: count unique users excluding prayer author
        const uniquePrayerCount = await db
          .selectDistinct({ userId: prayerResponses.userId })
          .from(prayerResponses)
          .where(
            and(
              eq(prayerResponses.prayerRequestId, response.prayerRequestId),
              eq(prayerResponses.responseType, 'prayed'),
              ne(prayerResponses.userId, prayerRequest.authorId) // Exclude prayer author
            )
          );
        
        // Update prayer count with actual unique count
        await db
          .update(prayerRequests)
          .set({ 
            prayerCount: uniquePrayerCount.length
          })
          .where(eq(prayerRequests.id, response.prayerRequestId));
      }
      
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
        eq(prayerResponses.responseType, 'prayed')
      ))
      .returning();
    
    if (deletedResponse.length > 0) {
      // Get prayer request to find author
      const [prayerRequest] = await db
        .select({ authorId: prayerRequests.authorId })
        .from(prayerRequests)
        .where(eq(prayerRequests.id, prayerRequestId));
      
      if (prayerRequest) {
        // Recalculate proper prayer count: count unique users excluding prayer author
        const uniquePrayerCount = await db
          .selectDistinct({ userId: prayerResponses.userId })
          .from(prayerResponses)
          .where(
            and(
              eq(prayerResponses.prayerRequestId, prayerRequestId),
              eq(prayerResponses.responseType, 'prayed'),
              ne(prayerResponses.userId, prayerRequest.authorId) // Exclude prayer author
            )
          );
        
        // Update prayer count with actual unique count
        await db
          .update(prayerRequests)
          .set({ 
            prayerCount: uniquePrayerCount.length
          })
          .where(eq(prayerRequests.id, prayerRequestId));
      }
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

  // Prayer circle operations
  async getPrayerCircles(churchId?: number): Promise<PrayerCircle[]> {
    let query = db.select().from(prayerCircles);
    
    if (churchId) {
      query = query.where(eq(prayerCircles.churchId, churchId));
    }
    
    return await query.orderBy(desc(prayerCircles.createdAt));
  }

  async getPrayerCircle(id: number): Promise<PrayerCircle | undefined> {
    const [circle] = await db
      .select()
      .from(prayerCircles)
      .where(eq(prayerCircles.id, id))
      .limit(1);
    return circle;
  }

  async createPrayerCircle(circle: InsertPrayerCircle): Promise<PrayerCircle> {
    const [newCircle] = await db
      .insert(prayerCircles)
      .values(circle)
      .returning();
    return newCircle;
  }

  async updatePrayerCircle(id: number, updates: Partial<PrayerCircle>): Promise<PrayerCircle> {
    const [updatedCircle] = await db
      .update(prayerCircles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prayerCircles.id, id))
      .returning();
    return updatedCircle;
  }

  async getUserCreatedCircles(userId: string, independentOnly?: boolean): Promise<PrayerCircle[]> {
    let query = db
      .select()
      .from(prayerCircles)
      .where(eq(prayerCircles.createdBy, userId));

    if (independentOnly) {
      // Independent circles have null churchId AND isIndependent = true
      query = query.where(and(
        eq(prayerCircles.createdBy, userId),
        isNull(prayerCircles.churchId),
        eq(prayerCircles.isIndependent, true)
      ));
    }

    return await query.orderBy(desc(prayerCircles.createdAt));
  }

  async deletePrayerCircle(id: number): Promise<void> {
    // First remove all members
    await db
      .delete(prayerCircleMembers)
      .where(eq(prayerCircleMembers.prayerCircleId, id));
    
    // Then delete the circle
    await db
      .delete(prayerCircles)
      .where(eq(prayerCircles.id, id));
  }

  // Prayer circle membership operations
  async joinPrayerCircle(membership: InsertPrayerCircleMember): Promise<PrayerCircleMember> {
    const [newMembership] = await db
      .insert(prayerCircleMembers)
      .values(membership)
      .returning();
    return newMembership;
  }

  async leavePrayerCircle(circleId: number, userId: string): Promise<void> {
    await db
      .delete(prayerCircleMembers)
      .where(and(
        eq(prayerCircleMembers.prayerCircleId, circleId),
        eq(prayerCircleMembers.userId, userId)
      ));
  }

  async getPrayerCircleMembers(circleId: number): Promise<(PrayerCircleMember & { user: User })[]> {
    return await db
      .select({
        id: prayerCircleMembers.id,
        prayerCircleId: prayerCircleMembers.prayerCircleId,
        userId: prayerCircleMembers.userId,
        role: prayerCircleMembers.role,
        joinedAt: prayerCircleMembers.joinedAt,
        isActive: prayerCircleMembers.isActive,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(prayerCircleMembers)
      .innerJoin(users, eq(prayerCircleMembers.userId, users.id))
      .where(and(
        eq(prayerCircleMembers.prayerCircleId, circleId),
        eq(prayerCircleMembers.isActive, true)
      ))
      .orderBy(prayerCircleMembers.joinedAt);
  }

  async getUserPrayerCircles(userId: string): Promise<(PrayerCircleMember & { prayerCircle: PrayerCircle })[]> {
    return await db
      .select({
        id: prayerCircleMembers.id,
        prayerCircleId: prayerCircleMembers.prayerCircleId,
        userId: prayerCircleMembers.userId,
        role: prayerCircleMembers.role,
        joinedAt: prayerCircleMembers.joinedAt,
        isActive: prayerCircleMembers.isActive,
        prayerCircle: {
          id: prayerCircles.id,
          name: prayerCircles.name,
          description: prayerCircles.description,
          churchId: prayerCircles.churchId,
          createdBy: prayerCircles.createdBy,
          isPublic: prayerCircles.isPublic,
          memberLimit: prayerCircles.memberLimit,
          focusAreas: prayerCircles.focusAreas,
          meetingSchedule: prayerCircles.meetingSchedule,
          createdAt: prayerCircles.createdAt,
          updatedAt: prayerCircles.updatedAt,
        }
      })
      .from(prayerCircleMembers)
      .innerJoin(prayerCircles, eq(prayerCircleMembers.prayerCircleId, prayerCircles.id))
      .where(and(
        eq(prayerCircleMembers.userId, userId),
        eq(prayerCircleMembers.isActive, true)
      ))
      .orderBy(desc(prayerCircleMembers.joinedAt));
  }

  async isUserInPrayerCircle(circleId: number, userId: string): Promise<boolean> {
    const [membership] = await db
      .select({ id: prayerCircleMembers.id })
      .from(prayerCircleMembers)
      .where(and(
        eq(prayerCircleMembers.prayerCircleId, circleId),
        eq(prayerCircleMembers.userId, userId),
        eq(prayerCircleMembers.isActive, true)
      ))
      .limit(1);
    return !!membership;
  }

  // Enhanced prayer circle methods for new features
  async getPrayerCircleByInviteCode(inviteCode: string): Promise<PrayerCircle | undefined> {
    const [circle] = await db
      .select()
      .from(prayerCircles)
      .where(eq(prayerCircles.inviteCode, inviteCode))
      .limit(1);
    return circle;
  }

  async createPrayerCircleReport(report: any): Promise<any> {
    const [newReport] = await db
      .insert(prayerCircleReports)
      .values(report)
      .returning();
    return newReport;
  }

  async incrementCircleReportCount(circleId: number): Promise<void> {
    await db
      .update(prayerCircles)
      .set({ 
        reportCount: sql`${prayerCircles.reportCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(prayerCircles.id, circleId));
  }

  async createPrayerUpdate(update: any): Promise<any> {
    const [newUpdate] = await db
      .insert(prayerCircleUpdates)
      .values(update)
      .returning();
    return newUpdate;
  }

  async incrementAnsweredPrayersCount(circleId: number): Promise<void> {
    await db
      .update(prayerCircles)
      .set({ 
        answeredPrayersCount: sql`${prayerCircles.answeredPrayersCount} + 1`,
        lastActivityAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(prayerCircles.id, circleId));
  }

  // Prayer reaction operations
  async togglePrayerReaction(prayerRequestId: number, userId: string, reactionType: string): Promise<{ reacted: boolean }> {
    const existingReaction = await db
      .select()
      .from(prayerReactions)
      .where(and(
        eq(prayerReactions.prayerRequestId, prayerRequestId),
        eq(prayerReactions.userId, userId),
        eq(prayerReactions.reactionType, reactionType)
      ))
      .limit(1);

    if (existingReaction.length > 0) {
      // Remove reaction
      await db
        .delete(prayerReactions)
        .where(and(
          eq(prayerReactions.prayerRequestId, prayerRequestId),
          eq(prayerReactions.userId, userId),
          eq(prayerReactions.reactionType, reactionType)
        ));
      return { reacted: false };
    } else {
      // Add reaction
      await db
        .insert(prayerReactions)
        .values({
          prayerRequestId,
          userId,
          reactionType,
          createdAt: new Date()
        });
      return { reacted: true };
    }
  }

  async getPrayerReactions(prayerRequestId: number): Promise<Record<string, number>> {
    const reactions = await db
      .select({
        reactionType: prayerReactions.reactionType,
        count: count(prayerReactions.id)
      })
      .from(prayerReactions)
      .where(eq(prayerReactions.prayerRequestId, prayerRequestId))
      .groupBy(prayerReactions.reactionType);

    // Create an object with reaction counts, defaulting to 0
    const reactionCounts: Record<string, number> = {
      heart: 0,
      fire: 0,
      praise: 0
    };

    reactions.forEach(reaction => {
      reactionCounts[reaction.reactionType] = reaction.count;
    });

    return reactionCounts;
  }

  async getUserPrayerReactions(prayerRequestId: number, userId: string): Promise<string[]> {
    const reactions = await db
      .select({
        reactionType: prayerReactions.reactionType
      })
      .from(prayerReactions)
      .where(and(
        eq(prayerReactions.prayerRequestId, prayerRequestId),
        eq(prayerReactions.userId, userId)
      ));

    return reactions.map(r => r.reactionType);
  }

  // Prayer bookmark operations
  async togglePrayerBookmark(prayerId: number, userId: string): Promise<{ bookmarked: boolean }> {
    const existingBookmark = await db
      .select()
      .from(prayerBookmarks)
      .where(and(
        eq(prayerBookmarks.prayerId, prayerId),
        eq(prayerBookmarks.userId, userId)
      ))
      .limit(1);

    if (existingBookmark.length > 0) {
      // Remove bookmark
      await db
        .delete(prayerBookmarks)
        .where(and(
          eq(prayerBookmarks.prayerId, prayerId),
          eq(prayerBookmarks.userId, userId)
        ));
      return { bookmarked: false };
    } else {
      // Add bookmark
      await db
        .insert(prayerBookmarks)
        .values({
          prayerId,
          userId,
          createdAt: new Date()
        });
      return { bookmarked: true };
    }
  }

  async getUserBookmarkedPrayers(userId: string, churchId?: number): Promise<PrayerRequest[]> {
    const query = db
      .select({
        id: prayerRequests.id,
        title: prayerRequests.title,
        content: prayerRequests.content,
        category: prayerRequests.category,
        isAnonymous: prayerRequests.isAnonymous,
        isPublic: prayerRequests.isPublic,
        isUrgent: prayerRequests.isUrgent,
        isAnswered: prayerRequests.isAnswered,
        authorId: prayerRequests.authorId,
        churchId: prayerRequests.churchId,
        prayerCount: prayerRequests.prayerCount,
        createdAt: prayerRequests.createdAt,
        updatedAt: prayerRequests.updatedAt,
        attachmentUrl: prayerRequests.attachmentUrl,
        // Include author information
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorEmail: users.email,
        authorProfileImageUrl: users.profileImageUrl
      })
      .from(prayerBookmarks)
      .innerJoin(prayerRequests, eq(prayerBookmarks.prayerId, prayerRequests.id))
      .leftJoin(users, eq(prayerRequests.authorId, users.id))
      .where(eq(prayerBookmarks.userId, userId));

    if (churchId) {
      query.where(eq(prayerRequests.churchId, churchId));
    }

    return await query.orderBy(desc(prayerBookmarks.createdAt));
  }

  // Template management operations
  async getCommunicationTemplates(userId: string, churchId?: number): Promise<any[]> {
    let query = db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.createdBy, userId));
    
    if (churchId) {
      query = query.where(eq(communicationTemplates.churchId, churchId));
    }
    
    return await query.orderBy(desc(communicationTemplates.createdAt));
  }

  async createCommunicationTemplate(template: any): Promise<any> {
    const [newTemplate] = await db.insert(communicationTemplates).values(template).returning();
    return newTemplate;
  }

  async updateCommunicationTemplate(templateId: number, updates: any): Promise<any> {
    const [updatedTemplate] = await db
      .update(communicationTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(communicationTemplates.id, templateId))
      .returning();
    return updatedTemplate;
  }

  async deleteCommunicationTemplate(templateId: number): Promise<void> {
    await db
      .delete(communicationTemplates)
      .where(eq(communicationTemplates.id, templateId));
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
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const uniqueDays = new Set();
    
    // Group activities by day (using only date part, not time)
    for (const activity of recentActivities) {
      if (activity.createdAt) {
        const activityDate = new Date(activity.createdAt.toString());
        activityDate.setHours(0, 0, 0, 0); // Normalize to start of day
        const dayKey = activityDate.getTime(); // Use timestamp for consistent comparison
        uniqueDays.add(dayKey);
      }
    }

    // Convert to sorted array of timestamps (most recent first)
    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
    
    // Calculate consecutive days starting from today working backwards
    for (let i = 0; i < sortedDays.length; i++) {
      const expectedTimestamp = today.getTime() - (i * 24 * 60 * 60 * 1000); // i days ago
      
      if (sortedDays[i] === expectedTimestamp) {
        currentStreak++;
      } else {
        break; // Break streak if we find a gap
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

  // Update last accessed timestamp for a church
  async updateChurchAccess(userId: string, churchId: number): Promise<void> {
    await db
      .update(userChurches)
      .set({ lastAccessedAt: new Date() })
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.churchId, churchId)
      ));
  }

  // User church connections
  async getUserChurches(userId: string): Promise<(Church & { role: string })[]> {
    
    // Get full church data with roles directly from user_churches table
    const result = await db
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
        isClaimed: churches.isClaimed,
        adminEmail: churches.adminEmail,
        isDemo: churches.isDemo,
        createdAt: churches.createdAt,
        updatedAt: churches.updatedAt,
        userRole: userChurches.role,
      })
      .from(churches)
      .innerJoin(userChurches, eq(churches.id, userChurches.churchId))
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.isActive, true)
      ))
      .orderBy(desc(sql`COALESCE(${userChurches.lastAccessedAt}, ${userChurches.joinedAt})`));
    
    const mappedResult = result.map(({ userRole, ...church }) => ({
      ...church,
      role: userRole || 'member'
    }));
    
    return mappedResult;
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
        isClaimed: churches.isClaimed,
        adminEmail: churches.adminEmail,
        isDemo: churches.isDemo,
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
    

      
    // Track activity
    await this.trackUserActivity({
      userId,
      activityType: 'church_joined',
      entityId: churchId,
      points: 20,
    });
  }

  async updateUserChurchRole(userId: string, churchId: number, role: string): Promise<void> {
    await db
      .update(userChurches)
      .set({ role })
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.churchId, churchId)
      ));
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

  // Church claiming operations
  async getClaimableChurches(userEmail: string): Promise<Church[]> {
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
        isClaimed: churches.isClaimed,
        adminEmail: churches.adminEmail,
        createdAt: churches.createdAt,
        updatedAt: churches.updatedAt,
      })
      .from(churches)
      .where(and(
        eq(churches.isClaimed, false),
        eq(churches.adminEmail, userEmail),
        eq(churches.isActive, true)
      ));
  }

  async claimChurch(churchId: number, userId: string, verifiedDenomination?: string): Promise<{ success: boolean; church?: Church; error?: string }> {
    try {
      // Get user email for claiming verification
      const user = await this.getUser(userId);
      if (!user || !user.email) {
        return { success: false, error: 'User email required for claiming verification' };
      }

      // Verify church is claimable by this user (email must match)
      const church = await db
        .select()
        .from(churches)
        .where(and(
          eq(churches.id, churchId),
          eq(churches.isClaimed, false),
          eq(churches.adminEmail, user.email),
          eq(churches.isActive, true)
        ))
        .limit(1);

      if (church.length === 0) {
        return { 
          success: false, 
          error: 'Church claiming requires email verification. Please contact admin@soapboxsuperapp.com with your church details to process your claim request.' 
        };
      }

      // Get church_admin role
      const adminRole = await db
        .select()
        .from(roles)
        .where(eq(roles.name, 'church_admin'))
        .limit(1);

      if (adminRole.length === 0) {
        return { success: false, error: 'Church admin role not found' };
      }

      // Start transaction
      await db.transaction(async (tx) => {
        // Prepare update data
        const updateData: any = {
          isClaimed: true, 
          adminEmail: null, // Clear admin email after claiming
          updatedAt: new Date()
        };

        // Update denomination if verified by admin
        if (verifiedDenomination) {
          updateData.denomination = verifiedDenomination;
        }

        // Mark church as claimed and update denomination if provided
        await tx
          .update(churches)
          .set(updateData)
          .where(eq(churches.id, churchId));

        // Add user as church admin
        await tx
          .insert(userChurches)
          .values({
            userId: userId,
            churchId: churchId,
            roleId: adminRole[0].id,
            isActive: true,
            joinedAt: new Date()
          });
      });

      // Return updated church
      const updatedChurch = await this.getChurch(churchId);
      return { success: true, church: updatedChurch };

    } catch (error) {
      return { success: false, error: 'Failed to claim church' };
    }
  }

  async bulkImportChurches(churchData: any[]): Promise<{ success: boolean; imported: number; error?: string }> {
    try {
      if (churchData.length === 0) {
        return { success: false, error: 'No church data provided', imported: 0 };
      }

      // Insert in batches of 100
      const batchSize = 100;
      let totalInserted = 0;

      for (let i = 0; i < churchData.length; i += batchSize) {
        const batch = churchData.slice(i, i + batchSize);
        
        try {
          const result = await db.insert(churches).values(batch).returning({ id: churches.id });
          totalInserted += result.length;
        } catch (error) {
          // Continue with next batch
        }
      }

      return { success: true, imported: totalInserted };

    } catch (error) {
      return { success: false, imported: 0, error: 'Bulk import failed' };
    }
  }

  async removeDemoChurches(): Promise<{ success: boolean; removed: number; error?: string }> {
    try {
      // Find and remove demo churches
      const demoPatterns = [
        'Demo Church',
        'Test Church', 
        'Sample Church',
        'Victory Christian',
        'Grace Community',
        'First Baptist'
      ];

      let totalRemoved = 0;

      for (const pattern of demoPatterns) {
        const result = await db.delete(churches)
          .where(eq(churches.name, pattern));
        totalRemoved += result.rowCount || 0;
      }

      return { success: true, removed: totalRemoved };

    } catch (error) {
      return { success: false, removed: 0, error: 'Failed to remove demo churches' };
    }
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

  async ensureConversationParticipant(conversationId: number, userId: string): Promise<void> {
    // Check if user is already a participant
    const existingParticipant = await db
      .select({ id: conversationParticipants.id })
      .from(conversationParticipants)
      .where(
        and(
          eq(conversationParticipants.conversationId, conversationId),
          eq(conversationParticipants.userId, userId)
        )
      )
      .limit(1);

    // Add as participant if not already one
    if (existingParticipant.length === 0) {
      await db.insert(conversationParticipants).values({
        conversationId,
        userId,
        isActive: true,
        joinedAt: new Date()
      });

    }
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
      
      // Update like count in discussions table
      await db
        .update(discussions)
        .set({ 
          likeCount: sql`${discussions.likeCount} - 1`
        })
        .where(eq(discussions.id, discussionId));
    } else {
      // Add like
      await db
        .insert(discussionLikes)
        .values({
          userId,
          discussionId,
        });
      liked = true;
      
      // Update like count in discussions table
      await db
        .update(discussions)
        .set({ 
          likeCount: sql`${discussions.likeCount} + 1`
        })
        .where(eq(discussions.id, discussionId));
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

  // Duplicate functions removed - implementations exist above at lines 1910 and 1918

  // Duplicate function removed - implementation exists elsewhere

  async deleteDiscussion(discussionId: number): Promise<void> {
    // Delete all related data first (due to foreign key constraints)
    
    // Delete discussion comments
    await db
      .delete(discussionComments)
      .where(eq(discussionComments.discussionId, discussionId));
    
    // Delete discussion likes
    await db
      .delete(discussionLikes)
      .where(eq(discussionLikes.discussionId, discussionId));
    
    // Delete discussion bookmarks
    await db
      .delete(discussionBookmarks)
      .where(eq(discussionBookmarks.discussionId, discussionId));
    
    // Finally delete the discussion itself
    await db
      .delete(discussions)
      .where(eq(discussions.id, discussionId));
  }

  async getFeedPosts(userId: string): Promise<any[]> {
    try {
      // Use raw SQL to bypass Drizzle ORM schema issues
      const discussionsResult = await pool.query(`
        SELECT 
          d.id,
          d.author_id,
          d.title,
          d.content,
          d.mood,
          d.suggested_verses,
          d.attached_media,
          d.linked_verse,
          d.audience,
          d.created_at,
          u.first_name,
          u.last_name,
          u.email,
          u.profile_image_url
        FROM discussions d
        LEFT JOIN users u ON d.author_id = u.id
        WHERE d.expired_at IS NULL
        ORDER BY d.created_at DESC
        LIMIT 10
      `);

      const feedPosts = await Promise.all(discussionsResult.rows.map(async row => {
        const authorName = row.first_name && row.last_name 
          ? `${row.first_name} ${row.last_name}`
          : row.first_name || 'Anonymous User';

        // Fetch comments for this discussion
        const commentsResult = await pool.query(`
          SELECT 
            c.id,
            c.content,
            c.created_at,
            u.first_name,
            u.last_name,
            u.email,
            u.profile_image_url
          FROM discussion_comments c
          LEFT JOIN users u ON c.author_id = u.id
          WHERE c.discussion_id = $1
          ORDER BY c.created_at ASC
          LIMIT 10
        `, [row.id]);

        const comments = commentsResult.rows.map(commentRow => ({
          id: commentRow.id,
          content: commentRow.content,
          createdAt: commentRow.created_at,
          author: {
            name: commentRow.first_name && commentRow.last_name 
              ? `${commentRow.first_name} ${commentRow.last_name}`
              : commentRow.first_name || 'Anonymous',
            profileImage: commentRow.profile_image_url || null
          }
        }));

        // Fetch like count for this discussion
        const likeCountResult = await pool.query(`
          SELECT COUNT(*) as like_count
          FROM discussion_likes
          WHERE discussion_id = $1
        `, [row.id]);

        // Check if current user liked this discussion
        const userLikeResult = await pool.query(`
          SELECT COUNT(*) as user_liked
          FROM discussion_likes
          WHERE discussion_id = $1 AND user_id = $2
        `, [row.id, userId]);

        const likeCount = parseInt(likeCountResult.rows[0]?.like_count || 0);
        const isLiked = parseInt(userLikeResult.rows[0]?.user_liked || 0) > 0;

        // Fetch prayer reaction count for this discussion
        const prayCountResult = await pool.query(`
          SELECT COUNT(*) as pray_count
          FROM community_reactions
          WHERE target_type = 'discussion' AND target_id = $1 AND reaction_type = 'pray'
        `, [row.id]);

        // Check if current user is praying for this discussion
        const userPrayResult = await pool.query(`
          SELECT COUNT(*) as user_praying
          FROM community_reactions
          WHERE target_type = 'discussion' AND target_id = $1 AND user_id = $2 AND reaction_type = 'pray'
        `, [row.id, userId]);

        const prayCount = parseInt(prayCountResult.rows[0]?.pray_count || 0);
        const isPraying = parseInt(userPrayResult.rows[0]?.user_praying || 0) > 0;

      return {
          id: row.id,
          type: 'discussion',
          title: row.title,
          content: row.content,
          mood: row.mood || null,
          suggestedVerses: row.suggested_verses || null,
          attachedMedia: row.attached_media || null,
          linkedVerse: row.linked_verse || null,
          audience: row.audience || 'public',
          author: {
            id: row.author_id,
            name: authorName,
            profileImage: row.profile_image_url || null,
            firstName: row.first_name,
            lastName: row.last_name,
            profileImageUrl: row.profile_image_url || null
          },
          church: null,
          createdAt: row.created_at,
          likeCount: likeCount,
          commentCount: comments.length,
          shareCount: 0,
          isLiked: isLiked,
          prayCount: prayCount,
          isPraying: isPraying,
          isBookmarked: false,
          tags: ['discussion'],
          comments: comments
        };
      }));

      return feedPosts;

    } catch (error) {
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
    // Use the same streak calculation logic as getUserStats for consistency
    // Get recent activities from user_activities table instead of just check-ins
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
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    
    const uniqueDays = new Set();
    
    // Group activities by day (using only date part, not time)
    for (const activity of recentActivities) {
      if (activity.createdAt) {
        const activityDate = new Date(activity.createdAt.toString());
        activityDate.setHours(0, 0, 0, 0); // Normalize to start of day
        const dayKey = activityDate.getTime(); // Use timestamp for consistent comparison
        uniqueDays.add(dayKey);
      }
    }

    // Convert to sorted array of timestamps (most recent first)
    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
    
    // Calculate consecutive days starting from today working backwards
    for (let i = 0; i < sortedDays.length; i++) {
      const expectedTimestamp = today.getTime() - (i * 24 * 60 * 60 * 1000); // i days ago
      
      if (sortedDays[i] === expectedTimestamp) {
        currentStreak++;
      } else {
        break; // Break streak
      }
    }

    return currentStreak;
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
        latitude: checkIns.latitude,
        longitude: checkIns.longitude,
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

  // Bible cache methods eliminated - using API.Bible + ChatGPT fallback only

  // Additional Bible cache methods eliminated

  // getBibleVersesPaginated eliminated

  // getBibleStats eliminated

  // Bible cache operations eliminated

  // Bible in a Day operations eliminated

  // Bible in a Day badge methods eliminated

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

  // Contacts and Invitations Methods

  async addContact(contact: InsertContact): Promise<Contact> {
    const [newContact] = await db
      .insert(contacts)
      .values(contact)
      .returning();
    return newContact;
  }

  async updateContactStatus(contactId: number, status: string): Promise<Contact> {
    const [updatedContact] = await db
      .update(contacts)
      .set({ status, updatedAt: new Date() })
      .where(eq(contacts.id, contactId))
      .returning();
    return updatedContact;
  }

  async removeContact(contactId: number): Promise<void> {
    await db
      .delete(contacts)
      .where(eq(contacts.id, contactId));
  }

  async getExistingInvitation(inviterId: string, email: string): Promise<Invitation | undefined> {
    const [existing] = await db
      .select()
      .from(invitations)
      .where(and(eq(invitations.inviterId, inviterId), eq(invitations.email, email)))
      .limit(1);
    return existing;
  }

  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [newInvitation] = await db
      .insert(invitations)
      .values(invitation)
      .returning();
    return newInvitation;
  }

  async getUserInvitations(userId: string): Promise<Invitation[]> {
    return await db
      .select()
      .from(invitations)
      .where(eq(invitations.inviterId, userId))
      .orderBy(desc(invitations.createdAt));
  }

  async updateInvitationStatus(inviteCode: string, status: string): Promise<Invitation> {
    const [updatedInvitation] = await db
      .update(invitations)
      .set({ status, acceptedAt: status === 'accepted' ? new Date() : null })
      .where(eq(invitations.inviteCode, inviteCode))
      .returning();
    return updatedInvitation;
  }

  async getPendingInvitations(userId: string): Promise<Invitation[]> {
    return await db
      .select()
      .from(invitations)
      .where(and(
        eq(invitations.inviterId, userId),
        eq(invitations.status, 'pending')
      ))
      .orderBy(desc(invitations.createdAt));
  }

  // Messaging System Methods
  async getUnreadMessageCount(userId: string): Promise<number> {
    // Temporarily return 0 until we fix the schema mismatch
    return 0;
  }

  async getUserConversations(userId: string): Promise<any[]> {
    // Get conversations with latest message info
    const conversationsData = await db
      .select({
        conversationId: messages.conversationId,
        otherUserId: sql<string>`CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.receiverId} ELSE ${messages.senderId} END`,
        lastMessage: messages.content,
        lastMessageTime: messages.createdAt,
        isRead: messages.isRead,
        senderId: messages.senderId
      })
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Group by conversation and get user details
    const conversationMap = new Map();
    
    for (const conv of conversationsData) {
      if (!conversationMap.has(conv.conversationId)) {
        // Get other user details
        const [otherUser] = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
            role: users.role
          })
          .from(users)
          .where(eq(users.id, conv.otherUserId));

        // Count unread messages in this conversation
        const [unreadCount] = await db
          .select({ count: count() })
          .from(messages)
          .where(
            and(
              eq(messages.conversationId, conv.conversationId),
              eq(messages.receiverId, userId),
              eq(messages.isRead, false)
            )
          );

        conversationMap.set(conv.conversationId, {
          id: conv.conversationId,
          participantId: conv.otherUserId,
          participantName: otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() : 'Unknown User',
          participantAvatar: otherUser?.profileImageUrl || null,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime?.toISOString() || new Date().toISOString(),
          unreadCount: unreadCount.count,
          isOnline: false // Could be enhanced with real-time status
        });
      }
    }

    return Array.from(conversationMap.values());
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, parseInt(conversationId)),
          eq(messages.receiverId, userId),
          eq(messages.isRead, false)
        )
      );
  }

  async getUserContacts(userId: string): Promise<any[]> {
    // Get actual contacts from the contacts table, not all users
    const userContacts = await db
      .select({
        id: contacts.id,
        contactUserId: contacts.contactUserId,
        name: contacts.name,
        email: contacts.email,
        phone: contacts.phone,
        status: contacts.status,
        contactType: contacts.contactType,
        createdAt: contacts.createdAt,
        // Join with users table for contact user details if they're registered
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        role: users.role
      })
      .from(contacts)
      .leftJoin(users, eq(contacts.contactUserId, users.id))
      .where(eq(contacts.userId, userId))
      .orderBy(desc(contacts.createdAt));

    return userContacts.map(contact => ({
      id: contact.contactUserId || contact.id,
      name: contact.name, // Keep the full name from contacts table
      firstName: contact.firstName || contact.name?.split(' ')[0] || contact.email?.split('@')[0] || 'Unknown',
      lastName: contact.lastName || (contact.name?.split(' ').length > 1 ? contact.name.split(' ').slice(1).join(' ') : ''),
      profileImageUrl: contact.profileImageUrl,
      role: contact.role || 'contact',
      email: contact.email,
      phone: contact.phone,
      status: contact.status,
      contactType: contact.contactType,
      isOnline: false, // Could be enhanced with real-time status
      createdAt: contact.createdAt
    }));
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

  async getBibleVerseByReferenceAndTranslation(reference: string, translation: string): Promise<any | null> {
    try {
      // Normalize reference for consistent matching
      const normalizedReference = reference.toLowerCase().replace(/\s+/g, ' ').trim();
      
      // First try the requested translation
      const [requestedVerse] = await db
        .select()
        .from(bibleVerses)
        .where(and(
          sql`LOWER(REPLACE(${bibleVerses.reference}, ' ', ' ')) = ${normalizedReference}`,
          eq(bibleVerses.translation, translation.toUpperCase()),
          eq(bibleVerses.isActive, true)
        ))
        .limit(1);

      if (requestedVerse) {
        return requestedVerse;
      }

      // If not found, try fallback order: NIV -> KJV -> any available
      const fallbackTranslations = ['NIV', 'KJV'];
      
      for (const fallbackTranslation of fallbackTranslations) {
        if (fallbackTranslation === translation.toUpperCase()) continue;
        
        const [fallbackVerse] = await db
          .select()
          .from(bibleVerses)
          .where(and(
            sql`LOWER(REPLACE(${bibleVerses.reference}, ' ', ' ')) = ${normalizedReference}`,
            eq(bibleVerses.translation, fallbackTranslation),
            eq(bibleVerses.isActive, true)
          ))
          .limit(1);

        if (fallbackVerse) {
          return fallbackVerse;
        }
      }

      // If still not found, try any translation for this reference
      const [anyVerse] = await db
        .select()
        .from(bibleVerses)
        .where(and(
          sql`LOWER(REPLACE(${bibleVerses.reference}, ' ', ' ')) = ${normalizedReference}`,
          eq(bibleVerses.isActive, true)
        ))
        .limit(1);

      return anyVerse || null;
    } catch (error) {
      return null;
    }
  }

  async getBibleVerseByReferenceFlexible(reference: string, translation: string): Promise<any | null> {
    try {
      // Try flexible matching with the requested translation first
      const searchTerm = `%${reference.toLowerCase().replace(/\s+/g, '%')}%`;
      
      const [verse] = await db
        .select()
        .from(bibleVerses)
        .where(and(
          sql`LOWER(${bibleVerses.reference}) LIKE ${searchTerm}`,
          eq(bibleVerses.translation, translation.toUpperCase()),
          eq(bibleVerses.isActive, true)
        ))
        .limit(1);

      if (verse) {
        return verse;
      }

      // If not found, try with fallback translations
      const fallbackTranslations = ['NIV', 'KJV'];
      
      for (const fallbackTranslation of fallbackTranslations) {
        if (fallbackTranslation === translation.toUpperCase()) continue;
        
        const [fallbackVerse] = await db
          .select()
          .from(bibleVerses)
          .where(and(
            sql`LOWER(${bibleVerses.reference}) LIKE ${searchTerm}`,
            eq(bibleVerses.translation, fallbackTranslation),
            eq(bibleVerses.isActive, true)
          ))
          .limit(1);

        if (fallbackVerse) {
          return fallbackVerse;
        }
      }

      // If still not found, try any translation
      const [anyVerse] = await db
        .select()
        .from(bibleVerses)
        .where(and(
          sql`LOWER(${bibleVerses.reference}) LIKE ${searchTerm}`,
          eq(bibleVerses.isActive, true)
        ))
        .limit(1);

      return anyVerse || null;
    } catch (error) {
      return null;
    }
  }

  async searchBibleVersesByTopic(topics: string[]): Promise<any[]> {
    if (topics.length === 0) return [];

    const verses = await db
      .select()
      .from(bibleVerses)
      .where(and(
        eq(bibleVerses.isActive, true),
        sql`${bibleVerses.topicTags} && ARRAY[${topics.map(t => `'${t}'`).join(',')}]::text[]`
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
      userReacted: false
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
      // Toggle off - remove existing reaction
      await db
        .delete(reactions)
        .where(eq(reactions.id, existing[0].id));
      return { reacted: false, message: 'Reaction removed' };
    } else {
      // Toggle on - create new reaction
      const [newReaction] = await db
        .insert(reactions)
        .values({
          userId: reactionData.userId,
          targetType: reactionData.targetType,
          targetId: reactionData.targetId,
          reactionType: reactionData.reactionType,
          emoji: reactionData.emoji,
          intensity: reactionData.intensity || 1,
          createdAt: new Date()
        })
        .returning();
      return { reacted: true, message: 'Reaction added', data: newReaction };
    }
  }

  async getReactionCount(targetType: string, targetId: number, reactionType: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(reactions)
      .where(
        and(
          eq(reactions.targetType, targetType),
          eq(reactions.targetId, targetId),
          eq(reactions.reactionType, reactionType)
        )
      );
    
    return Number(result[0]?.count || 0);
  }

  async removeReaction(userId: string, targetId: number, reactionType: string): Promise<any> {
    const deleted = await db
      .delete(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.targetId, targetId),
          eq(reactions.reactionType, reactionType)
        )
      )
      .returning();
    
    return { success: true, deleted: deleted.length > 0 };
  }

  // Removed duplicate removeReaction method

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

  async getRecentMoodCheckIns(limit: number = 10): Promise<any[]> {
    return await db
      .select({
        id: moodCheckins.id,
        userId: moodCheckins.userId,
        mood: moodCheckins.mood,
        moodEmoji: moodCheckins.moodEmoji,
        moodScore: moodCheckins.moodScore,
        notes: moodCheckins.notes,
        createdAt: moodCheckins.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(moodCheckins)
      .innerJoin(users, eq(moodCheckins.userId, users.id))
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

  async getUserPersonalizedContent(userId: string): Promise<PersonalizedContent[]> {
    return await db
      .select()
      .from(personalizedContent)
      .where(eq(personalizedContent.userId, userId))
      .orderBy(desc(personalizedContent.createdAt))
      .limit(50);
  }

  async getPersonalizedContent(contentId: string): Promise<PersonalizedContent | undefined> {
    const [content] = await db
      .select()
      .from(personalizedContent)
      .where(eq(personalizedContent.id, parseInt(contentId)))
      .limit(1);
    return content;
  }

  async markPersonalizedContentAsViewed(contentId: number, userId: string): Promise<void> {
    await db
      .update(personalizedContent)
      .set({ viewed: true })
      .where(
        and(
          eq(personalizedContent.id, contentId),
          eq(personalizedContent.userId, userId)
        )
      );
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


      return true;
    } catch (error) {
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
      },
      {
        id: 6,
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
      .from(videoContent)
      .where(
        and(
          eq(videoContent.isPublic, true),
          eq(videoContent.isActive, true)
        )
      )
      .orderBy(desc(videoContent.publishedAt))
      .limit(limit)
      .offset(offset);
  }

  async updateVideoContent(id: number, updates: Partial<InsertVideoContentDB>): Promise<VideoContentDB> {
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
      publishedAt: draftData.publishedAt || null,
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

  // S.O.A.P. Entry Management Implementation
  async createSoapEntry(entry: InsertSoapEntry): Promise<SoapEntry> {
    const [newEntry] = await db
      .insert(soapEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getSoapEntries(userId: string, options?: { churchId?: number; isPublic?: boolean; limit?: number; offset?: number }): Promise<SoapEntry[]> {
    let query = db.select().from(soapEntries).where(eq(soapEntries.userId, userId));

    if (options?.churchId) {
      query = query.where(eq(soapEntries.churchId, options.churchId));
    }

    if (options?.isPublic !== undefined) {
      query = query.where(eq(soapEntries.isPublic, options.isPublic));
    }

    query = query.orderBy(desc(soapEntries.devotionalDate));

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    return await query;
  }

  async getSoapEntry(id: number): Promise<SoapEntry | undefined> {
    const [entry] = await db
      .select()
      .from(soapEntries)
      .where(eq(soapEntries.id, id));
    return entry;
  }

  async updateSoapEntry(id: number, updates: Partial<SoapEntry>): Promise<SoapEntry> {
    const [updatedEntry] = await db
      .update(soapEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(soapEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteSoapEntry(id: number): Promise<void> {
    // Delete related bookmarks first to avoid foreign key constraint violation
    await db
      .delete(soapBookmarks)
      .where(eq(soapBookmarks.soapId, id));

    // Delete related comments
    await db
      .delete(soapComments)
      .where(eq(soapComments.soapId, id));

    // Delete related reactions
    await db
      .delete(reactions)
      .where(and(
        eq(reactions.targetType, 'soap'),
        eq(reactions.targetId, id)
      ));

    // Delete the SOAP entry
    await db
      .delete(soapEntries)
      .where(eq(soapEntries.id, id));
  }

  async getUserSoapStreak(userId: string): Promise<number> {
    const entries = await db
      .select({ devotionalDate: soapEntries.devotionalDate })
      .from(soapEntries)
      .where(eq(soapEntries.userId, userId))
      .orderBy(desc(soapEntries.devotionalDate));

    if (entries.length === 0) return 0;

    let streak = 1;
    let currentDate = new Date(entries[0].devotionalDate!);
    
    for (let i = 1; i < entries.length; i++) {
      const entryDate = new Date(entries[i].devotionalDate!);
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        streak++;
        currentDate = entryDate;
      } else {
        break;
      }
    }

    return streak;
  }

  async getPublicSoapEntries(churchId?: number, limit?: number, offset?: number, excludeUserId?: string): Promise<any[]> {
    let query = db
      .select({
        id: soapEntries.id,
        userId: soapEntries.userId,
        churchId: soapEntries.churchId,
        scripture: soapEntries.scripture,
        scriptureReference: soapEntries.scriptureReference,
        observation: soapEntries.observation,
        application: soapEntries.application,
        prayer: soapEntries.prayer,
        moodTag: soapEntries.moodTag,
        isPublic: soapEntries.isPublic,
        devotionalDate: soapEntries.devotionalDate,
        createdAt: soapEntries.createdAt,
        updatedAt: soapEntries.updatedAt,
        expiredAt: soapEntries.expiredAt,
        // Include user data with profile image
        author: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        }
      })
      .from(soapEntries)
      .innerJoin(users, eq(soapEntries.userId, users.id))
      .where(
        and(
          eq(soapEntries.isPublic, true),
          isNull(soapEntries.expiredAt), // Exclude expired content
          excludeUserId ? ne(soapEntries.userId, excludeUserId) : undefined, // Exclude current user's entries
          churchId ? eq(soapEntries.churchId, churchId) : undefined
        )
      );

    query = query.orderBy(desc(soapEntries.createdAt));

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    return await query;
  }

  async featureSoapEntry(id: number, featuredBy: string): Promise<SoapEntry> {
    const [featuredEntry] = await db
      .update(soapEntries)
      .set({
        isFeatured: true,
        featuredBy,
        featuredAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(soapEntries.id, id))
      .returning();
    return featuredEntry;
  }

  async unfeatureSoapEntry(id: number): Promise<SoapEntry> {
    const [unfeaturedEntry] = await db
      .update(soapEntries)
      .set({
        isFeatured: false,
        featuredBy: null,
        featuredAt: null,
        updatedAt: new Date()
      })
      .where(eq(soapEntries.id, id))
      .returning();
    return unfeaturedEntry;
  }

  async getChurchPastors(churchId: number): Promise<{ id: string; firstName: string; lastName: string; email: string; role: string }[]> {
    const pastors = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        role: roles.name
      })
      .from(userChurches)
      .innerJoin(users, eq(userChurches.userId, users.id))
      .innerJoin(roles, eq(userChurches.roleId, roles.id))
      .where(
        and(
          eq(userChurches.churchId, churchId),
          eq(userChurches.isActive, true),
          or(
            eq(roles.name, 'pastor'),
            eq(roles.name, 'lead_pastor'),
            eq(roles.name, 'senior_pastor'),
            eq(roles.name, 'associate_pastor')
          )
        )
      );
    return pastors;
  }

  async getSoapEntriesSharedWithPastor(pastorId: string, churchId: number): Promise<SoapEntry[]> {
    const entries = await db
      .select({
        ...soapEntries,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorEmail: users.email
      })
      .from(soapEntries)
      .innerJoin(users, eq(soapEntries.userId, users.id))
      .innerJoin(userChurches, eq(users.id, userChurches.userId))
      .where(
        and(
          eq(soapEntries.isSharedWithPastor, true),
          eq(soapEntries.churchId, churchId),
          eq(userChurches.churchId, churchId),
          eq(userChurches.isActive, true)
        )
      )
      .orderBy(desc(soapEntries.createdAt));
    return entries;
  }

  // Notification operations
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  // Gallery operations implementation
  async getGalleryImages(churchId?: number, filters?: { 
    collection?: string; 
    tags?: string[]; 
    uploadedBy?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<GalleryImage[]> {
    let query = db
      .select({
        id: galleryImages.id,
        url: galleryImages.url,
        title: galleryImages.title,
        description: galleryImages.description,
        collection: galleryImages.collection,
        tags: galleryImages.tags,
        uploadedBy: galleryImages.uploadedBy,
        churchId: galleryImages.churchId,
        createdAt: galleryImages.createdAt,
        updatedAt: galleryImages.updatedAt,
        uploaderName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('uploaderName'),
        uploaderAvatar: users.profileImageUrl,
        likesCount: sql`COUNT(DISTINCT ${galleryImageLikes.id})`.as('likesCount'),
        commentsCount: sql`COUNT(DISTINCT ${galleryImageComments.id})`.as('commentsCount')
      })
      .from(galleryImages)
      .leftJoin(users, eq(galleryImages.uploadedBy, users.id))
      .leftJoin(galleryImageLikes, eq(galleryImages.id, galleryImageLikes.imageId))
      .leftJoin(galleryImageComments, eq(galleryImages.id, galleryImageComments.imageId));

    const conditions = [];
    
    if (churchId) {
      conditions.push(eq(galleryImages.churchId, churchId));
    }
    
    if (filters?.collection && filters.collection !== 'all') {
      conditions.push(eq(galleryImages.collection, filters.collection));
    }
    
    if (filters?.uploadedBy) {
      conditions.push(eq(galleryImages.uploadedBy, filters.uploadedBy));
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      // Check if any of the provided tags exist in the image tags array
      const tagConditions = filters.tags.map(tag => 
        sql`${galleryImages.tags} @> ${JSON.stringify([tag])}`
      );
      conditions.push(or(...tagConditions));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query
      .groupBy(galleryImages.id, users.firstName, users.lastName, users.profileImageUrl)
      .orderBy(desc(galleryImages.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const images = await query;
    return images as GalleryImage[];
  }

  async getGalleryImage(imageId: number): Promise<GalleryImage | undefined> {
    const [image] = await db
      .select({
        id: galleryImages.id,
        url: galleryImages.url,
        title: galleryImages.title,
        description: galleryImages.description,
        collection: galleryImages.collection,
        tags: galleryImages.tags,
        uploadedBy: galleryImages.uploadedBy,
        churchId: galleryImages.churchId,
        createdAt: galleryImages.createdAt,
        updatedAt: galleryImages.updatedAt,
        uploaderName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('uploaderName'),
        uploaderAvatar: users.profileImageUrl,
        likesCount: sql`COUNT(DISTINCT ${galleryImageLikes.id})`.as('likesCount'),
        commentsCount: sql`COUNT(DISTINCT ${galleryImageComments.id})`.as('commentsCount')
      })
      .from(galleryImages)
      .leftJoin(users, eq(galleryImages.uploadedBy, users.id))
      .leftJoin(galleryImageLikes, eq(galleryImages.id, galleryImageLikes.imageId))
      .leftJoin(galleryImageComments, eq(galleryImages.id, galleryImageComments.imageId))
      .where(eq(galleryImages.id, imageId))
      .groupBy(galleryImages.id, users.firstName, users.lastName, users.profileImageUrl)
      .limit(1);
    
    return image as GalleryImage | undefined;
  }

  async uploadGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db
      .insert(galleryImages)
      .values(image)
      .returning();
    return newImage;
  }

  async updateGalleryImage(imageId: number, updates: Partial<GalleryImage>): Promise<GalleryImage> {
    const [updatedImage] = await db
      .update(galleryImages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(galleryImages.id, imageId))
      .returning();
    return updatedImage;
  }

  async deleteGalleryImage(imageId: number, userId: string): Promise<void> {
    // First delete related records
    await db.delete(galleryImageLikes).where(eq(galleryImageLikes.imageId, imageId));
    await db.delete(galleryImageComments).where(eq(galleryImageComments.imageId, imageId));
    await db.delete(galleryImageSaves).where(eq(galleryImageSaves.imageId, imageId));
    
    // Then delete the image (only if user owns it or has admin role)
    await db
      .delete(galleryImages)
      .where(
        and(
          eq(galleryImages.id, imageId),
          eq(galleryImages.uploadedBy, userId)
        )
      );
  }

  // Gallery interactions
  async likeGalleryImage(userId: string, imageId: number): Promise<GalleryImageLike> {
    const [like] = await db
      .insert(galleryImageLikes)
      .values({ userId, imageId })
      .returning();
    return like;
  }

  async unlikeGalleryImage(userId: string, imageId: number): Promise<void> {
    await db
      .delete(galleryImageLikes)
      .where(
        and(
          eq(galleryImageLikes.userId, userId),
          eq(galleryImageLikes.imageId, imageId)
        )
      );
  }

  async isGalleryImageLiked(userId: string, imageId: number): Promise<boolean> {
    const [like] = await db
      .select()
      .from(galleryImageLikes)
      .where(
        and(
          eq(galleryImageLikes.userId, userId),
          eq(galleryImageLikes.imageId, imageId)
        )
      )
      .limit(1);
    return !!like;
  }

  async getGalleryImageLikes(imageId: number): Promise<GalleryImageLike[]> {
    return await db
      .select({
        id: galleryImageLikes.id,
        userId: galleryImageLikes.userId,
        imageId: galleryImageLikes.imageId,
        createdAt: galleryImageLikes.createdAt,
        userName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('userName'),
        userAvatar: users.profileImageUrl
      })
      .from(galleryImageLikes)
      .leftJoin(users, eq(galleryImageLikes.userId, users.id))
      .where(eq(galleryImageLikes.imageId, imageId))
      .orderBy(desc(galleryImageLikes.createdAt));
  }

  async saveGalleryImage(userId: string, imageId: number): Promise<GalleryImageSave> {
    const [save] = await db
      .insert(galleryImageSaves)
      .values({ userId, imageId })
      .returning();
    return save;
  }

  async unsaveGalleryImage(userId: string, imageId: number): Promise<void> {
    await db
      .delete(galleryImageSaves)
      .where(
        and(
          eq(galleryImageSaves.userId, userId),
          eq(galleryImageSaves.imageId, imageId)
        )
      );
  }

  async isGalleryImageSaved(userId: string, imageId: number): Promise<boolean> {
    const [save] = await db
      .select()
      .from(galleryImageSaves)
      .where(
        and(
          eq(galleryImageSaves.userId, userId),
          eq(galleryImageSaves.imageId, imageId)
        )
      )
      .limit(1);
    return !!save;
  }

  async getUserSavedGalleryImages(userId: string): Promise<GalleryImage[]> {
    const images = await db
      .select({
        id: galleryImages.id,
        url: galleryImages.url,
        title: galleryImages.title,
        description: galleryImages.description,
        collection: galleryImages.collection,
        tags: galleryImages.tags,
        uploadedBy: galleryImages.uploadedBy,
        churchId: galleryImages.churchId,
        createdAt: galleryImages.createdAt,
        updatedAt: galleryImages.updatedAt,
        uploaderName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('uploaderName'),
        uploaderAvatar: users.profileImageUrl
      })
      .from(galleryImageSaves)
      .innerJoin(galleryImages, eq(galleryImageSaves.imageId, galleryImages.id))
      .leftJoin(users, eq(galleryImages.uploadedBy, users.id))
      .where(eq(galleryImageSaves.userId, userId))
      .orderBy(desc(galleryImageSaves.createdAt));
    
    return images as GalleryImage[];
  }

  // Gallery comments
  async addGalleryImageComment(comment: InsertGalleryImageComment): Promise<GalleryImageComment> {
    const [newComment] = await db
      .insert(galleryImageComments)
      .values(comment)
      .returning();
    return newComment;
  }

  async getGalleryImageComments(imageId: number): Promise<GalleryImageComment[]> {
    return await db
      .select({
        id: galleryImageComments.id,
        imageId: galleryImageComments.imageId,
        userId: galleryImageComments.userId,
        content: galleryImageComments.content,
        createdAt: galleryImageComments.createdAt,
        updatedAt: galleryImageComments.updatedAt,
        userName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('userName'),
        userAvatar: users.profileImageUrl
      })
      .from(galleryImageComments)
      .leftJoin(users, eq(galleryImageComments.userId, users.id))
      .where(eq(galleryImageComments.imageId, imageId))
      .orderBy(desc(galleryImageComments.createdAt));
  }

  async updateGalleryImageComment(commentId: number, content: string): Promise<GalleryImageComment> {
    const [updatedComment] = await db
      .update(galleryImageComments)
      .set({ content, updatedAt: new Date() })
      .where(eq(galleryImageComments.id, commentId))
      .returning();
    return updatedComment;
  }

  async deleteGalleryImageComment(commentId: number, userId: string): Promise<void> {
    await db
      .delete(galleryImageComments)
      .where(
        and(
          eq(galleryImageComments.id, commentId),
          eq(galleryImageComments.userId, userId)
        )
      );
  }

  // Gallery collections
  async getGalleryCollections(churchId?: number): Promise<{ collection: string; count: number; thumbnail?: string }[]> {
    let query = db
      .select({
        collection: galleryImages.collection,
        count: sql`COUNT(*)`.as('count'),
        thumbnail: sql`MIN(${galleryImages.url})`.as('thumbnail')
      })
      .from(galleryImages);

    if (churchId) {
      query = query.where(eq(galleryImages.churchId, churchId));
    }

    const collections = await query
      .groupBy(galleryImages.collection)
      .orderBy(sql`COUNT(*) DESC`);

    return collections.map(c => ({
      collection: c.collection,
      count: Number(c.count),
      thumbnail: c.thumbnail || undefined
    }));
  }

  async getUserGalleryUploads(userId: string): Promise<GalleryImage[]> {
    const images = await db
      .select({
        id: galleryImages.id,
        url: galleryImages.url,
        title: galleryImages.title,
        description: galleryImages.description,
        collection: galleryImages.collection,
        tags: galleryImages.tags,
        uploadedBy: galleryImages.uploadedBy,
        churchId: galleryImages.churchId,
        createdAt: galleryImages.createdAt,
        updatedAt: galleryImages.updatedAt,
        likesCount: sql`COUNT(DISTINCT ${galleryImageLikes.id})`.as('likesCount'),
        commentsCount: sql`COUNT(DISTINCT ${galleryImageComments.id})`.as('commentsCount')
      })
      .from(galleryImages)
      .leftJoin(galleryImageLikes, eq(galleryImages.id, galleryImageLikes.imageId))
      .leftJoin(galleryImageComments, eq(galleryImages.id, galleryImageComments.imageId))
      .where(eq(galleryImages.uploadedBy, userId))
      .groupBy(galleryImages.id)
      .orderBy(desc(galleryImages.createdAt));
    
    return images as GalleryImage[];
  }

  // Prayer Analytics & Badges implementation
  async getBadgeProgress(userId: string): Promise<any[]> {
    const badges = await db
      .select({
        id: prayerBadges.id,
        name: prayerBadges.name,
        description: prayerBadges.description,
        icon: prayerBadges.icon,
        category: prayerBadges.category,
        requirement: prayerBadges.requirement,
        color: prayerBadges.color,
        reward: prayerBadges.reward,
        currentProgress: userBadgeProgress.currentProgress,
        maxProgress: userBadgeProgress.maxProgress,
        isUnlocked: userBadgeProgress.isUnlocked,
        unlockedAt: userBadgeProgress.unlockedAt,
      })
      .from(prayerBadges)
      .leftJoin(userBadgeProgress, and(
        eq(userBadgeProgress.badgeId, prayerBadges.id),
        eq(userBadgeProgress.userId, userId)
      ))
      .where(eq(prayerBadges.isActive, true))
      .orderBy(prayerBadges.sortOrder);

    return badges.map(badge => ({
      ...badge,
      currentProgress: badge.currentProgress || 0,
      maxProgress: badge.maxProgress || (badge.requirement as any)?.value || 100,
      isUnlocked: badge.isUnlocked || false,
    }));
  }

  async getAnsweredPrayers(userId?: string, churchId?: number): Promise<any[]> {
    let query = db
      .select({
        id: answeredPrayerTestimonies.id,
        prayerId: answeredPrayerTestimonies.prayerId,
        userId: answeredPrayerTestimonies.userId,
        userName: answeredPrayerTestimonies.userName,
        testimony: answeredPrayerTestimonies.testimony,
        answeredAt: answeredPrayerTestimonies.answeredAt,
        category: answeredPrayerTestimonies.category,
        createdAt: answeredPrayerTestimonies.createdAt,
        prayerTitle: prayerRequests.title,
        prayerContent: prayerRequests.content,
      })
      .from(answeredPrayerTestimonies)
      .innerJoin(prayerRequests, eq(answeredPrayerTestimonies.prayerId, prayerRequests.id));

    if (userId) {
      query = query.where(eq(answeredPrayerTestimonies.userId, userId));
    }

    const testimonies = await query
      .orderBy(desc(answeredPrayerTestimonies.answeredAt))
      .limit(50);

    // Get reaction counts
    const testimoniesWithReactions = await Promise.all(
      testimonies.map(async (testimony) => {
        const reactions = await db
          .select({
            reactionType: answeredPrayerReactions.reactionType,
            count: count(answeredPrayerReactions.id),
          })
          .from(answeredPrayerReactions)
          .where(eq(answeredPrayerReactions.testimonyId, testimony.id))
          .groupBy(answeredPrayerReactions.reactionType);

        const comments = await db
          .select({ count: count(answeredPrayerComments.id) })
          .from(answeredPrayerComments)
          .where(eq(answeredPrayerComments.testimonyId, testimony.id));

        return {
          ...testimony,
          reactions: {
            praise: reactions.find(r => r.reactionType === 'praise')?.count || 0,
            heart: reactions.find(r => r.reactionType === 'heart')?.count || 0,
            fire: reactions.find(r => r.reactionType === 'fire')?.count || 0,
          },
          comments: comments[0]?.count || 0,
        };
      })
    );

    return testimoniesWithReactions;
  }

  async createAnsweredPrayerTestimony(data: any): Promise<any> {
    const [testimony] = await db
      .insert(answeredPrayerTestimonies)
      .values(data)
      .returning();
    return testimony;
  }

  async reactToAnsweredPrayer(testimonyId: number, userId: string, reactionType: string): Promise<void> {
    await db
      .insert(answeredPrayerReactions)
      .values({
        testimonyId,
        userId,
        reactionType,
      })
      .onConflictDoUpdate({
        target: [answeredPrayerReactions.userId, answeredPrayerReactions.testimonyId, answeredPrayerReactions.reactionType],
        set: {
          createdAt: new Date(),
        },
      });
  }

  async getPrayerTrends(filters: any, churchId?: number): Promise<any[]> {
    const { timeframe = 'month', ageGroup = 'all', geography = 'all', topic = 'all' } = filters;

    let dateFilter;
    const now = new Date();
    switch (timeframe) {
      case 'week':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    let query = db
      .select({
        category: prayerRequests.category,
        count: count(prayerRequests.id),
      })
      .from(prayerRequests)
      .where(gte(prayerRequests.createdAt, dateFilter));

    if (churchId) {
      query = query.where(eq(prayerRequests.churchId, churchId));
    }

    if (topic !== 'all') {
      query = query.where(eq(prayerRequests.category, topic));
    }

    const trends = await query
      .groupBy(prayerRequests.category)
      .orderBy(desc(count(prayerRequests.id)));

    const total = trends.reduce((sum, trend) => sum + Number(trend.count), 0);

    return trends.map((trend, index) => ({
      category: trend.category || 'general',
      count: Number(trend.count),
      percentage: total > 0 ? Math.round((Number(trend.count) / total) * 100) : 0,
      trend: index < trends.length / 2 ? 'up' : (index < (trends.length * 0.8) ? 'stable' : 'down'),
      change: Math.floor(Math.random() * 20) + 5, // Simplified trend calculation
    }));
  }

  async updateUserProgress(userId: string, activityType: string, entityId?: number): Promise<void> {
    // Track activity
    await db.insert(userActivities).values({
      userId,
      activityType,
      entityId: entityId || null,
    });

    // Update badge progress based on activity
    const badges = await db
      .select()
      .from(prayerBadges)
      .where(eq(prayerBadges.isActive, true));

    for (const badge of badges) {
      const requirement = badge.requirement as any;
      if (!requirement || requirement.type !== activityType) continue;

      // Count user activities for this badge type
      const activityCount = await db
        .select({ count: count(userActivities.id) })
        .from(userActivities)
        .where(and(
          eq(userActivities.userId, userId),
          eq(userActivities.activityType, activityType)
        ));

      const currentProgress = activityCount[0]?.count || 0;
      const maxProgress = requirement.value || 100;
      const isUnlocked = currentProgress >= maxProgress;

      // Upsert user badge progress
      await db
        .insert(userBadgeProgress)
        .values({
          userId,
          badgeId: badge.id,
          currentProgress,
          maxProgress,
          isUnlocked,
          unlockedAt: isUnlocked ? new Date() : null,
        })
        .onConflictDoUpdate({
          target: [userBadgeProgress.userId, userBadgeProgress.badgeId],
          set: {
            currentProgress,
            isUnlocked,
            unlockedAt: isUnlocked ? new Date() : userBadgeProgress.unlockedAt,
            lastProgressUpdate: new Date(),
          },
        });
    }
  }

  async initializeBadges(): Promise<void> {
    const defaultBadges = [
      {
        name: 'Prayer Warrior',
        description: 'Pray 50 times in a week',
        icon: '⚔️',
        category: 'prayer',
        requirement: { type: 'prayer_count', value: 50, timeframe: 'week' },
        color: 'bg-red-500',
        reward: 'Special prayer warrior badge',
        sortOrder: 1,
      },
      {
        name: 'Faithful Friend',
        description: 'Support 25 prayer requests',
        icon: '🤝',
        category: 'community',
        requirement: { type: 'prayer_support', value: 25, timeframe: 'month' },
        color: 'bg-blue-500',
        reward: 'Community supporter badge',
        sortOrder: 2,
      },
      {
        name: 'Growing in Faith',
        description: 'Complete 30 SOAP entries',
        icon: '🌱',
        category: 'growth',
        requirement: { type: 'soap_entry', value: 30, timeframe: 'month' },
        color: 'bg-green-500',
        reward: 'Spiritual growth badge',
        sortOrder: 3,
      },
      {
        name: 'Servant Heart',
        description: 'Volunteer for 10 church events',
        icon: '❤️',
        category: 'service',
        requirement: { type: 'volunteer_event', value: 10, timeframe: 'year' },
        color: 'bg-purple-500',
        reward: 'Service excellence badge',
        sortOrder: 4,
      },
    ];

    for (const badge of defaultBadges) {
      await db
        .insert(prayerBadges)
        .values(badge)
        .onConflictDoNothing();
    }
  }

  // Add missing methods for members and events
  async getAllMembers(): Promise<any[]> {
    try {
      const allMembers = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phoneNumber: users.mobileNumber,
          city: users.city,
          state: users.state,
          isActive: users.isActive,
          createdAt: users.createdAt,
          churchId: users.churchId,
          role: users.role,
          profileImageUrl: users.profileImageUrl,
          churchName: churches.name
        })
        .from(users)
        .leftJoin(churches, eq(users.churchId, churches.id))
        .where(eq(users.isActive, true))
        .orderBy(users.firstName, users.lastName);
      
      return allMembers;
    } catch (error) {
      
      return [];
    }
  }

  async getEventsByChurch(churchId: number): Promise<any[]> {
    try {
      const churchEvents = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          eventDate: events.eventDate,
          endDate: events.endDate,
          location: events.location,
          category: events.category,
          priority: events.priority,
          status: events.status,
          churchId: events.churchId,
          organizerId: events.organizerId,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          organizerName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`
        })
        .from(events)
        .leftJoin(users, eq(events.organizerId, users.id))
        .where(eq(events.churchId, churchId))
        .orderBy(desc(events.eventDate));
      
      return churchEvents;
    } catch (error) {
      
      return [];
    }
  }

  // Communication history operations
  async getCommunicationHistory(churchId: number): Promise<any[]> {
    try {
      const communications = await db
        .select({
          id: sql`MIN(${memberCommunications.id})`.as('id'),
          subject: memberCommunications.subject,
          content: memberCommunications.content,
          communicationType: memberCommunications.communicationType,
          sentAt: sql`MIN(${memberCommunications.sentAt})`.as('sentAt'),
          deliveryStatus: memberCommunications.deliveryStatus,
          recipientCount: sql`COUNT(DISTINCT ${memberCommunications.memberId})`.as('recipientCount'),
          senderName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as('senderName'),
          senderEmail: users.email
        })
        .from(memberCommunications)
        .leftJoin(users, eq(memberCommunications.sentBy, users.id))
        .where(eq(memberCommunications.churchId, churchId))
        .groupBy(
          memberCommunications.subject,
          memberCommunications.content,
          memberCommunications.communicationType,
          memberCommunications.deliveryStatus,
          users.firstName,
          users.lastName,
          users.email
        )
        .orderBy(desc(sql`MIN(${memberCommunications.sentAt})`))
        .limit(50);

      const mappedCommunications = communications.map(comm => ({
        id: comm.id,
        subject: comm.subject,
        title: comm.subject,
        content: comm.content,
        communicationType: comm.communicationType,
        type: comm.communicationType,
        sentAt: comm.sentAt,
        deliveryStatus: comm.deliveryStatus,
        status: comm.deliveryStatus,
        recipientCount: Number(comm.recipientCount),
        senderName: comm.senderName,
        sender: {
          name: comm.senderName,
          email: comm.senderEmail
        }
      }));

      return mappedCommunications;
    } catch (error) {
      
      return [];
    }
  }

  async createCommunicationRecord(record: {
    churchId: number;
    sentBy: string;
    subject: string;
    content: string;
    memberId?: string;
    communicationType: string;
    direction: string;
    sentAt: Date;
    deliveryStatus: string;
    responseReceived?: boolean;
    followUpRequired?: boolean;
    recipientCount?: number;
  }): Promise<any> {
    try {
      // If memberId is provided, create a single record
      if (record.memberId) {
        const communicationRecord = {
          memberId: record.memberId,
          communicationType: record.communicationType,
          direction: record.direction,
          subject: record.subject,
          content: record.content,
          sentBy: record.sentBy,
          sentAt: record.sentAt,
          deliveryStatus: record.deliveryStatus,
          responseReceived: record.responseReceived || false,
          followUpRequired: record.followUpRequired || false,
          churchId: record.churchId
        };

        await db.insert(memberCommunications).values(communicationRecord);
        
        return {
          id: Date.now(),
          subject: record.subject,
          content: record.content,
          type: record.communicationType,
          sentAt: record.sentAt,
          recipientCount: 1
        };
      } else {
        // Legacy bulk approach - get all church members for this communication
        const churchMembers = await this.getChurchMembers(record.churchId);
        
        // Create a communication record for each recipient
        const communicationRecords = churchMembers.map(member => ({
          memberId: member.userId,
          communicationType: record.communicationType,
          direction: record.direction,
          subject: record.subject,
          content: record.content,
          sentBy: record.sentBy,
          sentAt: record.sentAt,
          deliveryStatus: record.deliveryStatus,
          responseReceived: record.responseReceived || false,
          followUpRequired: record.followUpRequired || false,
          churchId: record.churchId
        }));

        // Insert all communication records
        if (communicationRecords.length > 0) {
          await db.insert(memberCommunications).values(communicationRecords);
        }

        return {
          id: 'bulk_' + Date.now(),
          subject: record.subject,
          content: record.content,
          type: record.communicationType,
          sentAt: record.sentAt,
          recipientCount: communicationRecords.length
        };
      }
    } catch (error) {
      
      throw error;
    }
  }

  // Church feature toggle operations
  async getChurchFeatureSettings(churchId: number): Promise<ChurchFeatureSetting[]> {
    return await db.select().from(churchFeatureSettings).where(eq(churchFeatureSettings.churchId, churchId));
  }

  async getChurchFeatureSettingById(featureId: number): Promise<ChurchFeatureSetting | null> {
    const [feature] = await db.select().from(churchFeatureSettings).where(eq(churchFeatureSettings.id, featureId));
    return feature || null;
  }

  async updateChurchFeatureSetting(setting: InsertChurchFeatureSetting): Promise<ChurchFeatureSetting> {
    const existingSetting = await db.select().from(churchFeatureSettings)
      .where(and(
        eq(churchFeatureSettings.churchId, setting.churchId),
        eq(churchFeatureSettings.featureCategory, setting.featureCategory),
        eq(churchFeatureSettings.featureName, setting.featureName)
      )).limit(1);

    if (existingSetting.length > 0) {
      // Update existing setting
      const [updated] = await db.update(churchFeatureSettings)
        .set({
          isEnabled: setting.isEnabled,
          configuration: setting.configuration,
          enabledBy: setting.enabledBy,
          lastModified: new Date()
        })
        .where(and(
          eq(churchFeatureSettings.churchId, setting.churchId),
          eq(churchFeatureSettings.featureCategory, setting.featureCategory),
          eq(churchFeatureSettings.featureName, setting.featureName)
        ))
        .returning();
      return updated;
    } else {
      // Create new setting
      const [created] = await db.insert(churchFeatureSettings).values(setting).returning();
      return created;
    }
  }

  async enableChurchFeature(churchId: number, category: string, featureName: string, enabledBy: string, configuration?: any): Promise<ChurchFeatureSetting> {
    return await this.updateChurchFeatureSetting({
      churchId,
      featureCategory: category,
      featureName,
      isEnabled: true,
      configuration,
      enabledBy
    });
  }

  async disableChurchFeature(churchId: number, category: string, featureName: string): Promise<void> {
    await db.update(churchFeatureSettings)
      .set({
        isEnabled: false,
        lastModified: new Date()
      })
      .where(and(
        eq(churchFeatureSettings.churchId, churchId),
        eq(churchFeatureSettings.featureCategory, category),
        eq(churchFeatureSettings.featureName, featureName)
      ));
  }

  async isFeatureEnabledForChurch(churchId: number, category: string, featureName: string): Promise<boolean> {
    const setting = await db.select().from(churchFeatureSettings)
      .where(and(
        eq(churchFeatureSettings.churchId, churchId),
        eq(churchFeatureSettings.featureCategory, category),
        eq(churchFeatureSettings.featureName, featureName)
      )).limit(1);

    if (setting.length === 0) {
      // If no setting exists, check default based on church size
      const church = await this.getChurch(churchId);
      if (!church) return true; // Default to enabled if church not found

      const churchSize = this.determineChurchSize(church.memberCount || 0);
      const defaultSetting = await db.select().from(defaultFeatureSettings)
        .where(and(
          eq(defaultFeatureSettings.churchSize, churchSize),
          eq(defaultFeatureSettings.featureCategory, category),
          eq(defaultFeatureSettings.featureName, featureName)
        )).limit(1);

      return defaultSetting.length > 0 ? defaultSetting[0].isEnabledByDefault : true;
    }

    return setting[0].isEnabled;
  }

  async getDefaultFeatureSettings(churchSize: string): Promise<DefaultFeatureSetting[]> {
    return await db.select().from(defaultFeatureSettings).where(eq(defaultFeatureSettings.churchSize, churchSize));
  }

  async createDefaultFeatureSetting(setting: InsertDefaultFeatureSetting): Promise<DefaultFeatureSetting> {
    const [created] = await db.insert(defaultFeatureSettings).values(setting).returning();
    return created;
  }

  async initializeChurchFeatures(churchId: number, churchSize: string, enabledBy: string): Promise<void> {
    const defaultSettings = await this.getDefaultFeatureSettings(churchSize);
    
    const featureSettings = defaultSettings.map(defaultSetting => ({
      churchId,
      featureCategory: defaultSetting.featureCategory,
      featureName: defaultSetting.featureName,
      isEnabled: defaultSetting.isEnabledByDefault,
      configuration: defaultSetting.configuration,
      enabledBy
    }));

    if (featureSettings.length > 0) {
      await db.insert(churchFeatureSettings).values(featureSettings);
    }
  }

  private determineChurchSize(memberCount: number): string {
    if (memberCount >= 2000) return 'mega';
    if (memberCount >= 500) return 'large';
    if (memberCount >= 100) return 'medium';
    return 'small';
  }

  // Content expiration privacy methods implementation
  async processExpiredContent(): Promise<{ expiredCount: number; processedTypes: string[] }> {
    const now = new Date();
    let expiredCount = 0;
    const processedTypes: string[] = [];

    try {
      // Process expired discussions
      const expiredDiscussions = await db
        .update(discussions)
        .set({ expiredAt: now })
        .where(
          and(
            isNotNull(discussions.expiresAt),
            lte(discussions.expiresAt, now),
            isNull(discussions.expiredAt)
          )
        )
        .returning({ id: discussions.id });

      if (expiredDiscussions.length > 0) {
        expiredCount += expiredDiscussions.length;
        processedTypes.push('discussions');
      }

      // Process expired prayer requests
      const expiredPrayers = await db
        .update(prayerRequests)
        .set({ expiredAt: now })
        .where(
          and(
            isNotNull(prayerRequests.expiresAt),
            lte(prayerRequests.expiresAt, now),
            isNull(prayerRequests.expiredAt)
          )
        )
        .returning({ id: prayerRequests.id });

      if (expiredPrayers.length > 0) {
        expiredCount += expiredPrayers.length;
        processedTypes.push('prayerRequests');
      }

      // Process expired SOAP entries
      const expiredSoap = await db
        .update(soapEntries)
        .set({ expiredAt: now })
        .where(
          and(
            isNotNull(soapEntries.expiresAt),
            lte(soapEntries.expiresAt, now),
            isNull(soapEntries.expiredAt)
          )
        )
        .returning({ id: soapEntries.id });

      if (expiredSoap.length > 0) {
        expiredCount += expiredSoap.length;
        processedTypes.push('soapEntries');
      }

      return { expiredCount, processedTypes };
    } catch (error) {
      throw error;
    }
  }

  async getExpiringContent(beforeDate: Date): Promise<{ discussions: any[]; prayerRequests: any[]; soapEntries: any[] }> {
    const expiringDiscussions = await db
      .select({
        id: discussions.id,
        title: discussions.title,
        authorId: discussions.authorId,
        expiresAt: discussions.expiresAt,
        createdAt: discussions.createdAt
      })
      .from(discussions)
      .where(
        and(
          isNotNull(discussions.expiresAt),
          lte(discussions.expiresAt, beforeDate),
          isNull(discussions.expiredAt)
        )
      );

    const expiringPrayers = await db
      .select({
        id: prayerRequests.id,
        title: prayerRequests.title,
        authorId: prayerRequests.authorId,
        expiresAt: prayerRequests.expiresAt,
        createdAt: prayerRequests.createdAt
      })
      .from(prayerRequests)
      .where(
        and(
          isNotNull(prayerRequests.expiresAt),
          lte(prayerRequests.expiresAt, beforeDate),
          isNull(prayerRequests.expiredAt)
        )
      );

    const expiringSoap = await db
      .select({
        id: soapEntries.id,
        scriptureReference: soapEntries.scriptureReference,
        userId: soapEntries.userId,
        expiresAt: soapEntries.expiresAt,
        createdAt: soapEntries.createdAt
      })
      .from(soapEntries)
      .where(
        and(
          isNotNull(soapEntries.expiresAt),
          lte(soapEntries.expiresAt, beforeDate),
          isNull(soapEntries.expiredAt)
        )
      );

    return {
      discussions: expiringDiscussions,
      prayerRequests: expiringPrayers,
      soapEntries: expiringSoap
    };
  }

  async markContentAsExpired(contentType: 'discussion' | 'prayer' | 'soap', contentId: number): Promise<void> {
    const now = new Date();

    switch (contentType) {
      case 'discussion':
        await db
          .update(discussions)
          .set({ expiredAt: now })
          .where(eq(discussions.id, contentId));
        break;
      case 'prayer':
        await db
          .update(prayerRequests)
          .set({ expiredAt: now })
          .where(eq(prayerRequests.id, contentId));
        break;
      case 'soap':
        await db
          .update(soapEntries)
          .set({ expiredAt: now })
          .where(eq(soapEntries.id, contentId));
        break;
    }
  }

  async restoreExpiredContent(contentType: 'discussion' | 'prayer' | 'soap', contentId: number): Promise<void> {
    switch (contentType) {
      case 'discussion':
        await db
          .update(discussions)
          .set({ expiredAt: null })
          .where(eq(discussions.id, contentId));
        break;
      case 'prayer':
        await db
          .update(prayerRequests)
          .set({ expiredAt: null })
          .where(eq(prayerRequests.id, contentId));
        break;
      case 'soap':
        await db
          .update(soapEntries)
          .set({ expiredAt: null })
          .where(eq(soapEntries.id, contentId));
        break;
    }
  }

  async getExpiredContentSummary(churchId?: number): Promise<{ totalExpired: number; byType: { [key: string]: number } }> {
    const whereClause = churchId ? and(isNotNull(discussions.expiredAt), eq(discussions.churchId, churchId)) : isNotNull(discussions.expiredAt);
    const prayerWhereClause = churchId ? and(isNotNull(prayerRequests.expiredAt), eq(prayerRequests.churchId, churchId)) : isNotNull(prayerRequests.expiredAt);
    const soapWhereClause = churchId ? and(isNotNull(soapEntries.expiredAt), eq(soapEntries.churchId, churchId)) : isNotNull(soapEntries.expiredAt);

    const [discussionCount] = await db
      .select({ count: count() })
      .from(discussions)
      .where(whereClause);

    const [prayerCount] = await db
      .select({ count: count() })
      .from(prayerRequests)
      .where(prayerWhereClause);

    const [soapCount] = await db
      .select({ count: count() })
      .from(soapEntries)
      .where(soapWhereClause);

    const byType = {
      discussions: discussionCount.count,
      prayerRequests: prayerCount.count,
      soapEntries: soapCount.count
    };

    const totalExpired = byType.discussions + byType.prayerRequests + byType.soapEntries;

    return { totalExpired, byType };
  }
}

export const storage = new DatabaseStorage();
