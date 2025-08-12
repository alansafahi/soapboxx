const { db } = require('../server/db.js');
const { readingPlanDays, readingPlans } = require('../shared/schema.js');
const { eq, and, like, or } = require('drizzle-orm');

async function fixPlaceholderContent() {
  console.log('🔍 Identifying plans with placeholder content...');
  
  // Find all plans with placeholder scripture
  const placeholderDays = await db.select({
    planId: readingPlanDays.planId,
    dayNumber: readingPlanDays.dayNumber,
    title: readingPlanDays.title,
    scriptureReference: readingPlanDays.scriptureReference,
    scriptureText: readingPlanDays.scriptureText
  })
  .from(readingPlanDays)
  .where(
    or(
      like(readingPlanDays.scriptureText, '%would be inserted here%'),
      like(readingPlanDays.scriptureText, '%[Scripture%'),
      like(readingPlanDays.devotionalContent, '%Today we learn from%Their life demonstrates%')
    )
  );
  
  console.log(`Found ${placeholderDays.length} days with placeholder content across multiple plans`);
  
  // Group by plan ID
  const planGroups = placeholderDays.reduce((acc, day) => {
    if (!acc[day.planId]) acc[day.planId] = [];
    acc[day.planId].push(day);
    return acc;
  }, {});
  
  console.log('Plans with placeholder content:', Object.keys(planGroups));
  
  // Get plan names for the problematic plans
  const planIds = Object.keys(planGroups).map(id => parseInt(id));
  const planInfo = await db.select({
    id: readingPlans.id,
    name: readingPlans.name
  })
  .from(readingPlans)
  .where(readingPlans.id.in(planIds));
  
  console.log('\nProblematic Plans:');
  planInfo.forEach(plan => {
    console.log(`- Plan ${plan.id}: "${plan.name}" (${planGroups[plan.id].length} days)`);
  });
  
  return { planGroups, planInfo };
}

// Run the analysis
fixPlaceholderContent().catch(console.error);