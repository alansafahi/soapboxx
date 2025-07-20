import OpenAI from "openai";
import { storage } from "./storage";
import { UserPersonalization, InsertUserPersonalization } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface PersonalizationData {
  userId: string;
  readingHistory: any[];
  preferences: any;
  engagementMetrics: any;
  spiritualMaturity: string;
  topicInterests: string[];
}

export interface ContentRecommendation {
  type: 'verse' | 'devotional' | 'prayer' | 'meditation' | 'article';
  title: string;
  content: string;
  reason: string;
  confidence: number;
  priority: number;
  estimatedReadTime: number;
  difficulty: string;
  topics: string[];
  scriptureReferences?: string[];
  actionable?: boolean;
}

export interface MoodBasedContent {
  mood: string;
  moodScore: number;
  recommendations: ContentRecommendation[];
}

export class AIPersonalizationService {
  
  private buildMoodBasedPrompt(mood: string, moodScore: number, notes?: string, userId?: string): string {
    return `
User's current emotional state:
- Mood: ${mood}
- Mood intensity (1-5): ${moodScore}
- Additional notes: ${notes || 'None provided'}

Please provide personalized spiritual content recommendations in JSON format:
{
  "recommendations": [
    {
      "type": "verse|devotional|prayer|meditation|article",
      "title": "Meaningful title",
      "content": "Full content text (scripture verse, prayer, devotional message)",
      "reason": "Why this content is relevant to their mood",
      "confidence": 0.8,
      "priority": 1,
      "estimatedReadTime": 3,
      "difficulty": "beginner|intermediate|advanced",
      "topics": ["comfort", "hope", "peace"],
      "scriptureReferences": ["Psalm 23:4", "Romans 8:28"],
      "actionable": true
    }
  ]
}

Provide 3-5 recommendations that offer comfort, encouragement, and biblical wisdom appropriate for their emotional state.
`;
  }

  private generateFallbackMoodContent(mood: string, moodScore: number): MoodBasedContent {
    const fallbackContent: ContentRecommendation[] = [];
    
    // Basic mood-appropriate content based on mood type
    if (mood.includes('sad') || mood.includes('down') || moodScore <= 2) {
      fallbackContent.push({
        type: 'verse',
        title: 'God\'s Comfort in Sadness',
        content: '"The Lord is close to the brokenhearted and saves those who are crushed in spirit." - Psalm 34:18',
        reason: 'God promises to be near during difficult times',
        confidence: 0.9,
        priority: 1,
        estimatedReadTime: 2,
        difficulty: 'beginner',
        topics: ['comfort', 'hope', 'healing'],
        scriptureReferences: ['Psalm 34:18'],
        actionable: true
      });
    } else if (mood.includes('anxious') || mood.includes('worried')) {
      fallbackContent.push({
        type: 'verse',
        title: 'Peace Over Anxiety',
        content: '"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6',
        reason: 'Biblical guidance for managing anxiety through prayer',
        confidence: 0.9,
        priority: 1,
        estimatedReadTime: 2,
        difficulty: 'beginner',
        topics: ['peace', 'prayer', 'trust'],
        scriptureReferences: ['Philippians 4:6'],
        actionable: true
      });
    } else if (mood.includes('grateful') || mood.includes('joy') || moodScore >= 4) {
      fallbackContent.push({
        type: 'verse',
        title: 'Gratitude and Joy',
        content: '"Rejoice always, pray continually, give thanks in all circumstances; for this is God\'s will for you in Christ Jesus." - 1 Thessalonians 5:16-18',
        reason: 'Celebrating your joyful spirit with thanksgiving',
        confidence: 0.9,
        priority: 1,
        estimatedReadTime: 2,
        difficulty: 'beginner',
        topics: ['gratitude', 'joy', 'praise'],
        scriptureReferences: ['1 Thessalonians 5:16-18'],
        actionable: true
      });
    }

    return {
      mood,
      moodScore,
      recommendations: fallbackContent
    };
  }

  async generateMoodBasedContent(userId: string, mood: string, moodScore: number, notes?: string): Promise<MoodBasedContent> {
    try {
      // Import content safety service
      const { contentSafety } = await import('./contentSafety');

      // Validate mood input
      const moodValidation = contentSafety.validateTextContent(mood);
      if (!moodValidation.isAllowed) {
        return this.generateFallbackMoodContent(mood, moodScore);
      }

      // Validate notes if provided
      if (notes) {
        const notesValidation = contentSafety.validateReflectionContent(notes);
        if (!notesValidation.isAllowed) {
          notes = undefined; // Remove problematic notes
        }
      }

      // Create safe AI prompt with guardrails
      const safePrompt = contentSafety.createSafeAIPrompt(
        this.buildMoodBasedPrompt(mood, moodScore, notes, userId),
        'general'
      );
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "user",
            content: safePrompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      // Debug: Log AI response to check for incorrect content
      console.log('AI Personalization Response for mood:', mood);
      console.log('AI Generated Content:', JSON.stringify(aiResponse, null, 2));
      
      return {
        mood,
        moodScore,
        recommendations: aiResponse.recommendations || []
      };
    } catch (error) {
      // Error generating mood-based content - fallback applied
      return this.generateFallbackMoodContent(mood, moodScore);
    }
  }

  async generatePersonalizedRecommendations(userId: string): Promise<ContentRecommendation[]> {
    try {
      // Get user's personalization data
      const personalizationData = await this.getUserPersonalizationData(userId);
      
      if (!personalizationData) {
        return await this.generateDefaultRecommendations(userId);
      }

      const prompt = this.buildRecommendationPrompt(personalizationData);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a spiritual AI assistant that provides personalized biblical content recommendations. 
            Analyze user data and provide thoughtful, relevant scripture and devotional recommendations. 
            Consider the user's spiritual maturity, reading patterns, and interests.
            Always respond with JSON in the specified format.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const recommendations = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      
      // Store recommendations in database
      await this.updateUserRecommendations(userId, recommendations.recommendations);
      
      return recommendations.recommendations || [];
      
    } catch (error) {
      // AI Personalization Error - fallback applied
      return await this.generateDefaultRecommendations(userId);
    }
  }

  private buildRecommendationPrompt(data: PersonalizationData): string {
    return `
    Based on the following user profile, generate 5-8 personalized biblical content recommendations:

    User Profile:
    - Spiritual Maturity: ${data.spiritualMaturity}
    - Primary Interests: ${data.topicInterests.join(', ')}
    - Reading Patterns: ${JSON.stringify(data.readingHistory)}
    - Engagement Level: ${data.engagementMetrics.averageTimeSpent || 'Unknown'}
    - Preferred Difficulty: ${data.preferences.difficultyLevel || 'intermediate'}

    Please provide recommendations in this JSON format:
    {
      "recommendations": [
        {
          "type": "verse|devotional|topic|reading_plan",
          "title": "Clear, engaging title",
          "content": "Brief preview or description",
          "reason": "Why this is recommended for this user",
          "confidence": 0.0-1.0,
          "priority": 1-10,
          "estimatedReadTime": "minutes",
          "difficulty": "beginner|intermediate|advanced",
          "topics": ["relevant", "biblical", "topics"]
        }
      ]
    }

    Focus on:
    1. Spiritual growth appropriate to their maturity level
    2. Topics that align with their interests
    3. Content that matches their reading patterns
    4. Progressive difficulty to encourage growth
    5. Variety in content types (verses, devotionals, topics)
    `;
  }

  async analyzeUserEngagement(userId: string, contentType: string, timeSpent: number, completed: boolean): Promise<void> {
    try {
      const prompt = `
      Analyze this user engagement data and provide insights:
      
      Content Type: ${contentType}
      Time Spent: ${timeSpent} minutes
      Completed: ${completed}
      
      Provide analysis in JSON format:
      {
        "engagementScore": 0.0-1.0,
        "preferredContentLength": "short|medium|long",
        "topicRelevance": 0.0-1.0,
        "recommendedNextSteps": ["suggestion1", "suggestion2"],
        "difficultyAdjustment": "easier|maintain|harder"
      }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are analyzing user engagement with biblical content to improve personalization."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      // Update user personalization with engagement insights
      await this.updateEngagementMetrics(userId, analysis);
      
    } catch (error) {
      // Engagement Analysis Error - handled
    }
  }

  async generateFamilyFriendlyContent(originalContent: string, ageGroup: string): Promise<any> {
    try {
      const prompt = `
      Adapt this biblical content for ${ageGroup} children:
      
      Original Content: ${originalContent}
      
      Please provide a family-friendly version in JSON format:
      {
        "simplifiedTitle": "Child-appropriate title",
        "simplifiedContent": "Age-appropriate explanation",
        "keyLessons": ["lesson1", "lesson2"],
        "discussionQuestions": ["question1", "question2"],
        "activities": ["activity1", "activity2"],
        "parentalNotes": "Guidance for parents"
      }
      
      Guidelines:
      - Use simple, age-appropriate language
      - Include engaging activities
      - Provide discussion starters for families
      - Focus on practical application
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a children's ministry expert creating family-friendly biblical content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
      });

      return JSON.parse(response.choices[0].message.content || '{}');
      
    } catch (error) {
      // Family Content Generation Error - fallback applied
      return null;
    }
  }

  async translateContent(content: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = `
      Translate this biblical content to ${targetLanguage} while maintaining its spiritual meaning and cultural sensitivity:
      
      Content: ${content}
      
      Provide translation that:
      - Maintains theological accuracy
      - Uses appropriate cultural context
      - Preserves the spiritual intent
      - Uses natural, flowing language
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a biblical translator with expertise in maintaining theological accuracy across languages."
          },
          {
            role: "user",
            content: prompt
          }
        ],
      });

      return response.choices[0].message.content || content;
      
    } catch (error) {
      // Translation Error - fallback applied
      return content;
    }
  }

  private async getUserPersonalizationData(userId: string): Promise<PersonalizationData | null> {
    try {
      // Get user personalization data from storage
      const personalization = await storage.getUserPersonalization(userId);
      const preferences = await storage.getUserPreferences(userId);
      const readingHistory = await storage.getUserReadingHistory(userId);
      
      if (!personalization) return null;

      return {
        userId,
        readingHistory,
        preferences,
        engagementMetrics: {
          averageTimeSpent: personalization.engagementScore * 30, // Approximate minutes
        },
        spiritualMaturity: personalization.spiritualMaturity || 'growing',
        topicInterests: personalization.topicInterests || [],
      };
    } catch (error) {
      return null;
    }
  }

  private async generateDefaultRecommendations(userId: string): Promise<ContentRecommendation[]> {
    // Provide default recommendations for new users
    return [
      {
        type: 'verse',
        title: 'Verse of the Day',
        content: 'Start your spiritual journey with daily scripture reading',
        reason: 'Perfect for beginning your daily devotional habit',
        confidence: 0.8,
        priority: 10,
        estimatedReadTime: 5,
        difficulty: 'beginner',
        topics: ['daily devotion', 'scripture reading']
      },
      {
        type: 'devotional',
        title: 'Introduction to Faith',
        content: 'A gentle introduction to core Christian principles',
        reason: 'Ideal starting point for spiritual growth',
        confidence: 0.9,
        priority: 9,
        estimatedReadTime: 10,
        difficulty: 'beginner',
        topics: ['faith basics', 'spiritual growth']
      }
    ];
  }

  private async updateUserRecommendations(userId: string, recommendations: ContentRecommendation[]): Promise<void> {
    try {
      // Update user personalization with new recommendations
      await storage.updateUserPersonalization(userId, {
        contentRecommendations: recommendations,
        lastRecommendationUpdate: new Date(),
      });
    } catch (error) {
    }
  }

  private async updateEngagementMetrics(userId: string, analysis: any): Promise<void> {
    try {
      // Update user personalization with engagement analysis
      const currentPersonalization = await storage.getUserPersonalization(userId);
      
      if (currentPersonalization) {
        const updatedEngagement = {
          ...currentPersonalization,
          engagementScore: analysis.engagementScore || currentPersonalization.engagementScore,
          difficultyLevel: analysis.difficultyAdjustment === 'maintain' 
            ? currentPersonalization.difficultyLevel 
            : analysis.difficultyAdjustment === 'easier' ? 'beginner' : 'advanced',
        };
        
        await storage.updateUserPersonalization(userId, updatedEngagement);
      }
    } catch (error) {
    }
  }
}

export const aiPersonalizationService = new AIPersonalizationService();