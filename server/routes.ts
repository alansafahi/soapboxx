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
      const { journeyType, devotionalPack } = req.query;
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
        audioUrl: null,
        devotionalPack: devotionalPack || null
      };
      
      res.json(verse);
    } catch (error) {
      console.error("Error fetching daily verse:", error);
      res.status(500).json({ message: "Failed to fetch daily verse" });
    }
  });

  // AI-powered reflection prompts
  app.post('/api/bible/ai-reflection', isAuthenticated, async (req: any, res) => {
    try {
      const { verseText, verseReference, userContext, emotionalState } = req.body;
      const userId = req.user.claims.sub;

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "AI service not configured" });
      }

      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `As a thoughtful spiritual guide, create personalized reflection questions for this Bible verse:

Verse: ${verseReference} - "${verseText}"
User Context: ${userContext || 'General spiritual growth'}
Current Mood: ${emotionalState || 'seeking guidance'}

Please provide:
1. Three deep reflection questions that help the user connect this verse to their life
2. A practical application suggestion
3. A brief prayer based on the verse

Respond in JSON format with these keys: reflectionQuestions (array), practicalApplication (string), prayer (string)`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 600
      });

      const aiReflection = JSON.parse(response.choices[0].message.content);
      
      res.json({
        reflectionQuestions: aiReflection.reflectionQuestions || [],
        practicalApplication: aiReflection.practicalApplication || "",
        prayer: aiReflection.prayer || "",
        generatedAt: new Date()
      });
    } catch (error) {
      console.error("Error generating AI reflection:", error);
      res.status(500).json({ message: "Failed to generate reflection" });
    }
  });

  // Thematic devotional packs
  app.get('/api/bible/devotional-packs', async (req, res) => {
    try {
      const devotionalPacks = [
        {
          id: "peace-30",
          title: "30 Days of Peace",
          description: "Find God's peace in daily life through Scripture",
          duration: 30,
          verses: 30,
          category: "Spiritual Growth",
          difficulty: "Beginner",
          tags: ["peace", "anxiety", "comfort", "rest"],
          imageUrl: null,
          isPopular: true
        },
        {
          id: "entrepreneurs",
          title: "Verses for Entrepreneurs",
          description: "Biblical wisdom for business leaders and innovators",
          duration: 21,
          verses: 21,
          category: "Career & Purpose",
          difficulty: "Intermediate", 
          tags: ["business", "leadership", "stewardship", "purpose"],
          imageUrl: null,
          isPopular: false
        },
        {
          id: "grief-healing",
          title: "Verses for Grief",
          description: "Comfort and hope during times of loss and sorrow",
          duration: 14,
          verses: 14,
          category: "Healing & Comfort",
          difficulty: "Beginner",
          tags: ["grief", "loss", "comfort", "healing", "hope"],
          imageUrl: null,
          isPopular: true
        },
        {
          id: "marriage-love",
          title: "Love & Marriage",
          description: "Biblical foundations for relationships and marriage",
          duration: 28,
          verses: 28,
          category: "Relationships",
          difficulty: "Intermediate",
          tags: ["marriage", "love", "relationships", "commitment"],
          imageUrl: null,
          isPopular: false
        },
        {
          id: "financial-wisdom",
          title: "Financial Wisdom",
          description: "God's perspective on money, generosity, and stewardship",
          duration: 21,
          verses: 21,
          category: "Stewardship",
          difficulty: "Intermediate",
          tags: ["money", "stewardship", "generosity", "wisdom"],
          imageUrl: null,
          isPopular: true
        },
        {
          id: "new-beginnings",
          title: "New Beginnings",
          description: "Fresh starts and God's plans for your future",
          duration: 21,
          verses: 21,
          category: "Life Changes",
          difficulty: "Beginner",
          tags: ["new start", "change", "future", "hope", "plans"],
          imageUrl: null,
          isPopular: false
        }
      ];
      
      res.json(devotionalPacks);
    } catch (error) {
      console.error("Error fetching devotional packs:", error);
      res.status(500).json({ message: "Failed to fetch devotional packs" });
    }
  });

  // Get specific devotional pack content
  app.get('/api/bible/devotional-packs/:packId', isAuthenticated, async (req: any, res) => {
    try {
      const { packId } = req.params;
      const { day } = req.query;
      const userId = req.user.claims.sub;
      
      // Sample content for demonstration
      const packContent = {
        "peace-30": {
          title: "30 Days of Peace",
          currentDay: parseInt(day) || 1,
          verse: {
            reference: "Philippians 4:6-7",
            text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.",
            theme: "Peace through Prayer",
            dayTitle: `Day ${day || 1}: Finding Peace in Prayer`
          },
          reflection: {
            question: "What worries are you carrying today that you can surrender to God in prayer?",
            application: "Practice the pattern: instead of worrying, pray with thanksgiving.",
            prayer: "Lord, I bring my anxieties to you. Thank you for your promise of peace that surpasses understanding."
          }
        },
        "entrepreneurs": {
          title: "Verses for Entrepreneurs", 
          currentDay: parseInt(day) || 1,
          verse: {
            reference: "Proverbs 16:3",
            text: "Commit to the Lord whatever you do, and he will establish your plans.",
            theme: "Divine Partnership in Business",
            dayTitle: `Day ${day || 1}: Partnering with God in Business`
          },
          reflection: {
            question: "How can you more intentionally invite God into your business decisions?",
            application: "Before making major business decisions, spend time in prayer seeking God's wisdom.",
            prayer: "Lord, I commit my work and plans to you. Guide my decisions and establish my steps."
          }
        },
        "grief-healing": {
          title: "Verses for Grief",
          currentDay: parseInt(day) || 1,
          verse: {
            reference: "Psalm 34:18",
            text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
            theme: "God's Presence in Pain",
            dayTitle: `Day ${day || 1}: God's Nearness in Sorrow`
          },
          reflection: {
            question: "How have you experienced God's closeness during difficult times?",
            application: "Allow yourself to feel God's presence even in your pain.",
            prayer: "Lord, thank you for being close to me in this difficult time. Help me feel your comforting presence."
          }
        }
      };

      const content = packContent[packId];
      if (!content) {
        return res.status(404).json({ message: "Devotional pack not found" });
      }

      res.json(content);
    } catch (error) {
      console.error("Error fetching devotional pack content:", error);
      res.status(500).json({ message: "Failed to fetch devotional content" });
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

  // AI-powered Bible reflection endpoint with content safety
  app.post('/api/bible/ai-reflection', isAuthenticated, async (req: any, res) => {
    try {
      const { verseText, verseReference, userContext, emotionalState } = req.body;
      const userId = req.user.claims.sub;

      if (!verseText || !verseReference) {
        return res.status(400).json({ message: "Verse text and reference are required" });
      }

      // Import content safety service
      const { contentSafety } = await import('./contentSafety');

      // Validate verse reference format
      const refValidation = contentSafety.validateVerseReference(verseReference);
      if (!refValidation.isAllowed) {
        return res.status(400).json({ message: refValidation.reason });
      }

      // Validate verse text content
      const textValidation = contentSafety.validateTextContent(verseText);
      if (!textValidation.isAllowed) {
        return res.status(400).json({ message: refValidation.reason });
      }

      // Validate reflection context
      if (userContext) {
        const contextValidation = contentSafety.validateReflectionContent(userContext);
        if (!contextValidation.isAllowed) {
          return res.status(400).json({ message: contextValidation.reason });
        }
      }

      // Generate AI-powered reflection using OpenAI
      const openai = new (await import('openai')).default({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create safe AI prompt with guardrails
      const safePrompt = contentSafety.createSafeAIPrompt(`
        Generate a personalized spiritual reflection for this Bible verse:
        
        Verse: "${verseText}" - ${verseReference}
        User Context: ${userContext || "General spiritual growth"}
        Current Emotional State: ${emotionalState || "seeking guidance"}
        
        Please provide:
        1. 3-4 thoughtful reflection questions that help the user personally engage with this verse
        2. A practical application suggestion for daily life
        3. A personalized prayer related to this verse and the user's context
        
        Respond in JSON format with keys: reflectionQuestions (array), practicalApplication (string), prayer (string)
      `, 'reflection');

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "user",
            content: safePrompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800,
        temperature: 0.7
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) {
        throw new Error("Empty response from AI service");
      }

      let reflectionData;
      try {
        reflectionData = JSON.parse(responseContent);
      } catch (parseError) {
        console.error("Failed to parse AI response:", responseContent);
        throw new Error("Invalid JSON response from AI service");
      }

      // Ensure required fields exist with fallbacks
      const safeReflectionData = {
        reflectionQuestions: reflectionData.reflectionQuestions || [
          "How does this verse speak to your current situation?",
          "What does God's strength mean to you personally?",
          "How can you apply this verse in your daily life?"
        ],
        practicalApplication: reflectionData.practicalApplication || "Take time today to reflect on God's strength in your life and trust Him with your challenges.",
        prayer: reflectionData.prayer || "Lord, help me to remember that I can do all things through Christ who strengthens me. Give me faith to trust in Your power when I feel weak. Amen.",
        generatedAt: new Date()
      };
      
      // Log the reflection generation for analytics
      console.log(`AI reflection generated for user ${userId}, verse: ${verseReference}`);
      
      res.json(safeReflectionData);
    } catch (error) {
      console.error("Error generating AI reflection:", error);
      res.status(500).json({ message: "Failed to generate AI reflection. Please try again." });
    }
  });

  // Verse lookup endpoint for auto-population
  app.post('/api/bible/lookup-verse', isAuthenticated, async (req: any, res) => {
    try {
      const { reference } = req.body;
      const userId = req.user.claims.sub;

      if (!reference) {
        return res.status(400).json({ message: "Verse reference is required" });
      }

      // Import content safety service
      const { contentSafety } = await import('./contentSafety');

      // Validate verse reference format
      const refValidation = contentSafety.validateVerseReference(reference);
      if (!refValidation.isAllowed) {
        return res.status(400).json({ message: refValidation.reason });
      }

      // Parse the verse reference to extract book, chapter, and verse
      const parseReference = (ref: string) => {
        // Handle references like "John 3:16", "1 John 3:16", "Psalm 23:1"
        const cleanRef = ref.trim();
        const match = cleanRef.match(/^((?:1st?|2nd?|3rd?|I{1,3}|1|2|3)?\s*[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/);
        
        if (!match) {
          throw new Error("Invalid verse reference format");
        }

        const [, book, chapter, startVerse, endVerse] = match;
        return {
          book: book.trim(),
          chapter: parseInt(chapter),
          startVerse: parseInt(startVerse),
          endVerse: endVerse ? parseInt(endVerse) : parseInt(startVerse)
        };
      };

      const parsedRef = parseReference(reference);

      // Look up verse in database
      const verse = await storage.lookupBibleVerse(reference);
      
      if (!verse) {
        return res.status(404).json({ 
          message: `Verse not found: ${reference}. Please enter the verse text manually.` 
        });
      }

      // Log the verse lookup for analytics
      console.log(`Verse lookup for user ${userId}: ${reference}`);
      
      res.json({
        reference: verse.reference,
        text: verse.text,
        book: parsedRef.book,
        chapter: parsedRef.chapter,
        verse: parsedRef.startVerse
      });
    } catch (error) {
      console.error("Error looking up verse:", error);
      res.status(500).json({ message: "Failed to lookup verse. Please enter the verse text manually." });
    }
  });

  // Bible verses by topic search endpoint
  app.post('/api/bible/search-by-topic', isAuthenticated, async (req: any, res) => {
    try {
      const { topics } = req.body;
      const userId = req.user.claims.sub;

      if (!topics || !Array.isArray(topics) || topics.length === 0) {
        return res.status(400).json({ message: "Topics array is required" });
      }

      const verses = await storage.searchBibleVersesByTopic(topics);
      
      console.log(`Topic search for user ${userId}: ${topics.join(', ')}`);
      
      res.json({
        topics,
        verses,
        count: verses.length
      });
    } catch (error) {
      console.error("Error searching verses by topic:", error);
      res.status(500).json({ message: "Failed to search verses by topic" });
    }
  });

  // Random verse endpoint for inspiration
  app.get('/api/bible/random-verse', isAuthenticated, async (req: any, res) => {
    try {
      const { category } = req.query;
      const userId = req.user.claims.sub;

      const verse = await storage.getRandomVerseByCategory(category as string);
      
      if (!verse) {
        return res.status(404).json({ message: "No verses found" });
      }

      console.log(`Random verse for user ${userId}: ${verse.reference}`);
      
      res.json(verse);
    } catch (error) {
      console.error("Error getting random verse:", error);
      res.status(500).json({ message: "Failed to get random verse" });
    }
  });

  // Verse Art Generation endpoint with comprehensive safety checks
  app.post('/api/bible/generate-verse-art', isAuthenticated, async (req: any, res) => {
    try {
      const { verseText, verseReference, backgroundTheme, fontStyle, colorScheme } = req.body;
      const userId = req.user.claims.sub;

      if (!verseText || !verseReference || !backgroundTheme) {
        return res.status(400).json({ message: "Verse text, reference, and background theme are required" });
      }

      // Import content safety service
      const { contentSafety } = await import('./contentSafety');

      // Comprehensive validation for verse art
      const artValidation = contentSafety.validateVerseArtRequest(verseText, verseReference, backgroundTheme);
      if (!artValidation.isAllowed) {
        return res.status(400).json({ 
          error: "Content validation failed",
          message: artValidation.reason || "Content contains inappropriate material for verse art generation" 
        });
      }

      // Generate AI artwork using DALL-E
      const openai = new (await import('openai')).default({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Create safe prompt for image generation
      const imagePrompt = contentSafety.createSafeAIPrompt(`
        Create beautiful, faith-inspired artwork for a Bible verse with these specifications:
        - Background: ${backgroundTheme} theme
        - Style: ${fontStyle} typography
        - Color scheme: ${colorScheme}
        - Text overlay: "${verseText}" - ${verseReference}
        
        The image should be inspirational, family-friendly, and suitable for Christian social media sharing.
        Include elegant typography that's easy to read over the background.
        Make it Instagram-ready with good contrast and beautiful composition.
      `, 'verse-art');

      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      if (!imageResponse.data || imageResponse.data.length === 0) {
        throw new Error("Failed to generate image - no data returned from DALL-E");
      }
      
      const imageUrl = imageResponse.data[0].url;
      
      const artData = {
        imageUrl,
        verseReference,
        verseText,
        backgroundTheme,
        fontStyle,
        colorScheme
      };

      // Log the art generation for analytics
      console.log(`Verse art generated for user ${userId}, verse: ${verseReference}, theme: ${backgroundTheme}`);
      
      res.json(artData);
    } catch (error) {
      console.error("Error generating verse art:", error);
      res.status(500).json({ message: "Failed to generate verse art" });
    }
  });

  // Download verse art endpoint (proxy to handle CORS)
  app.post('/api/bible/download-verse-art', isAuthenticated, async (req: any, res) => {
    try {
      const { imageUrl } = req.body;
      
      if (!imageUrl) {
        return res.status(400).json({ message: "Image URL is required" });
      }

      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const buffer = await response.buffer();
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'attachment; filename="verse-art.png"');
      res.send(buffer);
    } catch (error) {
      console.error("Error downloading verse art:", error);
      res.status(500).json({ message: "Failed to download verse art" });
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

  // Audio generation and routine endpoints
  app.get('/api/audio/generate', async (req, res) => {
    try {
      const { text, voice = 'warm-female', musicBed = 'gentle-piano', speed = '1.0' } = req.query;
      
      if (!text) {
        return res.status(400).json({ error: 'Text parameter is required' });
      }

      // Generate audio URL based on parameters
      const audioId = Buffer.from(`${text}-${voice}-${musicBed}-${speed}`).toString('base64url');
      const audioUrl = `/api/audio/stream/${audioId}`;
      
      res.json({
        audioUrl,
        duration: Math.ceil((text as string).length / 10), // Estimate duration
        voice,
        musicBed,
        speed: parseFloat(speed as string)
      });
    } catch (error) {
      console.error('Audio generation error:', error);
      res.status(500).json({ error: 'Failed to generate audio' });
    }
  });

  app.get('/api/audio/stream/:audioId', async (req, res) => {
    try {
      const { audioId } = req.params;
      
      // Decode audio parameters
      const decodedParams = Buffer.from(audioId, 'base64url').toString();
      const [text, voice, musicBed, speed] = decodedParams.split('-');
      
      // For demo purposes, return a placeholder audio stream
      // In production, this would integrate with text-to-speech and audio mixing services
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', '1024');
      
      // Generate a simple audio response for demo
      const audioBuffer = Buffer.alloc(1024);
      res.send(audioBuffer);
    } catch (error) {
      console.error('Audio streaming error:', error);
      res.status(500).json({ error: 'Failed to stream audio' });
    }
  });

  app.get('/api/audio/routines', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.query;
      const routines = await storage.getAudioRoutines(category as string);
      res.json(routines);
    } catch (error) {
      console.error('Error fetching audio routines:', error);
      res.status(500).json({ error: 'Failed to fetch routines' });
    }
  });

  app.get('/api/audio/routines/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const routine = await storage.getAudioRoutine(parseInt(id));
      
      if (!routine) {
        return res.status(404).json({ error: 'Routine not found' });
      }
      
      res.json(routine);
    } catch (error) {
      console.error('Error fetching audio routine:', error);
      res.status(500).json({ error: 'Failed to fetch routine' });
    }
  });

  app.post('/api/audio/routines/:id/progress', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { stepIndex, timeElapsed, completed } = req.body;
      const userId = req.user?.claims?.sub;

      await storage.updateRoutineProgress(userId, parseInt(id), {
        stepIndex,
        timeElapsed,
        completed,
        lastAccessed: new Date()
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating routine progress:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  });

  // Bible audio endpoints
  app.get('/api/bible/verses/:id', isAuthenticated, async (req, res) => {
    try {
      const verseId = parseInt(req.params.id);
      const verse = await storage.getBibleVerse(verseId);
      
      if (!verse) {
        return res.status(404).json({ error: 'Bible verse not found' });
      }
      
      res.json(verse);
    } catch (error) {
      console.error('Error fetching Bible verse:', error);
      res.status(500).json({ error: 'Failed to fetch Bible verse' });
    }
  });

  app.post('/api/audio/bible/generate', isAuthenticated, async (req, res) => {
    try {
      const { verseId, voice = 'warm-female', musicBed } = req.body;
      
      if (!verseId) {
        return res.status(400).json({ error: 'Verse ID is required' });
      }

      const verse = await storage.getBibleVerse(verseId);
      if (!verse) {
        return res.status(404).json({ error: 'Bible verse not found' });
      }

      const verseText = `${verse.reference}. ${verse.text}`;
      
      // Generate audio using OpenAI TTS
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const voiceMap: Record<string, any> = {
        'warm-female': 'nova',
        'gentle-male': 'onyx', 
        'peaceful-female': 'shimmer',
        'authoritative-male': 'echo'
      };

      const selectedVoice = voiceMap[voice] || 'nova';

      const mp3Response = await openai.audio.speech.create({
        model: 'tts-1',
        voice: selectedVoice,
        input: verseText,
      });

      const audioBuffer = Buffer.from(await mp3Response.arrayBuffer());
      
      // Return audio as data URL for immediate playback
      const audioDataUrl = `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`;

      res.json({
        verseId,
        audioUrl: audioDataUrl,
        voice,
        musicBed,
        duration: Math.ceil(verseText.length / 10), // Rough estimate
        verse: {
          id: verse.id,
          reference: verse.reference,
          text: verse.text
        }
      });

    } catch (error) {
      console.error('Error generating Bible audio:', error);
      res.status(500).json({ error: 'Failed to generate Bible audio' });
    }
  });

  // Enhanced audio routine with Bible integration
  app.post('/api/audio/routines/bible-integrated', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const { verseIds, routineType = 'custom', voice = 'warm-female', musicBed = 'gentle-piano' } = req.body;
      
      if (!verseIds || !Array.isArray(verseIds) || verseIds.length === 0) {
        return res.status(400).json({ error: 'Verse IDs array is required' });
      }

      // Get all verses
      const verses = await Promise.all(
        verseIds.map((id: number) => storage.getBibleVerse(id))
      );

      const validVerses = verses.filter(v => v !== null);
      
      if (validVerses.length === 0) {
        return res.status(404).json({ error: 'No valid verses found' });
      }

      // Create dynamic routine with Bible content
      const routine = {
        id: Date.now(), // Generate unique ID
        name: `Personalized Bible Journey`,
        description: `Custom audio experience with ${validVerses.length} selected verses`,
        totalDuration: validVerses.length * 120 + 180, // 2 min per verse + intro
        category: routineType,
        autoAdvance: true,
        steps: [
          {
            id: 'intro',
            type: 'meditation',
            title: 'Prepare Your Heart',
            content: 'Take a moment to quiet your mind and open your heart to receive God\'s Word. Let His truth speak to you in this sacred time.',
            duration: 120,
            voiceSettings: { voice, speed: 1.0, musicBed }
          },
          ...validVerses.map((verse, index) => ({
            id: `verse-${verse.id}`,
            type: 'scripture',
            title: `Scripture Reading: ${verse.reference}`,
            content: `${verse.reference}. ${verse.text}`,
            duration: 120,
            voiceSettings: { voice, speed: 0.9, musicBed }
          })),
          {
            id: 'closing',
            type: 'reflection',
            title: 'Quiet Reflection',
            content: 'Rest in the truth of God\'s Word. Let these verses settle deep into your heart and guide your day.',
            duration: 60,
            voiceSettings: { voice, speed: 0.8, musicBed }
          }
        ]
      };

      res.json(routine);

    } catch (error) {
      console.error('Error creating Bible-integrated routine:', error);
      res.status(500).json({ error: 'Failed to create Bible routine' });
    }
  });

  // Video Content Routes (Phase 1: Pastor/Admin Uploads)
  app.post('/api/videos', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userRole = await storage.getUserRole(userId);
      
      // Check if user has permission to upload videos
      if (!['admin', 'pastor', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions to upload videos' });
      }

      const videoData = {
        ...req.body,
        uploadedBy: userId,
        phase: 'phase1',
        generationType: 'uploaded',
      };

      const video = await storage.createVideoContent(videoData);
      res.status(201).json(video);
    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({ message: 'Failed to create video' });
    }
  });

  app.get('/api/videos', isAuthenticated, async (req, res) => {
    try {
      const { churchId, category, limit = 20, offset = 0 } = req.query;
      
      let videos;
      if (churchId) {
        videos = await storage.getVideosByChurch(
          parseInt(churchId as string), 
          category as string
        );
      } else {
        videos = await storage.getPublicVideos(
          parseInt(limit as string), 
          parseInt(offset as string)
        );
      }
      
      res.json(videos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ message: 'Failed to fetch videos' });
    }
  });

  app.get('/api/videos/:id', isAuthenticated, async (req, res) => {
    try {
      const video = await storage.getVideoContent(parseInt(req.params.id));
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      res.json(video);
    } catch (error) {
      console.error('Error fetching video:', error);
      res.status(500).json({ message: 'Failed to fetch video' });
    }
  });

  app.put('/api/videos/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const video = await storage.getVideoContent(parseInt(req.params.id));
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      // Check if user owns the video or has admin rights
      const userRole = await storage.getUserRole(userId);
      if (video.uploadedBy !== userId && !['admin', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions to edit this video' });
      }

      const updatedVideo = await storage.updateVideoContent(parseInt(req.params.id), req.body);
      res.json(updatedVideo);
    } catch (error) {
      console.error('Error updating video:', error);
      res.status(500).json({ message: 'Failed to update video' });
    }
  });

  app.delete('/api/videos/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const video = await storage.getVideoContent(parseInt(req.params.id));
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      // Check if user owns the video or has admin rights
      const userRole = await storage.getUserRole(userId);
      if (video.uploadedBy !== userId && !['admin', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions to delete this video' });
      }

      await storage.deleteVideoContent(parseInt(req.params.id));
      res.json({ message: 'Video deleted successfully' });
    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ message: 'Failed to delete video' });
    }
  });

  // Video Analytics Routes
  app.post('/api/videos/:id/view', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const videoId = parseInt(req.params.id);
      const { watchDuration, completionPercentage, deviceType, quality } = req.body;

      const viewData = {
        videoId,
        userId,
        watchDuration: watchDuration || 0,
        completionPercentage: completionPercentage || 0,
        deviceType: deviceType || 'unknown',
        quality: quality || '720p',
      };

      const view = await storage.recordVideoView(viewData);
      res.json(view);
    } catch (error) {
      console.error('Error recording video view:', error);
      res.status(500).json({ message: 'Failed to record video view' });
    }
  });

  app.get('/api/videos/:id/analytics', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const video = await storage.getVideoContent(parseInt(req.params.id));
      
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      // Check if user owns the video or has admin rights to view analytics
      const userRole = await storage.getUserRole(userId);
      if (video.uploadedBy !== userId && !['admin', 'pastor', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions to view analytics' });
      }

      const analytics = await storage.getVideoAnalytics(parseInt(req.params.id));
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching video analytics:', error);
      res.status(500).json({ message: 'Failed to fetch video analytics' });
    }
  });

  // Video Comments Routes
  app.post('/api/videos/:id/comments', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const videoId = parseInt(req.params.id);
      const { content, timestamp, parentId } = req.body;

      const commentData = {
        videoId,
        userId,
        content,
        timestamp: timestamp || null,
        parentId: parentId || null,
      };

      const comment = await storage.createVideoComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error('Error creating video comment:', error);
      res.status(500).json({ message: 'Failed to create comment' });
    }
  });

  app.get('/api/videos/:id/comments', isAuthenticated, async (req, res) => {
    try {
      const comments = await storage.getVideoComments(parseInt(req.params.id));
      res.json(comments);
    } catch (error) {
      console.error('Error fetching video comments:', error);
      res.status(500).json({ message: 'Failed to fetch comments' });
    }
  });

  // Video Likes/Reactions Routes
  app.post('/api/videos/:id/like', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const videoId = parseInt(req.params.id);
      const { reactionType = 'like' } = req.body;

      const result = await storage.toggleVideoLike(userId, videoId, reactionType);
      res.json(result);
    } catch (error) {
      console.error('Error toggling video like:', error);
      res.status(500).json({ message: 'Failed to toggle like' });
    }
  });

  // Video Series Routes
  app.post('/api/video-series', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userRole = await storage.getUserRole(userId);
      
      // Check if user has permission to create video series
      if (!['admin', 'pastor', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions to create video series' });
      }

      const seriesData = {
        ...req.body,
        createdBy: userId,
      };

      const series = await storage.createVideoSeries(seriesData);
      res.status(201).json(series);
    } catch (error) {
      console.error('Error creating video series:', error);
      res.status(500).json({ message: 'Failed to create video series' });
    }
  });

  app.get('/api/video-series', isAuthenticated, async (req, res) => {
    try {
      const { churchId } = req.query;
      
      if (!churchId) {
        return res.status(400).json({ message: 'Church ID is required' });
      }

      const series = await storage.getVideoSeriesByChurch(parseInt(churchId as string));
      res.json(series);
    } catch (error) {
      console.error('Error fetching video series:', error);
      res.status(500).json({ message: 'Failed to fetch video series' });
    }
  });

  app.get('/api/video-series/:id', isAuthenticated, async (req, res) => {
    try {
      const series = await storage.getVideoSeries(parseInt(req.params.id));
      if (!series) {
        return res.status(404).json({ message: 'Video series not found' });
      }
      res.json(series);
    } catch (error) {
      console.error('Error fetching video series:', error);
      res.status(500).json({ message: 'Failed to fetch video series' });
    }
  });

  // Video Playlists Routes
  app.post('/api/video-playlists', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userRole = await storage.getUserRole(userId);
      
      // Check if user has permission to create playlists
      if (!['admin', 'pastor', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions to create playlists' });
      }

      const playlistData = {
        ...req.body,
        createdBy: userId,
      };

      const playlist = await storage.createVideoPlaylist(playlistData);
      res.status(201).json(playlist);
    } catch (error) {
      console.error('Error creating video playlist:', error);
      res.status(500).json({ message: 'Failed to create playlist' });
    }
  });

  app.post('/api/video-playlists/:id/videos', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const playlistId = parseInt(req.params.id);
      const { videoId, position } = req.body;

      const playlist = await storage.getVideoPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
      }

      // Check if user owns the playlist or has admin rights
      const userRole = await storage.getUserRole(userId);
      if (playlist.createdBy !== userId && !['admin', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions to modify this playlist' });
      }

      const playlistVideo = await storage.addVideoToPlaylist(playlistId, videoId, position);
      res.status(201).json(playlistVideo);
    } catch (error) {
      console.error('Error adding video to playlist:', error);
      res.status(500).json({ message: 'Failed to add video to playlist' });
    }
  });

  app.get('/api/video-playlists/:id/videos', isAuthenticated, async (req, res) => {
    try {
      const videos = await storage.getPlaylistVideos(parseInt(req.params.id));
      res.json(videos);
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      res.status(500).json({ message: 'Failed to fetch playlist videos' });
    }
  });

  // AI Video Generation Routes - Phase 2
  app.post('/api/videos/ai-generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { aiVideoGenerator } = await import('./ai-video-generator');
      
      const request = {
        ...req.body,
        userId,
      };

      if (request.generateSeries) {
        // Generate video series
        const episodes = await aiVideoGenerator.generateVideoSeries(
          request.topic,
          request.seriesCount || 4,
          request
        );
        res.json(episodes);
      } else {
        // Generate single video
        const videoContent = await aiVideoGenerator.generateVideoContent(request);
        res.json(videoContent);
      }
    } catch (error) {
      console.error('Error generating AI video content:', error);
      res.status(500).json({ message: 'Failed to generate AI video content' });
    }
  });

  app.post('/api/videos/ai-create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { aiVideoGenerator } = await import('./ai-video-generator');
      const videoContent = req.body;

      // Generate the actual video file from content
      const videoUrl = await aiVideoGenerator.generateVideoFromContent(videoContent, {
        userId,
        churchId: 1, // Default church for demo
        type: videoContent.type || 'devotional',
        topic: videoContent.title,
        duration: videoContent.estimatedDuration,
        voicePersona: 'pastor-david',
        visualStyle: 'modern',
        targetAudience: 'general',
      });

      // Generate thumbnail
      const thumbnailUrl = await aiVideoGenerator.createThumbnail(videoContent, 'modern');

      // Create video record in database
      const newVideo = await storage.createVideo({
        title: videoContent.title,
        description: videoContent.description,
        videoUrl,
        thumbnailUrl,
        duration: videoContent.estimatedDuration,
        category: videoContent.type || 'devotional',
        tags: videoContent.tags || [],
        bibleReferences: videoContent.bibleReferences || [],
        speaker: 'AI Generated',
        uploadedBy: userId,
        churchId: 1,
        phase: 'phase2',
        generationType: 'ai_generated',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        viewCount: 0,
        likeCount: 0,
        shareCount: 0,
        isPublic: true,
        isActive: true,
      });

      res.status(201).json(newVideo);
    } catch (error) {
      console.error('Error creating AI video:', error);
      res.status(500).json({ message: 'Failed to create AI video' });
    }
  });

  // Generate AI thumbnail for existing video
  app.post('/api/videos/:id/ai-thumbnail', isAuthenticated, async (req: any, res) => {
    try {
      const videoId = parseInt(req.params.id);
      const { visualStyle = 'modern' } = req.body;
      const { aiVideoGenerator } = await import('./ai-video-generator');

      const video = await storage.getVideoById(videoId);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }

      const thumbnailUrl = await aiVideoGenerator.createThumbnail({
        title: video.title,
        description: video.description,
      }, visualStyle);

      // Update video with new thumbnail
      const updatedVideo = await storage.updateVideo(videoId, {
        thumbnailUrl,
        updatedAt: new Date(),
      });

      res.json({ thumbnailUrl, video: updatedVideo });
    } catch (error) {
      console.error('Error generating AI thumbnail:', error);
      res.status(500).json({ message: 'Failed to generate AI thumbnail' });
    }
  });

  // Generate AI script for video topic
  app.post('/api/videos/ai-script', isAuthenticated, async (req: any, res) => {
    try {
      const { topic, type = 'devotional', duration = 180, targetAudience = 'general' } = req.body;
      const { aiVideoGenerator } = await import('./ai-video-generator');

      const request = {
        type,
        topic,
        duration,
        targetAudience,
        voicePersona: 'pastor-david',
        visualStyle: 'modern',
        userId: req.user.claims.sub,
        churchId: 1,
      };

      const videoContent = await aiVideoGenerator.generateVideoContent(request);
      
      res.json({
        script: videoContent.script,
        visualCues: videoContent.visualCues,
        estimatedDuration: videoContent.estimatedDuration,
      });
    } catch (error) {
      console.error('Error generating AI script:', error);
      res.status(500).json({ message: 'Failed to generate AI script' });
    }
  });

  return httpServer;
}