import { AITrainingSystem, ModerationTrainingData } from './ai-training-system.js';
import { storage } from './storage.js';

// Global training system instance
const trainingSystem = new AITrainingSystem();

export interface LearningCase {
  contentId: string;
  contentType: 'discussion' | 'comment' | 'soap_entry' | 'prayer_request';
  content: string;
  aiClassification: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    confidence: number;
    actionRequired: string;
    reason: string;
  };
  moderatorDecision?: {
    finalPriority: 'low' | 'medium' | 'high' | 'critical';
    finalCategory: string;
    action: 'approved' | 'hidden' | 'removed' | 'edit_requested';
    moderatorNotes?: string;
    moderatorId: string;
  };
  outcome?: 'correct' | 'under_classified' | 'over_classified';
  timestamp: Date;
}

export class LearningIntegration {
  /**
   * Analyze content with enhanced AI that learns from past decisions
   */
  static async analyzeWithLearning(
    content: string,
    contentType: string,
    contentId?: string
  ) {
    try {
      const result = await trainingSystem.analyzeContentWithLearning(content, contentType);
      
      // Store the AI prediction for potential training
      if (contentId) {
        await this.storeAIPrediction(contentId, content, contentType, result);
      }
      
      return result;
    } catch (error) {
      console.error('Learning-enabled analysis failed:', error);
      throw error;
    }
  }

  /**
   * Record moderator decision for learning
   */
  static async recordModeratorDecision(
    contentId: string,
    moderatorDecision: {
      finalPriority: 'low' | 'medium' | 'high' | 'critical';
      finalCategory: string;
      action: 'approved' | 'hidden' | 'removed' | 'edit_requested';
      moderatorNotes?: string;
      moderatorId: string;
    }
  ) {
    try {
      // Get the original AI prediction
      const aiPrediction = await this.getAIPrediction(contentId);
      if (!aiPrediction) {
        console.log('No AI prediction found for content:', contentId);
        return;
      }

      // Determine outcome
      const outcome = this.determineOutcome(aiPrediction.aiClassification, moderatorDecision);

      // Create training case
      const trainingCase: ModerationTrainingData = {
        content: aiPrediction.content,
        contentType: aiPrediction.contentType,
        aiClassification: aiPrediction.aiClassification,
        humanDecision: moderatorDecision,
        outcome,
        timestamp: new Date()
      };

      // Record for learning
      await trainingSystem.recordTrainingCase(trainingCase);

      // Store in database for persistence
      await this.storeTrainingCase(contentId, trainingCase);

      console.log(`🧠 Learning case recorded: ${outcome} classification for ${aiPrediction.contentType} content`);

    } catch (error) {
      console.error('Failed to record moderator decision:', error);
    }
  }

  /**
   * Determine if AI classification was correct
   */
  private static determineOutcome(
    aiClassification: any,
    moderatorDecision: any
  ): 'correct' | 'under_classified' | 'over_classified' {
    const priorityLevels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    
    const aiLevel = priorityLevels[aiClassification.priority] || 2;
    const humanLevel = priorityLevels[moderatorDecision.finalPriority] || 2;

    if (aiLevel === humanLevel) {
      return 'correct';
    } else if (aiLevel < humanLevel) {
      return 'under_classified'; // AI was too lenient
    } else {
      return 'over_classified'; // AI was too strict
    }
  }

  /**
   * Store AI prediction for later comparison
   */
  private static async storeAIPrediction(
    contentId: string,
    content: string,
    contentType: string,
    aiResult: any
  ) {
    const learningCase: LearningCase = {
      contentId,
      contentType: contentType as any,
      content,
      aiClassification: {
        priority: aiResult.priority,
        category: aiResult.category || 'other',
        confidence: aiResult.confidence || 0.7,
        actionRequired: aiResult.actionRequired || 'review',
        reason: aiResult.reason || 'AI analysis'
      },
      timestamp: new Date()
    };

    // Store in memory cache (in production, use database)
    this.learningCache.set(contentId, learningCase);
  }

  /**
   * Get stored AI prediction
   */
  private static async getAIPrediction(contentId: string): Promise<LearningCase | null> {
    return this.learningCache.get(contentId) || null;
  }

  /**
   * Store training case in database
   */
  private static async storeTrainingCase(contentId: string, trainingCase: ModerationTrainingData) {
    // In production, store in dedicated training_cases table
    console.log('📚 Training case stored for content:', contentId);
  }

  /**
   * Get training feedback and statistics
   */
  static async getTrainingFeedback() {
    return trainingSystem.generateTrainingFeedback();
  }

  /**
   * Test the enhanced AI system
   */
  static async testEnhancedClassification() {
    return await trainingSystem.testWithExamples();
  }

  // In-memory cache for AI predictions (use database in production)
  private static learningCache = new Map<string, LearningCase>();
}

export { trainingSystem };