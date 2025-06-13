import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { AIPersonalizationService } from "./ai-personalization";
import { generateSoapSuggestions, enhanceSoapEntry, generateScriptureQuestions } from "./ai-pastoral";
import multer from "multer";
import path from "path";
import fs from "fs";
import OpenAI from "openai";
import * as schema from "@shared/schema";

// AI-powered post categorization
async function categorizePost(content: string): Promise<{ type: 'discussion' | 'prayer' | 'announcement' | 'share', title?: string }> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system", 
          content: "You are a spiritual community content analyzer. Categorize posts into one of these types based on content: 'prayer' (prayer requests, asking for prayers), 'announcement' (church events, important news), 'discussion' (questions, conversations, Bible study), or 'share' (testimonies, photos, inspiration, general sharing). Also generate an appropriate title if it's an announcement. Respond with JSON."
        },
        {
          role: "user",
          content: `Categorize this post: "${content}"`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 150
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      type: result.type || 'share',
      title: result.title || undefined
    };
  } catch (error) {
    console.error('AI categorization failed:', error);
    // Fallback to simple keyword detection
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('pray') || lowerContent.includes('prayer') || lowerContent.includes('please') && lowerContent.includes('help')) {
      return { type: 'prayer' };
    } else if (lowerContent.includes('announcement') || lowerContent.includes('event') || lowerContent.includes('notice')) {
      return { type: 'announcement', title: 'Community Announcement' };
    } else if (lowerContent.includes('what') || lowerContent.includes('how') || lowerContent.includes('why') || lowerContent.includes('discuss')) {
      return { type: 'discussion' };
    } else {
      return { type: 'share' };
    }
  }
}

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

  // Role Management Routes
  app.get('/api/auth/available-roles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const availableRoles = await storage.getAvailableRoles(userId);
      const currentRole = await storage.getUserRole(userId);
      
      res.json({
        currentRole,
        availableRoles,
        canSwitch: availableRoles.length > 1
      });
    } catch (error) {
      console.error("Error fetching available roles:", error);
      res.status(500).json({ message: "Failed to fetch available roles" });
    }
  });

  app.post('/api/auth/switch-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { newRole } = req.body;

      if (!newRole) {
        return res.status(400).json({ message: "Role is required" });
      }

      const success = await storage.switchUserRole(userId, newRole);
      
      if (success) {
        res.json({ 
          success: true, 
          message: `Successfully switched to ${newRole}`,
          newRole 
        });
      } else {
        res.status(403).json({ 
          success: false, 
          message: "You don't have permission to switch to this role" 
        });
      }
    } catch (error) {
      console.error("Error switching role:", error);
      res.status(500).json({ message: "Failed to switch role" });
    }
  });

  // User role endpoint for navigation
  app.get('/api/auth/user-role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userChurch = await storage.getUserChurch(userId);
      
      if (!userChurch) {
        return res.json({ role: 'new_member', churchId: null });
      }
      
      res.json({ 
        role: userChurch.role || 'member',
        churchId: userChurch.churchId 
      });
    } catch (error) {
      console.error("Error fetching user role:", error);
      res.json({ role: 'member', churchId: null });
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
      const token = smsService.generateVerificationToken();
      const result = await smsService.sendVerificationSMS({
        phoneNumber,
        firstName: 'Test User',
        token
      });
      
      if (result) {
        res.json({ 
          success: true, 
          message: "SMS verification code sent successfully",
          verificationId: token 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: "Failed to send SMS verification" 
        });
      }
    } catch (error) {
      console.error("SMS test error:", error);
      res.status(500).json({ message: "SMS test failed" });
    }
  });

  // Sermon Creation Studio API Endpoints
  app.post('/api/sermon/research', isAuthenticated, async (req: any, res) => {
    try {
      const { scripture, topic } = req.body;
      const userId = req.user.claims.sub;
      
      // Check if user has pastor permissions
      const userRole = await storage.getUserRole(userId);
      if (!['pastor', 'lead_pastor', 'church_admin', 'admin'].includes(userRole)) {
        return res.status(403).json({ message: "Pastor access required" });
      }

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `As a biblical scholar and theologian, provide comprehensive research for a sermon on ${topic ? `the topic: "${topic}"` : ''} ${scripture ? `based on the scripture: "${scripture}"` : ''}. 

      Please provide:
      1. Biblical commentary and theological insights
      2. Historical and cultural context
      3. Key themes and spiritual principles
      4. Cross-references to related scripture passages
      5. Practical applications for modern believers

      Format your response as JSON with the following structure:
      {
        "commentary": "detailed biblical commentary",
        "historicalContext": "historical and cultural background",
        "keyThemes": ["theme1", "theme2", "theme3"],
        "crossReferences": ["verse1", "verse2", "verse3"],
        "practicalApplications": ["application1", "application2", "application3"]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a biblical scholar with deep theological knowledge. Provide accurate, doctrinally sound research for sermon preparation. Always maintain biblical accuracy and provide practical, applicable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const research = JSON.parse(response.choices[0].message.content || '{}');
      
      res.json({
        commentary: research.commentary || "Biblical commentary unavailable",
        historicalContext: research.historicalContext || "Historical context unavailable",
        keyThemes: research.keyThemes || [],
        crossReferences: research.crossReferences || [],
        practicalApplications: research.practicalApplications || []
      });

    } catch (error) {
      console.error("Error generating sermon research:", error);
      res.status(500).json({ message: "Failed to generate sermon research" });
    }
  });

  app.post('/api/sermon/outline', isAuthenticated, async (req: any, res) => {
    try {
      const { scripture, topic, audience, length } = req.body;
      const userId = req.user.claims.sub;
      
      // Allow all authenticated users to use sermon creation tools for educational purposes
      // In production, you may want to restrict this to specific roles

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const lengthGuidance = {
        short: "15-20 minutes (2000-2500 words)",
        medium: "25-30 minutes (3000-3500 words)", 
        long: "35-45 minutes (4000-5000 words)"
      };

      const audienceGuidance = {
        general: "general congregation with mixed spiritual maturity",
        youth: "young adults and teenagers with contemporary applications",
        families: "families with children, emphasizing practical family applications",
        seniors: "mature believers with deeper theological content",
        seekers: "new believers and non-Christians with clear explanations"
      };

      const prompt = `Create a comprehensive sermon outline for ${topic ? `the topic: "${topic}"` : ''} ${scripture ? `based on the scripture: "${scripture}"` : ''}. 

      Target audience: ${audienceGuidance[audience] || "general congregation"}
      Sermon length: ${lengthGuidance[length] || "25-30 minutes"}

      Create a structured, engaging outline with:
      1. Compelling sermon title
      2. Central theme/message
      3. Engaging introduction
      4. 3-4 main points with supporting details
      5. Powerful conclusion
      6. Clear call to action
      7. Supporting scripture references
      8. Closing prayer or reflection moment

      Format as JSON:
      {
        "title": "compelling sermon title",
        "theme": "central message theme",
        "introduction": "engaging opening that hooks the audience",
        "mainPoints": ["point 1", "point 2", "point 3"],
        "conclusion": "powerful closing message",
        "callToAction": "specific action for congregation",
        "scriptureReferences": ["primary verse", "supporting verse 1", "supporting verse 2"],
        "closingPrayer": "meaningful prayer or reflection to end the service"
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an experienced pastor and preacher. Create engaging, biblically sound sermon outlines that connect with the specified audience. Focus on clear structure, practical application, and spiritual growth."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const outline = JSON.parse(response.choices[0].message.content || '{}');
      
      res.json({
        title: outline.title || "Untitled Sermon",
        theme: outline.theme || "Faith and Life",
        introduction: outline.introduction || "",
        mainPoints: outline.mainPoints || [],
        conclusion: outline.conclusion || "",
        callToAction: outline.callToAction || "",
        scriptureReferences: outline.scriptureReferences || [],
        closingPrayer: outline.closingPrayer || ""
      });

    } catch (error) {
      console.error("Error generating sermon outline:", error);
      res.status(500).json({ message: "Failed to generate sermon outline" });
    }
  });

  app.post('/api/sermon/illustrations', isAuthenticated, async (req: any, res) => {
    try {
      const { topic, mainPoints, audience } = req.body;
      const userId = req.user.claims.sub;
      
      // Allow all authenticated users to access sermon illustration tools

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const prompt = `Find relevant sermon illustrations for a message about "${topic}" with these main points: ${mainPoints.join(', ')}. 
      
      Target audience: ${audience}
      
      Provide 4-5 compelling illustrations including:
      - Real-life stories and examples
      - Historical accounts
      - Contemporary applications
      - Metaphors and analogies
      
      Each illustration should include both textual content and visual presentation elements.
      
      Format as JSON:
      {
        "illustrations": [
          {
            "title": "illustration title",
            "story": "detailed story or example",
            "application": "how it connects to the sermon point",
            "source": "source or type of illustration",
            "relevanceScore": 0.85,
            "visualElements": {
              "slideTitle": "compelling slide title",
              "keyImage": "description of a powerful visual that represents this illustration",
              "bulletPoints": ["key point 1", "key point 2", "key point 3"],
              "scriptureConnection": "relevant Bible verse to display with the visual",
              "backgroundSuggestion": "description of appropriate background color/style"
            },
            "presentationTips": {
              "timing": "when to show this during the sermon",
              "delivery": "how to present this illustration effectively",
              "interaction": "suggested audience engagement element"
            }
          }
        ]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a master storyteller and preacher. Provide powerful, appropriate illustrations that help congregations understand and remember spiritual truths. Ensure all stories are respectful, accurate, and meaningful."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      let illustrations = result.illustrations || [];
      
      // Add contextual styling metadata without generating images
      for (let i = 0; i < illustrations.length; i++) {
        const illustration = illustrations[i];
        
        if (illustration.visualElements) {
          // Add audience and theme context for presentation guidance
          const audienceStyles = {
            'youth': 'vibrant, modern, energetic colors, contemporary style',
            'children': 'bright, colorful, friendly, animated style, welcoming',
            'families': 'warm, inclusive, multi-generational, heartwarming',
            'seniors': 'classic, dignified, elegant, timeless composition',
            'general': 'professional, broadly appealing, balanced composition'
          };

          const topicThemes = {
            'hope': 'sunrise, dawn, light breaking through darkness, uplifting',
            'faith': 'mountains, strong foundations, steady anchor, trust',
            'love': 'warm light, embrace, heart imagery, connection',
            'peace': 'calm waters, gentle landscapes, serene atmosphere',
            'forgiveness': 'open hands, bridges, reconciliation imagery',
            'prayer': 'clasped hands, quiet sanctuary, heavenly light',
            'worship': 'raised hands, celebration, joyful gathering',
            'service': 'helping hands, community action, outreach',
            'salvation': 'cross, redemption imagery, transformation',
            'guidance': 'lighthouse, path, shepherd imagery, direction'
          };

          // Determine dominant theme from topic and main points
          const topicLower = topic.toLowerCase();
          const mainPointsText = mainPoints.join(' ').toLowerCase();
          let themeStyle = 'inspirational, spiritual, meaningful';
          
          for (const [theme, style] of Object.entries(topicThemes)) {
            if (topicLower.includes(theme) || mainPointsText.includes(theme)) {
              themeStyle = style;
              break;
            }
          }

          const audienceStyle = audienceStyles[audience] || audienceStyles['general'];
          
          // Add styling guidance without generating images
          illustrations[i].visualElements.audienceStyle = audienceStyle;
          illustrations[i].visualElements.themeStyle = themeStyle;
        }
      }
      
      res.json(illustrations);

    } catch (error) {
      console.error("Error generating sermon illustrations:", error);
      res.status(500).json({ message: "Failed to generate sermon illustrations" });
    }
  });

  app.post('/api/sermon/enhance', isAuthenticated, async (req: any, res) => {
    try {
      const { outline, research, selectedStories } = req.body;
      const userId = req.user.claims.sub;
      
      // Allow all authenticated users to access sermon enhancement tools

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Include selected stories in the enhancement prompt if provided
      let storiesSection = '';
      if (selectedStories && selectedStories.length > 0) {
        storiesSection = `
      
      SELECTED STORIES TO INCORPORATE:
      ${selectedStories.map((story, index) => `
      Story ${index + 1}: ${story.title}
      Content: ${story.story}
      Application: ${story.application}
      `).join('')}`;
      }

      const prompt = `Review and enhance this sermon outline based on the research provided. 
      
      OUTLINE:
      Title: ${outline.title}
      Theme: ${outline.theme}
      Introduction: ${outline.introduction}
      Main Points: ${outline.mainPoints.join('; ')}
      Conclusion: ${outline.conclusion}
      Call to Action: ${outline.callToAction}
      
      RESEARCH:
      Commentary: ${research.commentary}
      Key Themes: ${research.keyThemes.join(', ')}${storiesSection}
      
      Provide specific recommendations for:
      1. Clarity and flow improvements
      2. Engagement optimization
      3. Theological accuracy verification
      4. Transition enhancements
      5. Call-to-action strengthening${selectedStories && selectedStories.length > 0 ? '\n      6. Integration of selected stories into sermon flow' : ''}
      
      Please return your response as a JSON object with enhanced outline and recommendations:
      {
        "enhancedOutline": {
          "title": "improved title",
          "theme": "refined theme",
          "introduction": "enhanced introduction",
          "mainPoints": ["improved point 1", "improved point 2", "improved point 3"],
          "conclusion": "strengthened conclusion",
          "callToAction": "more compelling call to action",
          "scriptureReferences": ["references"]
        },
        "recommendations": ["specific improvement made 1", "specific improvement made 2"]
      }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a sermon coach and theological editor. Analyze sermons for clarity, engagement, and biblical accuracy. Provide constructive enhancements that improve the spiritual impact and delivery effectiveness."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      res.json({
        enhancedOutline: result.enhancedOutline || outline,
        recommendations: result.recommendations || []
      });

    } catch (error) {
      console.error("Error enhancing sermon:", error);
      res.status(500).json({ message: "Failed to enhance sermon" });
    }
  });

  // Save sermon draft endpoint
  app.post('/api/sermon/save-draft', isAuthenticated, async (req: any, res) => {
    try {
      const { title, outline, research, illustrations, enhancement, draftId } = req.body;
      const userId = req.user.claims.sub;
      
      const contentData = {
        outline,
        research,
        illustrations,
        enhancement
      };

      let draft;
      
      if (draftId) {
        // Update existing draft (replace)
        const updates = {
          title: title || 'Untitled Sermon',
          content: JSON.stringify(contentData),
          updatedAt: new Date()
        };
        
        draft = await storage.updateSermonDraft(draftId, userId, updates);
        
        if (!draft) {
          return res.status(404).json({ message: "Draft not found" });
        }
      } else {
        // Create new draft
        const draftData = {
          title: title || 'Untitled Sermon',
          content: JSON.stringify(contentData),
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublished: false
        };

        draft = await storage.createSermonDraft(draftData);
      }
      
      res.json({
        success: true,
        draftId: draft.id,
        message: draftId ? 'Sermon draft updated successfully' : 'Sermon draft saved successfully'
      });

    } catch (error) {
      console.error("Error saving sermon draft:", error);
      res.status(500).json({ message: "Failed to save sermon draft" });
    }
  });

  // Save completed sermon endpoint
  app.post('/api/sermon/save-completed', isAuthenticated, async (req: any, res) => {
    try {
      const { title, outline, research, illustrations, enhancement, completedAt } = req.body;
      const userId = req.user.claims.sub;
      
      const completedSermonData = {
        title: title || 'Untitled Sermon',
        content: JSON.stringify({
          outline,
          research,
          illustrations,
          enhancement,
          completedAt: completedAt || new Date().toISOString()
        }),
        userId,
        isPublished: true,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const completedSermon = await storage.createSermonDraft(completedSermonData);
      
      res.json({
        success: true,
        sermonId: completedSermon.id,
        message: 'Sermon completed and saved successfully'
      });

    } catch (error) {
      console.error("Error saving completed sermon:", error);
      res.status(500).json({ message: "Failed to save completed sermon" });
    }
  });

  // Get user's completed sermons
  app.get('/api/sermon/completed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const completedSermons = await storage.getUserCompletedSermons(userId);
      
      res.json(completedSermons);
    } catch (error) {
      console.error("Error fetching completed sermons:", error);
      res.status(500).json({ message: "Failed to fetch completed sermons" });
    }
  });

  // Get user's sermon drafts
  app.get('/api/sermon/drafts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const drafts = await storage.getUserSermonDrafts(userId);
      
      res.json(drafts);
    } catch (error) {
      console.error("Error fetching sermon drafts:", error);
      res.status(500).json({ message: "Failed to fetch sermon drafts" });
    }
  });

  // Get specific sermon draft
  app.get('/api/sermon/drafts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const draftId = parseInt(req.params.id);
      
      const draft = await storage.getSermonDraft(draftId, userId);
      
      if (!draft) {
        return res.status(404).json({ message: "Sermon draft not found" });
      }
      
      res.json(draft);
    } catch (error) {
      console.error("Error fetching sermon draft:", error);
      res.status(500).json({ message: "Failed to fetch sermon draft" });
    }
  });

  // Update sermon draft
  app.put('/api/sermon/drafts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const draftId = parseInt(req.params.id);
      const { title, outline, research, illustrations, enhancement } = req.body;
      
      const updates = {
        title: title || 'Untitled Sermon',
        content: JSON.stringify({
          outline,
          research,
          illustrations,
          enhancement
        }),
      };
      
      const draft = await storage.updateSermonDraft(draftId, userId, updates);
      
      if (!draft) {
        return res.status(404).json({ message: "Sermon draft not found" });
      }
      
      res.json({
        success: true,
        draft,
        message: 'Sermon draft updated successfully'
      });
    } catch (error) {
      console.error("Error updating sermon draft:", error);
      res.status(500).json({ message: "Failed to update sermon draft" });
    }
  });

  // Delete sermon draft
  app.delete('/api/sermon/drafts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const draftId = parseInt(req.params.id);
      
      await storage.deleteSermonDraft(draftId, userId);
      
      res.json({
        success: true,
        message: 'Sermon draft deleted successfully'
      });
    } catch (error) {
      console.error("Error deleting sermon draft:", error);
      res.status(500).json({ message: "Failed to delete sermon draft" });
    }
  });

  // Export sermon endpoint
  app.post('/api/sermon/export', isAuthenticated, async (req: any, res) => {
    try {
      const { title, outline, research, illustrations, enhancement, format = 'docx' } = req.body;
      const sermonTitle = title || 'Untitled Sermon';
      const sanitizedTitle = sermonTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      
      // Generate formatted content
      const generateContent = () => {
        let content = `SERMON: ${sermonTitle}\n`;
        content += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
        
        if (outline) {
          content += `THEME: ${outline.theme || 'N/A'}\n\n`;
          content += `INTRODUCTION:\n${outline.introduction || 'N/A'}\n\n`;
          
          if (outline.mainPoints && outline.mainPoints.length > 0) {
            content += `MAIN POINTS:\n`;
            outline.mainPoints.forEach((point: any, index: any) => {
              content += `${index + 1}. ${point}\n`;
            });
            content += '\n';
          }
          
          content += `CONCLUSION:\n${outline.conclusion || 'N/A'}\n\n`;
          content += `CALL TO ACTION:\n${outline.callToAction || 'N/A'}\n\n`;
          
          if (outline.scriptureReferences && outline.scriptureReferences.length > 0) {
            content += `SCRIPTURE REFERENCES:\n`;
            outline.scriptureReferences.forEach((ref: any) => {
              content += `- ${ref}\n`;
            });
            content += '\n';
          }
        }
        
        if (research) {
          content += `BIBLICAL RESEARCH:\n`;
          content += `Commentary: ${research.commentary || 'N/A'}\n\n`;
          content += `Historical Context: ${research.historicalContext || 'N/A'}\n\n`;
          
          if (research.keyThemes && research.keyThemes.length > 0) {
            content += `Key Themes:\n`;
            research.keyThemes.forEach((theme: any) => {
              content += `- ${theme}\n`;
            });
            content += '\n';
          }
        }
        
        if (illustrations && illustrations.length > 0) {
          content += `STORIES & ILLUSTRATIONS:\n`;
          illustrations.forEach((ill: any, index: any) => {
            content += `${index + 1}. ${ill.title}\n`;
            content += `   ${ill.story}\n`;
            content += `   Application: ${ill.application}\n\n`;
          });
        }
        
        if (enhancement) {
          content += `ENHANCEMENT RECOMMENDATIONS:\n`;
          if (enhancement.recommendations && enhancement.recommendations.length > 0) {
            enhancement.recommendations.forEach((rec: any) => {
              content += `- ${rec}\n`;
            });
          }
        }
        
        if (outline && outline.closingPrayer) {
          content += `\nCLOSING PRAYER:\n${outline.closingPrayer}\n`;
        }
        
        return content;
      };

      if (format === 'json') {
        const exportData = {
          title: sermonTitle,
          outline,
          research,
          illustrations,
          enhancement,
          exportedAt: new Date().toISOString()
        };
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.json"`);
        res.json(exportData);
        
      } else if (format === 'pdf') {
        const pdf = require('html-pdf-node');
        
        const htmlContent = `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                h1 { color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px; }
                h2 { color: #4a6fa5; margin-top: 30px; }
                h3 { color: #666; }
                .section { margin-bottom: 25px; }
                .main-points { margin-left: 20px; }
                .scripture-refs { background: #f8f9fa; padding: 15px; border-left: 4px solid #2c5aa0; }
                .illustrations { background: #fff9e6; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .footer { margin-top: 50px; text-align: center; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
              </style>
            </head>
            <body>
              <h1>${sermonTitle}</h1>
              <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
              
              ${outline ? `
                <div class="section">
                  <h2>Theme</h2>
                  <p>${outline.theme || 'N/A'}</p>
                </div>
                
                <div class="section">
                  <h2>Introduction</h2>
                  <p>${outline.introduction || 'N/A'}</p>
                </div>
                
                ${outline.mainPoints && outline.mainPoints.length > 0 ? `
                  <div class="section">
                    <h2>Main Points</h2>
                    <div class="main-points">
                      ${outline.mainPoints.map((point: any, index: any) => 
                        `<p><strong>${index + 1}.</strong> ${point}</p>`
                      ).join('')}
                    </div>
                  </div>
                ` : ''}
                
                <div class="section">
                  <h2>Conclusion</h2>
                  <p>${outline.conclusion || 'N/A'}</p>
                </div>
                
                <div class="section">
                  <h2>Call to Action</h2>
                  <p>${outline.callToAction || 'N/A'}</p>
                </div>
                
                ${outline.scriptureReferences && outline.scriptureReferences.length > 0 ? `
                  <div class="section scripture-refs">
                    <h2>Scripture References</h2>
                    ${outline.scriptureReferences.map((ref: any) => `<p>• ${ref}</p>`).join('')}
                  </div>
                ` : ''}
                
                ${outline.closingPrayer ? `
                  <div class="section" style="background: #f0f4ff; padding: 20px; border-left: 4px solid #4a6fa5; border-radius: 5px;">
                    <h2 style="color: #4a6fa5;">Closing Prayer</h2>
                    <p style="font-style: italic; color: #2c3e50;">${outline.closingPrayer}</p>
                  </div>
                ` : ''}
              ` : ''}
              
              ${research ? `
                <div class="section">
                  <h2>Biblical Research</h2>
                  <h3>Commentary</h3>
                  <p>${research.commentary || 'N/A'}</p>
                  
                  <h3>Historical Context</h3>
                  <p>${research.historicalContext || 'N/A'}</p>
                  
                  ${research.keyThemes && research.keyThemes.length > 0 ? `
                    <h3>Key Themes</h3>
                    ${research.keyThemes.map((theme: any) => `<p>• ${theme}</p>`).join('')}
                  ` : ''}
                </div>
              ` : ''}
              
              ${illustrations && illustrations.length > 0 ? `
                <div class="section">
                  <h2>Stories & Illustrations</h2>
                  ${illustrations.map((ill: any, index: any) => `
                    <div class="illustrations">
                      <h3>${index + 1}. ${ill.title}</h3>
                      <p>${ill.story}</p>
                      <p><strong>Application:</strong> ${ill.application}</p>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
              
              ${enhancement && enhancement.recommendations && enhancement.recommendations.length > 0 ? `
                <div class="section">
                  <h2>Enhancement Recommendations</h2>
                  ${enhancement.recommendations.map((rec: any) => `<p>• ${rec}</p>`).join('')}
                </div>
              ` : ''}
              
              <div class="footer">
                <p>Generated by SoapBox Sermon Creation Studio</p>
              </div>
            </body>
          </html>
        `;
        
        const options = { 
          format: 'A4',
          margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
        };
        
        const file = { content: htmlContent };
        const pdfBuffer = await pdf.generatePdf(file, options);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);
        res.send(pdfBuffer);
        
      } else if (format === 'docx') {
        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
        
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              new Paragraph({
                text: sermonTitle,
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Generated on: ${new Date().toLocaleDateString()}`,
                    italics: true,
                  }),
                ],
                spacing: { after: 400 },
              }),
              
              ...(outline ? [
                new Paragraph({
                  text: "Theme",
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  text: outline.theme || 'N/A',
                  spacing: { after: 200 },
                }),
                
                new Paragraph({
                  text: "Introduction",
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  text: outline.introduction || 'N/A',
                  spacing: { after: 200 },
                }),
                
                ...(outline.mainPoints && outline.mainPoints.length > 0 ? [
                  new Paragraph({
                    text: "Main Points",
                    heading: HeadingLevel.HEADING_1,
                  }),
                  ...outline.mainPoints.map((point: any, index: any) => 
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `${index + 1}. `,
                          bold: true,
                        }),
                        new TextRun({
                          text: point,
                        }),
                      ],
                      spacing: { after: 100 },
                    })
                  ),
                ] : []),
                
                new Paragraph({
                  text: "Conclusion",
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  text: outline.conclusion || 'N/A',
                  spacing: { after: 200 },
                }),
                
                new Paragraph({
                  text: "Call to Action",
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  text: outline.callToAction || 'N/A',
                  spacing: { after: 200 },
                }),
                
                ...(outline.scriptureReferences && outline.scriptureReferences.length > 0 ? [
                  new Paragraph({
                    text: "Scripture References",
                    heading: HeadingLevel.HEADING_1,
                  }),
                  ...outline.scriptureReferences.map((ref: any) => 
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${ref}`,
                        }),
                      ],
                      spacing: { after: 100 },
                    })
                  ),
                ] : []),
                
                ...(outline.closingPrayer ? [
                  new Paragraph({
                    text: "Closing Prayer",
                    heading: HeadingLevel.HEADING_1,
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: outline.closingPrayer,
                        italics: true,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ] : []),
              ] : []),
              
              ...(research ? [
                new Paragraph({
                  text: "Biblical Research",
                  heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                  text: "Commentary",
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  text: research.commentary || 'N/A',
                  spacing: { after: 200 },
                }),
                new Paragraph({
                  text: "Historical Context",
                  heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({
                  text: research.historicalContext || 'N/A',
                  spacing: { after: 200 },
                }),
                ...(research.keyThemes && research.keyThemes.length > 0 ? [
                  new Paragraph({
                    text: "Key Themes",
                    heading: HeadingLevel.HEADING_2,
                  }),
                  ...research.keyThemes.map((theme: any) => 
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• ${theme}`,
                        }),
                      ],
                      spacing: { after: 100 },
                    })
                  ),
                ] : []),
              ] : []),
              
              ...(illustrations && illustrations.length > 0 ? [
                new Paragraph({
                  text: "Stories & Illustrations",
                  heading: HeadingLevel.HEADING_1,
                }),
                ...illustrations.flatMap((ill: any, index: any) => [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `${index + 1}. ${ill.title}`,
                        bold: true,
                      }),
                    ],
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    text: ill.story,
                    spacing: { after: 100 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Application: ",
                        bold: true,
                      }),
                      new TextRun({
                        text: ill.application,
                      }),
                    ],
                    spacing: { after: 200 },
                  }),
                ]),
              ] : []),
              
              ...(enhancement && enhancement.recommendations && enhancement.recommendations.length > 0 ? [
                new Paragraph({
                  text: "Enhancement Recommendations",
                  heading: HeadingLevel.HEADING_1,
                }),
                ...enhancement.recommendations.map((rec: any) => 
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `• ${rec}`,
                      }),
                    ],
                    spacing: { after: 100 },
                  })
                ),
              ] : []),
            ],
          }],
        });

        const buffer = await Packer.toBuffer(doc);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.docx"`);
        res.send(buffer);
        
      } else {
        // Default to text format
        const content = generateContent();
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.txt"`);
        res.send(content);
      }

    } catch (error) {
      console.error("Error exporting sermon:", error);
      res.status(500).json({ message: "Failed to export sermon" });
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

      // Look up verse in database first
      let verse = await storage.lookupBibleVerse(reference);
      
      if (!verse) {
        // Fallback: Create a helpful message encouraging manual entry
        return res.status(404).json({ 
          message: `Verse not found: ${reference}. Please enter the verse text manually in the field below.`,
          suggestion: "You can copy and paste the verse text from your preferred Bible translation."
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

  // Biblical Research API endpoint
  app.post('/api/biblical-research', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { query, includeCommentary = true, includeCrossReferences = true } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Research query is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ message: "AI service not configured" });
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const prompt = `As a biblical scholar and theologian, provide comprehensive research for: "${query}"

Please provide:
1. Biblical commentary and theological insights
2. Historical and cultural context
3. Key themes and spiritual principles
4. Cross-references to related scripture passages
5. Practical applications for modern believers

Format your response as JSON with the following structure:
{
  "commentary": "detailed biblical commentary",
  "historicalContext": "historical and cultural background",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "crossReferences": ["verse1", "verse2", "verse3"],
  "practicalApplications": ["application1", "application2", "application3"]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a biblical scholar with deep theological knowledge. Provide accurate, doctrinally sound research for sermon preparation. Always maintain biblical accuracy and provide practical, applicable insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const researchData = JSON.parse(response.choices[0].message.content);
      
      res.json({
        success: true,
        query,
        research: researchData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Biblical research error:", error);
      res.status(500).json({ 
        success: false,
        message: "Research needs a moment - let's try that again with your input.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Content Distribution API routes
  app.post('/api/content/distribute', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has pastor or admin role
      const userRole = await storage.getUserRole(userId);
      console.log(`Content distribution - User ${userId} has role: ${userRole}`);
      
      if (!userRole) {
        return res.status(403).json({ 
          message: "Unable to verify your role. Please contact your church administrator.",
          action: "contact_admin"
        });
      }
      
      if (!['pastor', 'lead_pastor', 'church_admin', 'admin', 'super_admin', 'system_admin'].includes(userRole)) {
        return res.status(403).json({ 
          message: `Content distribution requires Pastor or Admin access. Your current role is "${userRole}". Please contact your church administrator to request elevated permissions.`,
          currentRole: userRole,
          requiredRoles: ['pastor', 'lead_pastor', 'church_admin', 'admin'],
          action: "upgrade_role"
        });
      }

      const { title, summary, keyPoints, audiences } = req.body;
      
      if (!title || !summary) {
        return res.status(400).json({ message: "Title and summary are required" });
      }

      const audienceContext = audiences?.length > 0 ? `Target audiences: ${audiences.join(', ')}` : '';
      const keyPointsText = keyPoints?.length > 0 ? `Key points: ${keyPoints.join(', ')}` : '';

      // Generate social media content
      const socialMediaPrompt = `
Create engaging social media content for a sermon titled "${title}".

Sermon summary: ${summary}
${keyPointsText}
${audienceContext}

Generate content for:
1. Facebook post (engaging, detailed, with discussion question)
2. Twitter/X post (concise, inspiring, with hashtags)
3. Instagram caption (visual-friendly, story-driven, with relevant hashtags)

For each platform, provide:
- Platform-optimized content
- Appropriate hashtags
- Best posting time recommendations

Format as JSON with this structure:
{
  "facebook": { "content": "...", "hashtags": [], "tips": [] },
  "twitter": { "content": "...", "hashtags": [], "tips": [] },
  "instagram": { "content": "...", "hashtags": [], "tips": [] }
}
      `;

      const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Single optimized API call for all content
      const allContentCompletion = await openaiClient.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a church communications expert. Create comprehensive multi-platform content efficiently."
          },
          {
            role: "user",
            content: `Create ALL content for sermon "${title}". Summary: ${summary}. Key points: ${keyPointsText}.

Return JSON with this exact structure:
{
  "social": {
    "facebook": {"content": "Post text", "hashtags": ["#faith"], "tips": ["engagement tip"], "format": "Facebook Post"},
    "instagram": {"content": "Post text", "hashtags": ["#blessed"], "tips": ["visual tip"], "format": "Instagram Post"},
    "twitter": {"content": "Tweet text", "hashtags": ["#sermon"], "tips": ["timing tip"], "format": "Twitter Post"}
  },
  "email": {
    "newsletter": {"subject": "Subject", "content": "Email body", "format": "HTML Newsletter"},
    "followup": {"subject": "Follow-up subject", "content": "Follow-up body", "format": "Devotional Follow-up"}
  },
  "study": {
    "smallGroup": {"content": "Discussion guide", "format": "Small Group Guide"},
    "personal": {"content": "Personal study", "format": "Personal Study"},
    "family": {"content": "Family devotional", "format": "Family Devotional"}
  },
  "bulletin": {
    "summary": {"content": "Brief summary", "format": "Sermon Summary"},
    "reflection": {"content": "Reflection text", "format": "Weekly Reflection"},
    "announcement": {"content": "Event info", "format": "Event Announcement"}
  }
}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200,
        temperature: 0.7
      });

      // Parse single response with comprehensive error handling
      let allContentData;
      try {
        const contentText = allContentCompletion.choices[0].message.content || '{}';
        allContentData = JSON.parse(contentText);
      } catch (error) {
        console.error('Error parsing content:', error);
        // Provide fallback structure
        allContentData = {
          social: { 
            facebook: { content: `Reflecting on "${title}" - ${summary}`, hashtags: ["#faith", "#sermon"], tips: ["Post during peak hours"], format: "Facebook Post" },
            instagram: { content: `${title} 🙏`, hashtags: ["#blessed", "#faith"], tips: ["Use engaging visuals"], format: "Instagram Post" },
            twitter: { content: `New sermon: ${title}`, hashtags: ["#sermon"], tips: ["Keep it concise"], format: "Twitter Post" }
          },
          email: { 
            newsletter: { subject: `Weekly Message: ${title}`, content: `Dear Church Family,\n\n${summary}`, format: "HTML Newsletter" },
            followup: { subject: `Reflection on ${title}`, content: `Continue reflecting on today's message...`, format: "Devotional Follow-up" }
          },
          study: { 
            smallGroup: { content: `Discussion questions for ${title}...`, format: "Small Group Guide" },
            personal: { content: `Personal study on ${title}...`, format: "Personal Study" },
            family: { content: `Family devotional based on ${title}...`, format: "Family Devotional" }
          },
          bulletin: { 
            summary: { content: `Brief summary of ${title}`, format: "Sermon Summary" },
            reflection: { content: `Weekly reflection on ${title}`, format: "Weekly Reflection" },
            announcement: { content: "Join us for upcoming events", format: "Event Announcement" }
          }
        };
      }

      // Extract data from single response
      const socialData = allContentData.social || {};
      const emailData = allContentData.email || {};
      const studyData = allContentData.study || {};
      const bulletinData = allContentData.bulletin || {};

      // Format response
      const distributionPackage = {
        socialMedia: [
          {
            platform: "facebook",
            format: "Facebook Post",
            content: socialData.facebook?.content || "",
            hashtags: socialData.facebook?.hashtags || [],
            estimatedReach: 500,
            engagementTips: socialData.facebook?.tips || []
          },
          {
            platform: "twitter",
            format: "Twitter/X Post",
            content: socialData.twitter?.content || "",
            hashtags: socialData.twitter?.hashtags || [],
            estimatedReach: 300,
            engagementTips: socialData.twitter?.tips || []
          },
          {
            platform: "instagram",
            format: "Instagram Caption",
            content: socialData.instagram?.content || "",
            hashtags: socialData.instagram?.hashtags || [],
            estimatedReach: 400,
            engagementTips: socialData.instagram?.tips || []
          }
        ],
        emailContent: [
          {
            platform: "email",
            format: emailData.newsletter?.format || "Email Newsletter",
            content: emailData.newsletter?.content || ""
          },
          {
            platform: "email",
            format: emailData.followup?.format || "Follow-up Email",
            content: emailData.followup?.content || ""
          }
        ],
        studyMaterials: [
          {
            platform: "study",
            format: studyData.smallGroup?.format || "Small Group Guide",
            content: studyData.smallGroup?.content || ""
          },
          {
            platform: "study",
            format: studyData.personal?.format || "Personal Study",
            content: studyData.personal?.content || ""
          },
          {
            platform: "study",
            format: studyData.family?.format || "Family Devotional",
            content: studyData.family?.content || ""
          }
        ],
        bulletinInserts: [
          {
            platform: "bulletin",
            format: bulletinData.summary?.format || "Sermon Summary",
            content: bulletinData.summary?.content || ""
          },
          {
            platform: "bulletin",
            format: bulletinData.reflection?.format || "Weekly Reflection",
            content: bulletinData.reflection?.content || ""
          },
          {
            platform: "bulletin",
            format: bulletinData.announcement?.format || "Event Announcement",
            content: bulletinData.announcement?.content || ""
          }
        ]
      };

      res.json(distributionPackage);

    } catch (error) {
      console.error("Content distribution error:", error);
      res.status(500).json({ message: "Failed to generate content distribution package" });
    }
  });

  app.post('/api/content/publish', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has pastor or admin role
      const userRole = await storage.getUserRole(userId);
      if (!userRole) {
        return res.status(403).json({ 
          message: "Unable to verify your role. Please contact your church administrator.",
          action: "contact_admin"
        });
      }
      
      if (!['pastor', 'lead_pastor', 'church_admin', 'admin', 'super_admin', 'system_admin'].includes(userRole)) {
        return res.status(403).json({ 
          message: `Content publishing requires Pastor or Admin access. Your current role is "${userRole}". Please contact your church administrator to request elevated permissions.`,
          currentRole: userRole,
          requiredRoles: ['pastor', 'lead_pastor', 'church_admin', 'admin'],
          action: "upgrade_role"
        });
      }

      const { package: contentPackage, selectedPlatforms, scheduleTime } = req.body;
      
      // In a real implementation, this would integrate with actual publishing APIs
      // For now, we'll simulate the publishing process
      
      const publishingResults = {
        facebook: selectedPlatforms.includes('facebook') ? 'scheduled' : 'skipped',
        twitter: selectedPlatforms.includes('twitter') ? 'scheduled' : 'skipped',
        instagram: selectedPlatforms.includes('instagram') ? 'scheduled' : 'skipped',
        email: selectedPlatforms.includes('email') ? 'scheduled' : 'skipped',
        website: selectedPlatforms.includes('website') ? 'scheduled' : 'skipped'
      };

      const publishedCount = Object.values(publishingResults).filter(status => status === 'scheduled').length;

      res.json({
        success: true,
        platformCount: publishedCount,
        results: publishingResults,
        scheduledTime: scheduleTime || new Date().toISOString(),
        message: `Content successfully scheduled for ${publishedCount} platforms`
      });

    } catch (error) {
      console.error("Content publishing error:", error);
      res.status(500).json({ message: "Failed to publish content" });
    }
  });

  // Social Media Credentials Management
  app.get('/api/social-credentials', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'User authentication required' });
      }
      
      const credentials = await storage.getSocialMediaCredentials(userId);
      res.json(credentials || {});
    } catch (error) {
      console.error('Error fetching social credentials:', error);
      res.status(500).json({ 
        message: 'Unable to load social media connections. Please try again.',
        details: 'Connection retrieval failed'
      });
    }
  });

  app.post('/api/social-credentials', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { platform, accessToken, refreshToken, accountId, accountName } = req.body;

      if (!platform || !accessToken) {
        return res.status(400).json({ message: 'Platform and access token are required' });
      }

      const credentialData = {
        userId,
        platform,
        accessToken,
        refreshToken: refreshToken || null,
        accountId: accountId || null,
        accountName: accountName || null,
        isActive: true
      };

      const credential = await storage.saveSocialMediaCredential(credentialData);
      res.status(201).json(credential);
    } catch (error) {
      console.error('Error saving social credentials:', error);
      res.status(500).json({ message: 'Failed to save credentials' });
    }
  });

  // Direct Social Media Publishing
  app.post('/api/social-media/publish', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { platform, content, credentialsId, sermonId } = req.body;

      if (!platform || !content || !credentialsId) {
        return res.status(400).json({ message: 'Platform, content, and credentials ID are required' });
      }

      // Get the credentials for publishing
      const credentials = await storage.getSocialMediaCredentialById(credentialsId);
      if (!credentials || credentials.userId !== userId) {
        return res.status(403).json({ message: 'Invalid or unauthorized credentials' });
      }

      // Simulate publishing to the platform
      // In a real implementation, you would use the platform's API
      let platformPostId = `${platform}_${Date.now()}`;
      let publishStatus = 'published';

      // Store the published post record
      const postData = {
        userId,
        sermonId: sermonId || null,
        platform,
        platformPostId,
        contentType: 'post',
        content,
        publishStatus,
        publishedAt: new Date(),
        engagementMetrics: {}
      };

      const post = await storage.createSocialMediaPost(postData);

      res.json({
        success: true,
        platform,
        postId: post.id,
        platformPostId,
        message: `Successfully published to ${platform}`
      });

    } catch (error) {
      console.error('Error publishing to social media:', error);
      res.status(500).json({ message: 'Failed to publish content' });
    }
  });

  // Social Media Publishing History
  app.get('/api/social-media/posts', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { platform, limit = 20, offset = 0 } = req.query;

      const posts = await storage.getSocialMediaPosts(userId, {
        platform: platform as string,
        limit: Number(limit),
        offset: Number(offset)
      });

      res.json(posts);
    } catch (error) {
      console.error('Error fetching social media posts:', error);
      res.status(500).json({ message: 'Failed to fetch posts' });
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

  // Interactive Demo Tracking Routes
  app.post('/api/demo/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { action, tourId, stepId, timestamp } = req.body;

      const trackingData = {
        userId,
        action, // tour_started, tour_completed, step_viewed, step_completed
        tourId,
        stepId: stepId || null,
        timestamp: timestamp || new Date().toISOString(),
        metadata: req.body.metadata || {}
      };

      // Store tracking data (using simple storage for demo)
      await storage.trackDemoProgress(trackingData);
      
      res.json({ success: true, message: 'Demo progress tracked' });
    } catch (error) {
      console.error('Error tracking demo progress:', error);
      res.status(500).json({ message: 'Failed to track demo progress' });
    }
  });

  app.get('/api/demo/progress/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const requestingUserId = req.user.claims.sub;

      // Users can only view their own progress unless they're admin
      const userRole = await storage.getUserRole(requestingUserId);
      if (userId !== requestingUserId && !['admin', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const progress = await storage.getDemoProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error('Error fetching demo progress:', error);
      res.status(500).json({ message: 'Failed to fetch demo progress' });
    }
  });

  app.get('/api/demo/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userRole = await storage.getUserRole(userId);

      // Only admins can view overall demo analytics
      if (!['admin', 'super_admin'].includes(userRole)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const analytics = await storage.getDemoAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching demo analytics:', error);
      res.status(500).json({ message: 'Failed to fetch demo analytics' });
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

  // Get churches created by the current user (for admin portal)
  app.get('/api/churches/created', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const churches = await storage.getUserCreatedChurches(userId);
      res.json(churches);
    } catch (error) {
      console.error("Error fetching user created churches:", error);
      res.status(500).json({ message: "Failed to fetch user created churches" });
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
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Post content is required" });
      }
      
      // Use AI to categorize the post
      const categorization = await categorizePost(content.trim());
      const { type, title } = categorization;
      
      let post;
      if (type === 'discussion') {
        post = await storage.createDiscussion({
          title: title || 'Community Discussion',
          content: content.trim(),
          authorId: userId,
          churchId: null,
          category: 'general',
          isPublic: true
        });
      } else if (type === 'prayer') {
        // Prayer content gets posted as a share since prayers belong in Prayer Wall
        post = await storage.createDiscussion({
          title: title || 'Prayer Share',
          content: content.trim(),
          authorId: userId,
          churchId: null,
          category: 'share',
          isPublic: true
        });
      } else if (type === 'announcement') {
        post = await storage.createDiscussion({
          title: title || 'Community Announcement',
          content: content.trim(),
          authorId: userId,
          churchId: null,
          category: 'announcement',
          isPublic: true
        });
      } else { // type === 'share'
        post = await storage.createDiscussion({
          title: title || 'Community Share',
          content: content.trim(),
          authorId: userId,
          churchId: null,
          category: 'share',
          isPublic: true
        });
      }
      
      console.log(`Created AI-categorized ${type} post for user ${userId}:`, post?.id);
      res.json(post);
    } catch (error) {
      console.error("Error creating feed post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Discussion interaction endpoints
  app.post("/api/discussions/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const discussionId = parseInt(req.params.id);
      
      const result = await storage.toggleDiscussionLike(userId, discussionId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling discussion like:", error);
      res.status(500).json({ message: "Failed to toggle like" });
    }
  });

  app.post("/api/discussions/:id/bookmark", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const discussionId = parseInt(req.params.id);
      
      const result = await storage.toggleDiscussionBookmark(userId, discussionId);
      res.json(result);
    } catch (error) {
      console.error("Error toggling discussion bookmark:", error);
      res.status(500).json({ message: "Failed to toggle bookmark" });
    }
  });

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
      
      // Clean up title to prevent nesting "Shared:" prefixes
      let originalTitle = discussion.title;
      if (originalTitle.startsWith('Shared: ')) {
        originalTitle = originalTitle.replace(/^Shared: /, '');
      }
      
      // Create cleaner share content with original title
      const shareContent = `📢 **Shared Discussion: ${originalTitle}**\n\n${discussion.content}\n\n*Originally shared by ${authorName}*`;
      
      const sharedPost = await storage.createDiscussion({
        authorId: userId,
        title: `Shared: ${originalTitle}`,
        content: shareContent,
        category: 'shared',
        churchId: null,
      });
      
      res.json({ message: "Discussion shared", sharedPost });
    } catch (error) {
      console.error("Error sharing discussion:", error);
      res.status(500).json({ message: "Failed to share discussion" });
    }
  });

  app.post("/api/discussions/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const discussionId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment content is required" });
      }
      
      const comment = await storage.createDiscussionComment({
        discussionId,
        authorId: userId,
        content: content.trim()
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating discussion comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get("/api/discussions/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const discussionId = parseInt(req.params.id);
      const comments = await storage.getDiscussionComments(discussionId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching discussion comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Prayer response endpoints (supportive comments on prayers)
  app.post("/api/prayers/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const prayerId = parseInt(req.params.id);
      const { content } = req.body;
      
      if (!content || !content.trim()) {
        return res.status(400).json({ message: "Prayer response content is required" });
      }
      
      const response = await storage.prayForRequest({
        prayerRequestId: prayerId,
        userId,
        content: content.trim(),
        responseType: 'support'
      });
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating prayer response:", error);
      res.status(500).json({ message: "Failed to create prayer response" });
    }
  });

  app.get("/api/prayers/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const prayerId = parseInt(req.params.id);
      // For now, return empty array as we need to implement getPrayerResponses method
      // or use existing prayer responses from the prayer request data
      const prayerRequest = await storage.getPrayerRequest(prayerId);
      const responses = prayerRequest ? [] : []; // TODO: Implement proper prayer responses fetching
      res.json(responses);
    } catch (error) {
      console.error("Error fetching prayer responses:", error);
      res.status(500).json({ message: "Failed to fetch prayer responses" });
    }
  });

  // Prayer Circles endpoints
  app.post("/api/prayer-circles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { name, description, isPrivate, maxMembers } = req.body;

      if (!name || !description) {
        return res.status(400).json({ message: "Name and description are required" });
      }

      // Create prayer circle (for now, we'll mock this since we don't have a prayer circles table)
      const prayerCircle = {
        id: Math.floor(Math.random() * 10000) + 1000,
        name,
        description,
        isPrivate: isPrivate || false,
        maxMembers: maxMembers || 50,
        creatorId: userId,
        memberCount: 1, // Creator is first member
        activePrayers: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.status(201).json(prayerCircle);
    } catch (error) {
      console.error("Error creating prayer circle:", error);
      res.status(500).json({ message: "Failed to create prayer circle" });
    }
  });

  // Demo Data Generation Routes - DISABLED IN PRODUCTION
  // app.post('/api/demo/generate-data', async (req, res) => {
  //   try {
  //     console.log('Starting comprehensive demo data generation...');
      
  //     // Import and run the comprehensive demo generator
  //     const { generateComprehensiveDemoData } = await import('../comprehensive-demo-generator.js');
  //     await generateComprehensiveDemoData();
      
  //     res.json({ 
  //       success: true, 
  //       message: 'Demo data generated successfully',
  //       summary: 'Created comprehensive demo environment with churches, users, discussions, prayers, events, and more'
  //     });
  //   } catch (error: any) {
  //     console.error('Demo data generation error:', error);
  //     res.status(500).json({ 
  //       success: false, 
  //       message: 'Failed to generate demo data',
  //       error: error?.message || 'Unknown error'
  //     });
  //   }
  // });

  // Demo API endpoints for isolated demo environment
  app.get('/api/health', async (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  app.get('/api/demo/stats', async (req, res) => {
    try {
      // Use demo database for stats
      const { demoDB, isDemoEnvironment } = await import('./demo-db');
      
      if (!isDemoEnvironment()) {
        return res.status(400).json({ message: 'Demo environment not available' });
      }

      const churches = await demoDB.select().from(schema.churches);
      const users = await demoDB.select().from(schema.users);
      const discussions = await demoDB.select().from(schema.discussions);
      const prayers = await demoDB.select().from(schema.prayerRequests);
      const events = await demoDB.select().from(schema.events);
      
      res.json({
        churches: churches.length,
        users: users.length,
        discussions: discussions.length,
        prayers: prayers.length,
        events: events.length
      });
    } catch (error) {
      console.error('Demo stats error:', error);
      res.status(500).json({ message: 'Failed to load demo stats' });
    }
  });

  app.post('/api/demo/generate', async (req, res) => {
    try {
      console.log('Starting comprehensive demo data generation...');
      
      const { demoDB, isDemoEnvironment } = await import('./demo-db');
      
      if (!isDemoEnvironment()) {
        return res.status(400).json({ message: 'Demo environment not available' });
      }

      // Import and run the comprehensive demo generator
      const { generateComprehensiveDemoData } = await import('../comprehensive-demo-generator.js');
      await generateComprehensiveDemoData();
      
      res.json({ 
        success: true, 
        message: 'Demo data generated successfully',
        summary: 'Created comprehensive demo environment with churches, users, discussions, prayers, events, and more'
      });
    } catch (error: any) {
      console.error('Demo data generation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to generate demo data',
        error: error?.message || 'Unknown error'
      });
    }
  });

  app.get('/api/demo/users', async (req, res) => {
    try {
      const { demoDB, isDemoEnvironment } = await import('./demo-db');
      
      if (!isDemoEnvironment()) {
        return res.status(400).json({ message: 'Demo environment not available' });
      }

      // Get sample users from demo database for role switching
      const users = await demoDB.select({
        id: schema.users.id,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        email: schema.users.email
      }).from(schema.users).limit(12);

      // Add mock role and church data for demo
      const demoUsers = users.map((user, index) => ({
        ...user,
        role: ['Pastor', 'Member', 'Admin', 'Volunteer'][index % 4],
        churchName: ['Grace Community Church', 'Faith Baptist Church', 'Hope Presbyterian'][index % 3]
      }));

      res.json(demoUsers);
    } catch (error) {
      console.error('Demo users error:', error);
      res.status(500).json({ message: 'Failed to load demo users' });
    }
  });

  app.post('/api/demo/clear', async (req, res) => {
    try {
      console.log('Clearing demo data...');
      
      const { demoDB, isDemoEnvironment } = await import('./demo-db');
      
      if (!isDemoEnvironment()) {
        return res.status(400).json({ message: 'Demo environment not available' });
      }

      // Clear all demo data from isolated demo database
      await demoDB.delete(schema.events);
      await demoDB.delete(schema.prayerRequests);
      await demoDB.delete(schema.discussions);
      await demoDB.delete(schema.users);
      await demoDB.delete(schema.churches);
      
      res.json({ 
        success: true, 
        message: 'Demo data cleared successfully' 
      });
    } catch (error: any) {
      console.error('Demo data clearing error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to clear demo data',
        error: error?.message || 'Unknown error'
      });
    }
  });

  app.post('/api/demo/login', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID required' });
      }

      const { demoDB, isDemoEnvironment } = await import('./demo-db');
      
      if (!isDemoEnvironment()) {
        return res.status(400).json({ message: 'Demo environment not available' });
      }

      // Simulate demo user login by setting session
      req.session.demoUserId = userId;
      req.session.isDemoMode = true;
      
      res.json({ 
        success: true, 
        message: 'Demo login successful',
        userId 
      });
    } catch (error: any) {
      console.error('Demo login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to clear demo data',
        error: error?.message || 'Unknown error'
      });
    }
  });



  // Demo Authentication Route
  app.post('/api/demo/auth', async (req, res) => {
    try {
      const { userType = 'member' } = req.body;
      
      // Get a demo user based on type
      const demoUser = await storage.getDemoUserByType(userType);
      
      if (!demoUser) {
        return res.status(404).json({ message: 'No demo users available. Generate demo data first.' });
      }
      
      res.json({
        success: true,
        user: {
          id: demoUser.id,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          profileImageUrl: demoUser.profileImageUrl,
          isDemoUser: true,
          userType
        }
      });
    } catch (error) {
      console.error('Demo auth error:', error);
      res.status(500).json({ message: 'Demo authentication failed' });
    }
  });

  // Engagement Analytics API Routes
  app.get('/api/engagement/metrics', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { range = '7d', platform = 'all', type = 'all' } = req.query;
      
      // Calculate date range
      const days = parseInt(range.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // For demo purposes, generate realistic analytics data
      const baseMetrics = {
        total_reach: 847200,
        total_engagement: 71850,
        avg_engagement_rate: 8.4,
        sentiment_score: 0.78,
        top_content: [
          {
            id: '1',
            title: 'Sunday Service: Finding Peace in Uncertainty',
            platform: 'Facebook',
            content_type: 'sermon',
            engagement_rate: 12.8,
            views: 4200,
            likes: 380,
            comments: 95,
            shares: 62,
            published_date: '2024-06-10'
          },
          {
            id: '2', 
            title: 'Daily Devotional: Strength in Prayer',
            platform: 'Instagram',
            content_type: 'devotional',
            engagement_rate: 11.4,
            views: 2800,
            likes: 285,
            comments: 48,
            shares: 34,
            published_date: '2024-06-09'
          }
        ]
      };
      
      res.json(baseMetrics);
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
      res.status(500).json({ message: 'Failed to fetch engagement metrics' });
    }
  });

  app.get('/api/engagement/platform-stats', isAuthenticated, async (req, res) => {
    try {
      const { range = '7d' } = req.query;
      
      const platformStats = [
        {
          platform: 'Facebook',
          total_posts: 24,
          total_engagement: 3420,
          avg_engagement_rate: 9.2,
          best_performing_content: 'Sunday Service Highlights',
          growth_trend: 15
        },
        {
          platform: 'Instagram', 
          total_posts: 18,
          total_engagement: 2890,
          avg_engagement_rate: 7.8,
          best_performing_content: 'Weekly Bible Verse',
          growth_trend: 22
        },
        {
          platform: 'Twitter',
          total_posts: 45,
          total_engagement: 1560,
          avg_engagement_rate: 5.4,
          best_performing_content: 'Prayer Request Update',
          growth_trend: -3
        },
        {
          platform: 'LinkedIn',
          total_posts: 12,
          total_engagement: 890,
          avg_engagement_rate: 6.1,
          best_performing_content: 'Community Outreach Impact',
          growth_trend: 8
        }
      ];
      
      res.json(platformStats);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      res.status(500).json({ message: 'Failed to fetch platform statistics' });
    }
  });

  app.get('/api/engagement/sentiment', isAuthenticated, async (req, res) => {
    try {
      const { range = '7d' } = req.query;
      
      const sentimentData = {
        overall_sentiment: 0.78,
        positive_mentions: 892,
        neutral_mentions: 204,
        negative_mentions: 47,
        trending_topics: [
          'Sunday Service',
          'Prayer Requests', 
          'Community Outreach',
          'Bible Study',
          'Youth Ministry'
        ],
        ai_recommendations: [
          'Increase prayer-focused content frequency',
          'Optimize posting schedule for evening engagement',
          'Consider more video content formats'
        ]
      };
      
      res.json(sentimentData);
    } catch (error) {
      console.error('Error fetching sentiment analysis:', error);
      res.status(500).json({ message: 'Failed to fetch sentiment analysis' });
    }
  });

  app.get('/api/engagement/ai-insights', isAuthenticated, async (req, res) => {
    try {
      const { range = '7d' } = req.query;
      
      const insights = {
        recommendations: [
          {
            type: 'Content Strategy',
            recommendation: 'Prayer-related content performs 35% better than average',
            confidence: 0.89,
            impact: 'High'
          },
          {
            type: 'Posting Schedule',
            recommendation: 'Sunday evening posts generate 42% more engagement',
            confidence: 0.92,
            impact: 'Medium'
          }
        ],
        performance_trends: {
          weekly_growth: 12.5,
          engagement_improvement: 18.2,
          reach_expansion: 25.7
        },
        content_insights: {
          top_performing_types: ['prayer', 'community_service', 'biblical_teachings'],
          optimal_posting_times: ['9-11 AM', '7-9 PM'],
          audience_preferences: ['video_content', 'interactive_posts', 'testimonials']
        }
      };
      
      res.json(insights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      res.status(500).json({ message: 'Failed to fetch AI insights' });
    }
  });

  // S.O.A.P. Entry Routes
  app.post('/api/soap', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const soapData = schema.insertSoapEntrySchema.parse({
        ...req.body,
        userId,
      });

      const newEntry = await storage.createSoapEntry(soapData);
      res.status(201).json(newEntry);
    } catch (error) {
      console.error('Error creating S.O.A.P. entry:', error);
      res.status(500).json({ message: 'Failed to create S.O.A.P. entry' });
    }
  });

  app.get('/api/soap', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { churchId, isPublic, limit = 20, offset = 0 } = req.query;

      const options = {
        churchId: churchId ? parseInt(churchId) : undefined,
        isPublic: isPublic === 'true',
        limit: parseInt(limit),
        offset: parseInt(offset),
      };

      const entries = await storage.getSoapEntries(userId, options);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching S.O.A.P. entries:', error);
      res.status(500).json({ message: 'Failed to fetch S.O.A.P. entries' });
    }
  });

  app.get('/api/soap/public', async (req, res) => {
    try {
      const { churchId, limit = 20, offset = 0 } = req.query;

      const entries = await storage.getPublicSoapEntries(
        churchId ? parseInt(churchId as string) : undefined,
        parseInt(limit as string),
        parseInt(offset as string)
      );
      res.json(entries);
    } catch (error) {
      console.error('Error fetching public S.O.A.P. entries:', error);
      res.status(500).json({ message: 'Failed to fetch public S.O.A.P. entries' });
    }
  });

  app.get('/api/soap/:id', isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getSoapEntry(entryId);

      if (!entry) {
        return res.status(404).json({ message: 'S.O.A.P. entry not found' });
      }

      res.json(entry);
    } catch (error) {
      console.error('Error fetching S.O.A.P. entry:', error);
      res.status(500).json({ message: 'Failed to fetch S.O.A.P. entry' });
    }
  });

  app.put('/api/soap/:id', isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if entry exists and belongs to user
      const existingEntry = await storage.getSoapEntry(entryId);
      if (!existingEntry || existingEntry.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to update this entry' });
      }

      const updatedEntry = await storage.updateSoapEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error) {
      console.error('Error updating S.O.A.P. entry:', error);
      res.status(500).json({ message: 'Failed to update S.O.A.P. entry' });
    }
  });

  app.delete('/api/soap/:id', isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if entry exists and belongs to user
      const existingEntry = await storage.getSoapEntry(entryId);
      if (!existingEntry || existingEntry.userId !== userId) {
        return res.status(403).json({ message: 'Unauthorized to delete this entry' });
      }

      await storage.deleteSoapEntry(entryId);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting S.O.A.P. entry:', error);
      res.status(500).json({ message: 'Failed to delete S.O.A.P. entry' });
    }
  });

  app.get('/api/soap/streak/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const streak = await storage.getUserSoapStreak(userId);
      res.json({ streak });
    } catch (error) {
      console.error('Error fetching S.O.A.P. streak:', error);
      res.status(500).json({ message: 'Failed to fetch S.O.A.P. streak' });
    }
  });

  app.post('/api/soap/:id/feature', isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if user has admin permissions
      const userRole = await storage.getUserRole(userId);
      const canFeature = ['pastor', 'lead_pastor', 'admin', 'super_admin', 'soapbox_owner'].includes(userRole);

      if (!canFeature) {
        return res.status(403).json({ message: 'Unauthorized to feature entries' });
      }

      const featuredEntry = await storage.featureSoapEntry(entryId, userId);
      res.json(featuredEntry);
    } catch (error) {
      console.error('Error featuring S.O.A.P. entry:', error);
      res.status(500).json({ message: 'Failed to feature S.O.A.P. entry' });
    }
  });

  // AI-powered S.O.A.P. assistance endpoints
  app.post('/api/soap/ai/suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const { scripture, scriptureReference, userContext } = req.body;

      if (!scripture || !scriptureReference) {
        return res.status(400).json({ message: 'Scripture and reference are required' });
      }

      const suggestions = await generateSoapSuggestions(scripture, scriptureReference, userContext);
      res.json(suggestions);
    } catch (error) {
      console.error('Error generating S.O.A.P. suggestions:', error);
      res.status(500).json({ message: error.message || 'Failed to generate AI suggestions' });
    }
  });

  app.post('/api/soap/ai/enhance', isAuthenticated, async (req: any, res) => {
    try {
      const { scripture, scriptureReference, observation, application, prayer } = req.body;

      if (!scripture || !scriptureReference || !observation || !application || !prayer) {
        return res.status(400).json({ message: 'All S.O.A.P. components are required for enhancement' });
      }

      const enhanced = await enhanceSoapEntry(scripture, scriptureReference, observation, application, prayer);
      res.json(enhanced);
    } catch (error) {
      console.error('Error enhancing S.O.A.P. entry:', error);
      res.status(500).json({ message: error.message || 'Failed to enhance reflection' });
    }
  });

  app.post('/api/soap/ai/questions', isAuthenticated, async (req: any, res) => {
    try {
      const { scripture, scriptureReference } = req.body;

      if (!scripture || !scriptureReference) {
        return res.status(400).json({ message: 'Scripture and reference are required' });
      }

      const questions = await generateScriptureQuestions(scripture, scriptureReference);
      res.json({ questions });
    } catch (error) {
      console.error('Error generating Scripture questions:', error);
      res.status(500).json({ message: error.message || 'Failed to generate questions' });
    }
  });

  app.delete('/api/soap/:id/feature', isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Check if user has admin permissions
      const userRole = await storage.getUserRole(userId);
      const canFeature = ['pastor', 'lead_pastor', 'admin', 'super_admin', 'soapbox_owner'].includes(userRole);

      if (!canFeature) {
        return res.status(403).json({ message: 'Unauthorized to unfeature entries' });
      }

      const unfeaturedEntry = await storage.unfeatureSoapEntry(entryId);
      res.json(unfeaturedEntry);
    } catch (error) {
      console.error('Error unfeaturing S.O.A.P. entry:', error);
      res.status(500).json({ message: 'Failed to unfeature S.O.A.P. entry' });
    }
  });

  // AI-assisted S.O.A.P. generation
  app.post('/api/soap/ai-assist', isAuthenticated, async (req: any, res) => {
    try {
      const { scripture, scriptureReference, currentObservation, currentApplication, currentPrayer } = req.body;

      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a spiritual mentor helping with S.O.A.P. (Scripture, Observation, Application, Prayer) Bible study. Provide thoughtful, biblically sound suggestions for the incomplete sections. Keep responses personal, practical, and spiritually enriching. Respond with JSON containing suggestions for the missing fields."
          },
          {
            role: "user",
            content: `Help me complete this S.O.A.P. study:
            
Scripture: ${scripture}
Reference: ${scriptureReference}
Current Observation: ${currentObservation || 'Not written yet'}
Current Application: ${currentApplication || 'Not written yet'}
Current Prayer: ${currentPrayer || 'Not written yet'}

Please provide suggestions for the missing or incomplete sections.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 800
      });

      const suggestions = JSON.parse(response.choices[0].message.content || '{}');
      res.json(suggestions);
    } catch (error) {
      console.error('Error generating AI S.O.A.P. suggestions:', error);
      res.status(500).json({ message: 'Failed to generate S.O.A.P. suggestions' });
    }
  });

  return httpServer;
}