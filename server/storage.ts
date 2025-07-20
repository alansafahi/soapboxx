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
  videoComments,
  videoLikes,
  videoUploadSessions,
  videoSeries,
  videoViews,
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
  type ContactSubmission,
  // Content moderation imports
  contentReports,
  contentModerationActions,
  userModerationHistory,
  contentModerationSettings,
  type ContentReport,
  type InsertContentReport,
  type ContentModerationAction,
  type InsertContentModerationAction,
  type UserModerationHistory,
  type InsertUserModerationHistory,
  type ContentModerationSettings,
  type InsertContentModerationSettings,
  type InsertContactSubmission,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type VideoComment,
  type InsertVideoComment,
  type VideoLike,
  type InsertVideoLike,
  type VideoUploadSession,
  type InsertVideoUploadSession,
  type VideoSeries,
  type InsertVideoSeries,
  type VideoView,
  type InsertVideoView,
  contactSubmissions,
  chatConversations,
  chatMessages,
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
import { eq, desc, and, sql, count, asc, or, ilike, isNotNull, gte, lte, inArray, isNull, gt, ne, avg } from "drizzle-orm";

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
  updateDiscussion(id: number, updates: Partial<Discussion>): Promise<Discussion>;
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

  // Content moderation operations
  // Content reports
  createContentReport(report: InsertContentReport): Promise<ContentReport>;
  getContentReports(churchId?: number, status?: string): Promise<ContentReport[]>;
  getContentReport(reportId: number): Promise<ContentReport | undefined>;
  updateContentReportStatus(reportId: number, status: string, reviewedBy: string, reviewNotes?: string, actionTaken?: string): Promise<ContentReport>;
  requestContentEdit(contentType: string, contentId: number, feedback: string, suggestions: string, moderatorId: string): Promise<any>;
  
  // Moderation actions
  createModerationAction(action: InsertContentModerationAction): Promise<ContentModerationAction>;
  getModerationActions(contentType?: string, contentId?: number): Promise<ContentModerationAction[]>;
  
  // User moderation history
  createUserModerationRecord(record: InsertUserModerationHistory): Promise<UserModerationHistory>;
  getUserModerationHistory(userId: string): Promise<UserModerationHistory[]>;
  getActiveSuspensions(userId: string): Promise<UserModerationHistory[]>;
  resolveUserModeration(recordId: number): Promise<UserModerationHistory>;
  
  // Content moderation settings
  getContentModerationSettings(churchId: number): Promise<ContentModerationSettings | undefined>;
  updateContentModerationSettings(churchId: number, settings: Partial<InsertContentModerationSettings>): Promise<ContentModerationSettings>;
  
  // AI content analysis
  analyzeContentWithAI(content: string, contentType: string): Promise<{ flagged: boolean; confidence: number; reason?: string; severity?: string }>;
  
  // Content visibility management
  hideContent(contentType: string, contentId: number, reason: string, moderatorId: string): Promise<void>;
  restoreContent(contentType: string, contentId: number, moderatorId: string): Promise<void>;
  
  // User suspension management
  suspendUser(userId: string, reason: string, duration: string, moderatorId: string, severity: string): Promise<UserModerationHistory>;
  banUser(userId: string, reason: string, moderatorId: string): Promise<UserModerationHistory>;
  
  // Bulk moderation operations
  bulkModerationAction(contentIds: number[], contentType: string, action: string, moderatorId: string, reason: string): Promise<void>;
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
  
  // Contact submissions from marketing website
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  updateContactSubmissionStatus(id: number, status: string): Promise<ContactSubmission>;
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
  deleteDiscussion(id: number): Promise<void>;
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

  // Chat conversation operations
  createChatConversation(sessionId: string, userData?: { name?: string; email?: string }): Promise<ChatConversation>;
  getChatConversation(sessionId: string): Promise<ChatConversation | undefined>;
  updateChatConversation(sessionId: string, data: { userName?: string; userEmail?: string }): Promise<ChatConversation>;
  getActiveChatConversations(): Promise<ChatConversation[]>;

  // Chat message operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  markChatMessagesAsRead(sessionId: string, sender: string): Promise<void>;
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

  async getUserById(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
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

  async deleteSoapEntry(id: number): Promise<void> {
    // Delete related data first
    await db.delete(reactions).where(eq(reactions.targetId, id));
    await db.delete(soapBookmarks).where(eq(soapBookmarks.soapId, id));
    await db.delete(contentReports).where(eq(contentReports.contentId, id));
    
    // Delete the SOAP entry
    await db.delete(soapEntries).where(eq(soapEntries.id, id));
  }

  async deleteDiscussion(id: number): Promise<void> {
    // Delete related data first
    await db.delete(discussionComments).where(eq(discussionComments.discussionId, id));
    await db.delete(discussionLikes).where(eq(discussionLikes.discussionId, id));
    await db.delete(discussionBookmarks).where(eq(discussionBookmarks.discussionId, id));
    await db.delete(contentReports).where(eq(contentReports.contentId, id));
    await db.delete(reactions).where(eq(reactions.targetId, id));
    
    // Delete the discussion
    await db.delete(discussions).where(eq(discussions.id, id));
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
  async getDiscussions(limit?: number, offset?: number, churchId?: number, currentUserId?: string, includeFlagged?: boolean): Promise<any[]> {
    try {
      // Get regular discussions
      const regularDiscussions = await db
        .select()
        .from(discussions)
        .leftJoin(users, eq(discussions.authorId, users.id))
        .where(
          and(
            isNull(discussions.expiredAt),
            eq(discussions.isPublic, true),
            churchId ? eq(discussions.churchId, churchId) : undefined
          )
        )
        .orderBy(desc(discussions.createdAt))
        .limit(limit || 50)
        .offset(offset || 0);

      // Get public SOAP entries  
      const soapEntriesData = await db
        .select()
        .from(soapEntries)
        .leftJoin(users, eq(soapEntries.userId, users.id))
        .where(eq(soapEntries.isPublic, true))
        .orderBy(desc(soapEntries.createdAt))
        .limit(limit || 25);

      // Transform and combine results
      const transformedDiscussions = regularDiscussions.map(row => ({
        ...row.discussions,
        author: row.users,
        type: 'general',
        soapData: null
      }));

      const transformedSoap = soapEntriesData.map(row => ({
        ...row.soap_entries,
        id: row.soap_entries?.id,
        authorId: row.soap_entries?.userId,
        title: 'S.O.A.P. Reflection',
        content: row.soap_entries?.scripture,
        category: 'soap_reflection',
        likeCount: 0,
        commentCount: 0,
        author: row.users,
        type: 'soap_reflection',
        soapData: {
          scripture: row.soap_entries?.scripture,
          scriptureReference: row.soap_entries?.scriptureReference,
          observation: row.soap_entries?.observation,
          application: row.soap_entries?.application,
          prayer: row.soap_entries?.prayer,
        }
      }));

      // Combine and sort all posts
      const allPosts = [...transformedDiscussions, ...transformedSoap]
        .filter(post => post.id) // Remove any invalid entries
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allPosts.slice(0, limit || 50);
    } catch (error) {
      console.error('Error in getDiscussions:', error);
      return [];
    }
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

  async getUserPosts(userId: string, sort: string = 'recent', type: string = 'all'): Promise<any[]> {
    try {
      const allPosts: any[] = [];

      // Get discussions using raw SQL
      if (type === 'all' || type === 'discussion') {
        const discussionResult = await db.execute(sql`
          SELECT * FROM discussions 
          WHERE author_id = ${userId} 
          ORDER BY created_at DESC
        `);
        
        const discussionsWithType = discussionResult.rows.map(d => ({ 
          ...d, 
          type: 'discussion',
          authorId: d.author_id,
          churchId: d.church_id,
          isPublic: d.is_public,
          createdAt: d.created_at,
          updatedAt: d.updated_at
        }));
        allPosts.push(...discussionsWithType);
      }

      // Get SOAP entries using raw SQL
      if (type === 'all' || type === 'soap_reflection') {
        const soapResult = await db.execute(sql`
          SELECT * FROM soap_entries 
          WHERE user_id = ${userId} 
          ORDER BY created_at DESC
        `);

        const soapWithType = soapResult.rows.map(s => ({
          ...s,
          type: 'soap_reflection',
          title: 'S.O.A.P. Reflection',
          category: 'soap_reflection',
          likeCount: 0,
          commentCount: 0,
          mood: s.mood || null,
          content: s.scripture || s.observation || s.application || s.prayer || 'S.O.A.P. Entry',
          userId: s.user_id,
          churchId: s.church_id,
          isPublic: s.is_public,
          createdAt: s.created_at,
          updatedAt: s.updated_at
        }));
        allPosts.push(...soapWithType);
      }

      // Get prayer requests using raw SQL
      if (type === 'all' || type === 'prayer_request') {
        const prayerResult = await db.execute(sql`
          SELECT * FROM prayer_requests 
          WHERE author_id = ${userId} 
          ORDER BY created_at DESC
        `);

        const prayerRequestsWithCount = prayerResult.rows.map(prayer => ({
          ...prayer,
          type: 'prayer_request',
          likeCount: 0,
          commentCount: 0,
          mood: prayer.mood || null,
          prayerCount: prayer.prayer_count || 0,
          authorId: prayer.author_id,
          churchId: prayer.church_id,
          isPublic: prayer.is_public,
          isAnonymous: prayer.is_anonymous,
          isAnswered: prayer.is_answered,
          answeredAt: prayer.answered_at,
          createdAt: prayer.created_at,
          updatedAt: prayer.updated_at
        }));

        allPosts.push(...prayerRequestsWithCount);
      }

      // Sort posts
      allPosts.sort((a, b) => {
        switch (sort) {
          case 'popular':
            return (b.likeCount || 0) - (a.likeCount || 0);
          case 'engagement':
            const aEngagement = (a.likeCount || 0) + (a.commentCount || 0) + (a.prayerCount || 0);
            const bEngagement = (b.likeCount || 0) + (b.commentCount || 0) + (b.prayerCount || 0);
            return bEngagement - aEngagement;
          case 'recent':
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });

      return allPosts;
    } catch (error) {
      console.error('Error in getUserPosts:', error);
      return [];
    }
  }

  async getUserPostStats(userId: string): Promise<{
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalPrayers: number;
    discussionCount: number;
    soapCount: number;
    prayerRequestCount: number;
  }> {
    try {
      // Get discussion count using raw SQL to avoid Drizzle issues
      const discussionResult = await db.execute(sql`SELECT COUNT(*) as count FROM discussions WHERE author_id = ${userId}`);
      const discussionCount = Number(discussionResult.rows[0]?.count || 0);

      // Get SOAP entry count
      const soapResult = await db.execute(sql`SELECT COUNT(*) as count FROM soap_entries WHERE user_id = ${userId}`);
      const soapCount = Number(soapResult.rows[0]?.count || 0);

      // Get prayer request count  
      const prayerResult = await db.execute(sql`SELECT COUNT(*) as count FROM prayer_requests WHERE author_id = ${userId}`);
      const prayerRequestCount = Number(prayerResult.rows[0]?.count || 0);

      // Get total prayers offered BY this user (prayers they gave to others)
      const prayersOfferedResult = await db.execute(sql`SELECT COUNT(*) as count FROM prayer_responses WHERE user_id = ${userId}`);
      const totalPrayers = Number(prayersOfferedResult.rows[0]?.count || 0);

      // Get total likes received on user's content
      const likesResult = await db.execute(sql`
        SELECT 
          (SELECT COUNT(*) FROM discussion_likes dl 
           JOIN discussions d ON dl.discussion_id = d.id 
           WHERE d.author_id = ${userId}) +
          (SELECT COUNT(*) FROM reactions r 
           JOIN soap_entries s ON r.target_id = s.id 
           WHERE s.user_id = ${userId} AND r.target_type = 'soap_entry') as count
      `);
      const totalLikes = Number(likesResult.rows[0]?.count || 0);

      // Get total comments on user's content
      const commentsResult = await db.execute(sql`
        SELECT 
          (SELECT COUNT(*) FROM discussion_comments dc 
           JOIN discussions d ON dc.discussion_id = d.id 
           WHERE d.author_id = ${userId}) +
          (SELECT COUNT(*) FROM soap_comments sc 
           JOIN soap_entries s ON sc.soap_entry_id = s.id 
           WHERE s.user_id = ${userId}) as count
      `);
      const totalComments = Number(commentsResult.rows[0]?.count || 0);

      return {
        totalPosts: discussionCount + soapCount + prayerRequestCount,
        totalLikes, // Actual likes received on user's content
        totalComments, // Actual comments received on user's content  
        totalPrayers, // Actual prayers offered by user to others
        discussionCount,
        soapCount,
        prayerRequestCount,
      };
    } catch (error) {
      console.error('Error in getUserPostStats:', error);
      return {
        totalPosts: 0,
        totalLikes: 0,
        totalComments: 0,
        totalPrayers: 0,
        discussionCount: 0,
        soapCount: 0,
        prayerRequestCount: 0,
      };
    }
  }
}

export const storage = new DatabaseStorage();
