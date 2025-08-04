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
  // Cache for common spiritual profiles to speed up generation
  private welcomeContentCache = new Map<string, any>();

  // Generate welcome content package based on spiritual assessment
  async generateWelcomeContentPackage(assessmentData: any): Promise<any> {
    try {
      // Create cache key for similar profiles
      const cacheKey = this.createWelcomeCacheKey(assessmentData);
      
      // Check cache first
      if (this.welcomeContentCache.has(cacheKey)) {
        console.log('Using cached welcome content for similar profile');
        return this.welcomeContentCache.get(cacheKey);
      }

      // Use optimized prompt for faster generation
      const prompt = this.buildOptimizedWelcomePrompt(assessmentData);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Faster model for welcome content
        messages: [
          {
            role: "system",
            content: "You are a pastoral AI assistant. Create concise, personalized spiritual welcome content. Return valid JSON only with no extra text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1500 // Reduced for faster generation
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error("No response from OpenAI");

      // Clean the response to handle markdown code blocks
      const cleanedResponse = response.replace(/```json\s*|\s*```/g, '').trim();
      const content = JSON.parse(cleanedResponse);
      
      // Cache the content for similar profiles
      this.welcomeContentCache.set(cacheKey, content);
      
      // Clean cache if it gets too large
      if (this.welcomeContentCache.size > 30) {
        const firstKey = this.welcomeContentCache.keys().next().value;
        this.welcomeContentCache.delete(firstKey);
      }

      return content;
    } catch (error) {
      console.error('Error generating welcome content:', error);
      return this.generateFallbackWelcomeContent(assessmentData);
    }
  }

  private createWelcomeCacheKey(assessmentData: any): string {
    // Create cache key based on key characteristics for deduplication
    const { faithJourney, bibleFamiliarity, prayerLife, churchExperience } = assessmentData;
    return `${faithJourney}-${bibleFamiliarity}-${prayerLife}-${churchExperience}`;
  }

  private buildOptimizedWelcomePrompt(assessmentData: any): string {
    const { faithJourney, bibleFamiliarity, prayerLife, churchExperience, timeAvailability, currentChallenges, spiritualHopes } = assessmentData;

    return `Create spiritual welcome content for: Faith=${faithJourney}, Bible=${bibleFamiliarity}, Prayer=${prayerLife}, Church=${churchExperience}.

Return JSON:
{
  "welcomeMessage": "brief personal welcome (2 sentences)",
  "scriptures": ["relevant verse with reference"],
  "recommendations": {
    "devotionals": ["2 specific topics"],
    "bibleReading": "reading plan name",
    "prayer": "focus area",
    "ministry": "suggested area"
  },
  "nextSteps": ["2 immediate actionable steps"],
  "encouragement": "motivating message (1 sentence)"
}`;
  }

  private buildWelcomeContentPrompt(assessmentData: any): string {
    const {
      faithJourney,
      bibleFamiliarity,
      prayerLife,
      churchExperience,
      spiritualPractices,
      lifeChallenges,
      learningStyle,
      timeAvailability,
      currentChallenges,
      spiritualHopes
    } = assessmentData;

    return `
Create a comprehensive welcome package for a new community member based on their spiritual assessment:

ASSESSMENT PROFILE:
- Faith Journey: ${faithJourney}
- Bible Familiarity: ${bibleFamiliarity}
- Prayer Life: ${prayerLife}
- Church Experience: ${churchExperience}
- Spiritual Practices: ${Array.isArray(spiritualPractices) ? spiritualPractices.join(', ') : spiritualPractices}
- Life Challenges: ${Array.isArray(lifeChallenges) ? lifeChallenges.join(', ') : lifeChallenges}
- Learning Style: ${Array.isArray(learningStyle) ? learningStyle.join(', ') : learningStyle}
- Time Available: ${timeAvailability}
- Current Challenges: ${currentChallenges || 'None shared'}
- Spiritual Hopes: ${spiritualHopes || 'None shared'}

Generate a JSON response with this structure:
{
  "welcomeMessage": "Personalized welcome message (2-3 sentences)",
  "scriptures": [
    {
      "verse": "Full scripture text",
      "reference": "Book Chapter:Verse",
      "explanation": "Brief explanation of why this verse is relevant to their journey"
    }
  ],
  "devotionals": [
    {
      "day": 1,
      "title": "Devotional title",
      "content": "Full devotional content (200-300 words)",
      "readTime": 3,
      "theme": "New Beginnings"
    }
  ],
  "personalizedPrayer": {
    "title": "Prayer title",
    "content": "Complete prayer text",
    "guidance": "How to use this prayer"
  },
  "readingPlan": {
    "title": "Plan name",
    "description": "Plan description",
    "duration": "30 days",
    "difficulty": "Beginner"
  },
  "communityConnections": [
    {
      "type": "discussion",
      "title": "Suggested discussion topic",
      "description": "Why this would be valuable"
    }
  ]
}

Guidelines:
- Include 4-5 scripture verses appropriate for their maturity level
- Create 7 devotionals for their first week
- Address their specific life challenges and hopes
- Match content difficulty to their experience level
- Consider their time availability for content length
- Make the prayer personal to their stated needs
- Recommend appropriate reading plans based on their bible familiarity
`;
  }

  private generateFallbackWelcomeContent(assessmentData: any): any {
    return {
      welcomeMessage: "Welcome to your spiritual journey! We're excited to walk alongside you as you grow in faith and community.",
      scriptures: [
        {
          verse: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
          reference: "Jeremiah 29:11",
          explanation: "This verse reminds us that God has good plans for your spiritual journey ahead."
        }
      ],
      devotionals: [
        {
          day: 1,
          title: "A New Beginning",
          content: "Today marks the start of something beautiful. As you join this community, remember that every great journey begins with a single step. God is with you in this new chapter.",
          readTime: 2,
          theme: "New Beginnings"
        }
      ],
      personalizedPrayer: {
        title: "A Prayer for Your Journey",
        content: "Lord, thank You for this new beginning in faith community. Guide my steps, open my heart to Your truth, and help me grow in relationship with You and others. Amen.",
        guidance: "Use this prayer to start your spiritual journey each day."
      },
      readingPlan: {
        title: "Psalms of Comfort",
        description: "A 30-day journey through encouraging Psalms",
        duration: "30 days",
        difficulty: "Beginner"
      },
      communityConnections: [
        {
          type: "discussion",
          title: "Newcomer Introductions",
          description: "Connect with other new community members"
        }
      ]
    };
  }
  
  private buildMoodBasedPrompt(mood: string, moodScore: number, notes?: string, userId?: string, emiCategories?: string[]): string {
    return `
User's current emotional state:
- Primary Mood: ${mood}
- Mood intensity (1-5): ${moodScore}
- EMI Categories: ${emiCategories ? emiCategories.join(', ') : 'Not specified'}
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

  async generateEMIBasedRecommendations(userId: string, selectedMoodIds: number[], emiCategories: string[]): Promise<ContentRecommendation[]> {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const prompt = `
Based on the user's Enhanced Mood Indicators (EMI) selection, provide personalized spiritual content recommendations:

User's Current EMI State:
- Selected Mood IDs: ${selectedMoodIds.join(', ')}
- Active EMI Categories: ${emiCategories.join(', ')}
- Emotional Context: User has selected multiple moods across different spiritual and emotional categories

Generate 4-6 contextual recommendations that address their current emotional and spiritual state:

1. **Bible Reading**: Select relevant scripture passages that speak to their current feelings
2. **Prayer Scripts**: Provide personalized prayer templates addressing their emotional needs
3. **Devotional Content**: Suggest reflective content matching their spiritual state
4. **Practical Applications**: Actionable steps they can take based on their current mood

Respond in JSON format:
{
  "recommendations": [
    {
      "type": "verse|prayer|devotional|meditation|application",
      "title": "Clear, encouraging title",
      "content": "Full content or scripture text",
      "reason": "Why this addresses their EMI selection",
      "confidence": 0.0-1.0,
      "priority": 1-5,
      "estimatedReadTime": minutes,
      "difficulty": "beginner|intermediate|advanced",
      "topics": ["relevant", "topics"],
      "scriptureReferences": ["if applicable"],
      "actionable": true/false,
      "emiAlignment": ["matching", "categories"]
    }
  ]
}

Focus on providing hope, comfort, guidance, and spiritual growth opportunities that directly respond to their emotional indicators.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a compassionate spiritual AI that provides personalized biblical guidance based on Enhanced Mood Indicators. Always provide relevant, biblically sound, and emotionally supportive recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      return aiResponse.recommendations || [];
      
    } catch (error) {
      // Fallback to default recommendations
      return this.generateDefaultEMIRecommendations(emiCategories);
    }
  }

  private generateDefaultEMIRecommendations(emiCategories: string[]): ContentRecommendation[] {
    const defaultRecs: ContentRecommendation[] = [];
    
    if (emiCategories.includes('Spiritual States')) {
      defaultRecs.push({
        type: 'verse',
        title: 'Growing in Faith',
        content: '"Trust in the Lord with all your heart and lean not on your own understanding." - Proverbs 3:5',
        reason: 'Encouragement for your spiritual journey',
        confidence: 0.8,
        priority: 1,
        estimatedReadTime: 2,
        difficulty: 'beginner',
        topics: ['faith', 'trust', 'guidance'],
        scriptureReferences: ['Proverbs 3:5'],
        actionable: true
      });
    }
    
    if (emiCategories.includes('Emotional Well-being')) {
      defaultRecs.push({
        type: 'prayer',
        title: 'Prayer for Emotional Peace',
        content: 'Lord, help me find peace in Your presence. Calm my emotions and guide my heart toward Your love.',
        reason: 'Support for emotional balance',
        confidence: 0.8,
        priority: 2,
        estimatedReadTime: 1,
        difficulty: 'beginner',
        topics: ['peace', 'emotions', 'comfort'],
        actionable: true
      });
    }
    
    return defaultRecs;
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