import { sql } from 'drizzle-orm';
import { db } from './db.js';

export interface AIVerificationResult {
  planId: number;
  name: string;
  tier: string;
  isAiGenerated: boolean;
  hasAiPrompt: boolean;
  isVerifiedAiPlan: boolean;
  verification: {
    criteria: Array<{ name: string; passed: boolean }>;
    overall: boolean;
  };
}

export class AIReadingPlanValidator {
  /**
   * Verify if a reading plan is a legitimate AI-curated plan
   */
  static async verifyAIPlan(planId: number): Promise<AIVerificationResult | null> {
    try {
      const result = await db.execute(sql`
        SELECT 
          id,
          name,
          subscription_tier,
          is_ai_generated,
          ai_prompt,
          CASE 
            WHEN is_ai_generated = true 
                 AND ai_prompt IS NOT NULL 
                 AND subscription_tier IN ('servant', 'torchbearer') 
            THEN true
            ELSE false
          END as is_verified_ai_plan
        FROM reading_plans 
        WHERE id = ${planId} AND is_active = true
      `);

      if (result.rows.length === 0) {
        return null;
      }

      const plan = result.rows[0] as any;
      
      const criteria = [
        { name: "AI Generated Flag", passed: Boolean(plan.is_ai_generated) },
        { name: "AI Prompt Present", passed: Boolean(plan.ai_prompt) },
        { name: "Appropriate Tier", passed: ['servant', 'torchbearer'].includes(plan.subscription_tier as string) }
      ];

      return {
        planId: plan.id as number,
        name: plan.name as string,
        tier: plan.subscription_tier as string,
        isAiGenerated: Boolean(plan.is_ai_generated),
        hasAiPrompt: Boolean(plan.ai_prompt),
        isVerifiedAiPlan: Boolean(plan.is_verified_ai_plan),
        verification: {
          criteria,
          overall: criteria.every(c => c.passed)
        }
      };
    } catch (error) {
      console.error('Error verifying AI plan:', error);
      throw error;
    }
  }

  /**
   * Get all verified AI-curated plans for a specific tier
   */
  static async getVerifiedAIPlansForTier(tier: 'servant' | 'torchbearer'): Promise<any[]> {
    try {
      const result = await db.execute(sql`
        SELECT rp.*,
               CASE 
                 WHEN rp.is_ai_generated = true AND rp.ai_prompt IS NOT NULL THEN true
                 ELSE false
               END as verified_ai_curated
        FROM reading_plans rp 
        WHERE rp.is_active = true 
          AND rp.subscription_tier = ${tier}
          AND rp.is_ai_generated = true
          AND rp.ai_prompt IS NOT NULL
        ORDER BY rp.created_at DESC
      `);

      return result.rows;
    } catch (error) {
      console.error('Error getting verified AI plans:', error);
      throw error;
    }
  }

  /**
   * Validate AI prompt quality for a reading plan
   */
  static validateAIPrompt(prompt: string): { isValid: boolean; score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    // Check prompt length (should be substantial but not too long)
    if (prompt.length < 20) {
      feedback.push("AI prompt is too short - should provide clear curation instructions");
    } else if (prompt.length > 500) {
      feedback.push("AI prompt is too long - should be concise and focused");
    } else {
      score += 25;
    }

    // Check for spiritual/biblical keywords
    const spiritualKeywords = ['biblical', 'scripture', 'faith', 'spiritual', 'bible', 'christian', 'god', 'jesus'];
    const hasSpiritual = spiritualKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    if (hasSpiritual) {
      score += 25;
    } else {
      feedback.push("AI prompt should include spiritual or biblical context");
    }

    // Check for curation/selection keywords
    const curationKeywords = ['curate', 'select', 'organize', 'arrange', 'compile', 'choose'];
    const hasCuration = curationKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    if (hasCuration) {
      score += 25;
    } else {
      feedback.push("AI prompt should indicate curation or selection process");
    }

    // Check for personalization indicators
    const personalizationKeywords = ['personalized', 'tailored', 'individual', 'specific', 'custom'];
    const hasPersonalization = personalizationKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    );
    if (hasPersonalization) {
      score += 25;
    } else {
      feedback.push("AI prompt could benefit from personalization indicators");
    }

    return {
      isValid: score >= 50,
      score,
      feedback: feedback.length === 0 ? ["AI prompt meets quality standards"] : feedback
    };
  }
}