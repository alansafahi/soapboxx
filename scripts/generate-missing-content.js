#!/usr/bin/env node

/**
 * Script to generate content for all empty reading plans
 * This will populate the 30 plans that currently have no content
 */

import { db } from '../server/db.js';
import { readingPlans, readingPlanDays } from '../shared/schema.js';
import { eq, isNull, sql } from 'drizzle-orm';
import { bulkGenerateContentForEmptyPlans, generateContentForSpecificPlan } from '../server/utils/contentGeneration.js';

async function main() {
  try {
    console.log('🚀 Starting content generation for empty reading plans...\n');

    // Get all empty plans
    const emptyPlansQuery = await db
      .select({
        id: readingPlans.id,
        name: readingPlans.name,
        subscriptionTier: readingPlans.subscriptionTier,
        duration: readingPlans.duration,
        category: readingPlans.category,
        type: readingPlans.type
      })
      .from(readingPlans)
      .leftJoin(readingPlanDays, eq(readingPlans.id, readingPlanDays.planId))
      .where(
        and(
          eq(readingPlans.isActive, true),
          isNull(readingPlanDays.planId)
        )
      );

    console.log(`Found ${emptyPlansQuery.length} empty reading plans to populate\n`);

    let successCount = 0;
    let failCount = 0;

    // Process each empty plan
    for (const plan of emptyPlansQuery) {
      try {
        console.log(`📖 Generating content for: ${plan.name} (${plan.duration} days, ${plan.subscriptionTier} tier)`);
        
        await generateContentForSpecificPlan(plan.id);
        successCount++;
        
        console.log(`✅ Successfully generated content for ${plan.name}`);
        
        // Add delay to respect OpenAI API rate limits
        await new Promise(resolve => setTimeout(resolve, 2500));
        
      } catch (error) {
        failCount++;
        console.error(`❌ Failed to generate content for ${plan.name}:`, error.message);
        continue;
      }
    }

    console.log('\n🎉 Content generation completed!');
    console.log(`✅ Success: ${successCount} plans`);
    console.log(`❌ Failed: ${failCount} plans`);

    // Final status check
    const finalStatus = await db.select({ 
      total: sql`count(*)`,
      withContent: sql`count(distinct plan_id)`
    })
    .from(readingPlans)
    .leftJoin(readingPlanDays, eq(readingPlans.id, readingPlanDays.planId))
    .where(eq(readingPlans.isActive, true));

    console.log(`\n📊 Final Status: ${finalStatus[0].withContent}/${finalStatus[0].total} plans now have content`);

  } catch (error) {
    console.error('❌ Content generation failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);