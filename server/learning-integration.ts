// Integration layer for AI training system with content moderation
import { aiTrainingSystem, ModerationTrainingData } from './ai-training-system.js';
import { analyzeContentForViolations, ModerationResult } from './ai-moderation.js';

export interface ModeratorDecision {
  reportId: number;
  moderatorId: string;
  finalAction: 'approved' | 'hidden' | 'removed' | 'edit_requested';
  finalPriority: 'low' | 'medium' | 'high' | 'critical';
  finalCategory: string;
  moderatorNotes?: string;
  contentId: number;
  contentType: string;
  originalContent: string;
}

export class LearningIntegration {
  /**
   * Process moderator decision and create training data
   */
  async processModeratorDecision(
    decision: ModeratorDecision,
    originalAIResult: ModerationResult
  ): Promise<void> {
    // Determine outcome by comparing AI vs human decision
    let outcome: 'correct' | 'under_classified' | 'over_classified';
    
    const priorityLevels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    const aiLevel = priorityLevels[originalAIResult.priority];
    const humanLevel = priorityLevels[decision.finalPriority];
    
    if (aiLevel === humanLevel) {
      outcome = 'correct';
    } else if (aiLevel < humanLevel) {
      outcome = 'under_classified';
    } else {
      outcome = 'over_classified';
    }
    
    // Create training case
    const trainingData: ModerationTrainingData = {
      content: decision.originalContent,
      contentType: decision.contentType,
      aiClassification: {
        priority: originalAIResult.priority,
        category: this.mapViolationsToCategory(originalAIResult.violations),
        confidence: originalAIResult.confidence
      },
      humanDecision: {
        finalPriority: decision.finalPriority,
        finalCategory: decision.finalCategory,
        action: decision.finalAction,
        moderatorNotes: decision.moderatorNotes
      },
      outcome,
      timestamp: new Date()
    };
    
    // Record for learning
    await aiTrainingSystem.recordTrainingCase(trainingData);
    
    console.log(`🧠 Learning case recorded: AI ${originalAIResult.priority} -> Human ${decision.finalPriority} (${outcome})`);
  }
  
  /**
   * Enhanced content analysis using the learning system
   */
  async analyzeContentWithLearning(
    content: string,
    contentType: string
  ): Promise<ModerationResult> {
    return await aiTrainingSystem.analyzeContentWithLearning(content, contentType);
  }
  
  /**
   * Map violations array to primary category
   */
  private mapViolationsToCategory(violations: string[]): string {
    if (violations.includes('sexual_content') || violations.includes('Sexual content')) return 'sexual_content';
    if (violations.includes('harassment') || violations.includes('Harassment')) return 'harassment_bullying';
    if (violations.includes('inappropriate_content') || violations.includes('Inappropriate content')) return 'inappropriate_content';
    if (violations.includes('privacy_violation') || violations.includes('Privacy violations')) return 'privacy_violation';
    if (violations.includes('false_information') || violations.includes('Misinformation')) return 'false_information';
    if (violations.includes('spam') || violations.includes('Spam')) return 'spam';
    return 'other';
  }
  
  /**
   * Get training system performance metrics
   */
  async getTrainingMetrics() {
    return aiTrainingSystem.generateTrainingFeedback();
  }
}

export const learningIntegration = new LearningIntegration();