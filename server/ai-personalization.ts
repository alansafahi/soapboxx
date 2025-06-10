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
  type: 'verse' | 'devotional' | 'topic' | 'reading_plan';
  title: string;
  content: string;
  reason: string;
  confidence: number;
  priority: number;
  estimatedReadTime: number;
  difficulty: string;
  topics: string[];
}

export class AIPersonalizationService {
  
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
      console.error('AI Personalization Error:', error);
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
      console.error('Engagement Analysis Error:', error);
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
      console.error('Family Content Generation Error:', error);
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
      console.error('Translation Error:', error);
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
      console.error('Error getting personalization data:', error);
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
      console.error('Error updating recommendations:', error);
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
      console.error('Error updating engagement metrics:', error);
    }
  }
}

export const aiPersonalizationService = new AIPersonalizationService();