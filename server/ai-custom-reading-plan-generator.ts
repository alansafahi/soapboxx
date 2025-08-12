import OpenAI from 'openai';
import { storage } from './storage.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CustomReadingPlan {
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  category: string;
  subscriptionTier: string;
  isAiGenerated: boolean;
  aiPersonalizationReason: string;
  days: CustomReadingPlanDay[];
}

export interface CustomReadingPlanDay {
  dayNumber: number;
  title: string;
  scriptureReference: string;
  devotionalContent: string;
  reflectionQuestion: string;
  prayerPrompt: string;
  additionalVerses?: string[];
  tags?: string[];
}

export interface CustomPlanRequest {
  selectedMoods: number[];
  userId: string;
  preferences?: {
    duration?: number;
    focusAreas?: string[];
    testament?: 'old' | 'new' | 'both';
    order?: 'canonical' | 'chronological' | 'thematic';
    translation?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    dailyTime?: string;
    studyStyle?: 'devotional' | 'expository' | 'thematic' | 'chronological';
  };
}

export class AICustomReadingPlanGenerator {
  private generatedPlansCache = new Map<string, CustomReadingPlan>();

  async generateCustomReadingPlan(request: CustomPlanRequest): Promise<{ customPlan: CustomReadingPlan }> {
    try {
      console.log('AI Custom Plan Generator - Request:', request);

      // Get EMI mood details
      const selectedMoods = await storage.getEMIMoodsByIds(request.selectedMoods);
      const moodCategories = Array.from(new Set(selectedMoods.map(mood => mood.category)));
      const moodNames = selectedMoods.map(mood => mood.name);
      const avgMoodScore = selectedMoods.reduce((sum, mood) => sum + mood.moodScore, 0) / selectedMoods.length;

      console.log('AI Custom Plan Generator - Moods:', { moodNames, moodCategories, avgMoodScore });

      // Get user's spiritual gifts if available (optional)
      const userSpritualGifts: string[] = [];
      
      // Create cache key for similar requests
      const cacheKey = this.createCacheKey(request, moodCategories);
      if (this.generatedPlansCache.has(cacheKey)) {
        return { customPlan: this.generatedPlansCache.get(cacheKey)! };
      }

      // Determine plan characteristics based on EMI and user preferences
      const planDuration = request.preferences?.duration || this.determineDuration(avgMoodScore, moodCategories);
      const studyStyle = request.preferences?.studyStyle || this.determineStudyStyle(moodCategories, avgMoodScore);
      const focusAreas = request.preferences?.focusAreas || this.determineFocusAreas(moodCategories, selectedMoods);
      const testament = request.preferences?.testament || 'both';
      const order = request.preferences?.order || 'canonical';
      const translation = request.preferences?.translation || 'all';
      const difficulty = request.preferences?.difficulty || 'advanced';
      const dailyTime = request.preferences?.dailyTime || '15-30';

      // Generate the custom reading plan using AI
      const prompt = this.buildCustomPlanPrompt(
        selectedMoods,
        moodCategories,
        moodNames,
        avgMoodScore,
        userSpritualGifts,
        planDuration,
        studyStyle,
        focusAreas,
        testament,
        order,
        translation,
        difficulty,
        dailyTime
      );

      console.log('AI Custom Plan Generator - Generating with OpenAI...');

      // For longer plans (>21 days), generate in chunks to avoid token limits
      const customPlan = planDuration > 21 
        ? await this.generateLongPlanInChunks(
            selectedMoods, moodCategories, moodNames, avgMoodScore, 
            userSpritualGifts, planDuration, studyStyle, focusAreas, 
            testament, order, translation, difficulty, dailyTime
          )
        : await this.generateShortPlan(prompt);
      
      // Cache the result
      this.generatedPlansCache.set(cacheKey, customPlan);
      console.log('AI Custom Plan Generator - Custom plan generated successfully');

      return { customPlan };

  }

  private async generateShortPlan(prompt: string): Promise<CustomReadingPlan> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI spiritual director specializing in creating personalized Bible reading plans. You create entirely new, custom reading plans tailored to individual spiritual and emotional needs, not modifications of existing plans. Your plans include carefully selected scripture passages, original devotional content, and personalized reflection questions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 4000
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || '{}');
    console.log('AI Custom Plan Generator - AI Response received');

    if (!aiResponse.plan) {
      throw new Error('AI did not return a valid plan structure');
    }

    const customPlan: CustomReadingPlan = {
      name: aiResponse.plan.name,
      description: aiResponse.plan.description,
      difficulty: 'advanced',
      duration: aiResponse.plan.days?.length || 21,
      category: 'personal',
      subscriptionTier: 'torchbearer',
      isAiGenerated: true,
      aiPersonalizationReason: aiResponse.plan.personalizationReason || 'Customized for your current spiritual and emotional state',
      days: aiResponse.plan.days || []
    };

    return customPlan;
  }

  private async generateLongPlanInChunks(
    selectedMoods: any[],
    moodCategories: string[],
    moodNames: string[],
    avgMoodScore: number,
    spiritualGifts: string[],
    duration: number,
    studyStyle: string,
    focusAreas: string[],
    testament: string,
    order: string,
    translation: string,
    difficulty: string,
    dailyTime: string
  ): Promise<CustomReadingPlan> {
    console.log(`AI Custom Plan Generator - Generating ${duration}-day plan in chunks`);
    
    // First, generate plan overview and first 10 days
    const initialPrompt = this.buildInitialChunkPrompt(
      selectedMoods, moodCategories, moodNames, avgMoodScore, spiritualGifts,
      duration, studyStyle, focusAreas, testament, order, translation, difficulty, dailyTime
    );

    const initialCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI spiritual director creating the foundation and first part of a personalized Bible reading plan. Focus on establishing the plan structure and first 10 days with high-quality content."
        },
        {
          role: "user",
          content: initialPrompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 4000
    });

    const initialResponse = JSON.parse(initialCompletion.choices[0]?.message?.content || '{}');
    const allDays = [...(initialResponse.plan?.days || [])];

    // Generate remaining days in chunks of 10
    const remainingDays = duration - 10;
    const chunks = Math.ceil(remainingDays / 10);
    
    for (let chunk = 0; chunk < chunks; chunk++) {
      const startDay = 11 + (chunk * 10);
      const endDay = Math.min(startDay + 9, duration);
      
      const chunkPrompt = this.buildContinuationChunkPrompt(
        initialResponse.plan?.name || 'Personalized Journey',
        moodNames, focusAreas, startDay, endDay, testament, order, translation, difficulty
      );

      try {
        const chunkCompletion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are continuing a personalized Bible reading plan. Generate the next set of days maintaining thematic consistency and progressive spiritual growth."
            },
            {
              role: "user",
              content: chunkPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.8,
          max_tokens: 4000
        });

        const chunkResponse = JSON.parse(chunkCompletion.choices[0]?.message?.content || '{}');
        if (chunkResponse.days) {
          allDays.push(...chunkResponse.days);
        }
        console.log(`AI Custom Plan Generator - Generated days ${startDay}-${endDay}`);
      } catch (error) {
        console.error(`Error generating chunk ${chunk + 1}:`, error);
        // Generate fallback days for this chunk
        for (let day = startDay; day <= endDay; day++) {
          allDays.push(this.generateFallbackDay(day, moodNames, focusAreas));
        }
      }
    }

    const customPlan: CustomReadingPlan = {
      name: initialResponse.plan?.name || `Personalized ${duration}-Day Journey`,
      description: initialResponse.plan?.description || `A custom ${duration}-day reading plan tailored to your spiritual and emotional needs.`,
      difficulty: 'advanced',
      duration: duration,
      category: this.categorizePlan(focusAreas),
      subscriptionTier: 'torchbearer',
      isAiGenerated: true,
      aiPersonalizationReason: initialResponse.plan?.personalizationReason || `Customized for your current state: ${moodNames.slice(0, 3).join(', ')}`,
      days: allDays
    };

    console.log(`AI Custom Plan Generator - Completed ${duration}-day plan with ${allDays.length} days`);
    return customPlan;

    } catch (error) {
      console.error('AI Custom Plan Generation error:', error);
      return this.generateFallbackCustomPlan(request);
    }
  }



  private determineDuration(avgMoodScore: number, categories: string[]): number {
    // Shorter plans for struggling individuals, longer for those in good spirits
    if (avgMoodScore <= 2) return 14; // 2 weeks for encouragement
    if (avgMoodScore >= 4) return 30; // 30 days for growth
    if (categories.includes('Life Circumstances')) return 21; // 3 weeks for life transitions
    return 21; // Default 3 weeks
  }

  private determineStudyStyle(categories: string[], avgMoodScore: number): string {
    if (categories.includes('Spiritual States') && avgMoodScore <= 2) return 'devotional';
    if (categories.includes('Seeking Support')) return 'thematic';
    if (avgMoodScore >= 4) return 'expository';
    return 'devotional';
  }

  private determineFocusAreas(categories: string[], moods: any[]): string[] {
    const areas: string[] = [];
    
    if (categories.includes('Seeking Support')) areas.push('comfort', 'hope');
    if (categories.includes('Spiritual States')) areas.push('faith', 'spiritual growth');
    if (categories.includes('Life Circumstances')) areas.push('guidance', 'wisdom');
    if (categories.includes('Emotional Well-being')) areas.push('peace', 'joy');
    
    // Add specific areas based on individual moods
    const moodNames = moods.map(m => m.name.toLowerCase());
    if (moodNames.some(name => ['struggling', 'overwhelmed', 'grieving'].includes(name))) {
      areas.push('healing', 'comfort');
    }
    if (moodNames.some(name => ['blessed', 'grateful', 'celebrating'].includes(name))) {
      areas.push('praise', 'thanksgiving');
    }
    if (moodNames.some(name => ['doubtful', 'questioning'].includes(name))) {
      areas.push('faith', 'truth');
    }

    return Array.from(new Set(areas)).slice(0, 4); // Limit to 4 focus areas
  }

  private categorizePlan(focusAreas: string[]): string {
    if (focusAreas.includes('comfort') || focusAreas.includes('healing')) return 'healing';
    if (focusAreas.includes('faith') || focusAreas.includes('spiritual growth')) return 'growth';
    if (focusAreas.includes('guidance') || focusAreas.includes('wisdom')) return 'wisdom';
    if (focusAreas.includes('praise') || focusAreas.includes('thanksgiving')) return 'worship';
    return 'personal';
  }

  private buildCustomPlanPrompt(
    selectedMoods: any[],
    moodCategories: string[],
    moodNames: string[],
    avgMoodScore: number,
    spiritualGifts: string[],
    duration: number,
    studyStyle: string,
    focusAreas: string[],
    testament: string,
    order: string,
    translation: string,
    difficulty: string,
    dailyTime: string
  ): string {
    return `Create a completely new, personalized ${duration}-day Bible reading plan based on the following profile:

EMOTIONAL & SPIRITUAL STATE:
- Current moods: ${moodNames.join(', ')}
- Mood categories: ${moodCategories.join(', ')}
- Average mood intensity: ${avgMoodScore}/5
- Spiritual gifts: ${spiritualGifts.length > 0 ? spiritualGifts.join(', ') : 'Not assessed'}

PLAN REQUIREMENTS:
- Study style: ${studyStyle}
- Focus areas: ${focusAreas.join(', ')}
- Duration: ${duration} days
- Testament focus: ${testament === 'both' ? 'Both Old and New Testament' : testament === 'old' ? 'Old Testament only' : 'New Testament only'}
- Reading order: ${order}
- Bible translation: ${translation === 'all' ? 'Flexible (mention verse references without specific translation)' : translation}
- Difficulty level: ${difficulty}
- Daily time commitment: ${dailyTime} minutes
- Target audience: Spiritually mature believers (Torchbearer level)

INSTRUCTIONS:
1. Create an entirely NEW reading plan with a unique name and description
2. Select scripture passages that specifically address the user's current emotional/spiritual state
3. Write original, personalized devotional content for each day (100-150 words per day)
4. Include reflection questions that connect to the user's specific circumstances
5. Provide prayer prompts that align with their spiritual needs
6. Ensure progression and flow throughout the plan

EXAMPLE STRUCTURE FOR STRUGGLING USERS (mood score 1-2):
- Focus on comfort, hope, God's faithfulness
- Include Psalms of lament and encouragement
- Devotionals about God's presence in difficulty

EXAMPLE STRUCTURE FOR THRIVING USERS (mood score 4-5):
- Focus on growth, service, leadership
- Include challenging passages about discipleship
- Devotionals about deeper spiritual maturity

Return your response in this JSON format:
{
  "plan": {
    "name": "Unique plan name reflecting the user's journey",
    "description": "Personalized description explaining why this plan fits their needs",
    "personalizationReason": "Explanation of how this plan addresses their specific emotional/spiritual state",
    "days": [
      {
        "dayNumber": 1,
        "title": "Day title",
        "scriptureReference": "Book Chapter:Verse-Verse",
        "devotionalContent": "Original 100-150 word devotional addressing their needs",
        "reflectionQuestion": "Personal question connecting to their circumstances",
        "prayerPrompt": "Prayer guidance matching their spiritual state",
        "additionalVerses": ["Related verse 1", "Related verse 2"],
        "tags": ["relevant", "themes"]
      }
      // ... continue for all ${duration} days
    ]
  }
}`;
  }

  private async generateFallbackCustomPlan(request: CustomPlanRequest): Promise<{ customPlan: CustomReadingPlan }> {
    console.log('AI Custom Plan Generator - Generating fallback plan');
    
    // Get basic mood info for fallback
    const selectedMoods = await storage.getEMIMoodsByIds(request.selectedMoods);
    const avgMoodScore = selectedMoods.reduce((sum, mood) => sum + mood.moodScore, 0) / selectedMoods.length;
    const moodNames = selectedMoods.map(mood => mood.name);

    const fallbackPlan: CustomReadingPlan = {
      name: `Personalized Journey: ${moodNames.slice(0, 2).join(' & ')}`,
      description: `A custom reading plan created specifically for your current spiritual and emotional journey, focusing on ${moodNames.slice(0, 2).join(' and ')}.`,
      difficulty: 'advanced',
      duration: 21,
      category: 'personal',
      subscriptionTier: 'torchbearer',
      isAiGenerated: true,
      aiPersonalizationReason: `Tailored to your current state: ${moodNames.slice(0, 3).join(', ')}`,
      days: this.generateFallbackDays(avgMoodScore, moodNames)
    };

    return { customPlan: fallbackPlan };
  }

  private generateFallbackDays(avgMoodScore: number, moodNames: string[]): CustomReadingPlanDay[] {
    const days: CustomReadingPlanDay[] = [];
    
    // Create 21 days of fallback content based on mood
    const scriptureReferences = avgMoodScore <= 2 
      ? ['Psalm 23:1-6', 'Isaiah 41:10', 'Romans 8:28', 'Jeremiah 29:11', 'Psalm 46:1-3']
      : ['Philippians 4:13', '2 Timothy 1:7', 'Joshua 1:9', 'Proverbs 3:5-6', 'Isaiah 40:31'];
      
    for (let i = 1; i <= 21; i++) {
      const scriptureRef = scriptureReferences[(i - 1) % scriptureReferences.length];
      
      days.push({
        dayNumber: i,
        title: `Day ${i}: Personal Reflection`,
        scriptureReference: scriptureRef,
        devotionalContent: avgMoodScore <= 2 
          ? `Today's reading reminds us that God is with us in every circumstance. Even when we feel ${moodNames[0]?.toLowerCase() || 'challenged'}, we can trust in His unfailing love and faithfulness.`
          : `As we continue growing in our faith, today's passage encourages us to step boldly into what God has planned. Your current season of ${moodNames[0]?.toLowerCase() || 'blessing'} is an opportunity to serve Him more fully.`,
        reflectionQuestion: avgMoodScore <= 2
          ? "How can you lean into God's comfort and strength today?"
          : "How is God calling you to use this season of blessing to serve others?",
        prayerPrompt: avgMoodScore <= 2
          ? "Ask God for His peace and presence in your current circumstances."
          : "Thank God for His blessings and ask for wisdom in using them for His glory.",
        additionalVerses: ['2 Corinthians 1:3-4', 'Romans 15:13'],
        tags: ['personal', 'growth', moodNames[0]?.toLowerCase() || 'journey']
      });
    }

    return days;
  }

  private buildInitialChunkPrompt(
    selectedMoods: any[],
    moodCategories: string[],
    moodNames: string[],
    avgMoodScore: number,
    spiritualGifts: string[],
    duration: number,
    studyStyle: string,
    focusAreas: string[],
    testament: string,
    order: string,
    translation: string,
    difficulty: string,
    dailyTime: string
  ): string {
    return `Create the foundation and first 10 days of a completely new, personalized ${duration}-day Bible reading plan:

EMOTIONAL & SPIRITUAL STATE:
- Current moods: ${moodNames.join(', ')}
- Mood categories: ${moodCategories.join(', ')}
- Average mood intensity: ${avgMoodScore}/5

PLAN REQUIREMENTS:
- Duration: ${duration} days (you're creating days 1-10 now)
- Testament focus: ${testament === 'both' ? 'Both Old and New Testament' : testament === 'old' ? 'Old Testament only' : 'New Testament only'}
- Reading order: ${order}
- Bible translation: ${translation === 'all' ? 'Flexible' : translation}
- Difficulty level: ${difficulty}
- Daily time: ${dailyTime} minutes

INSTRUCTIONS:
1. Create an entirely NEW reading plan with unique name and description
2. Generate ONLY the first 10 days with high-quality content
3. Ensure each day has 100-150 word devotional content
4. Create progression that can continue for ${duration} total days

Return JSON format:
{
  "plan": {
    "name": "Unique plan name",
    "description": "Personalized description",
    "personalizationReason": "Why this fits their needs",
    "days": [
      // ... days 1-10 only
    ]
  }
}`;
  }

  private buildContinuationChunkPrompt(
    planName: string,
    moodNames: string[],
    focusAreas: string[],
    startDay: number,
    endDay: number,
    testament: string,
    order: string,
    translation: string,
    difficulty: string
  ): string {
    return `Continue the "${planName}" reading plan with days ${startDay}-${endDay}:

CONTEXT:
- Plan focuses on: ${focusAreas.join(', ')}
- User moods: ${moodNames.join(', ')}
- Testament: ${testament}
- Order: ${order}
- Translation: ${translation}
- Difficulty: ${difficulty}

INSTRUCTIONS:
1. Maintain thematic consistency with the plan
2. Show spiritual progression from previous days
3. Create 100-150 word devotionals for each day
4. Include relevant reflection questions and prayer prompts

Return JSON format:
{
  "days": [
    // ... days ${startDay}-${endDay}
  ]
}`;
  }

  private generateFallbackDay(dayNumber: number, moodNames: string[], focusAreas: string[]): CustomReadingPlanDay {
    const scriptureReferences = [
      'Psalm 23:1-6', 'Isaiah 41:10', 'Romans 8:28', 'Jeremiah 29:11',
      'Philippians 4:13', '2 Timothy 1:7', 'Joshua 1:9', 'Proverbs 3:5-6'
    ];
    
    const scriptureRef = scriptureReferences[dayNumber % scriptureReferences.length];
    
    return {
      dayNumber,
      title: `Day ${dayNumber}: Personal Growth`,
      scriptureReference: scriptureRef,
      devotionalContent: `Today's reading provides guidance for your spiritual journey. As you reflect on this passage, consider how God is working in your current circumstances. Your journey of ${moodNames[0]?.toLowerCase() || 'faith'} is part of His greater plan for your life.`,
      reflectionQuestion: `How does today's scripture speak to your current situation of ${moodNames[0]?.toLowerCase() || 'spiritual growth'}?`,
      prayerPrompt: `Ask God for wisdom and strength as you continue growing in faith.`,
      additionalVerses: ['2 Corinthians 1:3-4', 'Romans 15:13'],
      tags: ['personal', 'growth', focusAreas[0] || 'faith']
    };
  }

  private createCacheKey(request: CustomPlanRequest, categories: string[]): string {
    return `custom-${request.userId}-${categories.sort().join(',')}-${request.selectedMoods.sort().join(',')}-${request.preferences?.duration || 'default'}`;
  }
}

export const aiCustomPlanGenerator = new AICustomReadingPlanGenerator();