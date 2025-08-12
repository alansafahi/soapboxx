import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CuratedPlan {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  duration: number;
  aiReason: string;
  relevanceScore: number;
  testament: string[];
  orderType: string[];
  categories: string[];
}

export interface CurationRequest {
  selectedMoods: number[];
  planType: 'advanced' | 'torchbearer';
  requestType: 'pre-selection-curation' | 'in-progress-personalization';
  userId?: string;
}

export class AIReadingPlanCurator {
  private curatedPlansCache = new Map<string, any>();

  async generateCuratedPlans(request: CurationRequest): Promise<{ curatedPlans: CuratedPlan[] }> {
    try {
      // Get all available plans for the requested difficulty level
      const allPlans = await storage.getReadingPlans();
      const filteredPlans = allPlans.filter(plan => 
        request.planType === 'torchbearer' 
          ? plan.subscriptionTier === 'torchbearer'
          : plan.subscriptionTier === 'advanced'
      ).slice(0, 100);

      // Get EMI mood details
      const selectedMoods = await storage.getEMIMoodsByIds(request.selectedMoods);
      const moodCategories = [...new Set(selectedMoods.map(mood => mood.category))];
      const moodNames = selectedMoods.map(mood => mood.name);

      // Create cache key for similar requests
      const cacheKey = this.createCacheKey(request, moodCategories);
      if (this.curatedPlansCache.has(cacheKey)) {
        return this.curatedPlansCache.get(cacheKey);
      }

      const prompt = this.buildCurationPrompt(
        filteredPlans,
        selectedMoods,
        moodCategories,
        moodNames,
        request.planType
      );

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a spiritual director AI that curates Bible reading plans based on users' emotional and spiritual states. You understand the nuances of spiritual growth and can match reading content to emotional needs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');
      const curatedPlans = this.processCurationResults(filteredPlans, aiResponse, selectedMoods);

      // Cache the results for 2 hours
      const result = { curatedPlans };
      this.curatedPlansCache.set(cacheKey, result);
      setTimeout(() => this.curatedPlansCache.delete(cacheKey), 2 * 60 * 60 * 1000);

      return result;

    } catch (error) {
      console.error('AI curation error:', error);
      return this.generateFallbackCuration(request);
    }
  }

  private buildCurationPrompt(
    availablePlans: any[],
    selectedMoods: any[],
    moodCategories: string[],
    moodNames: string[],
    planType: string
  ): string {
    const plansJson = availablePlans.slice(0, 20).map(plan => ({
      id: plan.id,
      title: plan.title,
      description: plan.description,
      difficulty: plan.difficulty,
      duration: plan.duration,
      testament: plan.testament,
      categories: plan.categories || [],
      orderType: plan.orderType || []
    }));

    return `
You are curating ${planType} Bible reading plans for a user based on their current emotional and spiritual state.

User's Current EMI State:
- Selected Moods: ${moodNames.join(', ')}
- Primary Categories: ${moodCategories.join(', ')}
- Emotional Context: User has selected ${selectedMoods.length} mood indicators across ${moodCategories.length} categories

Available Plans to Choose From:
${JSON.stringify(plansJson, null, 2)}

Analyze each plan and determine which ones would be most beneficial for someone experiencing these moods. Consider:

1. **Emotional Alignment**: How well does the plan's content address their current emotional state?
2. **Spiritual Growth**: Will this plan help them grow through their current circumstances?
3. **Practical Application**: Does the plan offer actionable wisdom for their situation?
4. **Difficulty Match**: Is the plan appropriately challenging without being overwhelming?
5. **Thematic Relevance**: Do the plan's themes resonate with their mood categories?

Return the top 3-5 most relevant plans in JSON format:
{
  "curatedPlans": [
    {
      "planId": 123,
      "relevanceScore": 0.95,
      "aiReason": "Perfect for finding hope during difficult seasons",
      "emotionalAlignment": "Addresses feelings of doubt and struggle with grace",
      "spiritualBenefit": "Builds faith through testimonies of God's faithfulness"
    }
  ]
}

Prioritize plans that:
- Directly address their emotional categories (${moodCategories.join(', ')})
- Offer comfort, guidance, or growth opportunities relevant to their mood
- Match their spiritual maturity level (${planType})
- Provide practical application for their current life circumstances

Focus on quality over quantity - select only the most impactful plans for their current state.`;
  }

  private processCurationResults(
    allPlans: any[],
    aiResponse: any,
    selectedMoods: any[]
  ): CuratedPlan[] {
    const curatedPlans: CuratedPlan[] = [];
    
    if (!aiResponse.curatedPlans || !Array.isArray(aiResponse.curatedPlans)) {
      return this.getFallbackPlans(allPlans, selectedMoods);
    }

    for (const curatedPlan of aiResponse.curatedPlans) {
      const originalPlan = allPlans.find(p => p.id === curatedPlan.planId);
      if (originalPlan) {
        curatedPlans.push({
          id: originalPlan.id,
          title: originalPlan.title,
          description: originalPlan.description,
          difficulty: originalPlan.difficulty,
          duration: originalPlan.duration,
          aiReason: curatedPlan.aiReason || curatedPlan.emotionalAlignment || 'Recommended for your current state',
          relevanceScore: curatedPlan.relevanceScore || 0.8,
          testament: originalPlan.testament || [],
          orderType: originalPlan.orderType || [],
          categories: originalPlan.categories || []
        });
      }
    }

    // Sort by relevance score and return top 5
    return curatedPlans
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  }

  private getFallbackPlans(allPlans: any[], selectedMoods: any[]): CuratedPlan[] {
    // Basic fallback logic based on mood categories
    const moodCategories = [...new Set(selectedMoods.map(mood => mood.category))];
    const avgMoodScore = selectedMoods.reduce((sum, mood) => sum + mood.moodScore, 0) / selectedMoods.length;

    // Filter plans based on simple heuristics
    let fallbackPlans = allPlans.slice(0, 10);

    // If user is struggling (low mood scores), prefer encouraging plans
    if (avgMoodScore <= 2) {
      const encouragingKeywords = ['comfort', 'hope', 'peace', 'grace', 'love', 'psalms'];
      fallbackPlans = allPlans.filter(plan => 
        encouragingKeywords.some(keyword => 
          plan.name.toLowerCase().includes(keyword) || 
          (plan.description && plan.description.toLowerCase().includes(keyword))
        )
      );
    }

    // If user is in good spirits (high mood scores), prefer growth-focused plans
    if (avgMoodScore >= 4) {
      const growthKeywords = ['leadership', 'discipleship', 'wisdom', 'purpose', 'calling'];
      fallbackPlans = allPlans.filter(plan => 
        growthKeywords.some(keyword => 
          plan.name.toLowerCase().includes(keyword) || 
          (plan.description && plan.description.toLowerCase().includes(keyword))
        )
      );
    }

    return fallbackPlans.slice(0, 5).map((plan, index) => ({
      id: plan.id,
      title: plan.name,
      description: plan.description || '',
      difficulty: plan.difficulty || 'advanced',
      duration: plan.duration,
      aiReason: this.getSimpleRecommendationReason(moodCategories, avgMoodScore),
      relevanceScore: 0.7 - (index * 0.1),
      testament: plan.testament || [],
      orderType: plan.orderType || [],
      categories: plan.categories || []
    }));
  }

  private getSimpleRecommendationReason(categories: string[], avgScore: number): string {
    if (avgScore <= 2) {
      return "Recommended for encouragement during challenging times";
    }
    if (avgScore >= 4) {
      return "Great for continued spiritual growth and development";
    }
    if (categories.includes('Spiritual States')) {
      return "Aligns with your current spiritual journey";
    }
    return "Selected based on your current emotional state";
  }

  private createCacheKey(request: CurationRequest, categories: string[]): string {
    return `${request.planType}-${categories.sort().join(',')}-${request.selectedMoods.sort().join(',')}`;
  }

  private async generateFallbackCuration(request: CurationRequest): Promise<{ curatedPlans: CuratedPlan[] }> {
    try {
      const allPlans = await storage.getReadingPlans();
      const filteredPlans = allPlans.filter(plan => 
        request.planType === 'torchbearer' 
          ? plan.subscriptionTier === 'torchbearer'
          : plan.subscriptionTier === 'advanced'
      ).slice(0, 10);

      const selectedMoods = await storage.getEMIMoodsByIds(request.selectedMoods);
      return { curatedPlans: this.getFallbackPlans(filteredPlans, selectedMoods) };
    } catch (error) {
      console.error('Fallback curation error:', error);
      return { curatedPlans: [] };
    }
  }
}

export const aiCurator = new AIReadingPlanCurator();