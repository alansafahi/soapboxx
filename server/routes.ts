import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { userInspirationHistory, prayerResponses, conversationParticipants, devotionals, weeklySeries, sermonMedia } from "@shared/schema";
import { and, eq, desc } from "drizzle-orm";
import { 
  insertChurchSchema,
  insertEventSchema,
  insertDiscussionSchema,
  insertPrayerRequestSchema,
  insertPrayerAssignmentSchema,
  insertPrayerFollowUpSchema,
  insertEventRsvpSchema,
  insertDevotionalSchema,
  insertWeeklySeriesSchema,
  insertSermonMediaSchema,
  insertCheckInSchema,
  insertQrCodeSchema,
  insertDailyVerseSchema,
  insertUserBibleReadingSchema,
  insertBibleVerseShareSchema,
  insertBibleInADaySessionSchema,
  insertBibleInADaySectionProgressSchema,
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allow various file types for media management
      const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi|mp3|wav|m4a|pdf|doc|docx|ppt|pptx/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Unsupported file type'));
      }
    }
  });

  // Helper function to determine file type from mime type
  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  };

  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));

  // Serve demo enhanced admin file
  app.get('/demo-enhanced-admin.html', (req, res) => {
    const filepath = path.join(process.cwd(), 'demo-enhanced-admin.html');
    res.sendFile(filepath);
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, profileData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Feed routes
  app.get("/api/feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const feedPosts = await storage.getFeedPosts(userId);
      res.json(feedPosts);
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  app.post("/api/feed/posts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { type, content, title } = req.body;
      
      let post;
      if (type === 'discussion') {
        post = await storage.createDiscussion({
          title: title || 'Community Discussion',
          content,
          authorId: userId,
          churchId: null
        });
      } else if (type === 'prayer') {
        post = await storage.createPrayerRequest({
          title: title || 'Prayer Request',
          content,
          authorId: userId,
          churchId: null,
          isAnonymous: false
        });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error creating feed post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Enhanced Community Feed API
  app.get('/api/community/enhanced-feed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const {
        type = 'all',
        category = 'all',
        timeRange = 'all',
        visibility = 'all',
        hasReactions = 'false',
        sortBy = 'recent',
        search = ''
      } = req.query;

      const filters = {
        type: type as string,
        category: category as string,
        timeRange: timeRange as string,
        visibility: visibility as string,
        hasReactions: hasReactions === 'true',
        sortBy: sortBy as string,
        search: search as string
      };

      const posts = await storage.getEnhancedCommunityFeed(userId, filters);
      res.json(posts);
    } catch (error) {
      console.error('Enhanced feed error:', error);
      res.status(500).json({ message: 'Failed to fetch enhanced community feed' });
    }
  });

  // Reactions API
  app.post('/api/community/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reactionData = {
        ...req.body,
        userId
      };

      const reaction = await storage.addReaction(reactionData);
      res.status(201).json(reaction);
    } catch (error) {
      console.error('Add reaction error:', error);
      res.status(400).json({ message: 'Failed to add reaction' });
    }
  });

  app.delete('/api/community/reactions/:targetId/:reactionType', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetId, reactionType } = req.params;
      await storage.removeReaction(userId, parseInt(targetId), reactionType);
      res.status(204).send();
    } catch (error) {
      console.error('Remove reaction error:', error);
      res.status(400).json({ message: 'Failed to remove reaction' });
    }
  });

  // Community Groups API
  app.get('/api/community/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getCommunityGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error('Get groups error:', error);
      res.status(500).json({ message: 'Failed to fetch community groups' });
    }
  });

  app.post('/api/community/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupData = {
        ...req.body,
        createdBy: userId
      };

      const group = await storage.createCommunityGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      console.error('Create group error:', error);
      res.status(400).json({ message: 'Failed to create community group' });
    }
  });

  app.post('/api/community/groups/:groupId/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { groupId } = req.params;
      const memberData = {
        groupId: parseInt(groupId),
        userId,
        role: 'member'
      };

      await storage.joinCommunityGroup(memberData);
      res.status(201).json({ message: 'Successfully joined group' });
    } catch (error) {
      console.error('Join group error:', error);
      res.status(400).json({ message: 'Failed to join group' });
    }
  });

  // Friendships API
  app.get('/api/community/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getUserFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(500).json({ message: 'Failed to fetch friends' });
    }
  });

  app.post('/api/community/friends/request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { addresseeId } = req.body;
      const friendshipData = {
        requesterId: userId,
        addresseeId,
        status: 'pending'
      };

      const friendship = await storage.sendFriendRequest(friendshipData.requesterId, friendshipData.addresseeId);
      res.status(201).json(friendship);
    } catch (error) {
      console.error('Send friend request error:', error);
      res.status(400).json({ message: 'Failed to send friend request' });
    }
  });

  app.put('/api/community/friends/:friendshipId/respond', isAuthenticated, async (req: any, res) => {
    try {
      const { friendshipId } = req.params;
      const { status } = req.body;

      const friendship = await storage.respondToFriendRequest(parseInt(friendshipId), status);
      res.json(friendship);
    } catch (error) {
      console.error('Respond to friend request error:', error);
      res.status(400).json({ message: 'Failed to respond to friend request' });
    }
  });

  // Community Reflections API
  app.post('/api/community/reflections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reflectionData = {
        ...req.body,
        userId
      };

      const reflection = await storage.createCommunityReflection(reflectionData);
      res.status(201).json(reflection);
    } catch (error) {
      console.error('Create reflection error:', error);
      res.status(400).json({ message: 'Failed to create reflection' });
    }
  });

  app.get('/api/community/reflections', isAuthenticated, async (req: any, res) => {
    try {
      const { verseId, groupId } = req.query;
      const reflections = await storage.getCommunityReflections({
        verseId: verseId ? parseInt(verseId as string) : undefined,
        groupId: groupId ? parseInt(groupId as string) : undefined
      });
      res.json(reflections);
    } catch (error) {
      console.error('Get reflections error:', error);
      res.status(500).json({ message: 'Failed to fetch reflections' });
    }
  });

  app.post('/api/auth/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboardingData = req.body;
      
      await storage.completeOnboarding(userId, onboardingData);
      
      res.json({ message: "Onboarding completed successfully" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Image upload endpoint
  app.post('/api/upload/image', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Church routes
  app.get('/api/churches', async (req, res) => {
    try {
      const churches = await storage.getChurches();
      res.json(churches);
    } catch (error) {
      console.error("Error fetching churches:", error);
      res.status(500).json({ message: "Failed to fetch churches" });
    }
  });

  app.get('/api/churches/nearby', async (req, res) => {
    try {
      const { lat, lng, limit } = req.query;
      const churches = await storage.getNearbyChurches(
        lat ? parseFloat(lat as string) : undefined,
        lng ? parseFloat(lng as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(churches);
    } catch (error) {
      console.error("Error fetching nearby churches:", error);
      res.status(500).json({ message: "Failed to fetch nearby churches" });
    }
  });

  app.get('/api/churches/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const church = await storage.getChurch(id);
      if (!church) {
        return res.status(404).json({ message: "Church not found" });
      }
      res.json(church);
    } catch (error) {
      console.error("Error fetching church:", error);
      res.status(500).json({ message: "Failed to fetch church" });
    }
  });

  app.post('/api/churches', isAuthenticated, async (req, res) => {
    try {
      const churchData = insertChurchSchema.parse(req.body);
      const church = await storage.createChurch(churchData);
      res.status(201).json(church);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid church data", errors: error.errors });
      }
      console.error("Error creating church:", error);
      res.status(500).json({ message: "Failed to create church" });
    }
  });

  app.put('/api/churches/:id', isAuthenticated, async (req: any, res) => {
    try {
      const churchId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedChurch = await storage.updateChurch(churchId, updates);
      res.json(updatedChurch);
    } catch (error) {
      console.error("Error updating church:", error);
      res.status(500).json({ message: "Failed to update church" });
    }
  });

  app.get('/api/churches/:id/members', isAuthenticated, async (req: any, res) => {
    try {
      const churchId = parseInt(req.params.id);
      const members = await storage.getChurchMembers(churchId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching church members:", error);
      res.status(500).json({ message: "Failed to fetch church members" });
    }
  });

  app.put('/api/churches/:churchId/members/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const churchId = parseInt(req.params.churchId);
      const userId = req.params.userId;
      const { role, permissions, title, bio } = req.body;
      
      const updatedMember = await storage.updateMemberRole(churchId, userId, role, permissions, title, bio);
      res.json(updatedMember);
    } catch (error) {
      console.error("Error updating member role:", error);
      res.status(500).json({ message: "Failed to update member role" });
    }
  });

  app.delete('/api/churches/:churchId/members/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const churchId = parseInt(req.params.churchId);
      const userId = req.params.userId;
      
      await storage.removeMember(churchId, userId);
      res.json({ message: "Member removed successfully" });
    } catch (error) {
      console.error("Error removing member:", error);
      res.status(500).json({ message: "Failed to remove member" });
    }
  });

  app.post('/api/churches/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const churchId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      await storage.joinChurch(userId, churchId);
      res.json({ message: "Successfully joined church" });
    } catch (error) {
      console.error("Error joining church:", error);
      res.status(500).json({ message: "Failed to join church" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const { churchId } = req.query;
      const events = await storage.getEvents(
        churchId ? parseInt(churchId as string) : undefined
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Specific routes must come before parameterized routes
  app.get("/api/events/today", async (req, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const events = await storage.getEvents();
      const todayEvents = events.filter(event => {
        const eventDate = new Date(event.eventDate);
        return eventDate >= startOfDay && eventDate <= endOfDay;
      });

      res.json(todayEvents);
    } catch (error) {
      console.error("Error fetching today's events:", error);
      res.status(500).json({ message: "Failed to fetch today's events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Received event data:", req.body);
      
      // Pre-process the data to match schema expectations
      const preprocessedData = {
        ...req.body,
        organizerId: req.user.claims.sub,
        // Ensure numeric values are properly typed
        churchId: parseInt(req.body.churchId),
        cost: req.body.cost ? req.body.cost.toString() : "0.00",
        maxAttendees: req.body.maxAttendees ? parseInt(req.body.maxAttendees) : null,
        minAttendees: req.body.minAttendees ? parseInt(req.body.minAttendees) : null,
        // Convert string dates to Date objects before validation
        eventDate: req.body.eventDate ? new Date(req.body.eventDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
        // Ensure arrays are properly formatted
        tags: Array.isArray(req.body.tags) ? req.body.tags : [],
        ageGroups: Array.isArray(req.body.ageGroups) ? req.body.ageGroups : [],
        // Handle optional strings
        subcategory: req.body.subcategory || null,
        location: req.body.location || null,
        address: req.body.address || null,
        onlineLink: req.body.onlineLink || null,
        notes: req.body.notes || null,
        publicNotes: req.body.publicNotes || null,
      };
      
      const eventData = insertEventSchema.parse(preprocessedData);
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get('/api/users/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.post('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { status } = req.body;
      
      const rsvpData = insertEventRsvpSchema.parse({
        eventId,
        userId,
        status: status || 'attending',
      });
      
      const rsvp = await storage.rsvpEvent(rsvpData);
      res.json(rsvp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid RSVP data", errors: error.errors });
      }
      console.error("Error creating RSVP:", error);
      res.status(500).json({ message: "Failed to create RSVP" });
    }
  });

  app.put('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const updates = req.body;
      const updatedEvent = await storage.updateEvent(eventId, updates);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      await storage.deleteEvent(eventId);
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  app.get('/api/events/upcoming', async (req, res) => {
    try {
      const { churchId, limit } = req.query;
      const events = await storage.getUpcomingEvents(
        churchId ? parseInt(churchId as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(events);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      res.status(500).json({ message: "Failed to fetch upcoming events" });
    }
  });

  app.get('/api/events/search', async (req, res) => {
    try {
      const { q, churchId } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const events = await storage.searchEvents(
        q as string,
        churchId ? parseInt(churchId as string) : undefined
      );
      res.json(events);
    } catch (error) {
      console.error("Error searching events:", error);
      res.status(500).json({ message: "Failed to search events" });
    }
  });

  app.put('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { status } = req.body;
      const updatedRsvp = await storage.updateEventRsvp(eventId, userId, status);
      res.json(updatedRsvp);
    } catch (error) {
      console.error("Error updating RSVP:", error);
      res.status(500).json({ message: "Failed to update RSVP" });
    }
  });

  app.get('/api/events/:id/rsvps', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const rsvps = await storage.getEventRsvps(eventId);
      res.json(rsvps);
    } catch (error) {
      console.error("Error fetching event RSVPs:", error);
      res.status(500).json({ message: "Failed to fetch event RSVPs" });
    }
  });

  app.get('/api/events/:id/attendance-stats', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const stats = await storage.getEventAttendanceStats(eventId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  app.post('/api/events/:id/volunteers', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { role, notes } = req.body;
      
      const volunteerData = {
        eventId,
        userId,
        role: role || 'General Volunteer',
        assignedBy: req.user.claims.sub,
        description: notes || ''
      };
      
      const volunteer = await storage.addEventVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error) {
      console.error("Error adding volunteer:", error);
      res.status(500).json({ message: "Failed to add volunteer" });
    }
  });

  app.delete('/api/events/:id/volunteers/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.params.userId;
      await storage.removeEventVolunteer(eventId, userId);
      res.json({ message: "Volunteer removed successfully" });
    } catch (error) {
      console.error("Error removing volunteer:", error);
      res.status(500).json({ message: "Failed to remove volunteer" });
    }
  });

  app.get('/api/events/:id/volunteers', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const volunteers = await storage.getEventVolunteers(eventId);
      res.json(volunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ message: "Failed to fetch volunteers" });
    }
  });

  app.post('/api/events/:id/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { title, message, notificationType, scheduledFor } = req.body;
      
      const notificationData = {
        eventId,
        message: `${title}: ${message}`,
        notificationType: notificationType || 'general',
        recipientId: req.user.claims.sub,
        channelType: 'push',
        scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date()
      };
      
      const notification = await storage.createEventNotification(notificationData);
      res.json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.get('/api/events/:id/notifications', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const notifications = await storage.getEventNotifications(eventId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/events/:id/updates', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { title, content, priority } = req.body;
      
      const updateData = {
        eventId,
        title,
        content,
        authorId: req.user.claims.sub,
        updateType: priority || 'normal'
      };
      
      const update = await storage.createEventUpdate(updateData);
      res.json(update);
    } catch (error) {
      console.error("Error creating event update:", error);
      res.status(500).json({ message: "Failed to create event update" });
    }
  });

  app.get('/api/events/:id/updates', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const updates = await storage.getEventUpdates(eventId);
      res.json(updates);
    } catch (error) {
      console.error("Error fetching event updates:", error);
      res.status(500).json({ message: "Failed to fetch event updates" });
    }
  });

  app.post('/api/events/:id/checkin', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const checkInData = {
        eventId,
        userId,
        checkedInBy: req.user.claims.sub,
        checkedInAt: new Date()
      };
      
      const checkIn = await storage.checkInToEvent(checkInData);
      res.json(checkIn);
    } catch (error) {
      console.error("Error checking in to event:", error);
      res.status(500).json({ message: "Failed to check in to event" });
    }
  });

  app.get('/api/events/:id/checkins', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const checkIns = await storage.getEventCheckIns(eventId);
      res.json(checkIns);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({ message: "Failed to fetch check-ins" });
    }
  });

  app.post('/api/events/:id/recurrence', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const { pattern, frequency, endDate, maxOccurrences } = req.body;
      
      const recurrenceData = {
        eventId,
        frequency: frequency || 'weekly',
        endType: endDate ? 'date' : 'count',
        endDate: endDate ? new Date(endDate) : undefined,
        maxOccurrences: maxOccurrences || 10
      };
      
      const recurrence = await storage.createEventRecurrence(recurrenceData);
      res.json(recurrence);
    } catch (error) {
      console.error("Error creating recurrence rule:", error);
      res.status(500).json({ message: "Failed to create recurrence rule" });
    }
  });

  app.get('/api/events/:id/recurrence', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const recurrence = await storage.getEventRecurrence(eventId);
      res.json(recurrence);
    } catch (error) {
      console.error("Error fetching recurrence:", error);
      res.status(500).json({ message: "Failed to fetch recurrence" });
    }
  });

  app.get('/api/events/:id/metrics', async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const metrics = await storage.getEventMetrics(eventId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching event metrics:", error);
      res.status(500).json({ message: "Failed to fetch event metrics" });
    }
  });

  app.put('/api/events/:id/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const metricsData = req.body;
      const metrics = await storage.updateEventMetrics(eventId, metricsData);
      res.json(metrics);
    } catch (error) {
      console.error("Error updating event metrics:", error);
      res.status(500).json({ message: "Failed to update event metrics" });
    }
  });

  // Discussion routes
  app.get('/api/discussions', async (req, res) => {
    try {
      const { churchId } = req.query;
      const discussions = await storage.getDiscussions(
        churchId ? parseInt(churchId as string) : undefined
      );
      res.json(discussions);
    } catch (error) {
      console.error("Error fetching discussions:", error);
      res.status(500).json({ message: "Failed to fetch discussions" });
    }
  });

  app.get('/api/discussions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const discussion = await storage.getDiscussion(id);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      res.json(discussion);
    } catch (error) {
      console.error("Error fetching discussion:", error);
      res.status(500).json({ message: "Failed to fetch discussion" });
    }
  });

  app.post('/api/discussions', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Discussion request body:", req.body);
      const discussionData = insertDiscussionSchema.parse(req.body);
      const fullDiscussionData = {
        ...discussionData,
        authorId: req.user.claims.sub,
      };
      const discussion = await storage.createDiscussion(fullDiscussionData);
      
      // Track user activity for creating discussion
      await storage.trackUserActivity({
        userId: req.user.claims.sub,
        activityType: 'discussion_created',
        entityId: discussion.id,
        points: 15,
      });
      
      res.status(201).json(discussion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Discussion validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid discussion data", errors: error.errors });
      }
      console.error("Error creating discussion:", error);
      res.status(500).json({ message: "Failed to create discussion" });
    }
  });

  app.post('/api/discussions/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const isLiked = await storage.getUserDiscussionLike(discussionId, userId);
      
      if (isLiked) {
        await storage.unlikeDiscussion(discussionId, userId);
        res.json({ liked: false });
      } else {
        await storage.likeDiscussion(discussionId, userId);
        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling discussion like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.get('/api/discussions/:id/comments', async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const comments = await storage.getDiscussionComments(discussionId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/discussions/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment content is required" });
      }
      
      const commentData = {
        discussionId,
        authorId: userId,
        content: content.trim(),
      };
      
      const comment = await storage.createDiscussionComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Prayer request routes
  app.get('/api/prayers', async (req, res) => {
    try {
      const { churchId } = req.query;
      const prayers = await storage.getPrayerRequests(
        churchId ? parseInt(churchId as string) : undefined
      );
      res.json(prayers);
    } catch (error) {
      console.error("Error fetching prayer requests:", error);
      res.status(500).json({ message: "Failed to fetch prayer requests" });
    }
  });

  app.post('/api/prayers', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Prayer request body:", req.body);
      const prayerData = insertPrayerRequestSchema.parse(req.body);
      const fullPrayerData = {
        ...prayerData,
        authorId: req.user.claims.sub,
      };
      const prayer = await storage.createPrayerRequest(fullPrayerData);
      
      // Track user activity for creating prayer request
      await storage.trackUserActivity({
        userId: req.user.claims.sub,
        activityType: 'prayer_request_created',
        entityId: prayer.id,
        points: 10,
      });
      
      res.status(201).json(prayer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Prayer validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid prayer request data", errors: error.errors });
      }
      console.error("Error creating prayer request:", error);
      res.status(500).json({ message: "Failed to create prayer request" });
    }
  });

  // Prayer status update route
  app.patch('/api/prayers/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      const { status, moderationNotes } = req.body;
      
      const updatedPrayer = await storage.updatePrayerStatus(prayerId, status, moderationNotes);
      res.json(updatedPrayer);
    } catch (error) {
      console.error("Error updating prayer status:", error);
      res.status(500).json({ message: "Failed to update prayer status" });
    }
  });

  // Prayer assignment routes
  app.post('/api/prayer-assignments', isAuthenticated, async (req: any, res) => {
    try {
      const assignmentData = insertPrayerAssignmentSchema.parse(req.body);
      const fullAssignmentData = {
        ...assignmentData,
        assignedBy: req.user.claims.sub,
      };
      const assignment = await storage.createPrayerAssignment(fullAssignmentData);
      res.status(201).json(assignment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      console.error("Error creating prayer assignment:", error);
      res.status(500).json({ message: "Failed to create prayer assignment" });
    }
  });

  // Prayer follow-up routes
  app.post('/api/prayer-follow-ups', isAuthenticated, async (req: any, res) => {
    try {
      const followUpData = insertPrayerFollowUpSchema.parse(req.body);
      const followUp = await storage.createPrayerFollowUp(followUpData);
      res.status(201).json(followUp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid follow-up data", errors: error.errors });
      }
      console.error("Error creating prayer follow-up:", error);
      res.status(500).json({ message: "Failed to create prayer follow-up" });
    }
  });

  // Get users for assignment dropdowns
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/prayers/:id/like', isAuthenticated, async (req: any, res) => {
    try {
      const prayerRequestId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const prayerResponse = await storage.getUserPrayerResponse(prayerRequestId, userId);
      
      if (prayerResponse) {
        // Remove the prayer response to "unlike"
        await storage.removePrayerResponse(prayerRequestId, userId);
        res.json({ liked: false });
      } else {
        // Add prayer response to "like"
        await storage.prayForRequest({
          prayerRequestId,
          userId,
          responseType: 'prayer',
        });
        res.json({ liked: true });
      }
    } catch (error) {
      console.error("Error toggling prayer like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post('/api/prayers/:id/pray', isAuthenticated, async (req: any, res) => {
    try {
      const prayerRequestId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const response = await storage.prayForRequest({
        prayerRequestId,
        userId,
      });
      
      // Track user activity for praying for someone
      await storage.trackUserActivity({
        userId,
        activityType: 'prayer_offered',
        entityId: prayerRequestId,
        points: 5,
      });
      
      res.json(response);
    } catch (error) {
      console.error("Error praying for request:", error);
      res.status(500).json({ message: "Failed to pray for request" });
    }
  });

  app.patch('/api/prayers/:id/answered', isAuthenticated, async (req: any, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      await storage.markPrayerAnswered(prayerId);
      res.json({ message: "Prayer marked as answered" });
    } catch (error) {
      console.error("Error marking prayer as answered:", error);
      res.status(500).json({ message: "Failed to mark prayer as answered" });
    }
  });

  app.post('/api/prayers/:id/support', isAuthenticated, async (req: any, res) => {
    try {
      const prayerRequestId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { content } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Support message cannot be empty" });
      }
      
      const supportResponse = await storage.prayForRequest({
        prayerRequestId,
        userId,
        responseType: 'support',
        content: content.trim(),
      });
      
      // Track user activity for providing support
      await storage.trackUserActivity({
        userId,
        activityType: 'prayer_support_given',
        entityId: prayerRequestId,
        points: 10,
      });
      
      res.status(201).json(supportResponse);
    } catch (error) {
      console.error("Error adding support message:", error);
      res.status(500).json({ message: "Failed to add support message" });
    }
  });

  app.get('/api/prayers/:id/support', async (req, res) => {
    try {
      const prayerRequestId = parseInt(req.params.id);
      const supportMessages = await storage.getPrayerSupportMessages(prayerRequestId);
      res.json(supportMessages);
    } catch (error) {
      console.error("Error fetching support messages:", error);
      res.status(500).json({ message: "Failed to fetch support messages" });
    }
  });

  // User stats and achievements
  app.get('/api/users/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  app.get('/api/users/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Daily inspiration endpoints
  app.get('/api/inspiration/daily', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspiration = await storage.getDailyInspiration(userId);
      
      if (!inspiration) {
        return res.status(404).json({ message: "No inspiration available" });
      }
      
      res.json(inspiration);
    } catch (error) {
      console.error("Error fetching daily inspiration:", error);
      res.status(500).json({ message: "Failed to fetch inspiration" });
    }
  });

  app.get('/api/inspiration/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getUserInspirationPreferences(userId);
      res.json(preferences || { preferredCategories: ['faith', 'hope', 'love'], deliveryTime: '08:00', isEnabled: true });
    } catch (error) {
      console.error("Error fetching inspiration preferences:", error);
      res.status(500).json({ message: "Failed to fetch preferences" });
    }
  });

  app.post('/api/inspiration/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.updateInspirationPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating inspiration preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  app.post('/api/inspiration/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspirationId = parseInt(req.params.id);
      await storage.markInspirationAsRead(userId, inspirationId);
      res.json({ message: "Marked as read" });
    } catch (error) {
      console.error("Error marking inspiration as read:", error);
      res.status(500).json({ message: "Failed to mark as read" });
    }
  });

  app.post('/api/inspiration/:id/favorite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspirationId = parseInt(req.params.id);
      await storage.favoriteInspiration(userId, inspirationId);
      res.json({ message: "Added to favorites" });
    } catch (error) {
      console.error("Error favoriting inspiration:", error);
      res.status(500).json({ message: "Failed to favorite" });
    }
  });

  app.delete('/api/inspiration/:id/favorite', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspirationId = parseInt(req.params.id);
      await storage.unfavoriteInspiration(userId, inspirationId);
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      console.error("Error unfavoriting inspiration:", error);
      res.status(500).json({ message: "Failed to unfavorite" });
    }
  });

  app.post('/api/inspiration/:id/share', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspirationId = parseInt(req.params.id);
      await storage.shareInspiration(userId, inspirationId);
      res.json({ message: "Shared successfully" });
    } catch (error) {
      console.error("Error sharing inspiration:", error);
      res.status(500).json({ message: "Failed to share" });
    }
  });

  app.post('/api/inspiration/:id/share-with-users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspirationId = parseInt(req.params.id);
      const { userIds } = req.body;
      
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ message: "userIds array is required" });
      }
      
      await storage.shareInspirationWithUsers(userId, inspirationId, userIds);
      res.json({ message: "Shared with users successfully" });
    } catch (error) {
      console.error("Error sharing inspiration with users:", error);
      res.status(500).json({ message: "Failed to share with users" });
    }
  });

  app.get('/api/users/churches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const churches = await storage.getUserChurches(userId);
      res.json(churches);
    } catch (error) {
      console.error("Error fetching user churches:", error);
      res.status(500).json({ message: "Failed to fetch user churches" });
    }
  });

  // Church routes
  app.get('/api/churches', async (req, res) => {
    try {
      const churches = await storage.getChurches();
      res.json(churches);
    } catch (error) {
      console.error("Error fetching churches:", error);
      res.status(500).json({ message: "Failed to fetch churches" });
    }
  });

  app.post('/api/churches', isAuthenticated, async (req: any, res) => {
    try {
      const churchData = insertChurchSchema.parse(req.body);
      const church = await storage.createChurch(churchData);
      res.status(201).json(church);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid church data", errors: error.errors });
      }
      console.error("Error creating church:", error);
      res.status(500).json({ message: "Failed to create church" });
    }
  });

  app.get('/api/churches/:id', async (req, res) => {
    try {
      const churchId = parseInt(req.params.id);
      const church = await storage.getChurch(churchId);
      if (!church) {
        return res.status(404).json({ message: "Church not found" });
      }
      res.json(church);
    } catch (error) {
      console.error("Error fetching church:", error);
      res.status(500).json({ message: "Failed to fetch church" });
    }
  });

  // User profile routes
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      // Update user profile data
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get('/api/users/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  app.get('/api/users/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Return user activities - implement based on needs
      res.json([]);
    } catch (error) {
      console.error("Error fetching user activities:", error);
      res.status(500).json({ message: "Failed to fetch user activities" });
    }
  });

  app.post('/api/users/churches/:churchId/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const churchId = parseInt(req.params.churchId);
      await storage.joinChurch(userId, churchId);
      res.json({ message: "Successfully joined church" });
    } catch (error) {
      console.error("Error joining church:", error);
      res.status(500).json({ message: "Failed to join church" });
    }
  });

  // Friends routes
  // User search route
  app.get('/api/users/search', isAuthenticated, async (req: any, res) => {
    try {
      const { q } = req.query;
      console.log("Search query received:", q, typeof q, q?.length);
      
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        console.log("Query too short or invalid, returning empty array");
        return res.json([]);
      }
      
      console.log("Searching for users with query:", q.trim());
      const users = await storage.searchUsers(q.trim());
      console.log("Search results:", users);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });

  app.get('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get('/api/friend-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.post('/api/friend-requests', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const { addresseeId } = req.body;
      
      if (requesterId === addresseeId) {
        return res.status(400).json({ message: "Cannot send friend request to yourself" });
      }
      
      const friendship = await storage.sendFriendRequest(requesterId, addresseeId);
      
      // Create a conversation immediately when friend request is sent
      try {
        const conversation = await storage.createConversation({
          name: null,
          type: 'direct',
          isActive: true,
          createdBy: requesterId
        });
        
        // Add both users as participants
        await storage.addConversationParticipant({
          conversationId: conversation.id,
          userId: requesterId,
          isActive: true
        });
        
        await storage.addConversationParticipant({
          conversationId: conversation.id,
          userId: addresseeId,
          isActive: true
        });
      } catch (convError) {
        console.error("Error creating conversation:", convError);
        // Don't fail the friend request if conversation creation fails
      }
      
      res.status(201).json(friendship);
    } catch (error) {
      console.error("Error sending friend request:", error);
      res.status(500).json({ message: "Failed to send friend request" });
    }
  });

  app.patch('/api/friend-requests/:id', isAuthenticated, async (req: any, res) => {
    try {
      const friendshipId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const friendship = await storage.respondToFriendRequest(friendshipId, status);
      res.json(friendship);
    } catch (error) {
      console.error("Error responding to friend request:", error);
      res.status(500).json({ message: "Failed to respond to friend request" });
    }
  });

  // Chat routes
  app.get('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post('/api/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const createdBy = req.user.claims.sub;
      const { type, name, description, participantIds } = req.body;
      
      // Create conversation
      const conversation = await storage.createConversation({
        type: type || 'direct',
        name,
        description,
        createdBy,
      });
      
      // Add creator as participant
      await storage.addConversationParticipant({
        conversationId: conversation.id,
        userId: createdBy,
        role: 'admin',
      });
      
      // Add other participants
      if (participantIds && Array.isArray(participantIds)) {
        for (const participantId of participantIds) {
          if (participantId !== createdBy) {
            await storage.addConversationParticipant({
              conversationId: conversation.id,
              userId: participantId,
              role: 'member',
            });
          }
        }
      }
      
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get('/api/conversations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const conversation = await storage.getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getConversationMessages(conversationId, userId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/conversations/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const senderId = req.user.claims.sub;
      const { content, messageType, replyToId } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      const message = await storage.sendMessage({
        conversationId,
        senderId,
        content: content.trim(),
        messageType: messageType || 'text',
        replyToId: replyToId || null,
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch('/api/conversations/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      await storage.markMessagesAsRead(conversationId, userId);
      res.json({ message: "Messages marked as read" });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Like routes for different post types
  app.post("/api/discussions/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const discussionId = parseInt(req.params.id);
      
      const isLiked = await storage.getUserDiscussionLike(discussionId, userId);
      if (isLiked) {
        await storage.unlikeDiscussion(discussionId, userId);
        res.json({ message: "Discussion unliked", isLiked: false });
      } else {
        await storage.likeDiscussion(discussionId, userId);
        res.json({ message: "Discussion liked", isLiked: true });
      }
    } catch (error) {
      console.error("Error toggling discussion like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post("/api/prayers/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const prayerId = parseInt(req.params.id);
      
      // For prayers, we'll track "prayers offered" as likes
      const existingResponse = await storage.getUserPrayerResponse(prayerId, userId);
      if (existingResponse) {
        res.json({ message: "Already prayed for this request", isLiked: true });
      } else {
        await storage.prayForRequest({
          prayerRequestId: prayerId,
          userId: userId
        });
        res.json({ message: "Prayer offered", isLiked: true });
      }
    } catch (error) {
      console.error("Error offering prayer:", error);
      res.status(500).json({ message: "Failed to offer prayer" });
    }
  });

  app.post("/api/inspirations/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const inspirationId = parseInt(req.params.id);
      
      // Check if already favorited
      const [existing] = await db
        .select()
        .from(userInspirationHistory)
        .where(and(
          eq(userInspirationHistory.userId, userId),
          eq(userInspirationHistory.inspirationId, inspirationId)
        ));

      if (existing?.wasFavorited) {
        await storage.unfavoriteInspiration(userId, inspirationId);
        res.json({ message: "Inspiration unfavorited", isLiked: false });
      } else {
        await storage.favoriteInspiration(userId, inspirationId);
        res.json({ message: "Inspiration favorited", isLiked: true });
      }
    } catch (error) {
      console.error("Error toggling inspiration favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  // Comment routes
  app.get("/api/discussions/:id/comments", async (req, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const comments = await storage.getDiscussionComments(discussionId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/discussions/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const discussionId = parseInt(req.params.id);
      const { content } = req.body;
      
      const comment = await storage.createDiscussionComment({
        discussionId,
        authorId: userId,
        content,
        parentId: null
      });
      
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Share routes
  app.post("/api/discussions/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const discussionId = parseInt(req.params.id);
      
      // Get the discussion details
      const discussion = await storage.getDiscussion(discussionId);
      if (!discussion) {
        return res.status(404).json({ message: "Discussion not found" });
      }
      
      // Get author info for the discussion
      const author = await storage.getUser(discussion.authorId);
      const authorName = author ? (author.firstName && author.lastName ? `${author.firstName} ${author.lastName}` : author.email || 'Unknown User') : 'Unknown User';
      
      // Create a new discussion post sharing the original
      const shareContent = `📢 **Shared Discussion: ${discussion.title}**\n\n${discussion.content}\n\n*Originally shared by ${authorName}*`;
      
      await storage.createDiscussion({
        authorId: userId,
        title: `Shared: ${discussion.title}`,
        content: shareContent,
        category: 'shared',
        churchId: null,
      });
      
      res.json({ message: "Discussion shared" });
    } catch (error) {
      console.error("Error sharing discussion:", error);
      res.status(500).json({ message: "Failed to share discussion" });
    }
  });

  app.post("/api/prayers/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const prayerId = parseInt(req.params.id);
      
      // Get the prayer details
      const prayer = await storage.getPrayerRequest(prayerId);
      if (!prayer) {
        return res.status(404).json({ message: "Prayer request not found" });
      }
      
      // Create a new discussion post sharing the prayer
      const shareContent = `🙏 **Shared Prayer Request: ${prayer.title}**\n\n${prayer.content}\n\n*Please join me in praying for this request*`;
      
      await storage.createDiscussion({
        authorId: userId,
        title: `Prayer Request: ${prayer.title}`,
        content: shareContent,
        category: 'prayer',
        churchId: null,
      });
      
      res.json({ message: "Prayer request shared" });
    } catch (error) {
      console.error("Error sharing prayer:", error);
      res.status(500).json({ message: "Failed to share prayer" });
    }
  });

  app.post("/api/inspirations/:id/share", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const inspirationId = parseInt(req.params.id);
      
      await storage.shareInspiration(userId, inspirationId);
      res.json({ message: "Inspiration shared" });
    } catch (error) {
      console.error("Error sharing inspiration:", error);
      res.status(500).json({ message: "Failed to share inspiration" });
    }
  });

  // Bookmark routes for different post types
  app.post("/api/discussions/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const discussionId = parseInt(req.params.id);
      
      await storage.bookmarkDiscussion(userId, discussionId);
      res.json({ message: "Discussion bookmarked" });
    } catch (error) {
      console.error("Error bookmarking discussion:", error);
      res.status(500).json({ message: "Failed to bookmark discussion" });
    }
  });

  app.post("/api/discussions/:id/unbookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const discussionId = parseInt(req.params.id);
      
      await storage.unbookmarkDiscussion(userId, discussionId);
      res.json({ message: "Discussion unbookmarked" });
    } catch (error) {
      console.error("Error unbookmarking discussion:", error);
      res.status(500).json({ message: "Failed to unbookmark discussion" });
    }
  });

  app.post("/api/prayers/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const prayerId = parseInt(req.params.id);
      
      await storage.bookmarkPrayer(userId, prayerId);
      res.json({ message: "Prayer request bookmarked" });
    } catch (error) {
      console.error("Error bookmarking prayer:", error);
      res.status(500).json({ message: "Failed to bookmark prayer" });
    }
  });

  app.post("/api/prayers/:id/unbookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const prayerId = parseInt(req.params.id);
      
      await storage.unbookmarkPrayer(userId, prayerId);
      res.json({ message: "Prayer request unbookmarked" });
    } catch (error) {
      console.error("Error unbookmarking prayer:", error);
      res.status(500).json({ message: "Failed to unbookmark prayer" });
    }
  });

  app.post("/api/inspirations/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const inspirationId = parseInt(req.params.id);
      
      await storage.bookmarkInspiration(userId, inspirationId);
      res.json({ message: "Inspiration bookmarked" });
    } catch (error) {
      console.error("Error bookmarking inspiration:", error);
      res.status(500).json({ message: "Failed to bookmark inspiration" });
    }
  });

  app.post("/api/inspirations/:id/unbookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const inspirationId = parseInt(req.params.id);
      
      await storage.unbookmarkInspiration(userId, inspirationId);
      res.json({ message: "Inspiration unbookmarked" });
    } catch (error) {
      console.error("Error unbookmarking inspiration:", error);
      res.status(500).json({ message: "Failed to unbookmark inspiration" });
    }
  });

  app.post("/api/events/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const eventId = parseInt(req.params.id);
      
      await storage.bookmarkEvent(userId, eventId);
      res.json({ message: "Event bookmarked" });
    } catch (error) {
      console.error("Error bookmarking event:", error);
      res.status(500).json({ message: "Failed to bookmark event" });
    }
  });

  app.post("/api/events/:id/unbookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const eventId = parseInt(req.params.id);
      
      await storage.unbookmarkEvent(userId, eventId);
      res.json({ message: "Event unbookmarked" });
    } catch (error) {
      console.error("Error unbookmarking event:", error);
      res.status(500).json({ message: "Failed to unbookmark event" });
    }
  });

  // Member Management API Routes
  // In-memory storage for member data
  let membersData = [
        {
          id: "1",
          fullName: "John Smith",
          email: "john.smith@email.com",
          phoneNumber: "+1 555-0123",
          address: "123 Main St, Springfield, IL 62701",
          membershipStatus: "active",
          joinedDate: "2023-01-15",
          churchId: "3",
          churchAffiliation: "Grace Community Church",
          denomination: "Non-denominational",
          interests: "Youth ministry, music, missions",
          notes: "Active volunteer, leads youth ministry, regular attendee"
        },
        {
          id: "2", 
          fullName: "Mary Johnson",
          email: "mary.johnson@email.com",
          phoneNumber: "+1 555-0456",
          address: "456 Oak Ave, Springfield, IL 62702",
          membershipStatus: "new_member",
          joinedDate: "2024-11-01",
          churchId: "3",
          churchAffiliation: "Grace Community Church",
          denomination: "Non-denominational",
          interests: "Choir, women's ministry, Bible study",
          notes: "Recently joined, interested in choir ministry"
        },
        {
          id: "3",
          fullName: "David Wilson",
          email: "david.wilson@email.com",
          phoneNumber: "+1 555-0789",
          address: "789 Pine Rd, Springfield, IL 62703",
          membershipStatus: "active",
          joinedDate: "2022-03-20",
          churchId: "2",
          churchAffiliation: "Church On The Way",
          denomination: "Pentecostal",
          interests: "Teaching, men's ministry, prayer",
          notes: "Sunday school teacher, active in men's ministry"
        },
        {
          id: "4",
          fullName: "Sarah Davis",
          email: "sarah.davis@email.com",
          phoneNumber: "+1 555-0234",
          address: "234 Elm St, Springfield, IL 62704",
          membershipStatus: "active",
          joinedDate: "2021-08-12",
          churchId: "3",
          churchAffiliation: "Grace Community Church",
          denomination: "Non-denominational",
          interests: "Worship, children's ministry, creative arts",
          notes: "Worship team member, children's ministry coordinator"
        },
        {
          id: "5",
          fullName: "Michael Brown",
          email: "michael.brown@email.com",
          phoneNumber: "+1 555-0567",
          address: "567 Maple Dr, Springfield, IL 62705",
          membershipStatus: "visitor",
          joinedDate: "2024-12-01",
          churchId: "1",
          churchAffiliation: "La Mesa",
          denomination: "Baptist",
          interests: "Small groups, community service, sports",
          notes: "First-time visitor, interested in small groups"
        },
        {
          id: "6",
          fullName: "Jennifer Martinez",
          email: "jennifer.martinez@email.com",
          phoneNumber: "+1 555-0890",
          address: "890 Cedar Ln, Springfield, IL 62706",
          membershipStatus: "active",
          joinedDate: "2020-06-14",
          churchId: "2",
          churchAffiliation: "Church On The Way",
          denomination: "Pentecostal",
          interests: "Women's ministry, prayer, counseling",
          notes: "Women's ministry leader, prayer team coordinator"
        },
        {
          id: "7",
          fullName: "Robert Taylor",
          email: "robert.taylor@email.com",
          phoneNumber: "+1 555-0345",
          address: "345 Birch Ave, Springfield, IL 62707",
          membershipStatus: "active",
          joinedDate: "2019-11-30",
          churchId: "1",
          churchAffiliation: "La Mesa",
          denomination: "Baptist",
          interests: "Leadership, finances, facility management",
          notes: "Deacon, financial ministry, building maintenance team"
        },
        {
          id: "8",
          fullName: "Lisa Anderson",
          email: "lisa.anderson@email.com",
          phoneNumber: "+1 555-0678",
          address: "678 Walnut St, Springfield, IL 62708",
          membershipStatus: "new_member",
          joinedDate: "2024-10-15",
          churchId: "3",
          churchAffiliation: "Grace Community Church",
          denomination: "Non-denominational",
          interests: "Discipleship, hospitality, newcomer ministry",
          notes: "New member class graduate, seeking ministry involvement"
        },
        {
          id: "9",
          fullName: "James Thompson",
          email: "james.thompson@email.com",
          phoneNumber: "+1 555-0912",
          address: "912 Hickory Ct, Springfield, IL 62709",
          membershipStatus: "inactive",
          joinedDate: "2018-04-22",
          churchId: "2",
          churchAffiliation: "Church On The Way",
          denomination: "Pentecostal",
          interests: "Missions, evangelism, technology",
          notes: "Former active member, moved but still on roster"
        },
        {
          id: "10",
          fullName: "Amanda White",
          email: "amanda.white@email.com",
          phoneNumber: "+1 555-0456",
          address: "456 Spruce Way, Springfield, IL 62710",
          membershipStatus: "visitor",
          joinedDate: "2024-12-08",
          churchId: "1",
          churchAffiliation: "La Mesa",
          denomination: "Baptist",
          interests: "Family ministry, outreach, Bible study",
          notes: "Visiting family, considering membership"
        },
        {
          id: "11",
          fullName: "Pastor Miguel Rodriguez",
          email: "miguel.rodriguez@email.com",
          phoneNumber: "+1 555-0111",
          address: "111 Ministry Lane, Springfield, IL 62711",
          membershipStatus: "active",
          joinedDate: "2020-01-15",
          churchId: "3,2",
          churchAffiliation: "Grace Community Church, Church On The Way",
          denomination: "Multi-denominational",
          interests: "Inter-church ministry, pastoral care, community outreach",
          notes: "Associate pastor serving both congregations, coordinates joint ministries"
        },
        {
          id: "12",
          fullName: "Rachel Kim",
          email: "rachel.kim@email.com",
          phoneNumber: "+1 555-0222",
          address: "222 Unity Street, Springfield, IL 62712",
          membershipStatus: "active",
          joinedDate: "2021-09-10",
          churchId: "2,1",
          churchAffiliation: "Church On The Way, La Mesa",
          denomination: "Baptist/Pentecostal",
          interests: "Worship ministry, youth programs, cross-cultural ministry",
          notes: "Worship leader who serves at both churches, bilingual ministry coordinator"
        },
        {
          id: "13",
          fullName: "Dr. Thomas Bennett",
          email: "thomas.bennett@email.com",
          phoneNumber: "+1 555-0333",
          address: "333 Scholar Drive, Springfield, IL 62713",
          membershipStatus: "active",
          joinedDate: "2019-05-20",
          churchId: "3,1",
          churchAffiliation: "Grace Community Church, La Mesa",
          denomination: "Non-denominational/Baptist",
          interests: "Biblical studies, teaching, seminary education",
          notes: "Theology professor who teaches Bible studies at both churches"
        }
      ];

  app.get("/api/members", async (req, res) => {
    try {
      const { churchId } = req.query;
      let filteredMembers = membersData;
      
      // Filter by church if churchId is provided
      if (churchId) {
        filteredMembers = membersData.filter(member => {
          // Handle members who belong to multiple churches (comma-separated churchIds)
          const memberChurchIds = member.churchId.split(',').map(id => id.trim());
          return memberChurchIds.includes(String(churchId));
        });
      }
      res.json(filteredMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  // Update member endpoint
  app.put("/api/members/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Find and update the member in our in-memory storage
      const memberIndex = membersData.findIndex(member => member.id === id);
      if (memberIndex !== -1) {
        membersData[memberIndex] = { ...membersData[memberIndex], ...updates };
        res.json(membersData[memberIndex]);
      } else {
        res.status(404).json({ error: "Member not found" });
      }
    } catch (error) {
      console.error("Error updating member:", error);
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  // In-memory storage for sessions
  let sessionsData = [
    {
      id: "1",
      churchId: "1",
      churchName: "Grace Community Church",
      sessionType: "counseling",
      memberId: "1",
      memberName: "John Smith",
      memberEmail: "john.smith@email.com",
      scheduledTime: "2024-06-15T14:00:00Z",
      duration: 60,
      location: "Pastor's Office",
      status: "confirmed",
      notes: "Marriage counseling session",
      createdAt: "2024-06-10T10:00:00Z"
    },
    {
      id: "2",
      churchId: "1",
      churchName: "Grace Community Church",
      sessionType: "pastoral_care",
      memberId: "2",
      memberName: "Mary Johnson",
      memberEmail: "mary.johnson@email.com",
      scheduledTime: "2024-06-16T16:00:00Z",
      duration: 45,
      location: "Church Library",
      status: "pending",
      notes: "Spiritual guidance discussion",
      createdAt: "2024-06-11T09:30:00Z"
    },
    {
      id: "3",
      churchId: "2",
      churchName: "Church On The Way",
      sessionType: "prayer",
      memberId: "3",
      memberName: "David Wilson",
      memberEmail: "david.wilson@email.com",
      scheduledTime: "2024-06-17T18:00:00Z",
      duration: 30,
      location: "Prayer Room",
      status: "confirmed",
      notes: "Personal prayer and support",
      createdAt: "2024-06-12T14:15:00Z"
    }
  ];

  app.get("/api/counseling-sessions", async (req, res) => {
    try {
      const { churchId } = req.query;
      
      let filteredSessions = sessionsData;
      
      // Filter by church if churchId is provided
      if (churchId) {
        filteredSessions = sessionsData.filter(session => 
          session.churchId === churchId.toString()
        );
      }
      
      res.json(filteredSessions);
    } catch (error) {
      console.error("Error fetching counseling sessions:", error);
      res.status(500).json({ error: "Failed to fetch counseling sessions" });
    }
  });

  app.post("/api/counseling-sessions", async (req, res) => {
    try {
      const { memberId, churchId, ...sessionData } = req.body;
      
      // Find member details if memberId is provided
      let memberInfo = {};
      if (memberId) {
        const member = membersData.find(m => m.id === memberId);
        if (member) {
          memberInfo = {
            memberName: member.fullName,
            memberEmail: member.email
          };
        }
      }
      
      // Find church name if churchId is provided
      let churchInfo = {};
      if (churchId) {
        const churchMap = {
          "1": "Grace Community Church",
          "2": "Church On The Way", 
          "3": "La Mesa"
        };
        churchInfo = {
          churchName: churchMap[churchId] || "Unknown Church"
        };
      }
      
      const newSession = {
        id: Date.now().toString(),
        memberId,
        churchId,
        ...memberInfo,
        ...churchInfo,
        ...sessionData,
        status: sessionData.status || "pending",
        createdAt: new Date().toISOString()
      };
      
      sessionsData.push(newSession);
      res.json(newSession);
    } catch (error) {
      console.error("Error creating counseling session:", error);
      res.status(400).json({ error: "Failed to create counseling session" });
    }
  });

  // Update session endpoint
  app.put("/api/counseling-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const sessionIndex = sessionsData.findIndex(session => session.id === id);
      if (sessionIndex !== -1) {
        sessionsData[sessionIndex] = { ...sessionsData[sessionIndex], ...updates };
        res.json(sessionsData[sessionIndex]);
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Delete session endpoint
  app.delete("/api/counseling-sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const sessionIndex = sessionsData.findIndex(session => session.id === id);
      if (sessionIndex !== -1) {
        sessionsData.splice(sessionIndex, 1);
        res.json({ message: "Session deleted successfully" });
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Update session status endpoint
  app.put("/api/counseling-sessions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const validStatuses = ["scheduled", "in_progress", "completed", "cancelled", "no_show", "rescheduled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      
      const sessionIndex = sessionsData.findIndex(session => session.id === id);
      if (sessionIndex !== -1) {
        sessionsData[sessionIndex] = { 
          ...sessionsData[sessionIndex], 
          status,
          updatedAt: new Date().toISOString()
        };
        res.json(sessionsData[sessionIndex]);
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (error) {
      console.error("Error updating session status:", error);
      res.status(500).json({ error: "Failed to update session status" });
    }
  });

  // Confirm session endpoint
  app.patch("/api/counseling-sessions/:id/confirm", async (req, res) => {
    try {
      const { id } = req.params;
      
      const sessionIndex = sessionsData.findIndex(session => session.id === id);
      if (sessionIndex !== -1) {
        sessionsData[sessionIndex] = { 
          ...sessionsData[sessionIndex], 
          status: "confirmed",
          updatedAt: new Date().toISOString()
        };
        res.json(sessionsData[sessionIndex]);
      } else {
        res.status(404).json({ error: "Session not found" });
      }
    } catch (error) {
      console.error("Error confirming session:", error);
      res.status(500).json({ error: "Failed to confirm session" });
    }
  });

  app.get("/api/volunteer-opportunities", async (req, res) => {
    try {
      const opportunities = [
        {
          id: "1",
          title: "Sunday Greeter",
          description: "Welcome visitors and members at the main entrance",
          maxVolunteers: 3,
          currentSignUps: 1,
          startTime: "2024-06-16T09:00:00Z",
          endTime: "2024-06-16T12:00:00Z",
          location: "Main Entrance",
          isActive: true
        }
      ];
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching volunteer opportunities:", error);
      res.status(500).json({ error: "Failed to fetch volunteer opportunities" });
    }
  });

  app.post("/api/volunteer-opportunities", async (req, res) => {
    try {
      const newOpportunity = {
        id: Date.now().toString(),
        ...req.body,
        currentSignUps: 0,
        isActive: true
      };
      res.json(newOpportunity);
    } catch (error) {
      console.error("Error creating volunteer opportunity:", error);
      res.status(400).json({ error: "Failed to create volunteer opportunity" });
    }
  });

  app.get("/api/livestreams", async (req, res) => {
    try {
      const streams = [
        {
          id: "1",
          title: "Sunday Service",
          description: "Weekly worship service with Pastor Johnson",
          scheduledStart: "2024-06-16T10:00:00Z",
          streamUrl: "https://youtube.com/live/example",
          status: "scheduled",
          viewerCount: 0,
          chatEnabled: true,
          recordingEnabled: true
        }
      ];
      res.json(streams);
    } catch (error) {
      console.error("Error fetching livestreams:", error);
      res.status(500).json({ error: "Failed to fetch livestreams" });
    }
  });

  app.post("/api/livestreams", async (req, res) => {
    try {
      const newStream = {
        id: Date.now().toString(),
        ...req.body,
        status: "scheduled",
        viewerCount: 0
      };
      res.json(newStream);
    } catch (error) {
      console.error("Error creating livestream:", error);
      res.status(400).json({ error: "Failed to create livestream" });
    }
  });

  app.get("/api/sermon-archive", async (req, res) => {
    try {
      const sermons = [
        {
          id: "1",
          title: "Walking in Faith",
          speaker: "Pastor Johnson",
          series: "Living by Faith",
          scripture: "Hebrews 11:1-6",
          sermonDate: "2024-06-09",
          duration: 2700,
          viewCount: 145,
          featured: true
        }
      ];
      res.json(sermons);
    } catch (error) {
      console.error("Error fetching sermon archive:", error);
      res.status(500).json({ error: "Failed to fetch sermon archive" });
    }
  });

  app.post("/api/sermon-archive", async (req, res) => {
    try {
      const newSermon = {
        id: Date.now().toString(),
        ...req.body,
        viewCount: 0,
        featured: false
      };
      res.json(newSermon);
    } catch (error) {
      console.error("Error creating sermon archive entry:", error);
      res.status(400).json({ error: "Failed to create sermon archive entry" });
    }
  });

  // Comprehensive Leaderboard API Endpoints
  // 1. Weekly Faithfulness Score
  app.get('/api/leaderboard/weekly-faithfulness', isAuthenticated, async (req: any, res) => {
    try {
      const { churchId } = req.query;
      const leaderboard = await storage.getLeaderboard('weekly', 'faithfulness', churchId ? parseInt(churchId) : undefined);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching weekly faithfulness leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // 2. Streak-Based Rankings
  app.get('/api/leaderboard/streaks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streaks = await storage.getUserStreaks(userId);
      res.json(streaks);
    } catch (error) {
      console.error("Error fetching user streaks:", error);
      res.status(500).json({ message: "Failed to fetch streaks" });
    }
  });

  // 3. Prayer Champions
  app.get('/api/leaderboard/prayer-champions', isAuthenticated, async (req: any, res) => {
    try {
      const { churchId } = req.query;
      const leaderboard = await storage.getLeaderboard('monthly', 'prayer', churchId ? parseInt(churchId) : undefined);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching prayer champions leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // 4. Service & Volunteering Points
  app.get('/api/leaderboard/service', isAuthenticated, async (req: any, res) => {
    try {
      const { churchId } = req.query;
      const leaderboard = await storage.getLeaderboard('monthly', 'service', churchId ? parseInt(churchId) : undefined);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching service leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // 5. User Score Management
  app.get('/api/users/score', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userScore = await storage.getUserScore(userId);
      const referralStats = await storage.getUserReferralStats(userId);
      
      // Get user's current referral tier
      const rewardTiers = await storage.getReferralRewardTiers();
      let currentTier = 'Bronze';
      if (referralStats.successfulReferrals >= 50) currentTier = 'Platinum';
      else if (referralStats.successfulReferrals >= 25) currentTier = 'Gold';
      else if (referralStats.successfulReferrals >= 10) currentTier = 'Silver';
      
      const scoreWithReferrals = {
        ...(userScore || { 
          totalPoints: 0, 
          weeklyPoints: 0, 
          monthlyPoints: 0, 
          currentStreak: 0, 
          faithfulnessScore: 0,
          prayerChampionPoints: 0,
          serviceHours: 0,
          isAnonymous: false
        }),
        referralCount: referralStats.successfulReferrals,
        referralPoints: referralStats.totalPointsEarned,
        referralTier: currentTier
      };
      
      res.json(scoreWithReferrals);
    } catch (error) {
      console.error("Error fetching user score:", error);
      res.status(500).json({ message: "Failed to fetch user score" });
    }
  });

  app.post('/api/users/score/anonymous', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { isAnonymous } = req.body;
      const userScore = await storage.updateUserScore(userId, { isAnonymous });
      res.json(userScore);
    } catch (error) {
      console.error("Error updating anonymous mode:", error);
      res.status(500).json({ message: "Failed to update anonymous mode" });
    }
  });

  // 6. Church vs Church Leaderboards
  app.get('/api/leaderboard/church-vs-church', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getLeaderboard('monthly', 'church_comparison', undefined);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching church vs church leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // 7. Seasonal Leaderboards
  app.get('/api/leaderboard/seasonal', isAuthenticated, async (req: any, res) => {
    try {
      const { season } = req.query;
      const leaderboard = await storage.getLeaderboard('seasonal', season || 'current', undefined);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching seasonal leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // 8. Role-Based Filters
  app.get('/api/leaderboard/by-role', isAuthenticated, async (req: any, res) => {
    try {
      const { role, churchId } = req.query;
      const leaderboard = await storage.getLeaderboard('monthly', `role_${role}`, churchId ? parseInt(churchId) : undefined);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching role-based leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // 9. Achievement System
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // 10. Challenge System
  app.get('/api/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const { churchId } = req.query;
      const challenges = await storage.getChallenges(churchId ? parseInt(churchId) : undefined);
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.post('/api/challenges/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challengeId = parseInt(req.params.id);
      const participant = await storage.joinChallenge(userId, challengeId);
      res.json(participant);
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(500).json({ message: "Failed to join challenge" });
    }
  });

  // Point Transaction System
  app.post('/api/points/add', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { points, activityType, entityId, description } = req.body;
      
      const transaction = await storage.addPointTransaction({
        userId,
        points,
        activityType,
        entityId,
        description,
      });

      // Update streaks based on activity
      if (activityType === 'daily_prayer' || activityType === 'daily_devotional') {
        await storage.updateStreak(userId, activityType);
      }

      res.json(transaction);
    } catch (error) {
      console.error("Error adding points:", error);
      res.status(500).json({ message: "Failed to add points" });
    }
  });

  // Content Management API Routes
  app.post('/api/devotionals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const devotionalData = insertDevotionalSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      const devotional = await storage.createDevotional(devotionalData);
      res.json(devotional);
    } catch (error) {
      console.error("Error creating devotional:", error);
      res.status(500).json({ message: "Failed to create devotional" });
    }
  });

  app.get('/api/devotionals', async (req, res) => {
    try {
      const { churchId } = req.query;
      const devotionals = await storage.getDevotionals(churchId ? parseInt(churchId.toString()) : undefined);
      res.json(devotionals);
    } catch (error) {
      console.error("Error fetching devotionals:", error);
      res.status(500).json({ message: "Failed to fetch devotionals" });
    }
  });

  app.post('/api/weekly-series', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const seriesData = insertWeeklySeriesSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      const series = await storage.createWeeklySeries(seriesData);
      res.json(series);
    } catch (error) {
      console.error("Error creating weekly series:", error);
      res.status(500).json({ message: "Failed to create weekly series" });
    }
  });

  app.get('/api/weekly-series', async (req, res) => {
    try {
      const { churchId } = req.query;
      const series = await storage.getWeeklySeries(churchId ? parseInt(churchId.toString()) : undefined);
      res.json(series);
    } catch (error) {
      console.error("Error fetching weekly series:", error);
      res.status(500).json({ message: "Failed to fetch weekly series" });
    }
  });

  app.post('/api/sermon-media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mediaData = insertSermonMediaSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      const media = await storage.createSermonMedia(mediaData);
      res.json(media);
    } catch (error) {
      console.error("Error creating sermon media:", error);
      res.status(500).json({ message: "Failed to create sermon media" });
    }
  });

  app.get('/api/sermon-media', async (req, res) => {
    try {
      const { churchId } = req.query;
      const media = await storage.getSermonMedia(churchId ? parseInt(churchId.toString()) : undefined);
      res.json(media);
    } catch (error) {
      console.error("Error fetching sermon media:", error);
      res.status(500).json({ message: "Failed to fetch sermon media" });
    }
  });

  // Draft content endpoints
  app.get('/api/drafts/devotionals', isAuthenticated, async (req, res) => {
    try {
      const { churchId } = req.query;
      let whereConditions = [eq(devotionals.isPublished, false)];
      
      if (churchId) {
        whereConditions.push(eq(devotionals.churchId, Number(churchId)));
      }
      
      const drafts = await db.select()
        .from(devotionals)
        .where(and(...whereConditions))
        .orderBy(desc(devotionals.createdAt));
        
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching devotional drafts:", error);
      res.status(500).json({ message: "Failed to fetch devotional drafts" });
    }
  });

  app.get('/api/drafts/weekly-series', isAuthenticated, async (req, res) => {
    try {
      const { churchId } = req.query;
      let whereConditions = [eq(weeklySeries.isActive, false)];
      
      if (churchId) {
        whereConditions.push(eq(weeklySeries.churchId, Number(churchId)));
      }
      
      const drafts = await db.select()
        .from(weeklySeries)
        .where(and(...whereConditions))
        .orderBy(desc(weeklySeries.createdAt));
        
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching weekly series drafts:", error);
      res.status(500).json({ message: "Failed to fetch weekly series drafts" });
    }
  });

  app.get('/api/drafts/sermon-media', isAuthenticated, async (req, res) => {
    try {
      const { churchId } = req.query;
      let whereConditions = [eq(sermonMedia.isPublished, false)];
      
      if (churchId) {
        whereConditions.push(eq(sermonMedia.churchId, Number(churchId)));
      }
      
      const drafts = await db.select()
        .from(sermonMedia)
        .where(and(...whereConditions))
        .orderBy(desc(sermonMedia.createdAt));
        
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching sermon media drafts:", error);
      res.status(500).json({ message: "Failed to fetch sermon media drafts" });
    }
  });

  // Publish draft endpoints
  app.patch('/api/drafts/devotionals/:id/publish', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await db.update(devotionals)
        .set({ isPublished: true, publishedAt: new Date() })
        .where(eq(devotionals.id, Number(id)))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error("Error publishing devotional:", error);
      res.status(500).json({ message: "Failed to publish devotional" });
    }
  });

  app.patch('/api/drafts/weekly-series/:id/publish', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await db.update(weeklySeries)
        .set({ isActive: true })
        .where(eq(weeklySeries.id, Number(id)))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error("Error publishing weekly series:", error);
      res.status(500).json({ message: "Failed to publish weekly series" });
    }
  });

  app.patch('/api/drafts/sermon-media/:id/publish', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updated = await db.update(sermonMedia)
        .set({ isPublished: true, publishedAt: new Date() })
        .where(eq(sermonMedia.id, Number(id)))
        .returning();
      res.json(updated[0]);
    } catch (error) {
      console.error("Error publishing sermon media:", error);
      res.status(500).json({ message: "Failed to publish sermon media" });
    }
  });

  // Delete draft endpoints
  app.delete('/api/drafts/devotionals/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(devotionals).where(eq(devotionals.id, Number(id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting devotional draft:", error);
      res.status(500).json({ message: "Failed to delete devotional draft" });
    }
  });

  // Delete published content endpoints
  app.delete('/api/devotionals/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(devotionals).where(eq(devotionals.id, Number(id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting devotional:", error);
      res.status(500).json({ message: "Failed to delete devotional" });
    }
  });

  app.delete('/api/weekly-series/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(weeklySeries).where(eq(weeklySeries.id, Number(id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting weekly series:", error);
      res.status(500).json({ message: "Failed to delete weekly series" });
    }
  });

  app.delete('/api/sermon-media/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(sermonMedia).where(eq(sermonMedia.id, Number(id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting sermon media:", error);
      res.status(500).json({ message: "Failed to delete sermon media" });
    }
  });

  app.delete('/api/drafts/weekly-series/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(weeklySeries).where(eq(weeklySeries.id, Number(id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting weekly series draft:", error);
      res.status(500).json({ message: "Failed to delete weekly series draft" });
    }
  });

  app.delete('/api/drafts/sermon-media/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(sermonMedia).where(eq(sermonMedia.id, Number(id)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting sermon media draft:", error);
      res.status(500).json({ message: "Failed to delete sermon media draft" });
    }
  });

  // Notification system routes
  app.get("/api/notifications/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const settings = await storage.getNotificationSettings(userId);
      res.json(settings || {
        userId,
        pushEnabled: true,
        emailEnabled: true,
        scriptureNotifications: true,
        eventNotifications: true,
        messageNotifications: true,
        prayerNotifications: true,
        scriptureTime: "06:00",
        timezone: "America/Los_Angeles",
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00",
        weekendNotifications: true
      });
    } catch (error) {
      console.error("Error getting notification settings:", error);
      res.status(500).json({ message: "Failed to get notification settings" });
    }
  });

  app.post("/api/notifications/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const settings = await storage.upsertNotificationSettings({
        userId,
        ...req.body
      });
      res.json(settings);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  app.get("/api/notifications/scheduled", isAuthenticated, async (req: any, res) => {
    try {
      const churchId = req.query.churchId ? parseInt(req.query.churchId) : undefined;
      const notifications = await storage.getScheduledNotifications(churchId);
      res.json(notifications);
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      res.status(500).json({ message: "Failed to get scheduled notifications" });
    }
  });

  app.post("/api/notifications/scheduled", isAuthenticated, async (req: any, res) => {
    try {
      const createdBy = req.user?.claims?.sub;
      const notification = await storage.createScheduledNotification({
        createdBy,
        ...req.body
      });
      res.json(notification);
    } catch (error) {
      console.error("Error creating scheduled notification:", error);
      res.status(500).json({ message: "Failed to create scheduled notification" });
    }
  });

  app.put("/api/notifications/scheduled/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.updateScheduledNotification(id, req.body);
      res.json(notification);
    } catch (error) {
      console.error("Error updating scheduled notification:", error);
      res.status(500).json({ message: "Failed to update scheduled notification" });
    }
  });

  app.delete("/api/notifications/scheduled/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteScheduledNotification(id);
      res.json({ message: "Scheduled notification deleted" });
    } catch (error) {
      console.error("Error deleting scheduled notification:", error);
      res.status(500).json({ message: "Failed to delete scheduled notification" });
    }
  });

  // Community statistics route
  app.get("/api/bible/community-stats", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      // Get today's reading count
      const todayReads = await storage.getBibleReadingCountSince(today);
      
      // Get this week's reading count
      const weekReads = await storage.getBibleReadingCountSince(weekAgo);

      res.json({
        todayReads,
        weekReads
      });
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Failed to fetch community statistics" });
    }
  });

  // Daily Bible Feature API Routes
  app.get('/api/bible/daily-verse', isAuthenticated, async (req: any, res) => {
    try {
      const { date, journeyType } = req.query;
      const userId = req.user.claims.sub;
      const targetDate = date ? new Date(date) : new Date();
      
      // Import journey system for verse selection
      const { getDailyVerseForUser } = await import('./journeySystem');
      
      // Get user's current journey preferences (simplified for now)
      const currentJourneyType = journeyType || "reading";
      const currentProgress = 0; // This would come from user preferences in full implementation
      
      // Get verse based on journey type and progress
      const verse = getDailyVerseForUser(currentJourneyType, currentProgress);
      
      if (!verse) {
        return res.status(404).json({ message: "No verse available for this journey type" });
      }
      
      // Update verse date to today
      verse.date = targetDate;
      
      res.json(verse);
    } catch (error) {
      console.error("Error fetching daily verse:", error);
      res.status(500).json({ message: "Failed to fetch daily verse" });
    }
  });

  // Journey types endpoint
  app.get('/api/bible/journey-types', isAuthenticated, async (req: any, res) => {
    try {
      const { journeyTypes } = await import('./journeySystem');
      const availableJourneys = journeyTypes.map(journey => ({
        type: journey.type,
        name: journey.name,
        description: journey.description,
        seriesCount: journey.series.length
      }));
      res.json(availableJourneys);
    } catch (error) {
      console.error("Error fetching journey types:", error);
      res.status(500).json({ message: "Failed to fetch journey types" });
    }
  });

  // Switch journey type endpoint
  app.post('/api/bible/switch-journey', isAuthenticated, async (req: any, res) => {
    try {
      const { journeyType } = req.body;
      const userId = req.user.claims.sub;
      
      if (!journeyType) {
        return res.status(400).json({ message: "Journey type is required" });
      }
      
      // In a full implementation, this would update user preferences in the database
      // For now, return success
      res.json({ 
        message: "Journey switched successfully",
        journeyType,
        userId
      });
    } catch (error) {
      console.error("Error switching journey:", error);
      res.status(500).json({ message: "Failed to switch journey" });
    }
  });

  app.post('/api/bible/daily-verse', isAuthenticated, async (req: any, res) => {
    try {
      const verseData = insertDailyVerseSchema.parse(req.body);
      const verse = await storage.createDailyVerse(verseData);
      res.json(verse);
    } catch (error) {
      console.error("Error creating daily verse:", error);
      res.status(500).json({ message: "Failed to create daily verse" });
    }
  });

  app.get('/api/bible/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const streak = await storage.getUserBibleStreak(userId);
      res.json(streak || {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastReadDate: null,
        totalDaysRead: 0,
        versesMemorized: 0,
        graceDaysUsed: 0,
      });
    } catch (error) {
      console.error("Error fetching bible streak:", error);
      res.status(500).json({ message: "Failed to fetch bible streak" });
    }
  });

  app.post('/api/bible/reading', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const readingData = insertUserBibleReadingSchema.parse({
        ...req.body,
        userId,
      });
      const reading = await storage.recordBibleReading(readingData);
      
      // Check for badge achievements
      const streak = await storage.getUserBibleStreak(userId);
      const badges = await storage.getBibleBadges();
      
      // Award streak badges
      for (const badge of badges) {
        if (badge.requirement && typeof badge.requirement === 'object') {
          const req_obj = badge.requirement as any;
          if (req_obj.type === 'streak' && streak && streak.currentStreak >= req_obj.value) {
            await storage.awardBibleBadge(userId, badge.id);
          }
          if (req_obj.type === 'total_days' && streak && streak.totalDaysRead >= req_obj.value) {
            await storage.awardBibleBadge(userId, badge.id);
          }
        }
      }
      
      res.json(reading);
    } catch (error) {
      console.error("Error recording bible reading:", error);
      res.status(500).json({ message: "Failed to record bible reading" });
    }
  });

  app.get('/api/bible/readings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const readings = await storage.getUserBibleReadings(userId);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching bible readings:", error);
      res.status(500).json({ message: "Failed to fetch bible readings" });
    }
  });

  app.get('/api/bible/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBibleBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching bible badges:", error);
      res.status(500).json({ message: "Failed to fetch bible badges" });
    }
  });

  app.post('/api/bible/share', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shareData = insertBibleVerseShareSchema.parse({
        ...req.body,
        userId,
      });
      const share = await storage.shareBibleVerse(shareData);
      res.json(share);
    } catch (error) {
      console.error("Error sharing bible verse:", error);
      res.status(500).json({ message: "Failed to share bible verse" });
    }
  });

  app.get('/api/bible/shares/:dailyVerseId', async (req, res) => {
    try {
      const dailyVerseId = parseInt(req.params.dailyVerseId);
      const shares = await storage.getBibleVerseShares(dailyVerseId);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching bible verse shares:", error);
      res.status(500).json({ message: "Failed to fetch bible verse shares" });
    }
  });

  // Referral Rewards System Routes
  app.get('/api/referrals/code', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      let referralCode = user?.referralCode;
      if (!referralCode) {
        referralCode = await storage.generateReferralCode(userId);
      }
      
      res.json({ referralCode });
    } catch (error) {
      console.error("Error generating referral code:", error);
      res.status(500).json({ message: "Failed to generate referral code" });
    }
  });

  app.post('/api/referrals/validate', async (req, res) => {
    try {
      const { referralCode } = req.body;
      if (!referralCode) {
        return res.status(400).json({ message: "Referral code required" });
      }

      const referral = await storage.getReferralByCode(referralCode);
      const isValid = !!referral;
      
      res.json({ valid: isValid, referralCode });
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ message: "Failed to validate referral code" });
    }
  });

  app.post('/api/referrals/process', isAuthenticated, async (req: any, res) => {
    try {
      const refereeId = req.user.claims.sub;
      const { referralCode } = req.body;

      if (!referralCode) {
        return res.status(400).json({ message: "Referral code required" });
      }

      // Find the referrer by their referral code
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      // Check if user was already referred
      const existingReferral = await storage.getUserReferralAsReferee(refereeId);
      if (existingReferral) {
        return res.status(400).json({ message: "User already referred by someone else" });
      }

      // Create referral record
      const referral = await storage.createReferral({
        referrerId: referrer.id,
        refereeId,
        referralCode,
        status: 'completed'
      });

      // Process rewards immediately
      const rewards = await storage.processReferralReward(referral.id);
      
      res.json({
        success: true,
        referral,
        rewards,
        message: `Welcome! You earned ${rewards.refereePoints} points, and ${referrer.firstName || 'your friend'} earned ${rewards.referrerPoints} points!`
      });
    } catch (error) {
      console.error("Error processing referral:", error);
      res.status(500).json({ message: "Failed to process referral" });
    }
  });

  app.get('/api/referrals/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserReferralStats(userId);
      const milestones = await storage.checkReferralMilestones(userId);
      
      res.json({
        ...stats,
        recentMilestones: milestones
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  app.get('/api/referrals/my-referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getUserReferrals(userId);
      
      // Get referee details for each referral
      const referralsWithDetails = await Promise.all(
        referrals.map(async (referral) => {
          const referee = await storage.getUser(referral.refereeId);
          return {
            ...referral,
            referee: {
              firstName: referee?.firstName,
              profileImageUrl: referee?.profileImageUrl,
              joinedAt: referee?.createdAt
            }
          };
        })
      );
      
      res.json(referralsWithDetails);
    } catch (error) {
      console.error("Error fetching user referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.get('/api/referrals/reward-tiers', async (req, res) => {
    try {
      const tiers = await storage.getReferralRewardTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching reward tiers:", error);
      res.status(500).json({ message: "Failed to fetch reward tiers" });
    }
  });

  app.get('/api/referrals/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getReferralLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching referral leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch referral leaderboard" });
    }
  });

  app.get('/api/leaderboard/referrals', async (req, res) => {
    try {
      const leaderboard = await storage.getReferralLeaderboard();
      
      // Map to LeaderboardEntry format expected by frontend
      const mappedLeaderboard = leaderboard.map((entry, index) => ({
        id: index + 1,
        rank: index + 1,
        score: entry.totalReferrals,
        entityName: entry.firstName || 'Anonymous User',
        userId: entry.userId
      }));
      
      res.json(mappedLeaderboard);
    } catch (error) {
      console.error("Error fetching referral leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch referral leaderboard" });
    }
  });

  // Bible in a Day routes
  app.post('/api/bible-in-a-day/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = { ...req.body, userId };
      const session = await storage.createBibleInADaySession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating Bible in a Day session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get('/api/bible-in-a-day/sessions/active', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const session = await storage.getUserActiveBibleInADaySession(userId);
      res.json(session);
    } catch (error) {
      console.error("Error fetching active Bible in a Day session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  app.get('/api/bible-in-a-day/sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const session = await storage.getBibleInADaySession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching Bible in a Day session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  app.put('/api/bible-in-a-day/sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const session = await storage.updateBibleInADaySession(sessionId, req.body);
      res.json(session);
    } catch (error) {
      console.error("Error updating Bible in a Day session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.post('/api/bible-in-a-day/sessions/:sessionId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { finalRating, reflectionNotes } = req.body;
      const session = await storage.completeBibleInADaySession(sessionId, finalRating, reflectionNotes);
      
      // Award completion badge
      const userId = req.user.claims.sub;
      const badgeType = session.sessionType === 'fast_track' ? 'fast_track_finisher' : 'full_immersion_finisher';
      await storage.awardBibleInADayBadge(userId, sessionId, badgeType);
      
      res.json(session);
    } catch (error) {
      console.error("Error completing Bible in a Day session:", error);
      res.status(500).json({ message: "Failed to complete session" });
    }
  });

  app.get('/api/bible-in-a-day/sessions/:sessionId/progress', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const progress = await storage.getBibleInADaySectionProgress(sessionId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching section progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post('/api/bible-in-a-day/progress', isAuthenticated, async (req: any, res) => {
    try {
      const progress = await storage.createBibleInADaySectionProgress(req.body);
      res.json(progress);
    } catch (error) {
      console.error("Error creating section progress:", error);
      res.status(500).json({ message: "Failed to create progress" });
    }
  });

  app.put('/api/bible-in-a-day/progress/:progressId', isAuthenticated, async (req: any, res) => {
    try {
      const progressId = parseInt(req.params.progressId);
      const progress = await storage.updateBibleInADaySectionProgress(progressId, req.body);
      res.json(progress);
    } catch (error) {
      console.error("Error updating section progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.post('/api/bible-in-a-day/progress/:progressId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const progressId = parseInt(req.params.progressId);
      const { reflectionAnswer } = req.body;
      const progress = await storage.completeBibleInADaySection(progressId, reflectionAnswer);
      res.json(progress);
    } catch (error) {
      console.error("Error completing section:", error);
      res.status(500).json({ message: "Failed to complete section" });
    }
  });

  app.get('/api/bible-in-a-day/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBibleInADayBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching Bible in a Day badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Check-in system routes
  app.post("/api/checkins", async (req, res) => {
    try {
      // Demo response for check-in
      const pointsEarned = Math.floor(Math.random() * 20) + 10; // 10-30 points
      const streakCount = Math.floor(Math.random() * 15) + 1; // 1-15 days
      
      res.json({
        id: Date.now(),
        pointsEarned,
        streakCount,
        checkInType: req.body.checkInType || 'Daily Devotional',
        mood: req.body.mood,
        notes: req.body.notes,
        prayerIntent: req.body.prayerIntent,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating check-in:", error);
      res.status(500).json({ message: "Failed to create check-in" });
    }
  });

  app.get("/api/checkins/today", async (req, res) => {
    try {
      // For demo purposes, return null since we don't have authenticated user
      res.json(null);
    } catch (error) {
      console.error("Error fetching today's check-in:", error);
      res.status(500).json({ message: "Failed to fetch today's check-in" });
    }
  });

  app.get("/api/checkins/streak", async (req, res) => {
    try {
      // For demo purposes, return a sample streak
      res.json({ streak: 3 });
    } catch (error) {
      console.error("Error fetching check-in streak:", error);
      res.status(500).json({ message: "Failed to fetch check-in streak" });
    }
  });

  app.get("/api/checkins/recent", async (req, res) => {
    try {
      // For demo purposes, return empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching recent check-ins:", error);
      res.status(500).json({ message: "Failed to fetch recent check-ins" });
    }
  });

  // QR code routes
  app.post("/api/qr-codes", isAuthenticated, async (req: any, res) => {
    try {
      const createdBy = req.user.claims.sub;
      const qrCodeData = insertQrCodeSchema.parse({
        ...req.body,
        createdBy,
      });
      
      const qrCode = await storage.createQrCode(qrCodeData);
      res.json(qrCode);
    } catch (error) {
      console.error("Error creating QR code:", error);
      res.status(500).json({ message: "Failed to create QR code" });
    }
  });

  app.get("/api/qr-codes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const qrCode = await storage.getQrCode(id);
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found" });
      }
      res.json(qrCode);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      res.status(500).json({ message: "Failed to fetch QR code" });
    }
  });

  app.post("/api/qr-codes/:id/validate", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const validation = await storage.validateQrCode(id);
      res.json(validation);
    } catch (error) {
      console.error("Error validating QR code:", error);
      res.status(500).json({ message: "Failed to validate QR code" });
    }
  });

  app.get("/api/churches/:churchId/qr-codes", isAuthenticated, async (req: any, res) => {
    try {
      const { churchId } = req.params;
      const qrCodes = await storage.getChurchQrCodes(parseInt(churchId));
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching church QR codes:", error);
      res.status(500).json({ message: "Failed to fetch church QR codes" });
    }
  });

  app.get("/api/churches/:churchId/checkins", isAuthenticated, async (req: any, res) => {
    try {
      const { churchId } = req.params;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const checkIns = await storage.getChurchCheckIns(parseInt(churchId), date);
      res.json(checkIns);
    } catch (error) {
      console.error("Error fetching church check-ins:", error);
      res.status(500).json({ message: "Failed to fetch church check-ins" });
    }
  });

  app.get("/api/scripture-schedules", isAuthenticated, async (req: any, res) => {
    try {
      const churchId = req.query.churchId ? parseInt(req.query.churchId) : undefined;
      const schedules = await storage.getScriptureSchedules(churchId);
      res.json(schedules);
    } catch (error) {
      console.error("Error getting scripture schedules:", error);
      res.status(500).json({ message: "Failed to get scripture schedules" });
    }
  });

  app.post("/api/scripture-schedules", isAuthenticated, async (req: any, res) => {
    try {
      const createdBy = req.user?.claims?.sub;
      const schedule = await storage.createScriptureSchedule({
        createdBy,
        ...req.body
      });
      res.json(schedule);
    } catch (error) {
      console.error("Error creating scripture schedule:", error);
      res.status(500).json({ message: "Failed to create scripture schedule" });
    }
  });

  app.put("/api/scripture-schedules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.updateScriptureSchedule(id, req.body);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating scripture schedule:", error);
      res.status(500).json({ message: "Failed to update scripture schedule" });
    }
  });

  app.delete("/api/scripture-schedules/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteScriptureSchedule(id);
      res.json({ message: "Scripture schedule deleted" });
    } catch (error) {
      console.error("Error deleting scripture schedule:", error);
      res.status(500).json({ message: "Failed to delete scripture schedule" });
    }
  });

  app.get("/api/notifications/deliveries", isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = req.query.notificationId ? parseInt(req.query.notificationId) : undefined;
      const userId = req.query.userId || undefined;
      const deliveries = await storage.getNotificationDeliveries(notificationId, userId);
      res.json(deliveries);
    } catch (error) {
      console.error("Error getting notification deliveries:", error);
      res.status(500).json({ message: "Failed to get notification deliveries" });

  // Church Admin Dashboard API Routes

  // Member Analytics
  app.get("/api/admin/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Calculate comprehensive member analytics
      const totalMembers = await storage.getChurchMemberCount(userChurch.churchId);
      const activeMembers = await storage.getActiveChurchMembers(userChurch.churchId);
      const newMembersThisMonth = await storage.getNewMembersThisMonth(userChurch.churchId);
      const engagementMetrics = await storage.getMemberEngagementMetrics(userChurch.churchId);
      
      const analytics = {
        totalMembers,
        activeMembers,
        newMembersThisMonth,
        averageEngagement: engagementMetrics.averageEngagement || 0,
        attendanceRate: engagementMetrics.attendanceRate || 0,
        volunteerParticipation: engagementMetrics.volunteerParticipation || 0,
        donationParticipation: engagementMetrics.donationParticipation || 0,
        eventParticipation: engagementMetrics.eventParticipation || 0
      };

      res.json(analytics);
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Communication Campaigns
  app.get("/api/admin/campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const campaigns = await storage.getCommunicationCampaigns(userChurch.churchId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/admin/campaigns", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const campaignData = {
        ...req.body,
        churchId: userChurch.churchId,
        createdBy: userId
      };

      const campaign = await storage.createCommunicationCampaign(campaignData);
      res.json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  // Volunteer Role Management
  app.get("/api/admin/volunteer-roles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const roles = await storage.getEnhancedVolunteerRoles(userChurch.churchId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching volunteer roles:", error);
      res.status(500).json({ message: "Failed to fetch volunteer roles" });
    }
  });

  app.post("/api/admin/volunteer-roles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const roleData = {
        ...req.body,
        churchId: userChurch.churchId,
        createdBy: userId
      };

      const role = await storage.createEnhancedVolunteerRole(roleData);
      res.json(role);
    } catch (error) {
      console.error("Error creating volunteer role:", error);
      res.status(500).json({ message: "Failed to create volunteer role" });
    }
  });

  // Donation Management
  app.get("/api/admin/donations/summary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const summary = await storage.getDonationSummary(userChurch.churchId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching donation summary:", error);
      res.status(500).json({ message: "Failed to fetch donation summary" });
    }
  });

  app.get("/api/admin/donations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { page = 1, limit = 50, startDate, endDate, categoryId } = req.query;
      const donations = await storage.getDonations(userChurch.churchId, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        startDate: startDate as string,
        endDate: endDate as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined
      });
      
      res.json(donations);
    } catch (error) {
      console.error("Error fetching donations:", error);
      res.status(500).json({ message: "Failed to fetch donations" });
    }
  });

  app.get("/api/admin/donation-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categories = await storage.getDonationCategories(userChurch.churchId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching donation categories:", error);
      res.status(500).json({ message: "Failed to fetch donation categories" });
    }
  });

  app.post("/api/admin/donation-categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = {
        ...req.body,
        churchId: userChurch.churchId
      };

      const category = await storage.createDonationCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating donation category:", error);
      res.status(500).json({ message: "Failed to create donation category" });
    }
  });

  // Campus Management
  app.get("/api/admin/campuses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const campuses = await storage.getCampuses(userChurch.churchId);
      res.json(campuses);
    } catch (error) {
      console.error("Error fetching campuses:", error);
      res.status(500).json({ message: "Failed to fetch campuses" });
    }
  });

  app.post("/api/admin/campuses", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const campusData = {
        ...req.body,
        churchId: userChurch.churchId
      };

      const campus = await storage.createCampus(campusData);
      res.json(campus);
    } catch (error) {
      console.error("Error creating campus:", error);
      res.status(500).json({ message: "Failed to create campus" });
    }
  });

  // Member Engagement Metrics
  app.get("/api/admin/member-engagement", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { period = 'monthly', startDate, endDate } = req.query;
      const metrics = await storage.getMemberEngagementMetrics(userChurch.churchId, {
        period: period as string,
        startDate: startDate as string,
        endDate: endDate as string
      });
      
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching member engagement metrics:", error);
      res.status(500).json({ message: "Failed to fetch engagement metrics" });
    }
  });

  // Spiritual Growth Tracking
  app.get("/api/admin/spiritual-growth", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { category, startDate, endDate } = req.query;
      const tracking = await storage.getSpiritualGrowthTracking(userChurch.churchId, {
        category: category as string,
        startDate: startDate as string,
        endDate: endDate as string
      });
      
      res.json(tracking);
    } catch (error) {
      console.error("Error fetching spiritual growth tracking:", error);
      res.status(500).json({ message: "Failed to fetch spiritual growth tracking" });
    }
  });

  app.post("/api/admin/spiritual-growth", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch || !['admin', 'pastor', 'moderator'].includes(userChurch.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const trackingData = {
        ...req.body,
        churchId: userChurch.churchId,
        verifiedBy: userId
      };

      const tracking = await storage.createSpiritualGrowthTracking(trackingData);
      res.json(tracking);
    } catch (error) {
      console.error("Error creating spiritual growth tracking:", error);
      res.status(500).json({ message: "Failed to create spiritual growth tracking" });
    }
  });

  // Content Management System API Routes

  // Media Library Management
  app.get("/api/content/media", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0) {
        return res.status(403).json({ message: "Church membership required" });
      }

      const { type, category, search, page = 1, limit = 20 } = req.query;
      const mediaItems = await storage.getMediaLibrary(userChurch[0].churchId, {
        type: type as string,
        category: category as string,
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(mediaItems);
    } catch (error) {
      console.error("Error fetching media library:", error);
      res.status(500).json({ message: "Failed to fetch media library" });
    }
  });

  app.post("/api/content/media/upload", upload.single('file'), isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0) {
        return res.status(403).json({ message: "Church membership required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const { title, description, category, tags, isPublic } = req.body;
      
      // Determine file type based on MIME type
      const fileType = req.file.mimetype.startsWith('video/') ? 'video' :
                      req.file.mimetype.startsWith('audio/') ? 'audio' :
                      req.file.mimetype.startsWith('image/') ? 'image' : 'document';

      const mediaData = {
        title: title || req.file.originalname,
        description,
        type: fileType,
        url: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        category: category || 'general',
        tags: typeof tags === 'string' ? tags.split(',') : (tags || []),
        isPublic: isPublic === 'true',
        uploadedBy: userId,
        churchId: userChurch[0].churchId,
        status: 'processing' // Will be updated to 'ready' after processing
      };

      const mediaItem = await storage.createMediaItem(mediaData);
      
      // Simulate processing completion for demo
      setTimeout(async () => {
        await storage.updateMediaItemStatus(mediaItem.id, 'ready');
      }, 2000);

      res.json(mediaItem);
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  app.patch("/api/content/media/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const updatedMedia = await storage.updateMediaItem(parseInt(id), req.body);
      res.json(updatedMedia);
    } catch (error) {
      console.error("Error updating media:", error);
      res.status(500).json({ message: "Failed to update media" });
    }
  });

  app.delete("/api/content/media/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteMediaItem(parseInt(id));
      res.json({ message: "Media deleted successfully" });
    } catch (error) {
      console.error("Error deleting media:", error);
      res.status(500).json({ message: "Failed to delete media" });
    }
  });

  // Sermon Management
  app.get("/api/content/sermons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0) {
        return res.status(403).json({ message: "Church membership required" });
      }

      const { series, preacher, year, page = 1, limit = 20 } = req.query;
      const sermons = await storage.getSermons(userChurch[0].churchId, {
        seriesId: series ? parseInt(series as string) : undefined,
        preacher: preacher as string,
        year: year ? parseInt(year as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(sermons);
    } catch (error) {
      console.error("Error fetching sermons:", error);
      res.status(500).json({ message: "Failed to fetch sermons" });
    }
  });

  app.post("/api/content/sermons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator', 'content_creator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Content creation access required" });
      }

      const sermonData = {
        ...req.body,
        churchId: userChurch[0].churchId,
        createdBy: userId
      };

      const sermon = await storage.createSermon(sermonData);
      res.json(sermon);
    } catch (error) {
      console.error("Error creating sermon:", error);
      res.status(500).json({ message: "Failed to create sermon" });
    }
  });

  app.patch("/api/content/sermons/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator', 'content_creator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Content editing access required" });
      }

      const updatedSermon = await storage.updateSermon(parseInt(id), req.body);
      res.json(updatedSermon);
    } catch (error) {
      console.error("Error updating sermon:", error);
      res.status(500).json({ message: "Failed to update sermon" });
    }
  });

  // Devotional Management
  app.get("/api/content/devotionals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0) {
        return res.status(403).json({ message: "Church membership required" });
      }

      const { category, author, published, page = 1, limit = 20 } = req.query;
      const devotionals = await storage.getDevotionals(userChurch[0].churchId, {
        category: category as string,
        author: author as string,
        published: published === 'true',
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(devotionals);
    } catch (error) {
      console.error("Error fetching devotionals:", error);
      res.status(500).json({ message: "Failed to fetch devotionals" });
    }
  });

  app.post("/api/content/devotionals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator', 'content_creator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Content creation access required" });
      }

      const devotionalData = {
        ...req.body,
        churchId: userChurch[0].churchId,
        author: userId
      };

      const devotional = await storage.createDevotional(devotionalData);
      res.json(devotional);
    } catch (error) {
      console.error("Error creating devotional:", error);
      res.status(500).json({ message: "Failed to create devotional" });
    }
  });

  // Weekly Series Management
  app.get("/api/content/weekly-series", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0) {
        return res.status(403).json({ message: "Church membership required" });
      }

      const { status, year, page = 1, limit = 20 } = req.query;
      const series = await storage.getWeeklySeries(userChurch[0].churchId, {
        status: status as string,
        year: year ? parseInt(year as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(series);
    } catch (error) {
      console.error("Error fetching weekly series:", error);
      res.status(500).json({ message: "Failed to fetch weekly series" });
    }
  });

  app.post("/api/content/weekly-series", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Series creation access required" });
      }

      const seriesData = {
        ...req.body,
        churchId: userChurch[0].churchId,
        createdBy: userId
      };

      const series = await storage.createWeeklySeries(seriesData);
      res.json(series);
    } catch (error) {
      console.error("Error creating weekly series:", error);
      res.status(500).json({ message: "Failed to create weekly series" });
    }
  });

  // Content Moderation
  app.get("/api/content/moderation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Moderation access required" });
      }

      const { status, type, priority, page = 1, limit = 50 } = req.query;
      const moderationQueue = await storage.getModerationQueue(userChurch[0].churchId, {
        status: status as string,
        type: type as string,
        priority: priority as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      });
      
      res.json(moderationQueue);
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      res.status(500).json({ message: "Failed to fetch moderation queue" });
    }
  });

  app.patch("/api/content/moderation/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { action, notes } = req.body;
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Moderation access required" });
      }

      const moderationData = {
        status: action, // 'approve' or 'reject'
        moderatorNotes: notes,
        moderatedBy: userId,
        moderatedAt: new Date()
      };

      const updatedItem = await storage.updateModerationItem(parseInt(id), moderationData);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error moderating content:", error);
      res.status(500).json({ message: "Failed to moderate content" });
    }
  });

  // Media Analytics
  app.get("/api/content/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Analytics access required" });
      }

      const { period = 'monthly', type, startDate, endDate } = req.query;
      const analytics = await storage.getContentAnalytics(userChurch[0].churchId, {
        period: period as string,
        type: type as string,
        startDate: startDate as string,
        endDate: endDate as string
      });
      
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching content analytics:", error);
      res.status(500).json({ message: "Failed to fetch content analytics" });
    }
  });

  // Content Categories Management
  app.get("/api/content/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0) {
        return res.status(403).json({ message: "Church membership required" });
      }

      const { type } = req.query; // 'media', 'sermon', 'devotional'
      const categories = await storage.getContentCategories(userChurch[0].churchId, type as string);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching content categories:", error);
      res.status(500).json({ message: "Failed to fetch content categories" });
    }
  });

  app.post("/api/content/categories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userChurch = await storage.getUserChurches(userId);
      
      if (!userChurch || userChurch.length === 0 || !['admin', 'pastor', 'moderator'].includes(userChurch[0].role)) {
        return res.status(403).json({ message: "Category management access required" });
      }

      const categoryData = {
        ...req.body,
        churchId: userChurch[0].churchId,
        createdBy: userId
      };

      const category = await storage.createContentCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating content category:", error);
      res.status(500).json({ message: "Failed to create content category" });
    }
  });
    }
  });

  // Media Management API Routes
  app.post('/api/media/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.user.claims.sub;
      const file = req.file;
      
      // Create media file record
      const mediaFileData = {
        churchId: req.body.churchId ? parseInt(req.body.churchId) : null,
        uploadedBy: userId,
        fileName: file.filename,
        originalName: file.originalname,
        fileType: getFileType(file.mimetype),
        mimeType: file.mimetype,
        fileSize: file.size,
        filePath: file.path,
        publicUrl: `/uploads/${file.filename}`,
        category: req.body.category || 'general',
        title: req.body.title || file.originalname,
        description: req.body.description || null,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        isPublic: req.body.isPublic === 'true',
        isApproved: false,
        status: 'pending',
      };

      const mediaFile = await storage.createMediaFile(mediaFileData);
      res.json(mediaFile);
    } catch (error) {
      console.error('Error uploading media file:', error);
      res.status(500).json({ message: 'Failed to upload media file' });
    }
  });

  app.get('/api/media/files', isAuthenticated, async (req: any, res) => {
    try {
      const churchId = req.query.churchId ? parseInt(req.query.churchId) : undefined;
      const mediaFiles = await storage.getMediaFiles(churchId);
      res.json(mediaFiles);
    } catch (error) {
      console.error('Error fetching media files:', error);
      res.status(500).json({ message: 'Failed to fetch media files' });
    }
  });

  app.get('/api/media/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const mediaFile = await storage.getMediaFile(id);
      
      if (!mediaFile) {
        return res.status(404).json({ message: 'Media file not found' });
      }
      
      res.json(mediaFile);
    } catch (error) {
      console.error('Error fetching media file:', error);
      res.status(500).json({ message: 'Failed to fetch media file' });
    }
  });

  app.patch('/api/media/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const mediaFile = await storage.updateMediaFile(id, updates);
      res.json(mediaFile);
    } catch (error) {
      console.error('Error updating media file:', error);
      res.status(500).json({ message: 'Failed to update media file' });
    }
  });

  app.delete('/api/media/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get file info to delete physical file
      const mediaFile = await storage.getMediaFile(id);
      if (mediaFile && mediaFile.filePath) {
        try {
          fs.unlinkSync(mediaFile.filePath);
        } catch (fileError) {
          console.warn('Failed to delete physical file:', fileError);
        }
      }
      
      await storage.deleteMediaFile(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting media file:', error);
      res.status(500).json({ message: 'Failed to delete media file' });
    }
  });

  app.get('/api/media/collections', isAuthenticated, async (req: any, res) => {
    try {
      const churchId = req.query.churchId ? parseInt(req.query.churchId) : undefined;
      const collections = await storage.getMediaCollections(churchId);
      res.json(collections);
    } catch (error) {
      console.error('Error fetching media collections:', error);
      res.status(500).json({ message: 'Failed to fetch media collections' });
    }
  });

  app.post('/api/media/collections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const collectionData = {
        ...req.body,
        createdBy: userId,
      };
      
      const collection = await storage.createMediaCollection(collectionData);
      res.json(collection);
    } catch (error) {
      console.error('Error creating media collection:', error);
      res.status(500).json({ message: 'Failed to create media collection' });
    }
  });

  app.get('/api/media/collections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const collection = await storage.getMediaCollection(id);
      
      if (!collection) {
        return res.status(404).json({ message: 'Collection not found' });
      }
      
      res.json(collection);
    } catch (error) {
      console.error('Error fetching media collection:', error);
      res.status(500).json({ message: 'Failed to fetch media collection' });
    }
  });

  app.patch('/api/media/collections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const collection = await storage.updateMediaCollection(id, updates);
      res.json(collection);
    } catch (error) {
      console.error('Error updating media collection:', error);
      res.status(500).json({ message: 'Failed to update media collection' });
    }
  });

  app.delete('/api/media/collections/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMediaCollection(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting media collection:', error);
      res.status(500).json({ message: 'Failed to delete media collection' });
    }
  });

  app.post('/api/media/collections/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const { mediaFileId } = req.body;
      
      const item = await storage.addMediaToCollection(collectionId, mediaFileId);
      res.json(item);
    } catch (error) {
      console.error('Error adding media to collection:', error);
      res.status(500).json({ message: 'Failed to add media to collection' });
    }
  });

  app.delete('/api/media/collections/:id/items/:mediaFileId', isAuthenticated, async (req: any, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const mediaFileId = parseInt(req.params.mediaFileId);
      
      await storage.removeMediaFromCollection(collectionId, mediaFileId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing media from collection:', error);
      res.status(500).json({ message: 'Failed to remove media from collection' });
    }
  });

  app.get('/api/media/collections/:id/items', isAuthenticated, async (req: any, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const mediaFiles = await storage.getCollectionMedia(collectionId);
      res.json(mediaFiles);
    } catch (error) {
      console.error('Error fetching collection media:', error);
      res.status(500).json({ message: 'Failed to fetch collection media' });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time chat
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  // Store active connections
  const connections = new Map<string, any>();

  wss.on('connection', (ws, req) => {
    let userId: string | null = null;
    
    // Send connection acknowledgment
    ws.send(JSON.stringify({ type: 'connection_established' }));

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'auth':
            userId = data.userId;
            if (userId) {
              connections.set(userId, ws);
              ws.send(JSON.stringify({ type: 'auth_success', userId }));
            } else {
              ws.send(JSON.stringify({ type: 'auth_error', message: 'Invalid user ID' }));
            }
            break;
            
          case 'join_conversation':
            // Store conversation ID for this connection
            (ws as any).conversationId = data.conversationId;
            break;
            
          case 'send_message':
            if (userId && data.conversationId && data.content) {
              try {
                // Save message to database
                const message = await storage.sendMessage({
                  conversationId: data.conversationId,
                  senderId: userId,
                  content: data.content,
                  messageType: data.messageType || 'text',
                  replyToId: data.replyToId || null,
                });
                
                // Broadcast to sender immediately
                ws.send(JSON.stringify({
                  type: 'new_message',
                  message
                }));
                
                // Broadcast to other participants
                connections.forEach((connection, connUserId) => {
                  if (connUserId !== userId && connection.readyState === 1) {
                    connection.send(JSON.stringify({
                      type: 'new_message',
                      message
                    }));
                  }
                });
              } catch (msgError) {
                console.error('Error saving message:', msgError);
                ws.send(JSON.stringify({ type: 'error', message: 'Failed to send message' }));
              }
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (userId) {
        connections.delete(userId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket connection error:', error);
      if (userId) {
        connections.delete(userId);
      }
      // Send error response if connection is still open
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ 
          type: 'connection_error', 
          message: 'Connection error occurred' 
        }));
      }
    });
  });

  return httpServer;
}
