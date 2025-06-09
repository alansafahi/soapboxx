import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertChurchSchema,
  insertEventSchema,
  insertDiscussionSchema,
  insertPrayerRequestSchema,
  insertEventRsvpSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post('/api/prayers/:id/pray', isAuthenticated, async (req: any, res) => {
    try {
      const prayerRequestId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const response = await storage.prayForRequest({
        prayerRequestId,
        userId,
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

  const httpServer = createServer(app);
  return httpServer;
}
