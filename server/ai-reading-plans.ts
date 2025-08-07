import OpenAI from "openai";
import { db } from "./db";
import { readingPlans, readingPlanDays } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ThematicPlanRequest {
  topic: string;
  duration: number; // days
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  userContext?: string; // Optional context about user's spiritual journey
}

export interface GeneratedPlanDay {
  dayNumber: number;
  title: string;
  scriptureReference: string;
  devotionalContent: string;
  reflectionQuestion: string;
  prayerPrompt: string;
  estimatedReadingTime: number;
}

export interface GeneratedPlan {
  name: string;
  description: string;
  days: GeneratedPlanDay[];
}

export async function generateThematicPlan(request: ThematicPlanRequest): Promise<GeneratedPlan> {
  try {
    const prompt = `Create a ${request.duration}-day spiritual reading plan focused on "${request.topic}". 
    
    Difficulty level: ${request.difficulty}
    ${request.userContext ? `User context: ${request.userContext}` : ''}
    
    Generate a comprehensive plan with:
    1. A compelling plan name and description
    2. ${request.duration} daily entries, each containing:
       - Day title (meaningful and inspiring)
       - Scripture reference (specific verses, not just books)
       - Devotional content (2-3 paragraphs, biblical and encouraging)
       - Reflection question (thought-provoking and personal)
       - Prayer prompt (conversational and heartfelt)
       - Estimated reading time in minutes (realistic)
    
    Focus on authentic biblical content that speaks to the topic of "${request.topic}".
    Use grace-driven language that encourages spiritual growth.
    Ensure progressive spiritual development throughout the plan.
    
    Respond with JSON in this exact format:
    {
      "name": "Plan Name",
      "description": "Plan description",
      "days": [
        {
          "dayNumber": 1,
          "title": "Day Title",
          "scriptureReference": "Book Chapter:Verse-Verse",
          "devotionalContent": "Devotional content...",
          "reflectionQuestion": "Reflection question?",
          "prayerPrompt": "Prayer prompt...",
          "estimatedReadingTime": 5
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a biblical scholar and spiritual director creating personalized Bible reading plans. Provide theologically sound, encouraging, and practically applicable content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Validate the structure
    if (!result.name || !result.description || !Array.isArray(result.days)) {
      throw new Error('Invalid plan structure generated');
    }

    return result as GeneratedPlan;
  } catch (error) {
    console.error('Error generating thematic plan:', error);
    throw new Error('Failed to generate AI-powered reading plan: ' + error.message);
  }
}

export async function saveGeneratedPlan(
  generatedPlan: GeneratedPlan,
  request: ThematicPlanRequest,
  userId: string
): Promise<number> {
  try {
    // Insert the reading plan
    const [plan] = await db
      .insert(readingPlans)
      .values({
        name: generatedPlan.name,
        description: generatedPlan.description,
        type: 'thematic',
        duration: request.duration,
        difficulty: request.difficulty,
        category: request.topic.toLowerCase(),
        subscriptionTier: 'premium',
        isAiGenerated: true,
        aiPrompt: JSON.stringify(request),
        authorId: userId,
        isPublic: false, // AI-generated plans are private by default
      })
      .returning({ id: readingPlans.id });

    const planId = plan.id;

    // Insert the daily content
    const dayInserts = generatedPlan.days.map(day => ({
      planId,
      dayNumber: day.dayNumber,
      title: day.title,
      scriptureReference: day.scriptureReference,
      devotionalContent: day.devotionalContent,
      reflectionQuestion: day.reflectionQuestion,
      prayerPrompt: day.prayerPrompt,
      estimatedReadingTime: day.estimatedReadingTime,
      tags: [request.topic, 'ai-generated', request.difficulty]
    }));

    await db.insert(readingPlanDays).values(dayInserts);

    return planId;
  } catch (error) {
    console.error('Error saving generated plan:', error);
    throw new Error('Failed to save AI-generated reading plan');
  }
}

export async function generatePersonalizedAudioPlan(
  topic: string,
  duration: number,
  userPreferences: {
    timeOfDay: 'morning' | 'afternoon' | 'evening';
    sessionLength: number; // minutes
    voicePreference?: string;
  }
): Promise<GeneratedPlan> {
  try {
    const prompt = `Create a ${duration}-day audio Bible reading plan for "${topic}" designed for ${userPreferences.timeOfDay} listening sessions of approximately ${userPreferences.sessionLength} minutes each.

    Focus on:
    - Scripture passages suitable for audio consumption
    - Devotional content that works well when heard rather than read
    - Reflection questions that can be pondered during commutes or quiet moments
    - Prayer prompts that flow naturally from the audio experience
    
    Consider the user's preferred listening time: ${userPreferences.timeOfDay}
    
    Respond with the same JSON format as previous plans, ensuring content is optimized for audio experience.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are creating audio-optimized Bible reading plans. Focus on content that works well when listened to rather than read."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });

    return JSON.parse(response.choices[0].message.content) as GeneratedPlan;
  } catch (error) {
    console.error('Error generating audio plan:', error);
    throw new Error('Failed to generate AI-powered audio plan');
  }
}