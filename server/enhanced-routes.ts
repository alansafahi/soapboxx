/**
 * Enhanced API Routes with Standardized Field Mapping
 * 
 * This module provides new API endpoints that use the mapping service
 * for consistent field naming conventions across the application.
 * These routes will gradually replace the existing ones.
 */

import { Router } from "express";
import { storage } from "./storage";
import { isAuthenticated } from "./auth";
import MappingService from "./mapping-service";

const router = Router();

// ============================================================================
// ENHANCED DISCUSSION ENDPOINTS
// ============================================================================

/**
 * Enhanced discussion creation endpoint
 * Uses mapping service for consistent field handling
 */
router.post('/discussions-enhanced', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    
    // Prepare discussion data with mapping service
    const discussionData = {
      authorId: user.email,
      title: req.body.title,
      content: req.body.content,
      isPublic: req.body.isPublic ?? true,
      attachedMedia: req.body.attachedMedia,
      tags: req.body.tags,
      category: req.body.category,
    };

    // Create discussion using enhanced method
    const discussion = await storage.createDiscussionEnhanced(discussionData);
    
    // Return mapped response
    res.json(MappingService.createCompatibleResponse(discussion));
  } catch (error) {
    console.error('Error creating discussion:', error);
    res.status(500).json({ error: 'Failed to create discussion' });
  }
});

/**
 * Enhanced discussion retrieval endpoint
 */
router.get('/discussions-enhanced/:id', async (req, res) => {
  try {
    const discussionId = parseInt(req.params.id);
    const discussion = await storage.getDiscussionEnhanced(discussionId);
    
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }
    
    res.json(MappingService.createCompatibleResponse(discussion));
  } catch (error) {
    console.error('Error getting discussion:', error);
    res.status(500).json({ error: 'Failed to get discussion' });
  }
});

/**
 * Enhanced discussion feed endpoint  
 */
router.get('/discussions-enhanced', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const discussions = await storage.getDiscussionsEnhanced(limit);
    
    res.json(MappingService.createCompatibleResponse(discussions));
  } catch (error) {
    console.error('Error getting discussions:', error);
    res.status(500).json({ error: 'Failed to get discussions' });
  }
});

// ============================================================================
// ENHANCED COMMENT ENDPOINTS
// ============================================================================

/**
 * Enhanced comment creation endpoint
 */
router.post('/discussions-enhanced/:id/comments', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const discussionId = parseInt(req.params.id);
    
    const commentData = {
      discussionId: discussionId,
      authorId: user.email,
      content: req.body.content,
      parentId: req.body.parentId || null,
    };

    const comment = await storage.createDiscussionCommentEnhanced(commentData);
    
    res.json(MappingService.createCompatibleResponse(comment));
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

/**
 * Enhanced comment retrieval for discussions
 */
router.get('/discussions-enhanced/:id/comments', async (req, res) => {
  try {
    const discussionId = parseInt(req.params.id);
    
    // Use existing method but map the response
    const comments = await storage.getDiscussionComments(discussionId);
    const mappedComments = comments.map(comment => MappingService.mapComment(comment));
    
    res.json(MappingService.createCompatibleResponse(mappedComments));
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Failed to get comments' });
  }
});

// ============================================================================
// ENHANCED USER ENDPOINTS
// ============================================================================

/**
 * Enhanced user profile endpoint
 */
router.get('/users-enhanced/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await storage.getUserEnhanced(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(MappingService.createCompatibleResponse(user));
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * Enhanced current user endpoint
 */
router.get('/me-enhanced', isAuthenticated, async (req, res) => {
  try {
    const user = req.user as any;
    const userData = await storage.getUserEnhanced(user.email);
    
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(MappingService.createCompatibleResponse(userData));
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Field mapping validation endpoint for debugging
 */
router.get('/debug/field-mapping', async (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const testData = {
        userId: 'test@example.com',
        authorId: 'author@example.com',
        createdAt: new Date(),
        isPublic: true,
        likeCount: 5,
        commentCount: 3,
      };

      const dbMapped = MappingService.safeToDatabase(testData);
      const frontendMapped = MappingService.safeFromDatabase(dbMapped);
      const compatible = MappingService.createCompatibleResponse(frontendMapped);

      res.json({
        original: testData,
        databaseMapping: dbMapped,
        frontendMapping: frontendMapped,
        compatibleResponse: compatible,
      });
    } catch (error) {
      res.status(500).json({ error: 'Field mapping debug failed' });
    }
  } else {
    res.status(404).json({ error: 'Debug endpoint not available in production' });
  }
});

/**
 * Migration status endpoint
 */
router.get('/migration/status', async (req, res) => {
  res.json({
    phase: 'Phase 1 - Mapping Layer Implementation',
    status: 'In Progress',
    enhancedEndpoints: [
      '/api/discussions-enhanced',
      '/api/discussions-enhanced/:id',
      '/api/discussions-enhanced/:id/comments',
      '/api/users-enhanced/:id',
      '/api/me-enhanced',
    ],
    nextPhase: 'Phase 2 - Frontend Integration',
    estimatedCompletion: '2-3 hours',
  });
});

export default router;