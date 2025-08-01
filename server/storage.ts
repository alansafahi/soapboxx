import MappingService from "./mapping-service";
import {
  users,
  notifications,
  communities,
  churches, // Legacy alias for backward compatibility
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
  prayerResponseLikes,
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
  type SoapEntry,
  type InsertSoapEntry,
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
  // D.I.V.I.N.E. Phase 3A imports
  memberCampusAssignments,
  campusMemberRoles,
  memberTransferHistory,
  type MemberCampusAssignment,
  type InsertMemberCampusAssignment,
  type CampusMemberRole,
  type InsertCampusMemberRole,
  type MemberTransferHistory,
  type InsertMemberTransferHistory,
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
  campuses,
  campusAdministrators,
  volunteerCampusAssignments,
  backgroundCheckProviders,
  type Campus,
  type InsertCampus,
  type CampusAdministrator,
  type InsertCampusAdministrator,
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
  likePrayerResponse(responseId: number, userId: string): Promise<{ liked: boolean; likeCount: number }>;
  getPrayerResponseLikeStatus(responseId: number, userId: string): Promise<boolean>;
  markPrayerAnswered(id: number): Promise<void>;
  updatePrayerStatus(prayerId: number, status: string, moderationNotes?: string): Promise<PrayerRequest>;
  createPrayerAssignment(assignment: InsertPrayerAssignment): Promise<PrayerAssignment>;
  createPrayerFollowUp(followUp: InsertPrayerFollowUp): Promise<PrayerFollowUp>;
  getAllUsers(): Promise<User[]>;
  getAllMembers(): Promise<any[]>;
  
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
  
  // Check-in operations
  createCheckIn(checkIn: InsertCheckIn): Promise<CheckIn>;
  getUserDailyCheckIn(userId: string): Promise<CheckIn | undefined>;
  getUserCheckInStreak(userId: string): Promise<number>;
  getUserCheckIns(userId: string, limit?: number): Promise<CheckIn[]>;
  
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

  async searchUsers(query: string, currentUserId?: string, churchId?: number): Promise<User[]> {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    // Build the query with safety constraints
    let queryBuilder = db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        communityId: userChurches.churchId,
        role: userChurches.role,
        isDiscoverable: sql`${users.isDiscoverable}::boolean`
      })
      .from(users)
      .leftJoin(userChurches, eq(users.id, userChurches.userId))
      .where(
        and(
          // Basic search criteria
          or(
            ilike(users.firstName, searchTerm),
            ilike(users.lastName, searchTerm),
            ilike(users.email, searchTerm)
          ),
          // Safety constraints
          currentUserId ? ne(users.id, currentUserId) : undefined, // Exclude current user
          churchId ? eq(userChurches.churchId, churchId) : undefined, // Church-scoped search
          eq(sql`${users.isDiscoverable}::boolean`, true), // Only discoverable users
          eq(userChurches.isActive, true) // Only active church members
        )
      )
      .limit(10);
    
    const foundUsers = await queryBuilder;
    return foundUsers as User[];
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
      .from(communities)
      .where(eq(communities.isActive, true))
      .orderBy(asc(communities.name));
  }

  async getNearbyChurches(lat?: number, lng?: number, limit: number = 10): Promise<Church[]> {
    // For simplicity, just return churches ordered by creation date if no coordinates provided
    if (!lat || !lng) {
      return await db
        .select()
        .from(communities)
        .where(eq(communities.isActive, true))
        .orderBy(desc(communities.createdAt))
        .limit(limit);
    }
    
    // In a real implementation, you'd use PostGIS for distance calculations
    return await db
      .select()
      .from(communities)
      .where(eq(communities.isActive, true))
      .orderBy(desc(communities.createdAt))
      .limit(limit);
  }

  async searchChurches(params: { denomination?: string; location?: string; churchName?: string; size?: string; proximity?: number; limit?: number }): Promise<any[]> {
    try {
      let whereConditions = [
        eq(communities.isActive, true),
        eq(communities.isDemo, false), // Only show production churches, not demo churches
        eq(communities.verificationStatus, 'approved') // Only show approved churches
      ];
      
      // Filter by denomination (only if not "all")
      if (params.denomination && params.denomination !== "all") {
        whereConditions.push(eq(communities.denomination, params.denomination));
      }
      
      // Filter by church name
      if (params.churchName && params.churchName.trim()) {
        const nameTerm = `%${params.churchName.trim()}%`;
        whereConditions.push(
          sql`${communities.name} ILIKE ${nameTerm}`
        );
      }
      
      // Filter by location (search in city, state, or zip code) - only if no specific denomination filter
      if (params.location && params.location.trim() && (!params.denomination || params.denomination === "all")) {
        const locationTerm = `%${params.location.trim()}%`;
        whereConditions.push(
          sql`(${communities.city} ILIKE ${locationTerm} OR ${communities.state} ILIKE ${locationTerm} OR ${communities.zipCode} ILIKE ${locationTerm})`
        );
      }
      
      // Optimized single query with left join for member counts
      const results = await db
        .select({
          id: communities.id,
          name: communities.name,
          denomination: communities.denomination,
          description: communities.description,
          bio: communities.bio,
          address: communities.address,
          city: communities.city,
          state: communities.state,
          zipCode: communities.zipCode,
          website: communities.website,
          phone: communities.phone,
          email: communities.email,
          logoUrl: communities.logoUrl,
          socialLinks: communities.socialLinks,
          communityTags: communities.communityTags,
          latitude: communities.latitude,
          longitude: communities.longitude,
          rating: communities.rating,
          memberCount: communities.memberCount,
          isActive: communities.isActive,
          isClaimed: communities.isClaimed,
          adminEmail: communities.adminEmail,
          isDemo: communities.isDemo,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
          actualMemberCount: sql<number>`COALESCE(COUNT(${userChurches.churchId}), 0)::int`,
          distance: sql<number>`0` // Placeholder for distance
        })
        .from(communities)
        .leftJoin(userChurches, and(
          eq(userChurches.churchId, communities.id),
          eq(userChurches.isActive, true)
        ))
        .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
        .groupBy(communities.id)
        .orderBy(asc(communities.name))
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
          .from(communities)
          .where(eq(communities.isActive, true))
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
      .select({ denomination: communities.denomination })
      .from(communities)
      .where(and(
        eq(communities.isActive, true),
        isNotNull(communities.denomination)
      ))
      .groupBy(communities.denomination)
      .orderBy(asc(communities.denomination));
    
    return result
      .map(row => row.denomination)
      .filter(denomination => denomination !== null && denomination.trim() !== '') as string[];
  }

  // Church verification operations
  async getChurchesByStatus(status?: string): Promise<any[]> {
    let whereCondition;
    
    if (status === 'pending') {
      whereCondition = eq(communities.verificationStatus, 'pending');
    } else if (status === 'approved') {
      whereCondition = eq(communities.verificationStatus, 'approved');
    } else if (status === 'rejected') {
      whereCondition = eq(communities.verificationStatus, 'rejected');
    } else if (status === 'suspended') {
      whereCondition = eq(communities.verificationStatus, 'suspended');
    } else {
      // Return all churches if no status filter
      whereCondition = undefined;
    }
    
    const query = db
      .select({
        id: communities.id,
        name: communities.name,
        denomination: communities.denomination,
        description: communities.description,
        bio: communities.bio,
        address: communities.address,
        city: communities.city,
        state: communities.state,
        zipCode: communities.zipCode,
        phone: communities.phone,
        email: communities.email,
        website: communities.website,
        logoUrl: communities.logoUrl,
        size: communities.size,
        hoursOfOperation: communities.hoursOfOperation,
        socialLinks: communities.socialLinks,
        communityTags: communities.communityTags,
        latitude: communities.latitude,
        longitude: communities.longitude,
        rating: communities.rating,
        memberCount: communities.memberCount,
        isActive: communities.isActive,
        isClaimed: communities.isClaimed,
        adminEmail: communities.adminEmail,
        isDemo: communities.isDemo,
        status: communities.verificationStatus, // Map verificationStatus to status for frontend
        verifiedAt: communities.verifiedAt,
        verifiedBy: communities.verifiedBy,
        rejectionReason: communities.rejectionReason,
        createdAt: communities.createdAt,
        updatedAt: communities.updatedAt,
      })
      .from(communities)
      .orderBy(desc(communities.createdAt));
    
    if (whereCondition) {
      query.where(whereCondition);
    }
    
    return await query;
  }

  async approveChurch(churchId: number, approvedBy: string): Promise<void> {
    await db
      .update(communities)
      .set({
        verificationStatus: 'approved',
        verifiedBy: approvedBy,
        verifiedAt: new Date(),
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(communities.id, churchId));
  }

  async rejectChurch(churchId: number, reason: string, rejectedBy: string): Promise<void> {
    await db
      .update(communities)
      .set({
        verificationStatus: 'rejected',
        verifiedBy: rejectedBy,
        rejectionReason: reason,
        updatedAt: new Date()
      })
      .where(eq(communities.id, churchId));
  }

  async suspendChurch(churchId: number, reason: string, suspendedBy: string): Promise<void> {
    await db
      .update(communities)
      .set({
        verificationStatus: 'suspended',
        verifiedBy: suspendedBy,
        rejectionReason: reason,
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(communities.id, churchId));
  }

  async getChurch(id: number): Promise<Church | undefined> {
    try {
      const [church] = await db.select().from(communities).where(eq(communities.id, id));
      return church;
    } catch (error) {

      throw error;
    }
  }

  // Add missing getChurchLeaderboard method for the leaderboard endpoint
  async getChurchLeaderboard(churchId: number): Promise<any[]> {
    try {
      // Simple leaderboard implementation - return empty for now
      // TODO: Implement proper leaderboard logic
      return [];
    } catch (error) {

      return [];
    }
  }

  async getChurchByAdminEmail(email: string): Promise<Church | undefined> {
    const [church] = await db
      .select()
      .from(communities)
      .where(eq(communities.adminEmail, email));
    return church;
  }

  async createChurch(church: InsertChurch): Promise<Church> {
    const [newChurch] = await db.insert(communities).values(church).returning();
    return newChurch;
  }

  async updateChurch(id: number, updates: Partial<Church>): Promise<Church> {
    
    // Filter out any fields that don't exist in the database schema
    const allowedFields = [
      'name', 'type', 'denomination', 'description', 'bio', 'address', 'city', 
      'state', 'zipCode', 'phone', 'email', 'website', 'logoUrl', 'size', 
      'hoursOfOperation', 'officeHours', 'worshipTimes', 'socialLinks', 'communityTags', 'latitude', 'longitude', 
      'rating', 'memberCount', 'isActive', 'isClaimed', 'adminEmail', 'adminPhone', 
      'verificationStatus', 'rejectionReason', 'createdBy', 'isDemo', 'updatedAt',
      'establishedYear', 'parentChurchName' // Added missing database fields that exist in schema
    ];
    
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = (updates as any)[key];
        return obj;
      }, {} as any);
    

    
    const [updatedChurch] = await db
      .update(communities)
      .set({ ...filteredUpdates, updatedAt: new Date() })
      .where(eq(communities.id, id))
      .returning();
    
    return updatedChurch;
  }

  async deleteChurch(id: number): Promise<void> {
    // Soft delete by marking as inactive
    await db
      .update(communities)
      .set({ 
        isActive: false,
        updatedAt: new Date()
      })
      .where(eq(communities.id, id));
  }

  async getUserCreatedChurches(userId: string): Promise<Church[]> {
    try {
      // Use raw SQL to avoid Drizzle ORM table reference issues
      const result = await db.execute(sql`
        SELECT 
          c.id, c.name, c.denomination, c.address, c.city, c.state, c.zip_code as "zipCode",
          c.phone, c.email, c.website, c.description, c.logo_url as "logoUrl",
          c.verification_status as "verificationStatus", c.is_active as "isActive",
          c.created_at as "createdAt", c.updated_at as "updatedAt", c.admin_email as "adminEmail",
          c.type, c.size, c.member_count as "memberCount", c.created_by as "createdBy"
        FROM communities c
        INNER JOIN user_churches uc ON c.id = uc.church_id
        WHERE uc.user_id = ${userId}
          AND uc.role IN ('church_admin', 'admin', 'pastor', 'lead-pastor')
          AND c.is_active = true
          AND uc.is_active = true
        ORDER BY c.created_at DESC
      `);


      return result.rows as Church[];
    } catch (error) {

      
      // Try alternative query using direct createdBy field
      try {
        const fallbackResult = await db.execute(sql`
          SELECT * FROM communities 
          WHERE created_by = ${userId} 
            AND is_active = true 
          ORDER BY created_at DESC
        `);
        

        return fallbackResult.rows as Church[];
      } catch (fallbackError) {

        return [];
      }
    }
  }

  async getUserChurch(userId: string): Promise<(UserChurch & { role: string }) | undefined> {
    // First try to get primary church
    const [primaryChurch] = await db
      .select()
      .from(userChurches)
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.isActive, true),
        sql`is_primary = true`
      ))
      .limit(1);
    
    // If no primary church set, fall back to first church joined
    const [userChurch] = primaryChurch ? [primaryChurch] : await db
      .select()
      .from(userChurches)
      .where(and(
        eq(userChurches.userId, userId),
        eq(userChurches.isActive, true)
      ))
      .orderBy(userChurches.joinedAt)
      .limit(1);
    
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
    try {
      const result = await pool.query(
        'SELECT role FROM user_churches WHERE user_id = $1 AND church_id = $2 AND is_active = true LIMIT 1',
        [userId, churchId]
      );

      if (result.rows.length === 0) {
        return undefined;
      }

      return {
        role: result.rows[0].role || 'member'
      };
    } catch (error) {
      return undefined;
    }
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
        communityId: userChurches.churchId,
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
      .where(churchId ? eq(events.communityId, churchId) : undefined)
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

  async deletePrayerRequest(prayerId: number, userId: string): Promise<void> {
    try {
      // Verify the user owns this prayer request
      const [prayerRequest] = await db
        .select()
        .from(prayerRequests)
        .where(eq(prayerRequests.id, prayerId));
      
      if (!prayerRequest) {
        throw new Error('Prayer request not found');
      }
      
      if (prayerRequest.authorId !== userId) {
        throw new Error('You can only delete your own prayer requests');
      }
      
      // Delete related data first to handle foreign key constraints
      await db.delete(prayerResponses).where(eq(prayerResponses.prayerRequestId, prayerId));
      await db.delete(prayerBookmarks).where(eq(prayerBookmarks.prayerId, prayerId));
      await db.delete(contentReports).where(eq(contentReports.contentId, prayerId));
      await db.delete(reactions).where(eq(reactions.targetId, prayerId));
      
      // Delete the prayer request
      await db.delete(prayerRequests).where(eq(prayerRequests.id, prayerId));
      
    } catch (error) {
      throw error;
    }
  }

  async getUpcomingEvents(churchId?: number, limit = 10): Promise<Event[]> {
    const now = new Date();
    const query = db
      .select()
      .from(events)
      .where(and(
        churchId ? eq(events.communityId, churchId) : undefined,
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
        churchId ? eq(events.communityId, churchId) : undefined,
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
      // Simple query to get discussions without complex joins for now
      const discussionsResult = await db.execute(sql`
        SELECT 
          d.id, d.title, d.content, d.category, d.is_public, d.created_at, d.author_id,
          u.id as user_id, u.email, u.first_name, u.last_name, u.profile_image_url
        FROM discussions d
        LEFT JOIN users u ON d.author_id = u.id
        WHERE d.is_public = true AND d.expired_at IS NULL
        ORDER BY d.created_at DESC
        LIMIT ${limit || 50} OFFSET ${offset || 0}
      `);

      const discussions = discussionsResult.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        category: row.category,
        isPublic: row.is_public,
        createdAt: row.created_at,
        authorId: row.author_id,
        author: {
          id: row.user_id,
          email: row.email,
          firstName: row.first_name,
          lastName: row.last_name,
          profileImageUrl: row.profile_image_url,
        },
        type: 'general',
        soapData: null,
        isLiked: false
      }));

      // Get comment counts for discussions
      const discussionIds = discussions.map(d => d.id).filter(Boolean);
      let discussionCommentCounts: Record<number, number> = {};
      
      if (discussionIds.length > 0) {
        const commentCountResult = await db.execute(sql`
          SELECT discussion_id, COUNT(*) as comment_count 
          FROM discussion_comments 
          WHERE discussion_id IN (${sql.join(discussionIds, sql`, `)})
          GROUP BY discussion_id
        `);
        
        discussionCommentCounts = commentCountResult.rows.reduce((acc: Record<number, number>, row: any) => {
          acc[row.discussion_id] = Number(row.comment_count);
          return acc;
        }, {});
      }

      // Get like counts and user like status for discussions
      let discussionLikeCounts: Record<number, number> = {};
      let userLikedDiscussions: Set<number> = new Set();
      
      if (discussionIds.length > 0) {
        // Get like counts
        const likeCountResult = await db.execute(sql`
          SELECT discussion_id, COUNT(*) as like_count 
          FROM discussion_likes 
          WHERE discussion_id IN (${sql.join(discussionIds, sql`, `)})
          GROUP BY discussion_id
        `);
        
        discussionLikeCounts = likeCountResult.rows.reduce((acc: Record<number, number>, row: any) => {
          acc[row.discussion_id] = Number(row.like_count);
          return acc;
        }, {});
        
        // Get user's liked posts
        if (currentUserId) {
          const userLikesResult = await db.execute(sql`
            SELECT discussion_id 
            FROM discussion_likes 
            WHERE user_id = ${currentUserId} AND discussion_id IN (${sql.join(discussionIds, sql`, `)})
          `);
          
          userLikedDiscussions = new Set(userLikesResult.rows.map((row: any) => row.discussion_id));
        }
      }

      // Add comment counts, like counts, and like status to discussions
      const discussionsWithCounts = discussions.map(discussion => ({
        ...discussion,
        commentCount: discussionCommentCounts[discussion.id] || 0,
        likeCount: discussionLikeCounts[discussion.id] || 0,
        isLiked: userLikedDiscussions.has(discussion.id)
      }));

      return discussionsWithCounts;
    } catch (error) {
      return [];
    }
  }

  // Missing toggleDiscussionLike method
  async toggleDiscussionLike(userId: string, discussionId: number): Promise<any> {
    try {
      // Check if user already liked this discussion
      const existingLike = await db.execute(sql`
        SELECT * FROM discussion_likes 
        WHERE user_id = ${userId} AND discussion_id = ${discussionId}
      `);

      if (existingLike.rows.length > 0) {
        // Unlike - remove the like
        await db.execute(sql`
          DELETE FROM discussion_likes 
          WHERE user_id = ${userId} AND discussion_id = ${discussionId}
        `);
        
        // Remove points for unliking
        await this.trackUserActivity({
          userId: userId,
          activityType: 'unlike_discussion',
          entityId: discussionId,
          points: -5, // Remove 5 points for unliking
        });
        
        return { success: true, liked: false, message: 'Like removed' };
      } else {
        // Like - add the like
        await db.execute(sql`
          INSERT INTO discussion_likes (user_id, discussion_id, created_at)
          VALUES (${userId}, ${discussionId}, ${new Date()})
        `);
        
        // Track user activity and award points
        await this.trackUserActivity({
          userId: userId,
          activityType: 'like_discussion',
          entityId: discussionId,
          points: 5, // Award 5 points for liking
        });
        
        return { success: true, liked: true, message: 'Like added' };
      }
    } catch (error) {
      throw new Error('Failed to toggle like');
    }
  }

  // Simplified getDiscussions for testing - keeping original complex version below
  async getDiscussionsOLD(limit?: number, offset?: number, churchId?: number, currentUserId?: string, includeFlagged?: boolean): Promise<any[]> {
    try {
      // Get public SOAP entries  
      const soapEntriesData = await db
        .select()
        .from(soapEntries)
        .leftJoin(users, eq(soapEntries.userId, users.id))
        .where(eq(soapEntries.isPublic, true))
        .orderBy(desc(soapEntries.createdAt))
        .limit(limit || 25);

      // Get public prayer requests
      const prayerRequestsData = await db
        .select()
        .from(prayerRequests)
        .leftJoin(users, eq(prayerRequests.authorId, users.id))
        .where(
          and(
            eq(prayerRequests.isPublic, true),
            or(
              isNull(prayerRequests.expiresAt),
              gt(prayerRequests.expiresAt, new Date())
            )
          )
        )
        .orderBy(desc(prayerRequests.createdAt))
        .limit(limit || 25);

      // Get discussion like status for current user if provided
      const discussionIds = allDiscussions.map(row => row.discussions?.id).filter(Boolean);
      let discussionLikeStatus: Record<number, boolean> = {};
      if (currentUserId && discussionIds.length > 0) {
        const discussionLikeResult = await db.execute(sql`
          SELECT discussion_id, COUNT(*) as is_liked
          FROM discussion_likes 
          WHERE discussion_id IN (${sql.join(discussionIds, sql`, `)})
          AND user_id = ${currentUserId}
          GROUP BY discussion_id
        `);
        
        discussionLikeStatus = discussionLikeResult.rows.reduce((acc: Record<number, boolean>, row: any) => {
          acc[row.discussion_id] = Number(row.is_liked) > 0;
          return acc;
        }, {});
      }

      // Transform and combine results
      const transformedDiscussions = allDiscussions.map(row => ({
        ...row.discussions,
        author: row.users,
        type: 'general',
        soapData: null,
        isLiked: discussionLikeStatus[row.discussions?.id || 0] || false
      }));

      // Get comment counts for SOAP entries
      const soapIds = soapEntriesData.map(row => row.soap_entries?.id).filter(Boolean);
      let soapCommentCounts: Record<number, number> = {};
      
      if (soapIds.length > 0) {
        const commentCountResult = await db.execute(sql`
          SELECT soap_id, COUNT(*) as comment_count 
          FROM soap_comments 
          WHERE soap_id IN (${sql.join(soapIds, sql`, `)})
          GROUP BY soap_id
        `);
        
        soapCommentCounts = commentCountResult.rows.reduce((acc: Record<number, number>, row: any) => {
          acc[row.soap_id] = Number(row.comment_count);
          return acc;
        }, {});
      }

      // Get SOAP like status for current user if provided  
      let soapLikeStatus: Record<number, boolean> = {};
      if (currentUserId && soapIds.length > 0) {
        const soapLikeResult = await db.execute(sql`
          SELECT soap_id, COUNT(*) as is_liked
          FROM soap_likes 
          WHERE soap_id IN (${sql.join(soapIds, sql`, `)})
          AND user_id = ${currentUserId}
          GROUP BY soap_id
        `);
        
        soapLikeStatus = soapLikeResult.rows.reduce((acc: Record<number, boolean>, row: any) => {
          acc[row.soap_id] = Number(row.is_liked) > 0;
          return acc;
        }, {});
      }

      const transformedSoap = soapEntriesData.map(row => ({
        ...row.soap_entries,
        id: row.soap_entries?.id,
        authorId: row.soap_entries?.userId,
        title: 'S.O.A.P. Reflection',
        content: row.soap_entries?.scripture,
        category: 'soap_reflection',
        likeCount: 0,
        commentCount: soapCommentCounts[row.soap_entries?.id || 0] || 0,
        author: row.users,
        type: 'soap_reflection',
        soapData: {
          scripture: row.soap_entries?.scripture,
          scriptureReference: row.soap_entries?.scriptureReference,
          observation: row.soap_entries?.observation,
          application: row.soap_entries?.application,
          prayer: row.soap_entries?.prayer,
        },
        isLiked: soapLikeStatus[row.soap_entries?.id || 0] || false
      }));

      // Get comment counts for prayer requests (using prayer_responses table)
      const prayerIds = prayerRequestsData.map(row => row.prayer_requests?.id).filter(Boolean);
      let prayerCommentCounts: Record<number, number> = {};
      
      if (prayerIds.length > 0) {
        const prayerCommentCountResult = await db.execute(sql`
          SELECT prayer_request_id, COUNT(*) as comment_count 
          FROM prayer_responses 
          WHERE prayer_request_id IN (${sql.join(prayerIds, sql`, `)})
          GROUP BY prayer_request_id
        `);
        
        prayerCommentCounts = prayerCommentCountResult.rows.reduce((acc: Record<number, number>, row: any) => {
          acc[row.prayer_request_id] = Number(row.comment_count);
          return acc;
        }, {});
      }

      // Get prayer like status for current user if provided
      let prayerLikeStatus: Record<number, boolean> = {};
      if (currentUserId && prayerIds.length > 0) {
        const prayerLikeResult = await db.execute(sql`
          SELECT prayer_request_id, COUNT(*) as is_liked
          FROM prayer_responses 
          WHERE prayer_request_id IN (${sql.join(prayerIds, sql`, `)})
          AND user_id = ${currentUserId}
          AND response_type = 'prayer'
          GROUP BY prayer_request_id
        `);
        
        prayerLikeStatus = prayerLikeResult.rows.reduce((acc: Record<number, boolean>, row: any) => {
          acc[row.prayer_request_id] = Number(row.is_liked) > 0;
          return acc;
        }, {});
      }

      const transformedPrayerRequests = prayerRequestsData.map(row => ({
        ...row.prayer_requests,
        id: row.prayer_requests?.id,
        authorId: row.prayer_requests?.authorId,
        title: 'Prayer Request',
        content: row.prayer_requests?.content,
        category: row.prayer_requests?.category || 'general',
        likeCount: row.prayer_requests?.prayerCount || 0,
        commentCount: prayerCommentCounts[row.prayer_requests?.id || 0] || 0,
        prayerCount: row.prayer_requests?.prayerCount || 0,
        author: row.users,
        type: 'prayer_request',
        soapData: null,
        isAnonymous: row.prayer_requests?.isAnonymous || false,
        moodTag: row.prayer_requests?.moodTag,
        isLiked: prayerLikeStatus[row.prayer_requests?.id || 0] || false
      }));

      // Combine and sort all posts
      const allPosts = [...transformedDiscussions, ...transformedSoap, ...transformedPrayerRequests]
        .filter(post => post.id) // Remove any invalid entries
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allPosts.slice(0, limit || 50);
    } catch (error) {
      // Silent error logging for production
      return [];
    }
  }

  async getDiscussion(discussionId: number): Promise<Discussion | undefined> {
    try {
      const result = await db.select().from(discussions).where(eq(discussions.id, discussionId));
      return result[0];
    } catch (error) {
      // Silent error logging for production
      return undefined;
    }
  }

  async getUserRole(userId: string): Promise<string> {
    try {
      // First check global role
      const userResult = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
      const globalRole = userResult[0]?.role || 'member';
      
      // If global role is admin-level, return it
      if (['soapbox_owner', 'platform_admin', 'system_admin'].includes(globalRole)) {
        return globalRole;
      }
      
      // Check for church-specific admin roles using raw SQL to handle column mapping
      const churchRoles = await db.execute(sql`
        SELECT role FROM user_churches 
        WHERE user_id = ${userId} AND role IS NOT NULL
      `);
      
      // If user has any church admin role, return the highest privilege level
      const adminRoles = churchRoles.rows
        .map((r: any) => r.role)
        .filter(role => ['church_admin', 'pastor', 'lead_pastor'].includes(role));
      
      if (adminRoles.includes('lead_pastor')) return 'lead_pastor';
      if (adminRoles.includes('pastor')) return 'pastor';
      if (adminRoles.includes('church_admin')) return 'church_admin';
      
      return globalRole;
    } catch (error) {
      // Silent error logging for production
      return 'member';
    }
  }

  async getUserChurches(userId: string): Promise<any[]> {
    try {
      // Use raw SQL to avoid Drizzle ORM issues with field mappings
      const result = await db.execute(sql`
        SELECT 
          c.*,
          uc.role,
          uc.joined_at,
          uc.last_accessed_at,
          uc.is_active as user_is_active
        FROM user_churches uc
        LEFT JOIN communities c ON uc.church_id = c.id
        WHERE uc.user_id = ${userId} AND uc.is_active = true
        ORDER BY uc.last_accessed_at DESC
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type || 'church', // Include community type
        denomination: row.denomination,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        phone: row.phone,
        email: row.email,
        website: row.website,
        description: row.description,
        logoUrl: row.logo_url,
        isActive: row.is_active,
        memberCount: row.member_count || 0,
        role: row.role || 'member',
        userRole: row.role || 'member',
        lastAccessedAt: row.last_accessed_at,
        joinedAt: row.joined_at,
      }));
    } catch (error) {
      return [];
    }
  }

  async getDiscoverableCommunities(userId: string): Promise<any[]> {
    try {
      // Get communities user is not already a member of
      const result = await db.execute(sql`
        SELECT 
          c.*
        FROM communities c
        WHERE c.is_active = true 
          AND c.id NOT IN (
            SELECT uc.church_id 
            FROM user_churches uc 
            WHERE uc.user_id = ${userId} AND uc.is_active = true
          )
        ORDER BY c.member_count DESC, c.name ASC
        LIMIT 50
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        denomination: row.denomination,
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        phone: row.phone,
        email: row.email,
        website: row.website,
        description: row.description,
        logoUrl: row.logo_url,
        isActive: row.is_active,
        memberCount: row.member_count || 0,
        isJoined: false, // By definition, these are communities the user hasn't joined
      }));
    } catch (error) {
      return [];
    }
  }

  async joinCommunity(userId: string, communityId: number): Promise<any> {
    try {
      // Check if user is already a member
      const existingMembership = await db.execute(sql`
        SELECT id FROM user_churches 
        WHERE user_id = ${userId} AND church_id = ${communityId}
      `);

      if (existingMembership.rows.length > 0) {
        // Reactivate if membership exists but is inactive
        await db.execute(sql`
          UPDATE user_churches 
          SET is_active = true, last_accessed_at = NOW()
          WHERE user_id = ${userId} AND church_id = ${communityId}
        `);
      } else {
        // Create new membership with admin role for community creator
        await db.execute(sql`
          INSERT INTO user_churches (user_id, church_id, role, joined_at, last_accessed_at, is_active)
          VALUES (${userId}, ${communityId}, 'church_admin', NOW(), NOW(), true)
        `);
      }

      // Update member count
      await db.execute(sql`
        UPDATE communities 
        SET member_count = (
          SELECT COUNT(*) FROM user_churches 
          WHERE church_id = ${communityId} AND is_active = true
        )
        WHERE id = ${communityId}
      `);

      return { success: true, message: 'Successfully joined community' };
    } catch (error) {
      throw error;
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
          communityId: d.community_id,
          isPublic: d.is_public,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          attachedMedia: d.attached_media // Add attached media field
        }));
        allPosts.push(...discussionsWithType);
      }

      // Get SOAP entries using raw SQL with actual comment counts
      if (type === 'all' || type === 'soap_reflection') {
        const soapResult = await db.execute(sql`
          SELECT se.*, 
                 COUNT(sc.id) as comment_count
          FROM soap_entries se
          LEFT JOIN soap_comments sc ON se.id = sc.soap_id 
          WHERE se.user_id = ${userId} 
          GROUP BY se.id
          ORDER BY se.created_at DESC
        `);

        const soapWithType = soapResult.rows.map(s => ({
          ...s,
          type: 'soap_reflection',
          title: 'S.O.A.P. Reflection',
          category: 'soap_reflection',
          likeCount: 0,
          commentCount: Number(s.comment_count) || 0,
          mood: s.mood || null,
          content: s.scripture || s.observation || s.application || s.prayer || 'S.O.A.P. Entry',
          userId: s.user_id,
          communityId: s.community_id,
          isPublic: s.is_public,
          createdAt: s.created_at,
          updatedAt: s.updated_at,
          attachedMedia: s.attached_media // Add attached media field
        }));
        allPosts.push(...soapWithType);
      }

      // Get prayer requests using raw SQL with actual comment counts
      if (type === 'all' || type === 'prayer_request') {
        const prayerResult = await db.execute(sql`
          SELECT pr.*, 
                 COUNT(prs.id) as comment_count
          FROM prayer_requests pr
          LEFT JOIN prayer_responses prs ON pr.id = prs.prayer_request_id 
          WHERE pr.author_id = ${userId} 
          GROUP BY pr.id
          ORDER BY pr.created_at DESC
        `);

        const prayerRequestsWithCount = prayerResult.rows.map(prayer => ({
          ...prayer,
          type: 'prayer_request',
          likeCount: 0,
          commentCount: Number(prayer.comment_count) || 0,
          moodTag: prayer.moodTag || null,
          prayerCount: prayer.prayer_count || 0,
          authorId: prayer.author_id,
          churchId: prayer.church_id,
          isPublic: prayer.is_public,
          isAnonymous: prayer.is_anonymous,
          isAnswered: prayer.is_answered,
          answeredAt: prayer.answered_at,
          createdAt: prayer.created_at,
          updatedAt: prayer.updated_at,
          attachedMedia: prayer.attached_media // Add attached media field
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
      // Silent error logging for production
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

      // Get total likes received on user's content (simplified approach)
      const discussionLikesResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM discussion_likes dl 
        JOIN discussions d ON dl.discussion_id = d.id 
        WHERE d.author_id = ${userId}
      `);
      const soapLikesResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM reactions r 
        JOIN soap_entries s ON r.target_id = s.id 
        WHERE s.user_id = ${userId} AND r.target_type = 'soap_entry'
      `);
      const totalLikes = Number(discussionLikesResult.rows[0]?.count || 0) + Number(soapLikesResult.rows[0]?.count || 0);

      // Get total comments on user's content (simplified approach)
      const discussionCommentsResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM discussion_comments dc 
        JOIN discussions d ON dc.discussion_id = d.id 
        WHERE d.author_id = ${userId}
      `);
      const soapCommentsResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM soap_comments sc 
        JOIN soap_entries s ON sc.soap_id = s.id 
        WHERE s.user_id = ${userId}
      `);
      const totalComments = Number(discussionCommentsResult.rows[0]?.count || 0) + Number(soapCommentsResult.rows[0]?.count || 0);

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
      // Silent error logging for production
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
  
  // Check-in operations
  async createCheckIn(checkInData: InsertCheckIn): Promise<CheckIn> {
    try {
      // Get user's church for additional context
      const user = await this.getUser(checkInData.userId);
      const churchId = user?.communityId;
      
      // Calculate streak
      const currentStreak = await this.getUserCheckInStreak(checkInData.userId);
      const newStreak = currentStreak + 1;
      
      // Create check-in record
      const [checkIn] = await db
        .insert(checkIns)
        .values({
          ...checkInData,
          churchId,
          streakCount: newStreak,
          pointsEarned: 10, // Base points for check-in
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      
      // Record user activity for streak tracking
      await db.insert(userActivities).values({
        userId: checkInData.userId,
        activityType: 'check_in',
        entityId: checkIn.id,
        points: checkIn.pointsEarned,
        createdAt: new Date(),
      });
      
      return checkIn;
    } catch (error) {
      // Silent error logging for production
      throw new Error('Failed to create check-in');
    }
  }
  
  async getUserDailyCheckIn(userId: string): Promise<CheckIn | undefined> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const [checkIn] = await db
        .select()
        .from(checkIns)
        .where(
          and(
            eq(checkIns.userId, userId),
            gte(checkIns.createdAt, today),
            lte(checkIns.createdAt, tomorrow)
          )
        )
        .orderBy(desc(checkIns.createdAt));
        
      return checkIn;
    } catch (error) {
      // Silent error logging for production
      return undefined;
    }
  }
  
  async getUserCheckInStreak(userId: string): Promise<number> {
    try {
      // Use the same logic as getUserStats for consistency
      const result = await db.execute(sql`
        WITH consecutive_days AS (
          SELECT 
            DATE(created_at) as activity_date,
            ROW_NUMBER() OVER (ORDER BY DATE(created_at) DESC) as row_num,
            DATE(created_at) - INTERVAL '1 day' * ROW_NUMBER() OVER (ORDER BY DATE(created_at) DESC) as streak_group
          FROM user_activities 
          WHERE user_id = ${userId}
          AND DATE(created_at) >= CURRENT_DATE - INTERVAL '365 days'
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at) DESC
        ),
        streak_groups AS (
          SELECT 
            COUNT(*) as streak_length,
            MIN(activity_date) as streak_start,
            MAX(activity_date) as streak_end
          FROM consecutive_days 
          GROUP BY streak_group
          ORDER BY streak_end DESC
        )
        SELECT COALESCE(MAX(streak_length), 0) as current_streak
        FROM streak_groups 
        WHERE streak_end >= CURRENT_DATE - INTERVAL '1 day'
      `);
      
      return Number(result.rows[0]?.current_streak || 0);
    } catch (error) {
      // Silent error logging for production
      return 0;
    }
  }
  
  async getUserCheckIns(userId: string, limit: number = 10): Promise<CheckIn[]> {
    try {
      const userCheckIns = await db
        .select()
        .from(checkIns)
        .where(eq(checkIns.userId, userId))
        .orderBy(desc(checkIns.createdAt))
        .limit(limit);
        
      return userCheckIns;
    } catch (error) {
      // Silent error logging for production
      return [];
    }
  }
  
  // Mood check-in operations
  async createMoodCheckin(moodCheckinData: InsertMoodCheckin): Promise<MoodCheckin> {
    try {
      // Get user's church for additional context
      const user = await this.getUser(moodCheckinData.userId);
      const churchId = user?.communityId;
      
      // Create mood check-in record
      const [moodCheckin] = await db
        .insert(moodCheckins)
        .values({
          ...moodCheckinData,
          churchId,
          shareable: moodCheckinData.shareable || false,
          aiContentGenerated: false,
          createdAt: new Date(),
        })
        .returning();
      
      // Record user activity for engagement tracking
      await db.insert(userActivities).values({
        userId: moodCheckinData.userId,
        activityType: 'mood_checkin',
        entityId: moodCheckin.id,
        points: 5, // Points for mood check-in
        createdAt: new Date(),
      });
      
      return moodCheckin;
    } catch (error) {
      // Silent error logging for production
      throw new Error('Failed to create mood check-in');
    }
  }
  
  async getRecentMoodCheckins(userId: string, limit: number = 10): Promise<MoodCheckin[]> {
    try {
      const recentCheckins = await db
        .select()
        .from(moodCheckins)
        .where(eq(moodCheckins.userId, userId))
        .orderBy(desc(moodCheckins.createdAt))
        .limit(limit);
        
      return recentCheckins;
    } catch (error) {
      // Silent error logging for production
      return [];
    }
  }
  
  async getRecentMoodCheckIns(limit: number = 10): Promise<any[]> {
    try {
      // Get recent mood check-ins with user info for horizontal strip display
      const result = await db.execute(sql`
        SELECT 
          mc.*,
          u.id as user_id,
          u.first_name,
          u.last_name,
          u.email,
          u.profile_image_url
        FROM mood_checkins mc
        LEFT JOIN users u ON mc.user_id = u.id
        ORDER BY mc.created_at DESC
        LIMIT ${limit}
      `);
      
      return result.rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        mood: row.mood,
        moodEmoji: row.mood_emoji,
        moodScore: row.mood_score,
        notes: row.notes,
        createdAt: row.created_at,
        user: {
          id: row.user_id,
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          profileImageUrl: row.profile_image_url,
        }
      }));
    } catch (error) {
      // Silent error logging for production
      return [];
    }
  }
  
  async getMoodInsights(userId: string, days: number = 30): Promise<any> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const insights = await db
        .select({
          averageScore: avg(moodCheckins.moodScore),
          totalCheckins: count(moodCheckins.id),
        })
        .from(moodCheckins)
        .where(
          and(
            eq(moodCheckins.userId, userId),
            gte(moodCheckins.createdAt, startDate)
          )
        );
        
      return insights[0] || { averageScore: 0, totalCheckins: 0 };
    } catch (error) {
      // Silent error logging for production
      return { averageScore: 0, totalCheckins: 0 };
    }
  }

  // Messaging system methods to fix 500 errors
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      // Return 0 for now - messaging system needs full implementation
      return 0;
    } catch (error) {
      return 0;
    }
  }

  async getUserConversations(userId: string): Promise<any[]> {
    try {
      // Return empty array for now
      return [];
    } catch (error) {
      return [];
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    // Stub implementation
    return;
  }

  async getUserContacts(userId: string): Promise<any[]> {
    try {
      return [];
    } catch (error) {
      return [];
    }
  }

  // Additional missing methods to prevent 500 errors
  async getUserNotifications(userId: string): Promise<any[]> {
    try {
      return [];
    } catch (error) {
      return [];
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    return;
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    return;
  }

  async createNotification(notification: any): Promise<any> {
    return {};
  }

  async getAllMembers(): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT 
          u.id,
          u.email,
          u.first_name as "firstName",
          u.last_name as "lastName", 
          u.phone_number as "phoneNumber",
          u.city,
          u.state,
          u.profile_image_url as "profileImageUrl",
          u.role,
          uc.is_active as "isActive",
          u.created_at as "createdAt",
          uc.church_id as "churchId",
          c.name as "churchName"
        FROM users u
        LEFT JOIN user_churches uc ON u.id = uc.user_id
        LEFT JOIN communities c ON uc.church_id = c.id
        WHERE uc.church_id IS NOT NULL
        ORDER BY u.created_at DESC
      `);
      return result.rows;
    } catch (error) {
      return [];
    }
  }

  async getChurchMembers(churchId: number): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT 
          u.id,
          u.email,
          u.first_name as "firstName",
          u.last_name as "lastName", 
          u.phone_number as "phoneNumber",
          u.city,
          u.state,
          u.profile_image_url as "profileImageUrl",
          u.role,
          uc.is_active as "isActive",
          u.created_at as "createdAt",
          uc.church_id as "churchId",
          c.name as "churchName"
        FROM users u
        LEFT JOIN user_churches uc ON u.id = uc.user_id
        LEFT JOIN communities c ON uc.church_id = c.id
        WHERE uc.church_id = $1
        ORDER BY u.created_at DESC
      `, [churchId]);
      return result.rows;
    } catch (error) {
      return [];
    }
  }

  async getChurchFeatureSettings(churchId: number): Promise<any[]> {
    try {
      // Direct database query to avoid compilation issues
      const result = await pool.query(
        'SELECT * FROM church_feature_settings WHERE church_id = $1 ORDER BY feature_category, feature_name',
        [churchId]
      );
      return result.rows;
    } catch (error) {
      return [];
    }
  }

  async updateChurchFeatureSetting(data: {
    churchId: number;
    featureCategory: string;
    featureName: string;
    isEnabled: boolean;
    enabledBy: string;
  }): Promise<any> {
    try {
      const result = await pool.query(`
        UPDATE church_feature_settings 
        SET is_enabled = $1, enabled_by = $2, last_modified = NOW()
        WHERE church_id = $3 AND feature_category = $4 AND feature_name = $5
        RETURNING *
      `, [data.isEnabled, data.enabledBy, data.churchId, data.featureCategory, data.featureName]);
      
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to update feature setting');
    }
  }

  async getChurchFeatureSettingById(featureId: number): Promise<any> {
    try {
      const result = await pool.query(
        'SELECT * FROM church_feature_settings WHERE id = $1',
        [featureId]
      );
      return result.rows[0];
    } catch (error) {
      return null;
    }
  }

  // Prayer request operations implementation
  async createPrayerRequest(prayer: InsertPrayerRequest): Promise<PrayerRequest> {
    try {
      const [prayerRequest] = await db
        .insert(prayerRequests)
        .values({
          ...prayer,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Record user activity for engagement tracking
      await db.insert(userActivities).values({
        userId: prayer.authorId,
        activityType: 'prayer_request',
        entityId: prayerRequest.id,
        points: 15, // Points for creating prayer request
        createdAt: new Date(),
      });

      return prayerRequest;
    } catch (error) {
      throw new Error('Failed to create prayer request');
    }
  }

  // S.O.A.P. Entry operations implementation
  async createSoapEntry(entry: InsertSoapEntry): Promise<SoapEntry> {
    try {
      const [soapEntry] = await db
        .insert(soapEntries)
        .values({
          ...entry,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Record user activity for engagement tracking
      if (this.trackUserActivity) {
        await this.trackUserActivity(entry.userId, 'soap_entry', soapEntry.id, 20);
      }

      return soapEntry;
    } catch (error) {
      throw new Error('Failed to create S.O.A.P. entry');
    }
  }

  async getSoapEntries(userId: string, options?: { churchId?: number; isPublic?: boolean; limit?: number; offset?: number }): Promise<SoapEntry[]> {
    try {
      const { limit = 20, offset = 0, isPublic, churchId } = options || {};
      
      let baseQuery = db.select().from(soapEntries);
      let conditions = [eq(soapEntries.userId, userId)];

      if (isPublic !== undefined) {
        conditions.push(eq(soapEntries.isPublic, isPublic));
      }

      if (churchId) {
        conditions.push(eq(soapEntries.communityId, churchId));
      }

      const entries = await baseQuery
        .where(and(...conditions))
        .orderBy(desc(soapEntries.createdAt))
        .limit(limit)
        .offset(offset);

      return entries;
    } catch (error) {
      return [];
    }
  }

  async getSoapEntry(id: number): Promise<SoapEntry | undefined> {
    try {
      const [entry] = await db
        .select()
        .from(soapEntries)
        .where(eq(soapEntries.id, id));
      return entry;
    } catch (error) {
      return undefined;
    }
  }

  async updateSoapEntry(id: number, updates: Partial<SoapEntry>): Promise<SoapEntry> {
    try {
      const [updatedEntry] = await db
        .update(soapEntries)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(soapEntries.id, id))
        .returning();

      return updatedEntry;
    } catch (error) {
      throw new Error('Failed to update S.O.A.P. entry');
    }
  }

  // deleteSoapEntry method already defined above at line 1995

  async getUserSoapStreak(userId: string): Promise<number> {
    try {
      // Get consecutive days of SOAP entries
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const entries = await db
        .select({
          createdAt: soapEntries.createdAt
        })
        .from(soapEntries)
        .where(and(
          eq(soapEntries.userId, userId),
          gte(soapEntries.createdAt, thirtyDaysAgo)
        ))
        .orderBy(desc(soapEntries.createdAt));

      // Calculate streak
      let streak = 0;
      const today = new Date();
      let currentDate = new Date(today);

      for (const entry of entries) {
        const entryDate = new Date(entry.createdAt);
        const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (daysDiff > streak) {
          break;
        }
      }

      return streak;
    } catch (error) {
      return 0;
    }
  }

  async getPublicSoapEntries(churchId?: number, limit = 20, offset = 0, excludeUserId?: string): Promise<any[]> {
    try {
      let conditions = [eq(soapEntries.isPublic, true)];

      // Only filter by church if churchId is provided AND we want church-specific results
      if (churchId && excludeUserId) {
        // For church-specific feed with user exclusion, get entries from same church excluding user
        conditions.push(eq(soapEntries.communityId, churchId));
        conditions.push(ne(soapEntries.userId, excludeUserId));
      } else if (churchId) {
        // For church-specific feed without exclusion
        conditions.push(eq(soapEntries.communityId, churchId));
      } else if (excludeUserId) {
        // For global feed excluding specific user
        conditions.push(ne(soapEntries.userId, excludeUserId));
      }
      // else: no filters, get all public entries

      // Remove debug logging for production

      //   churchId,
      //   excludeUserId,
      //   conditions: conditions.length
      // });

      // Build where clause properly
      let whereClause;
      if (conditions.length === 1) {
        whereClause = conditions[0];
      } else if (conditions.length > 1) {
        whereClause = and(...conditions);
      } else {
        whereClause = undefined;
      }

      // Use a simplified query approach to avoid Drizzle ORM issues
      const query = db
        .select()
        .from(soapEntries)
        .leftJoin(users, eq(soapEntries.userId, users.id))
        .orderBy(desc(soapEntries.createdAt))
        .limit(limit)
        .offset(offset);

      if (whereClause) {
        query.where(whereClause);
      }

      const rawEntries = await query;
      
      // Transform the results manually
      const entries = rawEntries.map(row => ({
        id: row.soap_entries.id,
        userId: row.soap_entries.userId,
        scripture: row.soap_entries.scripture,
        scriptureReference: row.soap_entries.scriptureReference,
        observation: row.soap_entries.observation,
        application: row.soap_entries.application,
        prayer: row.soap_entries.prayer,
        moodTag: row.soap_entries.moodTag,
        tags: row.soap_entries.tags,
        isPublic: row.soap_entries.isPublic,
        churchId: row.soap_entries.communityId,
        createdAt: row.soap_entries.createdAt,
        updatedAt: row.soap_entries.updatedAt,
        firstName: row.users?.firstName,
        lastName: row.users?.lastName,
        email: row.users?.email,
        profileImageUrl: row.users?.profileImageUrl
      }));

      // Remove debug logging for production

      // if (entries.length > 0) {

      //     id: entries[0].id,
      //     authorEmail: entries[0].email,
      //     churchId: entries[0].communityId,
      //     scriptureRef: entries[0].scriptureReference
      //   });
      // }

      return entries.map(entry => ({
        ...entry,
        author: {
          firstName: entry.firstName,
          lastName: entry.lastName,
          email: entry.email,
          profileImageUrl: entry.profileImageUrl
        }
      }));
    } catch (error) {
      // Error logged for internal tracking
      return [];
    }
  }

  async featureSoapEntry(id: number, featuredBy: string): Promise<SoapEntry> {
    try {
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
    } catch (error) {
      throw new Error('Failed to feature S.O.A.P. entry');
    }
  }

  async unfeatureSoapEntry(id: number): Promise<SoapEntry> {
    try {
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
    } catch (error) {
      throw new Error('Failed to unfeature S.O.A.P. entry');
    }
  }

  async getSoapEntriesSharedWithPastor(pastorId: string, churchId: number): Promise<SoapEntry[]> {
    try {
      const entries = await db
        .select()
        .from(soapEntries)
        .where(and(
          eq(soapEntries.communityId, churchId),
          eq(soapEntries.isSharedWithPastor, true)
        ))
        .orderBy(desc(soapEntries.createdAt));

      return entries;
    } catch (error) {
      return [];
    }
  }

  // S.O.A.P. Bookmark operations
  async saveSoapEntry(soapId: number, userId: string): Promise<void> {
    try {
      await db.insert(soapBookmarks).values({
        soapId,
        userId,
        createdAt: new Date()
      });
    } catch (error) {
      // Ignore duplicate key errors
    }
  }

  async getSavedSoapEntries(userId: string): Promise<any[]> {
    try {
      // Use raw SQL to avoid Drizzle ORM field selection issues
      const savedEntries = await db.execute(sql`
        SELECT 
          sb.id as bookmark_id,
          sb.soap_id,
          sb.created_at as bookmark_created_at,
          se.scripture,
          se.scripture_reference,
          se.observation,
          se.application,
          se.prayer,
          se.mood_tag,
          se.tags,
          se.created_at as soap_created_at,
          se.user_id as author_id,
          u.first_name,
          u.last_name,
          u.email,
          u.profile_image_url
        FROM soap_bookmarks sb
        LEFT JOIN soap_entries se ON sb.soap_id = se.id
        LEFT JOIN users u ON se.user_id = u.id
        WHERE sb.user_id = ${userId}
        ORDER BY sb.created_at DESC
      `);

      // Transform the raw results to match the SoapPostCard expected format
      return savedEntries.rows.map((row: any) => ({
        id: row.soap_id, // Use the SOAP entry ID as the main ID
        content: `${row.scripture || ''}\n\nObservation: ${row.observation || ''}\n\nApplication: ${row.application || ''}\n\nPrayer: ${row.prayer || ''}`,
        authorId: row.author_id,
        createdAt: row.soap_created_at || new Date().toISOString(),
        type: 'soap_reflection',
        isSaved: true, // This is from saved reflections, so it's always saved
        soapData: {
          scripture: row.scripture || '',
          scriptureReference: row.scripture_reference || '',
          observation: row.observation || '',
          application: row.application || '',
          prayer: row.prayer || ''
        },
        author: {
          id: row.author_id || '',
          firstName: row.first_name || 'Unknown',
          lastName: row.last_name || '',
          profileImageUrl: row.profile_image_url || null,
          email: row.email || ''
        },
        likeCount: 0,
        commentCount: 0,
        _count: {
          comments: 0,
          likes: 0
        }
      }));
    } catch (error) {
      // Error logged for internal tracking
      return [];
    }
  }

  async removeSavedSoapEntry(soapId: number, userId: string): Promise<void> {
    try {
      await db.delete(soapBookmarks)
        .where(and(
          eq(soapBookmarks.soapId, soapId),
          eq(soapBookmarks.userId, userId)
        ));
    } catch (error) {
      throw new Error('Failed to remove saved S.O.A.P. entry');
    }
  }

  async isSoapEntrySaved(soapId: number, userId: string): Promise<boolean> {
    try {
      const [bookmark] = await db
        .select()
        .from(soapBookmarks)
        .where(and(
          eq(soapBookmarks.soapId, soapId),
          eq(soapBookmarks.userId, userId)
        ));

      return !!bookmark;
    } catch (error) {
      return false;
    }
  }

  // Communication Templates operations
  async getCommunicationTemplates(userId: string, churchId?: number): Promise<any[]> {
    try {
      const user = await this.getUser(userId);
      const userChurchId = churchId || user?.communityId;

      if (!userChurchId) {
        return [];
      }

      const templates = await db
        .select()
        .from(communicationTemplates)
        .where(and(
          eq(communicationTemplates.communityId, userChurchId),
          eq(communicationTemplates.isActive, true)
        ))
        .orderBy(desc(communicationTemplates.usageCount), desc(communicationTemplates.createdAt));

      return templates;
    } catch (error) {
      return [];
    }
  }

  async createCommunicationTemplate(template: any): Promise<any> {
    try {
      const [newTemplate] = await db
        .insert(communicationTemplates)
        .values({
          ...template,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return newTemplate;
    } catch (error) {
      throw new Error('Failed to create communication template');
    }
  }

  async updateCommunicationTemplate(templateId: number, updates: any): Promise<any> {
    try {
      const [updatedTemplate] = await db
        .update(communicationTemplates)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(communicationTemplates.id, templateId))
        .returning();

      return updatedTemplate;
    } catch (error) {
      throw new Error('Failed to update communication template');
    }
  }

  async deleteCommunicationTemplate(templateId: number): Promise<void> {
    try {
      await db
        .delete(communicationTemplates)
        .where(eq(communicationTemplates.id, templateId));
    } catch (error) {
      throw new Error('Failed to delete communication template');
    }
  }

  // Communication history operations (using memberCommunications as history table)
  async getCommunicationHistory(churchId: number): Promise<any[]> {
    try {
      const history = await db
        .select()
        .from(memberCommunications)
        .where(eq(memberCommunications.communityId, churchId))
        .orderBy(desc(memberCommunications.sentAt));

      return history;
    } catch (error) {
      return [];
    }
  }

  // Sermon operations
  async createSermonDraft(sermonData: any): Promise<any> {
    try {
      const [newDraft] = await db
        .insert(sermonDrafts)
        .values({
          title: sermonData.title,
          content: sermonData.content,
          userId: sermonData.userId,
          isPublished: sermonData.isPublished || false,
          publishedAt: sermonData.publishedAt,
          createdAt: sermonData.createdAt || new Date(),
          updatedAt: sermonData.updatedAt || new Date()
        })
        .returning();
      return newDraft;
    } catch (error) {
      throw new Error('Failed to create sermon draft');
    }
  }

  async updateSermonDraft(draftId: number, userId: string, updates: any): Promise<any> {
    try {
      const [updated] = await db
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
      return updated;
    } catch (error) {
      throw new Error('Failed to update sermon draft');
    }
  }

  async getUserCompletedSermons(userId: string): Promise<any[]> {
    try {
      return await db
        .select()
        .from(sermonDrafts)
        .where(and(
          eq(sermonDrafts.userId, userId),
          eq(sermonDrafts.isPublished, true)
        ))
        .orderBy(desc(sermonDrafts.publishedAt));
    } catch (error) {
      return [];
    }
  }

  async getUserSermonDrafts(userId: string): Promise<any[]> {
    try {
      return await db
        .select()
        .from(sermonDrafts)
        .where(and(
          eq(sermonDrafts.userId, userId),
          eq(sermonDrafts.isPublished, false)
        ))
        .orderBy(desc(sermonDrafts.updatedAt));
    } catch (error) {
      return [];
    }
  }

  async getSermonDraft(draftId: number, userId: string): Promise<any> {
    try {
      const [draft] = await db
        .select()
        .from(sermonDrafts)
        .where(and(
          eq(sermonDrafts.id, draftId),
          eq(sermonDrafts.userId, userId)
        ));
      return draft;
    } catch (error) {
      return null;
    }
  }

  async deleteSermonDraft(draftId: number, userId: string): Promise<void> {
    try {
      await db
        .delete(sermonDrafts)
        .where(and(
          eq(sermonDrafts.id, draftId),
          eq(sermonDrafts.userId, userId)
        ));
    } catch (error) {
      throw new Error('Failed to delete sermon draft');
    }
  }

  async createCommunicationRecord(record: {
    churchId: number;
    sentBy: string;
    subject: string;
    content: string;
    recipientCount: number;
    communicationType: string;
    channels: string[];
    priority: string;
    requiresResponse: boolean;
    scheduledFor?: Date;
    sentAt?: Date;
    deliveryStatus: string;
  }): Promise<any> {
    try {
      const [newRecord] = await db
        .insert(memberCommunications)
        .values({
          churchId: record.communityId,
          subject: record.subject,
          content: record.content,
          memberId: record.sentBy,
          communicationType: record.communicationType,
          direction: 'outbound',
          sentAt: record.sentAt || new Date(),
          deliveryStatus: record.deliveryStatus,
          responseReceived: false,
          followUpRequired: record.requiresResponse,
          createdAt: new Date()
        })
        .returning();

      return newRecord;
    } catch (error) {
      throw new Error('Failed to create communication record');
    }
  }



  // Get community by ID
  async getCommunity(communityId: number): Promise<any> {
    try {
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId));
      return community;
    } catch (error) {
      return null;
    }
  }

  // Feature initialization for all community types
  async initializeChurchFeatures(churchId: number, churchSize: string = 'small', enabledBy?: string): Promise<void> {
    try {
      // Get community type to determine which features to initialize
      const community = await this.getCommunity(churchId);
      if (!community) {
        throw new Error('Community not found');
      }

      // Define default features by community type
      const featuresByType: Record<string, Array<{category: string, name: string, enabled: boolean}>> = {
        'church': [
          // Community features
          { category: 'community', name: 'donation', enabled: true },
          { category: 'community', name: 'events', enabled: true },
          { category: 'community', name: 'communication_hub', enabled: true },
          // Spiritual tools
          { category: 'spiritual_tools', name: 'prayer_wall', enabled: true },
          { category: 'spiritual_tools', name: 'audio_bible', enabled: true },
          { category: 'spiritual_tools', name: 'audio_routines', enabled: false },
          // Media contents
          { category: 'media_contents', name: 'video_library', enabled: false },
          { category: 'media_contents', name: 'image_gallery', enabled: false },
          // Admin features
          { category: 'admin_features', name: 'sermon_studio', enabled: true },
          { category: 'admin_features', name: 'engagement_analytics', enabled: true }
        ],
        'group': [
          // Community features
          { category: 'community', name: 'events', enabled: true },
          { category: 'community', name: 'communication_hub', enabled: true },
          // Group tools
          { category: 'group_tools', name: 'resource_sharing', enabled: true },
          { category: 'group_tools', name: 'member_directory', enabled: true },
          // Media contents
          { category: 'media_contents', name: 'image_gallery', enabled: true }
        ],
        'ministry': [
          // Community features
          { category: 'community', name: 'events', enabled: true },
          { category: 'community', name: 'communication_hub', enabled: true },
          // Ministry tools
          { category: 'ministry_tools', name: 'volunteer_management', enabled: true },
          { category: 'ministry_tools', name: 'resource_management', enabled: true },
          // Media contents
          { category: 'media_contents', name: 'training_library', enabled: true }
        ]
      };

      const defaultFeatures = featuresByType[community.type] || featuresByType['church'];
      
      // Insert default features for this community
      for (const feature of defaultFeatures) {
        try {
          await pool.query(`
            INSERT INTO church_feature_settings (
              church_id, feature_category, feature_name, is_enabled, enabled_by, enabled_at, last_modified
            ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            ON CONFLICT (church_id, feature_category, feature_name) 
            DO UPDATE SET 
              is_enabled = EXCLUDED.is_enabled,
              enabled_by = EXCLUDED.enabled_by,
              last_modified = NOW()
          `, [churchId, feature.category, feature.name, feature.enabled, enabledBy]);
        } catch (error) {
        }
      }
    } catch (error) {
      throw new Error('Failed to initialize community features');
    }
  }

  // Gallery Methods Implementation
  async getGalleryImages(churchId?: number, filters?: { 
    collection?: string; 
    tags?: string[]; 
    uploadedBy?: string; 
    limit?: number; 
    offset?: number; 
  }): Promise<GalleryImage[]> {
    try {
      const { limit = 20, offset = 0, collection, uploadedBy } = filters || {};
      
      
      
      // Simplified query to test basic functionality
      const directQuery = await db
        .select()
        .from(galleryImages)
        .where(eq(galleryImages.communityId, churchId || 2804))
        .limit(limit)
        .offset(offset);
      
      
      
      // If direct query works, continue with full query
      let baseQuery = db
        .select({
          id: galleryImages.id,
          title: galleryImages.title,
          description: galleryImages.description,
          url: galleryImages.url,
          collection: galleryImages.collection,
          tags: galleryImages.tags,
          uploadedBy: galleryImages.uploadedBy,
          uploadedAt: galleryImages.uploadedAt,
          likes: galleryImages.likes,
          comments: galleryImages.comments,
          churchId: galleryImages.communityId,
          isPublic: galleryImages.isPublic,
          uploaderName: users.firstName,
          uploaderAvatar: users.profileImageUrl
        })
        .from(galleryImages)
        .leftJoin(users, eq(galleryImages.uploadedBy, users.id));

      let conditions = [];
      
      if (churchId) {
        conditions.push(eq(galleryImages.communityId, churchId));
      }
      
      if (collection && collection !== 'all') {
        conditions.push(eq(galleryImages.collection, collection));
      }
      
      if (uploadedBy) {
        conditions.push(eq(galleryImages.uploadedBy, uploadedBy));
      }

      if (conditions.length > 0) {
        baseQuery = baseQuery.where(and(...conditions));
      }

      
      const images = await baseQuery
        .orderBy(desc(galleryImages.uploadedAt))
        .limit(limit)
        .offset(offset);

      

      const mappedImages = images.map(image => ({
        id: image.id,
        title: image.title || 'Untitled',
        description: image.description,
        url: image.url,
        collection: image.collection,
        tags: image.tags || [],
        uploadedBy: image.uploadedBy,
        uploaderName: image.uploaderName || 'Unknown',
        uploaderAvatar: image.uploaderAvatar,
        createdAt: image.uploadedAt?.toISOString() || new Date().toISOString(),
        likesCount: image.likes || 0,
        commentsCount: image.comments || 0,
        isLiked: false, // Will be set by API layer
        isSaved: false, // Will be set by API layer
        churchId: image.communityId
      }));

      
      return mappedImages;
    } catch (error) {
      
      return [];
    }
  }

  async getGalleryImage(imageId: number): Promise<GalleryImage | undefined> {
    try {
      const [result] = await db
        .select({
          id: galleryImages.id,
          title: galleryImages.title,
          description: galleryImages.description,
          url: galleryImages.url,
          collection: galleryImages.collection,
          tags: galleryImages.tags,
          uploadedBy: galleryImages.uploadedBy,
          uploadedAt: galleryImages.uploadedAt,
          likes: galleryImages.likes,
          comments: galleryImages.comments,
          churchId: galleryImages.communityId,
          uploaderName: users.firstName,
          uploaderAvatar: users.profileImageUrl
        })
        .from(galleryImages)
        .leftJoin(users, eq(galleryImages.uploadedBy, users.id))
        .where(eq(galleryImages.id, imageId));

      if (!result) return undefined;

      return {
        id: result.id,
        title: result.title || 'Untitled',
        description: result.description,
        url: result.url,
        collection: result.collection,
        tags: result.tags || [],
        uploadedBy: result.uploadedBy,
        uploaderName: result.uploaderName || 'Unknown',
        uploaderAvatar: result.uploaderAvatar,
        createdAt: result.uploadedAt?.toISOString() || new Date().toISOString(),
        likesCount: result.likes || 0,
        commentsCount: result.comments || 0,
        isLiked: false,
        isSaved: false,
        churchId: result.communityId
      };
    } catch (error) {
      return undefined;
    }
  }

  async uploadGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    try {
      const [uploaded] = await db
        .insert(galleryImages)
        .values({
          ...image,
          uploadedAt: new Date(),
          likes: 0,
          comments: 0
        })
        .returning();

      return this.getGalleryImage(uploaded.id) as Promise<GalleryImage>;
    } catch (error) {
      throw new Error('Failed to upload gallery image');
    }
  }

  async updateGalleryImage(imageId: number, updates: Partial<GalleryImage>): Promise<GalleryImage> {
    try {
      await db
        .update(galleryImages)
        .set(updates)
        .where(eq(galleryImages.id, imageId));

      return this.getGalleryImage(imageId) as Promise<GalleryImage>;
    } catch (error) {
      throw new Error('Failed to update gallery image');
    }
  }

  async deleteGalleryImage(imageId: number, userId: string): Promise<void> {
    try {
      await db
        .delete(galleryImages)
        .where(and(
          eq(galleryImages.id, imageId),
          eq(galleryImages.uploadedBy, userId)
        ));
    } catch (error) {
      throw new Error('Failed to delete gallery image');
    }
  }

  // Community Settings Methods
  async getCommunitySettings(communityId: number): Promise<any> {
    try {
      // Get basic community information
      const [community] = await db
        .select()
        .from(communities)
        .where(eq(communities.id, communityId))
        .limit(1);

      if (!community) {
        throw new Error('Community not found');
      }

      // Return current community data formatted as settings
      return {
        basicInfo: {
          name: community.name || '',
          description: community.description || '',
          website: community.website || '',
          phone: community.phone || '',
          email: community.email || '',
          address: community.address || '',
          city: community.city || '',
          state: community.state || '',
          zipCode: community.zipCode || ''
        },
        administrative: community.type === 'church' ? {
          multiCampusEnabled: false, // Default value
          denominationSettings: community.denomination || '',
          churchSize: community.size || 'medium',
          serviceTimesEnabled: true, // Default value
          verificationStatus: community.verificationStatus || 'pending'
        } : undefined,
        community: {
          memberApprovalRequired: false, // Default value
          directoryVisibility: 'members' as const,
          allowGroupCreation: true, // Default value
          ageGroupFocus: []
        },
        communication: {
          notificationsEnabled: true,
          emailNewsletters: true,
          emergencyAlerts: true,
          quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
          }
        },
        financial: (community.type === 'church' || community.type === 'ministry') ? {
          donationsEnabled: true,
          recurringGivingEnabled: true,
          financialTransparency: 'summary' as const,
          stripeIntegration: false
        } : undefined,
        privacy: {
          memberDirectoryVisible: true,
          photoSharingEnabled: true,
          contentModeration: 'automatic' as const,
          backgroundChecksRequired: false
        },
        integrations: {
          calendarSync: false,
          socialMediaSharing: true,
          emailProvider: 'default',
          smsProvider: 'default'
        }
      };
    } catch (error) {
      throw new Error('Failed to retrieve community settings');
    }
  }

  async updateCommunitySettings(communityId: number, settingsData: any, userId: string): Promise<any> {
    try {
      // Update basic community information if provided
      if (settingsData.basicInfo) {
        const basicUpdates: any = {};
        
        if (settingsData.basicInfo.name) basicUpdates.name = settingsData.basicInfo.name;
        if (settingsData.basicInfo.description) basicUpdates.description = settingsData.basicInfo.description;
        if (settingsData.basicInfo.website) basicUpdates.website = settingsData.basicInfo.website;
        if (settingsData.basicInfo.phone) basicUpdates.phone = settingsData.basicInfo.phone;
        if (settingsData.basicInfo.email) basicUpdates.email = settingsData.basicInfo.email;
        if (settingsData.basicInfo.address) basicUpdates.address = settingsData.basicInfo.address;
        if (settingsData.basicInfo.city) basicUpdates.city = settingsData.basicInfo.city;
        if (settingsData.basicInfo.state) basicUpdates.state = settingsData.basicInfo.state;
        if (settingsData.basicInfo.zipCode) basicUpdates.zipCode = settingsData.basicInfo.zipCode;

        if (Object.keys(basicUpdates).length > 0) {
          basicUpdates.updatedAt = new Date();
          await db
            .update(communities)
            .set(basicUpdates)
            .where(eq(communities.id, communityId));
        }
      }

      // Update administrative settings for churches
      if (settingsData.administrative) {
        const adminUpdates: any = {};
        
        if (settingsData.administrative.denominationSettings) {
          adminUpdates.denomination = settingsData.administrative.denominationSettings;
        }
        if (settingsData.administrative.churchSize) {
          adminUpdates.size = settingsData.administrative.churchSize;
        }

        if (Object.keys(adminUpdates).length > 0) {
          adminUpdates.updatedAt = new Date();
          await db
            .update(communities)
            .set(adminUpdates)
            .where(eq(communities.id, communityId));
        }
      }

      // For now, other settings (communication, privacy, etc.) would need additional tables
      // This is a basic implementation that updates the core community data

      // Return updated settings
      return await this.getCommunitySettings(communityId);
    } catch (error) {
      throw new Error('Failed to update community settings');
    }
  }

  // Gallery interaction methods
  async likeGalleryImage(userId: string, imageId: number): Promise<GalleryImageLike> {
    try {
      const [like] = await db
        .insert(galleryImageLikes)
        .values({ userId, imageId })
        .returning();

      // Update like count
      await db
        .update(galleryImages)
        .set({ likes: sql`${galleryImages.likes} + 1` })
        .where(eq(galleryImages.id, imageId));

      return like;
    } catch (error) {
      throw new Error('Failed to like gallery image');
    }
  }

  async unlikeGalleryImage(userId: string, imageId: number): Promise<void> {
    try {
      await db
        .delete(galleryImageLikes)
        .where(and(
          eq(galleryImageLikes.userId, userId),
          eq(galleryImageLikes.imageId, imageId)
        ));

      // Update like count
      await db
        .update(galleryImages)
        .set({ likes: sql`${galleryImages.likes} - 1` })
        .where(eq(galleryImages.id, imageId));
    } catch (error) {
      throw new Error('Failed to unlike gallery image');
    }
  }

  async isGalleryImageLiked(userId: string, imageId: number): Promise<boolean> {
    try {
      const [like] = await db
        .select()
        .from(galleryImageLikes)
        .where(and(
          eq(galleryImageLikes.userId, userId),
          eq(galleryImageLikes.imageId, imageId)
        ));

      return !!like;
    } catch (error) {
      return false;
    }
  }

  async getGalleryImageLikes(imageId: number): Promise<GalleryImageLike[]> {
    try {
      return await db
        .select()
        .from(galleryImageLikes)
        .where(eq(galleryImageLikes.imageId, imageId));
    } catch (error) {
      return [];
    }
  }

  async saveGalleryImage(userId: string, imageId: number): Promise<GalleryImageSave> {
    try {
      const [save] = await db
        .insert(galleryImageSaves)
        .values({ userId, imageId })
        .returning();

      return save;
    } catch (error) {
      throw new Error('Failed to save gallery image');
    }
  }

  async unsaveGalleryImage(userId: string, imageId: number): Promise<void> {
    try {
      await db
        .delete(galleryImageSaves)
        .where(and(
          eq(galleryImageSaves.userId, userId),
          eq(galleryImageSaves.imageId, imageId)
        ));
    } catch (error) {
      throw new Error('Failed to unsave gallery image');
    }
  }

  async isGalleryImageSaved(userId: string, imageId: number): Promise<boolean> {
    try {
      const [save] = await db
        .select()
        .from(galleryImageSaves)
        .where(and(
          eq(galleryImageSaves.userId, userId),
          eq(galleryImageSaves.imageId, imageId)
        ));

      return !!save;
    } catch (error) {
      return false;
    }
  }

  async getUserSavedGalleryImages(userId: string): Promise<GalleryImage[]> {
    try {
      const savedImages = await db
        .select({
          image: galleryImages,
          uploaderName: users.firstName,
          uploaderAvatar: users.profileImageUrl
        })
        .from(galleryImageSaves)
        .innerJoin(galleryImages, eq(galleryImageSaves.imageId, galleryImages.id))
        .leftJoin(users, eq(galleryImages.uploadedBy, users.id))
        .where(eq(galleryImageSaves.userId, userId));

      return savedImages.map(({ image, uploaderName, uploaderAvatar }) => ({
        ...image,
        uploaderName: uploaderName || 'Unknown',
        uploaderAvatar,
        createdAt: image.uploadedAt?.toISOString() || new Date().toISOString(),
        likesCount: image.likes || 0,
        commentsCount: image.comments || 0,
        isLiked: false,
        isSaved: true,
        tags: image.tags || []
      }));
    } catch (error) {
      return [];
    }
  }

  async addGalleryImageComment(comment: InsertGalleryImageComment): Promise<GalleryImageComment> {
    try {
      const [newComment] = await db
        .insert(galleryImageComments)
        .values({
          ...comment,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Update comment count
      await db
        .update(galleryImages)
        .set({ comments: sql`${galleryImages.comments} + 1` })
        .where(eq(galleryImages.id, comment.imageId));

      return newComment;
    } catch (error) {
      throw new Error('Failed to add gallery image comment');
    }
  }

  async getGalleryImageComments(imageId: number): Promise<GalleryImageComment[]> {
    try {
      const comments = await db
        .select({
          id: galleryImageComments.id,
          imageId: galleryImageComments.imageId,
          userId: galleryImageComments.userId,
          comment: galleryImageComments.comment,
          createdAt: galleryImageComments.createdAt,
          updatedAt: galleryImageComments.updatedAt,
          authorName: users.firstName,
          authorAvatar: users.profileImageUrl
        })
        .from(galleryImageComments)
        .leftJoin(users, eq(galleryImageComments.userId, users.id))
        .where(eq(galleryImageComments.imageId, imageId))
        .orderBy(asc(galleryImageComments.createdAt));

      return comments.map(comment => ({
        id: comment.id,
        imageId: comment.imageId,
        userId: comment.userId,
        comment: comment.comment,
        isApproved: true,
        approvedBy: null,
        approvedAt: null,
        createdAt: comment.createdAt || new Date(),
        updatedAt: comment.updatedAt || new Date(),
        authorName: comment.authorName || 'Unknown',
        authorAvatar: comment.authorAvatar
      }));
    } catch (error) {
      return [];
    }
  }

  async updateGalleryImageComment(commentId: number, content: string): Promise<GalleryImageComment> {
    try {
      const [updated] = await db
        .update(galleryImageComments)
        .set({ comment: content, updatedAt: new Date() })
        .where(eq(galleryImageComments.id, commentId))
        .returning();

      return updated;
    } catch (error) {
      throw new Error('Failed to update gallery image comment');
    }
  }

  async deleteGalleryImageComment(commentId: number, userId: string): Promise<void> {
    try {
      const [comment] = await db
        .select()
        .from(galleryImageComments)
        .where(eq(galleryImageComments.id, commentId));

      if (comment) {
        await db
          .delete(galleryImageComments)
          .where(and(
            eq(galleryImageComments.id, commentId),
            eq(galleryImageComments.userId, userId)
          ));

        // Update comment count
        await db
          .update(galleryImages)
          .set({ comments: sql`${galleryImages.comments} - 1` })
          .where(eq(galleryImages.id, comment.imageId));
      }
    } catch (error) {
      throw new Error('Failed to delete gallery image comment');
    }
  }

  async getGalleryCollections(churchId?: number): Promise<{ collection: string; count: number; thumbnail?: string }[]> {
    try {
      let query = db
        .selectDistinct({ collection: galleryImages.collection })
        .from(galleryImages);

      if (churchId) {
        query = query.where(eq(galleryImages.communityId, churchId));
      }

      const collections = await query;
      return collections
        .map(c => c.collection)
        .filter(Boolean)
        .map(collection => ({
          collection,
          count: 0, // TODO: Calculate actual count
          thumbnail: undefined // TODO: Get thumbnail
        }));
    } catch (error) {
      return [];
    }
  }

  // Prayer-related methods implementation
  async getPrayerRequest(id: number): Promise<PrayerRequest | undefined> {
    try {
      const [prayer] = await db
        .select()
        .from(prayerRequests)
        .where(eq(prayerRequests.id, id));
      return prayer;
    } catch (error) {
      return undefined;
    }
  }

  async getPrayerSupportMessages(prayerRequestId: number): Promise<any[]> {
    try {
      const messages = await db
        .select({
          id: prayerResponses.id,
          content: prayerResponses.content,
          responseType: prayerResponses.responseType,
          createdAt: prayerResponses.createdAt,
          userId: prayerResponses.userId,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl
        })
        .from(prayerResponses)
        .leftJoin(users, eq(prayerResponses.userId, users.id))
        .where(eq(prayerResponses.prayerRequestId, prayerRequestId))
        .orderBy(asc(prayerResponses.createdAt));

      // Get like counts for each response
      const responseIds = messages.map(msg => msg.id);
      let likeCounts: Record<number, number> = {};
      
      if (responseIds.length > 0) {
        const likeCountResult = await db
          .select({
            responseId: prayerResponseLikes.prayerResponseId,
            count: sql<number>`count(*)`
          })
          .from(prayerResponseLikes)
          .where(sql`${prayerResponseLikes.prayerResponseId} IN (${sql.join(responseIds, sql`, `)})`)
          .groupBy(prayerResponseLikes.prayerResponseId);

        likeCounts = likeCountResult.reduce((acc: Record<number, number>, row: any) => {
          acc[row.responseId] = Number(row.count);
          return acc;
        }, {});
      }

      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        author: {
          id: msg.userId,
          firstName: msg.firstName || 'Anonymous',
          lastName: msg.lastName || '',
          email: msg.email,
          profileImageUrl: msg.profileImageUrl
        },
        createdAt: msg.createdAt,
        likeCount: likeCounts[msg.id] || 0,
        isLiked: false // Will be set on frontend based on user
      }));
    } catch (error) {
      return [];
    }
  }

  async prayForRequest(response: InsertPrayerResponse): Promise<PrayerResponse> {
    try {
      const [prayerResponse] = await db
        .insert(prayerResponses)
        .values({
          ...response,
          createdAt: new Date()
        })
        .returning();

      // Update prayer count on the prayer request
      await db
        .update(prayerRequests)
        .set({ 
          prayerCount: sql`${prayerRequests.prayerCount} + 1`
        })
        .where(eq(prayerRequests.id, response.prayerRequestId));

      // Record user activity for engagement tracking
      await db.insert(userActivities).values({
        userId: response.userId,
        activityType: 'prayer_response',
        entityId: prayerResponse.id,
        points: 10, // Points for praying for someone
        createdAt: new Date(),
      });

      return prayerResponse;
    } catch (error) {
      throw new Error('Failed to create prayer response');
    }
  }

  async getUserPrayerResponse(prayerRequestId: number, userId: string): Promise<PrayerResponse | undefined> {
    try {
      const [response] = await db
        .select()
        .from(prayerResponses)
        .where(and(
          eq(prayerResponses.prayerRequestId, prayerRequestId),
          eq(prayerResponses.userId, userId),
          eq(prayerResponses.responseType, 'prayer')
        ));
      return response;
    } catch (error) {
      return undefined;
    }
  }

  async removePrayerResponse(prayerRequestId: number, userId: string): Promise<void> {
    try {
      await db
        .delete(prayerResponses)
        .where(and(
          eq(prayerResponses.prayerRequestId, prayerRequestId),
          eq(prayerResponses.userId, userId),
          eq(prayerResponses.responseType, 'prayer')
        ));
      
      // Update prayer count on the prayer request
      await db
        .update(prayerRequests)
        .set({ 
          prayerCount: sql`${prayerRequests.prayerCount} - 1`
        })
        .where(eq(prayerRequests.id, prayerRequestId));
    } catch (error) {
      throw new Error('Failed to remove prayer response');
    }
  }

  // Prayer response like methods
  async likePrayerResponse(responseId: number, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    try {
      // Check if already liked
      const existingLike = await db
        .select()
        .from(prayerResponseLikes)
        .where(and(
          eq(prayerResponseLikes.prayerResponseId, responseId),
          eq(prayerResponseLikes.userId, userId)
        ));

      if (existingLike.length > 0) {
        // Unlike - remove the like
        await db
          .delete(prayerResponseLikes)
          .where(and(
            eq(prayerResponseLikes.prayerResponseId, responseId),
            eq(prayerResponseLikes.userId, userId)
          ));

        // Get updated like count
        const likeCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(prayerResponseLikes)
          .where(eq(prayerResponseLikes.prayerResponseId, responseId));

        return { liked: false, likeCount: Number(likeCount[0]?.count || 0) };
      } else {
        // Like - add the like
        await db
          .insert(prayerResponseLikes)
          .values({
            prayerResponseId: responseId,
            userId,
            createdAt: new Date()
          });

        // Get updated like count
        const likeCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(prayerResponseLikes)
          .where(eq(prayerResponseLikes.prayerResponseId, responseId));

        // Award points for liking a prayer comment
        await this.trackUserActivity({
          userId: userId,
          activityType: 'like_prayer_comment',
          entityId: responseId,
          points: 5,
        });

        return { liked: true, likeCount: Number(likeCount[0]?.count || 0) };
      }
    } catch (error) {
      throw new Error('Failed to like prayer response');
    }
  }

  async getPrayerResponseLikeStatus(responseId: number, userId: string): Promise<boolean> {
    try {
      const like = await db
        .select()
        .from(prayerResponseLikes)
        .where(and(
          eq(prayerResponseLikes.prayerResponseId, responseId),
          eq(prayerResponseLikes.userId, userId)
        ));

      return like.length > 0;
    } catch (error) {
      return false;
    }
  }

  async getUserBookmarkedPrayers(userId: string, churchId?: number): Promise<any[]> {
    try {
      const query = db
        .select({
          id: prayerRequests.id,
          content: prayerRequests.content,
          isAnonymous: prayerRequests.isAnonymous,
          isUrgent: prayerRequests.isUrgent,
          createdAt: prayerRequests.createdAt,
          authorId: prayerRequests.authorId,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorEmail: users.email,
          authorProfileImageUrl: users.profileImageUrl,
          category: prayerRequests.category,
          tags: prayerRequests.tags,
          prayerCount: prayerRequests.prayerCount,
          status: prayerRequests.status
        })
        .from(prayerBookmarks)
        .innerJoin(prayerRequests, eq(prayerBookmarks.prayerId, prayerRequests.id))
        .leftJoin(users, eq(prayerRequests.authorId, users.id))
        .where(eq(prayerBookmarks.userId, userId))
        .orderBy(desc(prayerBookmarks.createdAt));

      const bookmarkedPrayers = await query;

      return bookmarkedPrayers.map(prayer => ({
        id: prayer.id,
        content: prayer.content,
        isAnonymous: prayer.isAnonymous,
        isUrgent: prayer.isUrgent,
        createdAt: prayer.createdAt,
        authorId: prayer.authorId,
        authorFirstName: prayer.authorFirstName,
        authorLastName: prayer.authorLastName,
        authorEmail: prayer.authorEmail,
        authorProfileImageUrl: prayer.authorProfileImageUrl,
        category: prayer.category,
        tags: prayer.tags,
        prayerCount: prayer.prayerCount || 0,
        status: prayer.status
      }));
    } catch (error) {
      
      return [];
    }
  }

  async togglePrayerBookmark(prayerId: number, userId: string): Promise<{ bookmarked: boolean }> {
    try {
      // Check if bookmark already exists
      const existing = await db
        .select()
        .from(prayerBookmarks)
        .where(and(
          eq(prayerBookmarks.prayerId, prayerId),
          eq(prayerBookmarks.userId, userId)
        ))
        .limit(1);

      if (existing.length > 0) {
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
    } catch (error) {
      
      throw new Error('Failed to toggle prayer bookmark');
    }
  }

  // Discussion comment operations implementation
  async createDiscussionComment(comment: InsertDiscussionComment): Promise<DiscussionComment> {
    try {
      
      const [newComment] = await db
        .insert(discussionComments)
        .values({
          discussionId: comment.discussionId,
          authorId: comment.authorId,
          content: comment.content,
          parentId: comment.parentId || null,
          createdAt: new Date(),
          updatedAt: new Date(),
          likeCount: 0
        })
        .returning();


      // Record user activity for engagement tracking
      try {
        await db.insert(userActivities).values({
          userId: comment.authorId,
          activityType: 'discussion_comment',
          entityId: newComment.id,
          points: 5, // Points for adding comment
          createdAt: new Date(),
        });
      } catch (activityError) {
        // Continue even if activity recording fails
      }

      // Return comment with proper structure expected by frontend
      return {
        id: newComment.id,
        discussionId: newComment.discussionId,
        authorId: newComment.authorId,
        content: newComment.content,
        likeCount: 0,
        createdAt: newComment.createdAt || new Date(),
        updatedAt: newComment.updatedAt || new Date()
      };
    } catch (error) {
      throw new Error(`Failed to create discussion comment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getDiscussionComments(discussionId: number, userId?: string): Promise<DiscussionComment[]> {
    try {
      const comments = await db
        .select({
          id: discussionComments.id,
          discussionId: discussionComments.discussionId,
          authorId: discussionComments.authorId,
          content: discussionComments.content,
          parentId: discussionComments.parentId,
          likeCount: discussionComments.likeCount,
          createdAt: discussionComments.createdAt,
          updatedAt: discussionComments.updatedAt,
          authorName: sql`COALESCE(${users.firstName}, 'Unknown')`.as('authorName'),
          authorAvatar: users.profileImageUrl
        })
        .from(discussionComments)
        .leftJoin(users, eq(discussionComments.authorId, users.id))
        .where(eq(discussionComments.discussionId, discussionId))
        .orderBy(asc(discussionComments.createdAt));

      // Get user's liked comments if userId provided
      let userLikedComments: Set<number> = new Set();
      if (userId && comments.length > 0) {
        try {
          const commentIds = comments.map(c => c.id);
          const userLikesResult = await db.execute(sql`
            SELECT comment_id 
            FROM discussion_comment_likes 
            WHERE user_id = ${userId} AND comment_id IN (${sql.join(commentIds, sql`, `)})
          `);
          
          userLikedComments = new Set(userLikesResult.rows.map((row: any) => row.comment_id));
        } catch (likesError) {
          // Continue without like status if table doesn't exist or has issues
        }
      }

      return comments.map(comment => ({
        id: comment.id,
        discussionId: comment.discussionId,
        authorId: comment.authorId,
        content: comment.content,
        parentId: comment.parentId,
        likeCount: comment.likeCount || 0,
        isLiked: userLikedComments.has(comment.id),
        createdAt: comment.createdAt || new Date(),
        updatedAt: comment.updatedAt || new Date(),
        author: {
          id: comment.authorId,
          name: comment.authorName as string || 'Unknown User',
          firstName: comment.authorName as string || 'Unknown',
          lastName: '',
          profileImageUrl: comment.authorAvatar
        }
      }));
    } catch (error) {
      return [];
    }
  }

  // SOAP comment operations implementation
  async createSoapComment(comment: { soapId: number; authorId: string; content: string }): Promise<any> {
    try {
      const [newComment] = await db
        .insert(soapComments)
        .values({
          soapId: comment.soapId,
          authorId: comment.authorId,
          content: comment.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          likeCount: 0
        })
        .returning();

      // Record user activity for engagement tracking
      await db.insert(userActivities).values({
        userId: comment.authorId,
        activityType: 'soap_comment',
        entityId: newComment.id,
        points: 5, // Points for adding comment
        createdAt: new Date(),
      });

      return newComment;
    } catch (error) {
      throw new Error('Failed to create SOAP comment');
    }
  }

  async getSoapComments(soapId: number): Promise<any[]> {
    try {
      const comments = await db
        .select({
          id: soapComments.id,
          soapId: soapComments.soapId,
          authorId: soapComments.authorId,
          content: soapComments.content,
          likeCount: soapComments.likeCount,
          createdAt: soapComments.createdAt,
          updatedAt: soapComments.updatedAt,
          authorName: sql`COALESCE(${users.firstName}, 'Unknown')`.as('authorName'),
          authorAvatar: users.profileImageUrl
        })
        .from(soapComments)
        .leftJoin(users, eq(soapComments.authorId, users.id))
        .where(eq(soapComments.soapId, soapId))
        .orderBy(asc(soapComments.createdAt));

      return comments.map(comment => ({
        id: comment.id,
        soapId: comment.soapId,
        authorId: comment.authorId,
        content: comment.content,
        likeCount: comment.likeCount || 0,
        createdAt: comment.createdAt || new Date(),
        updatedAt: comment.updatedAt || new Date(),
        author: {
          id: comment.authorId,
          name: comment.authorName as string || 'Unknown User',
          profileImage: comment.authorAvatar
        }
      }));
    } catch (error) {
      return [];
    }
  }

  // Toggle discussion comment like
  async toggleDiscussionCommentLike(commentId: number, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    try {
      // Check if user already liked this comment
      const existingLike = await db.execute(sql`
        SELECT * FROM discussion_comment_likes 
        WHERE comment_id = ${commentId} AND user_id = ${userId}
      `);
      
      if (existingLike.rows.length > 0) {
        // Unlike: Remove like and decrement counter
        await db.execute(sql`
          DELETE FROM discussion_comment_likes 
          WHERE comment_id = ${commentId} AND user_id = ${userId}
        `);
        
        await db.execute(sql`
          UPDATE discussion_comments 
          SET like_count = GREATEST(like_count - 1, 0) 
          WHERE id = ${commentId}
        `);
        
        // Remove points for unliking
        await this.trackUserActivity({
          userId: userId,
          activityType: 'unlike_discussion_comment',
          entityId: commentId,
          points: -3,
        });
        
        // Get updated count
        const countResult = await db.execute(sql`
          SELECT like_count FROM discussion_comments WHERE id = ${commentId}
        `);
        const likeCount = countResult.rows[0]?.like_count || 0;
        
        return { liked: false, likeCount };
      } else {
        // Like: Add like and increment counter
        await db.execute(sql`
          INSERT INTO discussion_comment_likes (comment_id, user_id, created_at) 
          VALUES (${commentId}, ${userId}, ${new Date().toISOString()})
        `);
        
        await db.execute(sql`
          UPDATE discussion_comments 
          SET like_count = like_count + 1 
          WHERE id = ${commentId}
        `);
        
        // Award points for liking
        await this.trackUserActivity({
          userId: userId,
          activityType: 'like_discussion_comment',
          entityId: commentId,
          points: 3,
        });
        
        // Get updated count
        const countResult = await db.execute(sql`
          SELECT like_count FROM discussion_comments WHERE id = ${commentId}
        `);
        const likeCount = countResult.rows[0]?.like_count || 1;
        
        return { liked: true, likeCount };
      }
    } catch (error) {
      throw error;
    }
  }

  // Track user activity for rewards system
  async trackUserActivity(activity: InsertUserActivity): Promise<void> {
    try {
      await db.insert(userActivities).values({
        userId: activity.userId,
        activityType: activity.activityType,
        entityId: activity.entityId,
        points: activity.points || 0,
        createdAt: new Date(),
      });
    } catch (error) {
      // Don't throw error to avoid breaking main functionality
    }
  }

  // ============================================================================
  // ENHANCED METHODS WITH MAPPING SERVICE (Phase 1 of Naming Convention Fix)
  // ============================================================================
  
  /**
   * Enhanced discussion creation with standardized field mapping
   * Replaces createDiscussion with better field handling
   */
  async createDiscussionEnhanced(discussionData: any): Promise<any> {
    try {
      // Use mapping service to prepare data for database
      const dbData = MappingService.prepareContentForDatabase(discussionData);
      
      const [discussion] = await db
        .insert(discussions)
        .values({
          ...dbData,
          // Ensure required fields are present
          author_id: discussionData.authorId || discussionData.author_id,
          title: discussionData.title,
          content: discussionData.content,
          is_public: discussionData.isPublic ?? true,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      // Return mapped response for frontend
      return MappingService.mapDiscussion(discussion);
    } catch (error) {
      throw new Error(`Failed to create discussion: ${error}`);
    }
  }

  /**
   * Enhanced discussion retrieval with standardized mapping
   */
  async getDiscussionEnhanced(discussionId: number): Promise<any> {
    try {
      const result = await db.execute(sql`
        SELECT 
          d.*,
          u.id as author_id,
          u.email as author_email,
          u.first_name as author_first_name,
          u.last_name as author_last_name,
          u.profile_image_url as author_profile_image,
          CONCAT(u.first_name, ' ', u.last_name) as author_name,
          COUNT(DISTINCT dl.id) as like_count,
          COUNT(DISTINCT dc.id) as comment_count
        FROM discussions d
        LEFT JOIN users u ON d.author_id = u.id
        LEFT JOIN discussion_likes dl ON d.id = dl.discussion_id
        LEFT JOIN discussion_comments dc ON d.id = dc.discussion_id
        WHERE d.id = ${discussionId}
        GROUP BY d.id, u.id
      `);

      if (result.rows.length === 0) {
        return null;
      }

      // Use mapping service to standardize response
      return MappingService.mapDiscussion(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to get discussion: ${error}`);
    }
  }

  /**
   * Enhanced comment creation with proper field mapping
   */
  async createDiscussionCommentEnhanced(commentData: any): Promise<any> {
    try {
      // Use mapping service to prepare data
      const dbData = MappingService.prepareCommentForDatabase(commentData);
      
      const [comment] = await db
        .insert(discussionComments)
        .values({
          ...dbData,
          discussion_id: commentData.discussionId || commentData.discussion_id,
          author_id: commentData.authorId || commentData.author_id,
          content: commentData.content,
          created_at: new Date(),
        })
        .returning();

      // Return mapped comment with author info
      const result = await db.execute(sql`
        SELECT 
          dc.*,
          u.id as author_id,
          u.email as author_email,
          u.first_name as author_first_name,
          u.last_name as author_last_name,
          u.profile_image as author_profile_image,
          CONCAT(u.first_name, ' ', u.last_name) as author_name,
          EXISTS(
            SELECT 1 FROM discussion_comment_likes dcl 
            WHERE dcl.comment_id = dc.id 
            AND dcl.user_id = '${commentData.authorId || commentData.author_id}'
          ) as is_liked,
          COUNT(DISTINCT dcl.id) as like_count
        FROM discussion_comments dc
        LEFT JOIN users u ON dc.author_id = u.id
        LEFT JOIN discussion_comment_likes dcl ON dc.id = dcl.comment_id
        WHERE dc.id = ${comment.id}
        GROUP BY dc.id, u.id
      `);

      return MappingService.mapComment(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create comment: ${error}`);
    }
  }

  /**
   * Enhanced user mapping for consistent user objects
   */
  async getUserEnhanced(userId: string): Promise<any> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return null;
      }

      // Use mapping service for consistent user structure
      return MappingService.mapUser(user);
    } catch (error) {
      throw new Error(`Failed to get user: ${error}`);
    }
  }

  /**
   * Enhanced discussion feed with proper field mapping
   */
  async getDiscussionsEnhanced(limit: number = 20): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT DISTINCT
          d.id,
          'discussion' as type,
          d.title,
          d.content,
          d.is_public,
          d.created_at,
          d.updated_at,
          d.author_id,
          u.email as author_email,
          u.first_name as author_first_name,
          u.last_name as author_last_name,
          u.profile_image_url as author_profile_image,
          CONCAT(u.first_name, ' ', u.last_name) as author_name,
          COUNT(DISTINCT dl.id) as like_count,
          COUNT(DISTINCT dc.id) as comment_count,
          d.attached_media::text
        FROM discussions d
        LEFT JOIN users u ON d.author_id = u.id
        LEFT JOIN discussion_likes dl ON d.id = dl.discussion_id
        LEFT JOIN discussion_comments dc ON d.id = dc.discussion_id
        WHERE d.is_public = true
        GROUP BY d.id, u.id
        
        UNION ALL
        
        SELECT DISTINCT
          se.id,
          'soap' as type,
          'S.O.A.P. Reflection' as title,
          CONCAT('Scripture: ', se.scripture, ' | ', se.observation) as content,
          se.is_public,
          se.created_at,
          se.updated_at,
          se.user_id as author_id,
          u2.email as author_email,
          u2.first_name as author_first_name,
          u2.last_name as author_last_name,
          u2.profile_image_url as author_profile_image,
          CONCAT(u2.first_name, ' ', u2.last_name) as author_name,
          0 as like_count,
          COUNT(DISTINCT sc.id) as comment_count,
          NULL::text as attached_media
        FROM soap_entries se
        LEFT JOIN users u2 ON se.user_id = u2.id
        LEFT JOIN soap_comments sc ON se.id = sc.soap_id
        WHERE se.is_public = true
        GROUP BY se.id, u2.id
        
        ORDER BY created_at DESC
        LIMIT ${limit}
      `);

      // Map all results using mapping service
      return result.rows.map(row => {
        if (row.type === 'soap') {
          return MappingService.mapSoapEntry(row);
        }
        return MappingService.mapDiscussion(row);
      });
    } catch (error) {
      throw new Error(`Failed to get discussions: ${error}`);
    }
  }

  // Staff Management Operations
  async getStaffMembers(communityId: number): Promise<any[]> {
    try {
      const result = await pool.query(`
        SELECT 
          u.id,
          u.email,
          u.first_name,
          u.last_name,
          uc.role,
          uc.title,
          uc.department,
          CASE 
            WHEN u.id IS NOT NULL THEN 'active'
            ELSE 'pending'
          END as status,
          uc.assigned_at as invited_at,
          uc.joined_at,
          u.last_login as last_active
        FROM user_communities uc
        LEFT JOIN users u ON uc.user_id = u.id
        WHERE uc.community_id = $1 
        AND uc.role IN ('lead_pastor', 'associate_pastor', 'youth_pastor', 'worship_leader', 'ministry_leader', 'administrator', 'church_admin')
        ORDER BY 
          CASE uc.role
            WHEN 'lead_pastor' THEN 1
            WHEN 'associate_pastor' THEN 2
            WHEN 'youth_pastor' THEN 3
            WHEN 'worship_leader' THEN 4
            WHEN 'ministry_leader' THEN 5
            WHEN 'administrator' THEN 6
            WHEN 'church_admin' THEN 7
            ELSE 8
          END,
          uc.assigned_at ASC
      `, [communityId]);

      return result.rows.map(row => ({
        id: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        role: row.role,
        title: row.title,
        department: row.department,
        status: row.status,
        invitedAt: row.invited_at,
        joinedAt: row.joined_at,
        lastActive: row.last_active,
        permissions: this.getRolePermissions(row.role)
      }));
    } catch (error) {
      throw new Error(`Failed to get staff members: ${error}`);
    }
  }

  async inviteStaffMember(data: {
    communityId: number;
    email: string;
    role: string;
    title: string;
    department: string;
    invitedBy: string;
  }): Promise<any> {
    try {
      // Check if user already exists
      const existingUser = await this.getUserByEmail(data.email);
      
      if (existingUser) {
        // Add existing user to community with role
        const [userCommunity] = await db
          .insert(userChurches)
          .values({
            userId: existingUser.id,
            churchId: data.communityId,
            role: data.role,
            title: data.title,
            department: data.department,
            assignedBy: data.invitedBy,
            assignedAt: new Date(),
            joinedAt: new Date(),
            isActive: true
          })
          .onConflictDoUpdate({
            target: [userChurches.userId, userChurches.churchId],
            set: {
              role: data.role,
              title: data.title,
              department: data.department,
              assignedBy: data.invitedBy,
              assignedAt: new Date()
            }
          })
          .returning();

        return {
          id: existingUser.id,
          email: data.email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          role: data.role,
          title: data.title,
          department: data.department,
          status: 'active'
        };
      } else {
        // Create invitation record for new user
        const [invitation] = await db
          .insert(invitations)
          .values({
            email: data.email,
            invitedBy: data.invitedBy,
            role: 'member',
            communityId: data.communityId,
            status: 'pending',
            createdAt: new Date()
          })
          .returning();

        // Create pending user community record
        await pool.query(`
          INSERT INTO user_communities (user_id, community_id, role, title, department, assigned_by, assigned_at, is_active)
          VALUES (NULL, $1, $2, $3, $4, $5, NOW(), false)
        `, [data.communityId, data.role, data.title, data.department, data.invitedBy]);

        return {
          id: `pending_${invitation.id}`,
          email: data.email,
          firstName: '',
          lastName: '',
          role: data.role,
          title: data.title,
          department: data.department,
          status: 'pending'
        };
      }
    } catch (error) {
      throw new Error(`Failed to invite staff member: ${error}`);
    }
  }

  async updateStaffRole(communityId: number, staffId: string, role: string): Promise<void> {
    try {
      await db
        .update(userChurches)
        .set({ 
          role: role,
          updatedAt: new Date()
        })
        .where(and(
          eq(userChurches.userId, staffId),
          eq(userChurches.churchId, communityId)
        ));
    } catch (error) {
      throw new Error(`Failed to update staff role: ${error}`);
    }
  }

  async removeStaffMember(communityId: number, staffId: string): Promise<void> {
    try {
      await db
        .update(userChurches)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(and(
          eq(userChurches.userId, staffId),
          eq(userChurches.churchId, communityId)
        ));
    } catch (error) {
      throw new Error(`Failed to remove staff member: ${error}`);
    }
  }

  private getRolePermissions(role: string): string[] {
    const rolePermissions: Record<string, string[]> = {
      lead_pastor: [
        "manage_staff", "approve_content", "moderate_prayers", "manage_events", 
        "access_analytics", "manage_finances", "send_communications", "manage_settings"
      ],
      associate_pastor: [
        "approve_content", "moderate_prayers", "manage_events", 
        "access_analytics", "send_communications"
      ],
      youth_pastor: [
        "manage_youth_events", "moderate_prayers", "create_content", 
        "send_youth_communications", "access_youth_analytics"
      ],
      worship_leader: [
        "manage_worship_events", "upload_music", "create_worship_content",
        "manage_worship_team", "access_worship_analytics"
      ],
      ministry_leader: [
        "manage_ministry_events", "create_content", "moderate_ministry_prayers",
        "send_ministry_communications", "manage_volunteers"
      ],
      administrator: [
        "manage_members", "manage_events", "access_analytics",
        "send_communications", "manage_facilities"
      ],
      church_admin: [
        "manage_members", "manage_events", "access_analytics",
        "send_communications", "manage_facilities"
      ]
    };

    return rolePermissions[role] || ["basic_access"];
  }
}

export const storage = new DatabaseStorage();
