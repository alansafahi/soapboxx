import OpenAI from "openai";
import { db } from "../db.js";
import { readingPlans, readingPlanDays } from "../../shared/schema.js";
import { eq, and, isNull } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ReadingPlanContentRequest {
  planId: number;
  planName: string;
  description: string;
  type: string;
  duration: number;
  difficulty: string;
  category: string;
  subscriptionTier: string;
  isAiGenerated?: boolean;
}

export interface GeneratedDayContent {
  dayNumber: number;
  title: string;
  scriptureReference: string;
  scriptureText: string;
  devotionalContent: string;
  reflectionQuestion: string;
  prayerPrompt: string;
  additionalVerses?: string[];
  tags?: string[];
  estimatedReadingTime: number;
}

export async function generateReadingPlanContent(
  plan: ReadingPlanContentRequest
): Promise<GeneratedDayContent[]> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a biblical scholar and spiritual content creator. Generate authentic, meaningful daily reading content for a ${plan.duration}-day reading plan titled "${plan.planName}".
          
          Plan Details:
          - Type: ${plan.type}
          - Difficulty: ${plan.difficulty}
          - Category: ${plan.category}
          - Subscription Tier: ${plan.subscriptionTier}
          - Description: ${plan.description}
          
          Requirements:
          1. Each day should have a clear scripture reference and authentic biblical text
          2. Devotional content should be 200-400 words, theologically sound, and spiritually encouraging
          3. Reflection questions should be thought-provoking and personal
          4. Prayer prompts should be specific and heartfelt
          5. Additional verses should complement the main passage
          6. Estimated reading time should be realistic (5-15 minutes typically)
          7. Content should progressively build throughout the plan
          8. Use a variety of biblical books and themes appropriate to the plan type
          
          Tier-Specific Guidelines:
          - Disciple (Free): Focus on foundational truths, simple applications, basic spiritual concepts
          - Servant (Standard): Include deeper theological insights, character development, leadership themes  
          - Torchbearer (Premium): Advanced spiritual concepts, leadership development, complex theological discussions
          
          Respond with a JSON object containing an array of ${plan.duration} days of content.`
        },
        {
          role: "user",
          content: `Generate all ${plan.duration} days of content for this reading plan. Each day should follow this exact JSON structure:
          
          {
            "days": [
              {
                "dayNumber": 1,
                "title": "Day title that captures the theme",
                "scriptureReference": "Book Chapter:Verse-Verse format",
                "scriptureText": "The actual biblical text",
                "devotionalContent": "Meaningful devotional content 200-400 words",
                "reflectionQuestion": "Thought-provoking personal question",
                "prayerPrompt": "Specific prayer guide",
                "additionalVerses": ["Reference1", "Reference2"],
                "tags": ["tag1", "tag2", "tag3"],
                "estimatedReadingTime": 8
              }
            ]
          }`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.days as GeneratedDayContent[];

  } catch (error) {
    console.error(`Failed to generate content for plan ${plan.planName}:`, error);
    throw error;
  }
}

export async function bulkGenerateContentForEmptyPlans() {
  try {
    // Get all plans without content
    const emptyPlans = await db.select()
      .from(readingPlans)
      .leftJoin(readingPlanDays, eq(readingPlans.id, readingPlanDays.planId))
      .where(and(
        eq(readingPlans.isActive, true),
        isNull(readingPlanDays.planId)
      ));

    console.log(`Found ${emptyPlans.length} plans without content`);

    for (const planRow of emptyPlans) {
      const plan = planRow.reading_plans;
      if (!plan) continue;

      console.log(`Generating content for: ${plan.name} (${plan.duration} days)`);

      try {
        const contentRequest: ReadingPlanContentRequest = {
          planId: plan.id,
          planName: plan.name,
          description: plan.description || "",
          type: plan.type,
          duration: plan.duration,
          difficulty: plan.difficulty || "beginner",
          category: plan.category,
          subscriptionTier: plan.subscriptionTier || "disciple",
          isAiGenerated: true
        };

        const generatedContent = await generateReadingPlanContent(contentRequest);

        // Insert generated content into database
        const dayData = generatedContent.map(day => ({
          planId: plan.id,
          dayNumber: day.dayNumber,
          title: day.title,
          scriptureReference: day.scriptureReference,
          scriptureText: day.scriptureText,
          devotionalContent: day.devotionalContent,
          reflectionQuestion: day.reflectionQuestion,
          prayerPrompt: day.prayerPrompt,
          additionalVerses: day.additionalVerses || [],
          tags: day.tags || [],
          estimatedReadingTime: day.estimatedReadingTime
        }));

        await db.insert(readingPlanDays).values(dayData);

        // Mark plan as AI-generated
        await db.update(readingPlans)
          .set({ 
            isAiGenerated: true,
            aiPrompt: `Generated content for ${plan.type} reading plan focusing on ${plan.category}`,
            updatedAt: new Date()
          })
          .where(eq(readingPlans.id, plan.id));

        console.log(`✅ Generated ${generatedContent.length} days for ${plan.name}`);

        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Failed to generate content for ${plan.name}:`, error);
        // Continue with next plan instead of stopping entire process
        continue;
      }
    }

    console.log("🎉 Bulk content generation completed!");

  } catch (error) {
    console.error("Failed bulk content generation:", error);
    throw error;
  }
}

export async function generateContentForSpecificPlan(planId: number) {
  const plan = await db.select().from(readingPlans).where(eq(readingPlans.id, planId)).limit(1);
  
  if (!plan.length) {
    throw new Error(`Plan with ID ${planId} not found`);
  }

  const planData = plan[0];
  const contentRequest: ReadingPlanContentRequest = {
    planId: planData.id,
    planName: planData.name,
    description: planData.description || "",
    type: planData.type,
    duration: planData.duration,
    difficulty: planData.difficulty || "beginner",
    category: planData.category,
    subscriptionTier: planData.subscriptionTier || "disciple",
    isAiGenerated: true
  };

  const generatedContent = await generateReadingPlanContent(contentRequest);

  // Delete existing content if any
  await db.delete(readingPlanDays).where(eq(readingPlanDays.planId, planId));

  // Insert new content
  const dayData = generatedContent.map(day => ({
    planId: planData.id,
    dayNumber: day.dayNumber,
    title: day.title,
    scriptureReference: day.scriptureReference,
    scriptureText: day.scriptureText,
    devotionalContent: day.devotionalContent,
    reflectionQuestion: day.reflectionQuestion,
    prayerPrompt: day.prayerPrompt,
    additionalVerses: day.additionalVerses || [],
    tags: day.tags || [],
    estimatedReadingTime: day.estimatedReadingTime
  }));

  await db.insert(readingPlanDays).values(dayData);

  // Mark plan as AI-generated
  await db.update(readingPlans)
    .set({ 
      isAiGenerated: true,
      aiPrompt: `Regenerated content for ${planData.type} reading plan focusing on ${planData.category}`,
      updatedAt: new Date()
    })
    .where(eq(readingPlans.id, planId));

  return generatedContent;
}