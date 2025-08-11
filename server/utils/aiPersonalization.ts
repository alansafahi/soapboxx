import OpenAI from "openai";
import { db } from "../db.js";
import { users, enhancedMoodIndicators, weeklyCheckins, readingPlanDays } from "../../shared/schema.js";
import { eq, desc, and } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface UserContext {
  userId: string;
  currentMood?: string[];
  spiritualMaturity?: string;
  recentCheckins?: any[];
  spiritualGifts?: string[];
  growthGoals?: string[];
  ministryInterests?: string[];
  currentStruggles?: string;
  prayerFocus?: string;
}

export interface PersonalizedContent {
  reflectionQuestion: string;
  prayerPrompt: string;
  personalApplication: string;
  encouragement: string;
}

export async function getUserContext(userId: string): Promise<UserContext> {
  // Get user profile data
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length) {
    throw new Error("User not found");
  }

  const userData = user[0];

  // Get recent weekly check-ins for spiritual state
  const recentCheckins = await db
    .select()
    .from(weeklyCheckins)
    .where(eq(weeklyCheckins.userId, userId))
    .orderBy(desc(weeklyCheckins.createdAt))
    .limit(3);

  return {
    userId,
    spiritualMaturity: userData.spiritualMaturityLevel || 'growing',
    spiritualGifts: userData.spiritualGifts || [],
    growthGoals: userData.growthGoals || [],
    ministryInterests: userData.ministryInterests || [],
    recentCheckins: recentCheckins
  };
}

export async function generatePersonalizedContent(
  scriptureRef: string,
  scriptureText: string,
  baseDevotional: string,
  userContext: UserContext,
  currentMoodInput?: string
): Promise<PersonalizedContent> {
  try {
    const contextSummary = buildContextSummary(userContext, currentMoodInput);
    
    const prompt = `
You are a wise spiritual director creating personalized Bible study content. 

Scripture: ${scriptureRef}
Text: "${scriptureText}"
Base Devotional: ${baseDevotional}

User Context: ${contextSummary}

Create personalized content that:
1. Connects this scripture to their current spiritual state and circumstances
2. Addresses their specific growth areas or struggles
3. Incorporates their spiritual gifts and ministry interests when relevant
4. Provides encouragement tailored to their maturity level

Generate:
1. A reflection question that speaks to their current situation
2. A prayer prompt that addresses their specific needs
3. A personal application paragraph (2-3 sentences)
4. An encouragement note (1-2 sentences)

Respond in JSON format:
{
  "reflectionQuestion": "...",
  "prayerPrompt": "...", 
  "personalApplication": "...",
  "encouragement": "..."
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a compassionate spiritual director with deep biblical knowledge. Create personalized, encouraging content that meets people where they are in their spiritual journey."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const content = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      reflectionQuestion: content.reflectionQuestion || "How does this passage speak to your current spiritual journey?",
      prayerPrompt: content.prayerPrompt || "Lord, help me apply this truth in my life today.",
      personalApplication: content.personalApplication || "Consider how this scripture applies to your current circumstances.",
      encouragement: content.encouragement || "God is working in your life through His Word."
    };

  } catch (error) {
    console.error('AI personalization error:', error);
    
    // Fallback to contextual but non-AI content
    return generateFallbackContent(scriptureRef, userContext, currentMoodInput);
  }
}

function buildContextSummary(userContext: UserContext, currentMood?: string): string {
  const parts = [];
  
  if (currentMood) {
    parts.push(`Current mood/feelings: ${currentMood}`);
  }
  
  if (userContext.spiritualMaturity) {
    parts.push(`Spiritual maturity: ${userContext.spiritualMaturity}`);
  }
  
  if (userContext.spiritualGifts?.length) {
    parts.push(`Spiritual gifts: ${userContext.spiritualGifts.join(', ')}`);
  }
  
  if (userContext.growthGoals?.length) {
    parts.push(`Growth goals: ${userContext.growthGoals.join(', ')}`);
  }
  
  if (userContext.ministryInterests?.length) {
    parts.push(`Ministry interests: ${userContext.ministryInterests.join(', ')}`);
  }
  
  if (userContext.recentCheckins?.length) {
    const avgGrowth = userContext.recentCheckins.reduce((sum, c) => sum + (c.spiritualGrowth || 3), 0) / userContext.recentCheckins.length;
    const avgPrayer = userContext.recentCheckins.reduce((sum, c) => sum + (c.prayerLife || 3), 0) / userContext.recentCheckins.length;
    parts.push(`Recent spiritual growth: ${avgGrowth.toFixed(1)}/5, Prayer life: ${avgPrayer.toFixed(1)}/5`);
  }
  
  return parts.join('. ') || 'Limited context available - focusing on general spiritual growth.';
}

function generateFallbackContent(scriptureRef: string, userContext: UserContext, currentMood?: string): PersonalizedContent {
  // Create contextual content without AI based on available user data
  let reflectionQuestion = "How does this passage speak to your current spiritual journey?";
  let prayerPrompt = "Lord, help me apply this truth in my life today.";
  let personalApplication = "Consider how this scripture applies to your current circumstances.";
  let encouragement = "God is working in your life through His Word.";
  
  // Customize based on mood if provided
  if (currentMood?.toLowerCase().includes('anxious') || currentMood?.toLowerCase().includes('worried')) {
    reflectionQuestion = "What worries or anxieties can you surrender to God based on this passage?";
    prayerPrompt = "God of peace, help me trust in Your sovereignty over my concerns.";
  } else if (currentMood?.toLowerCase().includes('grateful') || currentMood?.toLowerCase().includes('thankful')) {
    reflectionQuestion = "What specific reasons for gratitude does this passage highlight?";
    prayerPrompt = "Thank You, Lord, for Your faithfulness shown in this passage.";
  } else if (currentMood?.toLowerCase().includes('struggling') || currentMood?.toLowerCase().includes('difficult')) {
    reflectionQuestion = "How does this passage offer hope or guidance for your current struggles?";
    prayerPrompt = "Lord, be my strength and comfort in this challenging time.";
  }
  
  // Customize based on spiritual gifts
  if (userContext.spiritualGifts?.includes('teaching')) {
    personalApplication = "Consider how you might share this truth with others you teach or mentor.";
  } else if (userContext.spiritualGifts?.includes('mercy')) {
    personalApplication = "Reflect on how this passage can help you show compassion to others.";
  } else if (userContext.spiritualGifts?.includes('leadership')) {
    personalApplication = "Think about how this truth can guide your leadership and influence.";
  }
  
  return {
    reflectionQuestion,
    prayerPrompt,
    personalApplication,
    encouragement
  };
}

export async function createEMIPromptForAIPlan(planName: string): Promise<string[]> {
  // Generate EMI prompts to gather current emotional/spiritual state for AI personalization
  const prompts = [
    "How are you feeling today?",
    "What's on your heart as you begin this reading plan?",
    "Are there any specific areas where you'd like to grow spiritually?",
    "What challenges or blessings are you experiencing right now?"
  ];
  
  // Customize prompt based on plan theme
  if (planName.toLowerCase().includes('peace') || planName.toLowerCase().includes('anxiety')) {
    prompts.unshift("What anxieties or worries are weighing on your mind?");
  } else if (planName.toLowerCase().includes('love')) {
    prompts.unshift("How are your relationships going? Where do you need more love?");
  } else if (planName.toLowerCase().includes('wisdom')) {
    prompts.unshift("What decisions or situations need wisdom right now?");
  } else if (planName.toLowerCase().includes('leadership')) {
    prompts.unshift("How are you feeling about your leadership responsibilities?");
  } else if (planName.toLowerCase().includes('joy') || planName.toLowerCase().includes('gratitude')) {
    prompts.unshift("What are you most grateful for today?");
  } else if (planName.toLowerCase().includes('faith') || planName.toLowerCase().includes('pressure')) {
    prompts.unshift("What challenges are testing your faith right now?");
  }
  
  return prompts;
}