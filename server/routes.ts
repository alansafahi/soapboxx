import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";

function getFileType(mimetype: string): string {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype === 'application/pdf') return 'document';
  if (mimetype.includes('document') || mimetype.includes('text')) return 'document';
  return 'other';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Basic test route
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running' });
  });

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

  // Tour completion routes
  app.get('/api/tours/:userId/completion/:tourType', async (req, res) => {
    try {
      const { userId, tourType } = req.params;
      const completion = await storage.getTourCompletion(userId, tourType);
      res.json(completion);
    } catch (error) {
      console.error("Error fetching tour completion:", error);
      res.status(500).json({ message: "Failed to fetch tour completion" });
    }
  });

  app.post('/api/tours/:userId/completion', async (req, res) => {
    try {
      const { userId } = req.params;
      const { tourType, stepIndex, completed } = req.body;
      
      const completion = await storage.saveTourCompletion({
        userId,
        tourType,
        stepIndex,
        completed,
        completedAt: completed ? new Date() : null
      });
      
      res.json(completion);
    } catch (error) {
      console.error("Error saving tour completion:", error);
      res.status(500).json({ message: "Failed to save tour completion" });
    }
  });

  app.put('/api/tours/:userId/completion/:tourType', async (req, res) => {
    try {
      const { userId, tourType } = req.params;
      const { stepIndex, completed } = req.body;
      
      const completion = await storage.updateTourCompletion(userId, tourType, {
        stepIndex,
        completed,
        completedAt: completed ? new Date() : null
      });
      
      res.json(completion);
    } catch (error) {
      console.error("Error updating tour completion:", error);
      res.status(500).json({ message: "Failed to update tour completion" });
    }
  });

  // Tour status endpoint
  app.get('/api/tour/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has platform roles (SoapBox Owner, System Admin, Support Agent)
      const platformRoles = ['soapbox_owner', 'system_admin', 'support_agent'];
      
      // Get user's role from user-church relationship
      const userChurches = await storage.getUserChurches(userId);
      const userRole = userChurches && userChurches.length > 0 ? userChurches[0].role : 'member';
      const isPlatformRole = platformRoles.includes(userRole);
      
      // Check if user needs onboarding tour
      const tourCompletion = await storage.getTourCompletion(userId, userRole);
      const shouldShowTour = isPlatformRole && (!tourCompletion || !tourCompletion.completedAt);
      
      res.json({
        shouldShowTour,
        userRole,
        isNewUser: !user.createdAt || Date.now() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000,
        hasNewRoleAssignment: shouldShowTour
      });
    } catch (error) {
      console.error("Error checking tour status:", error);
      res.status(500).json({ message: "Failed to check tour status" });
    }
  });

  // Complete tour endpoint
  app.post('/api/tour/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { role } = req.body;
      
      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }

      await storage.saveTourCompletion({
        userId,
        tourType: role,
        stepIndex: -1, // -1 indicates full tour completion
        completed: true,
        completedAt: new Date()
      });
      
      res.json({ success: true, message: "Tour marked as completed" });
    } catch (error) {
      console.error("Error completing tour:", error);
      res.status(500).json({ message: "Failed to complete tour" });
    }
  });

  // Test SMS endpoint
  app.post('/api/test-sms', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number required" });
      }

      const { smsService } = await import('./smsService');
      const result = await smsService.sendPhoneVerification('test-user', phoneNumber);
      
      if (result.success) {
        res.json({ 
          success: true, 
          message: "SMS verification code sent successfully",
          verificationId: result.verificationId 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.message 
        });
      }
    } catch (error) {
      console.error("SMS test error:", error);
      res.status(500).json({ message: "SMS test failed" });
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