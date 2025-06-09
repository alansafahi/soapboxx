import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { db } from "./db";
import { userInspirationHistory, prayerResponses, conversationParticipants } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import { 
  insertChurchSchema,
  insertEventSchema,
  insertDiscussionSchema,
  insertPrayerRequestSchema,
  insertEventRsvpSchema,
  insertDevotionalSchema,
  insertWeeklySeriesSchema,
  insertSermonMediaSchema,
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
    fileFilter: (req, file, cb) => {
      // Only allow image files
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  app.use('/uploads', express.static(uploadsDir));

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

  app.get('/api/events/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
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
      const eventData = insertEventSchema.parse(req.body);
      eventData.organizerId = req.user.claims.sub;
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
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
      res.status(500).json({ message: "Failed to RSVP to event" });
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
      res.json(userScore || { 
        totalPoints: 0, 
        weeklyPoints: 0, 
        monthlyPoints: 0, 
        currentStreak: 0, 
        faithfulnessScore: 0,
        prayerChampionPoints: 0,
        serviceHours: 0,
        isAnonymous: false
      });
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

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'auth':
            userId = data.userId;
            if (userId) {
              connections.set(userId, ws);
              ws.send(JSON.stringify({ type: 'auth_success' }));
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
    });
  });

  return httpServer;
}
