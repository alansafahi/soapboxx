import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { AIPersonalizationService } from "./ai-personalization";
import multer from "multer";
import path from "path";

// Helper function to check for new role assignments
async function checkForNewRoleAssignment(userId: string, currentRole: string): Promise<boolean> {
  try {
    // For now, check if user is new (created within last 30 days) or if they haven't seen this role's tour
    const user = await storage.getUser(userId);
    const isNewUser = user && user.createdAt && Date.now() - new Date(user.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
    
    // Check if tour has been completed for this role
    const tourCompletion = await storage.getTourCompletion(userId, currentRole);
    const hasNotSeenTour = !tourCompletion || !tourCompletion.completedAt;
    
    return Boolean(isNewUser || hasNotSeenTour);
  } catch (error) {
    console.error("Error checking role assignments:", error);
    return true; // Default to showing tour if check fails
  }
}

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

  // Initialize AI personalization service
  const aiPersonalizationService = new AIPersonalizationService();

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
      const memberRoles = ['member', 'new_member', 'volunteer', 'small_group_leader'];
      
      // Get user's role from user-church relationship
      const userChurches = await storage.getUserChurches(userId);
      
      // Determine user role based on various factors
      let userRole = 'member'; // Default role
      
      // Check for platform roles first (for admin users)
      if (user.email && user.email.includes('admin')) {
        userRole = 'system_admin';
      } else if (user.email && user.email.includes('owner')) {
        userRole = 'soapbox_owner';
      } else if (user.email && user.email.includes('support')) {
        userRole = 'support_agent';
      } else {
        // For church members, determine role based on profile or church relationships
        if (userChurches && userChurches.length > 0) {
          // Use church role if available
          const churchRole = userChurches[0].roleId;
          // Map church role IDs to tour role names (simplified for demo)
          if (churchRole === 2) userRole = 'volunteer';
          else if (churchRole === 3) userRole = 'small_group_leader';
          else userRole = 'member';
        } else {
          // For new users, check if they just completed onboarding
          const isRecentUser = user.createdAt && Date.now() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
          userRole = isRecentUser ? 'new_member' : 'member';
        }
      }
      
      const isPlatformRole = platformRoles.includes(userRole);
      const isMemberRole = memberRoles.includes(userRole);
      
      // Check if user needs tour (only show after onboarding is complete)
      const hasCompletedOnboarding = user.hasCompletedOnboarding;
      const tourCompletion = await storage.getTourCompletion(userId, userRole);
      const hasCompletedTour = tourCompletion && tourCompletion.completedAt;
      
      // Check for new role assignment by looking at role assignment history
      const hasNewRoleAssignment = await checkForNewRoleAssignment(userId, userRole);
      
      // Show tour only if:
      // 1. User has completed onboarding
      // 2. Haven't completed tour for this role
      // 3. Has a valid role
      // 4. Either has new role assignment OR is a basic member (always eligible)
      const shouldShowTour = hasCompletedOnboarding && 
                            !hasCompletedTour && 
                            (isPlatformRole || isMemberRole) &&
                            (hasNewRoleAssignment || userRole === 'member' || userRole === 'new_member');
      
      res.json({
        shouldShowTour,
        userRole,
        isNewUser: !user.createdAt || Date.now() - new Date(user.createdAt).getTime() < 24 * 60 * 60 * 1000,
        hasNewRoleAssignment
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

  // Mood check-in API endpoints
  app.post('/api/mood-checkins', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { mood, moodScore, moodEmoji, notes, shareWithStaff, generatePersonalizedContent } = req.body;

      // Create mood check-in record
      const moodCheckin = await storage.createMoodCheckin({
        userId,
        mood,
        moodScore,
        moodEmoji,
        notes
      });

      // Generate personalized content if requested
      let personalizedContent = null;
      if (generatePersonalizedContent) {
        try {
          personalizedContent = await aiPersonalizationService.generateMoodBasedContent(
            userId,
            mood,
            moodScore,
            notes
          );
          
          // Store personalized content for future reference
          if (personalizedContent) {
            await storage.savePersonalizedContent({
              userId,
              checkInId: moodCheckin.id,
              contentType: 'mood_based',
              title: 'AI-Generated Spiritual Guidance',
              content: JSON.stringify(personalizedContent)
            });
          }
        } catch (aiError) {
          console.error('Error generating personalized content:', aiError);
          // Continue without personalized content rather than failing the whole request
        }
      }

      res.json({
        moodCheckin,
        personalizedContent
      });
    } catch (error) {
      console.error('Error creating mood check-in:', error);
      res.status(500).json({ message: 'Failed to create mood check-in' });
    }
  });

  app.get('/api/mood-checkins/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const recentCheckins = await storage.getRecentMoodCheckins(userId, limit);
      res.json(recentCheckins);
    } catch (error) {
      console.error('Error fetching recent mood check-ins:', error);
      res.status(500).json({ message: 'Failed to fetch mood check-ins' });
    }
  });

  app.get('/api/mood-checkins/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 30;
      
      const insights = await storage.getMoodInsights(userId, days);
      res.json(insights);
    } catch (error) {
      console.error('Error fetching mood insights:', error);
      res.status(500).json({ message: 'Failed to fetch mood insights' });
    }
  });

  app.get('/api/personalized-content/:contentId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { contentId } = req.params;
      
      const content = await storage.getPersonalizedContent(contentId);
      
      // Verify content belongs to requesting user
      if (content && content.userId === userId) {
        res.json(content);
      } else {
        res.status(404).json({ message: 'Content not found' });
      }
    } catch (error) {
      console.error('Error fetching personalized content:', error);
      res.status(500).json({ message: 'Failed to fetch personalized content' });
    }
  });

  // Bible API endpoints
  app.get('/api/bible/daily-verse', isAuthenticated, async (req: any, res) => {
    try {
      const { journeyType } = req.query;
      const userId = req.user.claims.sub;
      
      // Simple daily verse data for now
      const verse = {
        id: 1,
        date: new Date(),
        verseReference: "Philippians 4:13",
        verseText: "I can do all this through him who gives me strength.",
        verseTextNiv: "I can do all this through him who gives me strength.",
        verseTextKjv: "I can do all things through Christ which strengtheneth me.",
        verseTextEsv: "I can do all things through him who strengthens me.",
        verseTextNlt: "For I can do everything through Christ, who gives me strength.",
        theme: "Strength and Perseverance",
        reflectionPrompt: "How can God's strength help you face today's challenges?",
        guidedPrayer: "Lord, help me to rely on Your strength in all circumstances. Amen.",
        backgroundImageUrl: null,
        audioUrl: null
      };
      
      res.json(verse);
    } catch (error) {
      console.error("Error fetching daily verse:", error);
      res.status(500).json({ message: "Failed to fetch daily verse" });
    }
  });

  app.get('/api/bible/streak', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const streak = {
        id: 1,
        userId,
        currentStreak: 3,
        longestStreak: 7,
        lastReadDate: new Date(),
        totalDaysRead: 15,
        versesMemorized: 5,
        graceDaysUsed: 1
      };
      
      res.json(streak);
    } catch (error) {
      console.error("Error fetching bible streak:", error);
      res.status(500).json({ message: "Failed to fetch bible streak" });
    }
  });

  app.get('/api/bible/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const badges = [
        {
          id: 1,
          name: "First Steps",
          description: "Completed your first Bible reading",
          iconUrl: null,
          earnedAt: new Date(),
          badge: {
            id: 1,
            name: "First Steps",
            description: "Completed your first Bible reading",
            iconUrl: null,
            requirement: { type: "readings", count: 1 }
          }
        }
      ];
      
      res.json(badges);
    } catch (error) {
      console.error("Error fetching bible badges:", error);
      res.status(500).json({ message: "Failed to fetch bible badges" });
    }
  });

  app.get('/api/bible/community-stats', async (req, res) => {
    try {
      const stats = {
        todayReads: 127,
        weekReads: 892
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Failed to fetch community stats" });
    }
  });

  app.post('/api/bible/reading', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { dailyVerseId, reflectionText, emotionalReaction, audioListened } = req.body;
      
      // Record the reading (simplified for now)
      const reading = {
        id: Date.now(),
        userId,
        dailyVerseId,
        reflectionText,
        emotionalReaction,
        audioListened,
        createdAt: new Date()
      };
      
      res.json(reading);
    } catch (error) {
      console.error("Error recording bible reading:", error);
      res.status(500).json({ message: "Failed to record bible reading" });
    }
  });

  // Admin/Pastor Analytics Endpoints
  app.get('/api/admin/member-checkins', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { period = '30', churchId } = req.query;
      
      // Check if user has admin/pastor permissions
      const userRole = await storage.getUserRole(userId);
      if (!['admin', 'pastor', 'lead_pastor', 'church_admin'].includes(userRole)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Get check-in data for all church members
      const checkinData = await storage.getChurchMemberCheckIns(churchId || 1, startDate);
      
      res.json({
        period: `${period} days`,
        totalMembers: checkinData.totalMembers,
        activeMembers: checkinData.activeMembers,
        averageCheckins: checkinData.averageCheckins,
        memberDetails: checkinData.members
      });
    } catch (error) {
      console.error("Error fetching member check-ins:", error);
      res.status(500).json({ message: "Failed to fetch member check-ins" });
    }
  });

  app.get('/api/admin/devotion-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { period = '30', churchId } = req.query;
      
      // Check if user has admin/pastor permissions
      const userRole = await storage.getUserRole(userId);
      if (!['admin', 'pastor', 'lead_pastor', 'church_admin'].includes(userRole)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period));

      // Get devotion reading analytics
      const devotionStats = await storage.getDevotionAnalytics(churchId || 1, startDate);
      
      res.json({
        period: `${period} days`,
        totalReadings: devotionStats.totalReadings,
        uniqueReaders: devotionStats.uniqueReaders,
        averageEngagement: devotionStats.averageEngagement,
        mostPopularVerses: devotionStats.mostPopularVerses,
        memberReadingStats: devotionStats.memberStats
      });
    } catch (error) {
      console.error("Error fetching devotion analytics:", error);
      res.status(500).json({ message: "Failed to fetch devotion analytics" });
    }
  });

  app.get('/api/admin/at-risk-members', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { churchId, threshold = '14' } = req.query;
      
      // Check if user has admin/pastor permissions
      const userRole = await storage.getUserRole(userId);
      if (!['admin', 'pastor', 'lead_pastor', 'church_admin'].includes(userRole)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Find members who haven't engaged in specified days
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - parseInt(threshold));

      const atRiskMembers = await storage.getAtRiskMembers(churchId || 1, thresholdDate);
      
      res.json({
        threshold: `${threshold} days`,
        atRiskCount: atRiskMembers.length,
        members: atRiskMembers.map(member => ({
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          lastCheckIn: member.lastCheckIn,
          lastBibleReading: member.lastBibleReading,
          lastEventAttendance: member.lastEventAttendance,
          daysSinceLastActivity: member.daysSinceLastActivity,
          riskLevel: member.daysSinceLastActivity > 30 ? 'high' : member.daysSinceLastActivity > 14 ? 'medium' : 'low'
        }))
      });
    } catch (error) {
      console.error("Error fetching at-risk members:", error);
      res.status(500).json({ message: "Failed to fetch at-risk members" });
    }
  });

  app.get('/api/admin/engagement-overview', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { churchId } = req.query;
      
      // Check if user has admin/pastor permissions
      const userRole = await storage.getUserRole(userId);
      if (!['admin', 'pastor', 'lead_pastor', 'church_admin'].includes(userRole)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get comprehensive engagement overview
      const engagement = await storage.getEngagementOverview(churchId || 1);
      
      res.json({
        checkIns: {
          thisWeek: engagement.checkInsThisWeek,
          lastWeek: engagement.checkInsLastWeek,
          trend: engagement.checkInTrend
        },
        bibleReading: {
          thisWeek: engagement.bibleReadingsThisWeek,
          lastWeek: engagement.bibleReadingsLastWeek,
          trend: engagement.bibleReadingTrend
        },
        events: {
          thisWeek: engagement.eventAttendanceThisWeek,
          lastWeek: engagement.eventAttendanceLastWeek,
          trend: engagement.eventTrend
        },
        prayers: {
          thisWeek: engagement.prayersThisWeek,
          lastWeek: engagement.prayersLastWeek,
          trend: engagement.prayerTrend
        }
      });
    } catch (error) {
      console.error("Error fetching engagement overview:", error);
      res.status(500).json({ message: "Failed to fetch engagement overview" });
    }
  });

  // Enhanced spiritual health analytics endpoints
  app.get('/api/admin/analytics/prayer-engagement', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userRole = await storage.getUserRole(userId);
      if (!userRole || !['admin', 'pastor', 'super_admin'].includes(userRole.role)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const churchId = userRole.churchId;
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days

      const prayerAnalytics = await storage.getPrayerAnalytics(churchId, startDate);

      res.json({
        ...prayerAnalytics,
        timeframe: 'Last 7 days'
      });
    } catch (error) {
      console.error("Error fetching prayer engagement analytics:", error);
      res.status(500).json({ message: "Failed to fetch prayer engagement data" });
    }
  });

  // Devotional completion tracking endpoint
  app.get('/api/admin/analytics/devotional-completions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userRole = await storage.getUserRole(userId);
      if (!userRole || !['admin', 'pastor', 'super_admin'].includes(userRole.role)) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }

      const { devotional } = req.query;
      const devotionalName = typeof devotional === 'string' ? devotional : 'Lent';
      const churchId = userRole.churchId;

      const completions = await storage.getDevotionalCompletions(churchId, devotionalName);

      res.json({
        devotionalName,
        completions,
        totalCompletions: completions.length,
        message: `${completions.length} members completed the ${devotionalName} devotional`
      });
    } catch (error) {
      console.error("Error fetching devotional completions:", error);
      res.status(500).json({ message: "Failed to fetch devotional completion data" });
    }
  });

  return httpServer;
}