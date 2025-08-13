import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function addReflectionQuestions() {
  console.log('🔧 Adding reflection questions to Old Testament days...');
  
  const reflectionTemplate = `How does this passage reveal God's character and His relationship with His people? What specific attributes of God do you see displayed in this text?

What themes of faith, obedience, or covenant relationship emerge from this narrative? How do these ancient themes connect to your personal spiritual journey today?

In what ways does this passage speak to contemporary challenges you face? How can the principles and truths demonstrated here guide your decisions and relationships?

What does this text teach about the nature of spiritual growth and maturity? How is God calling you to deeper commitment and trust through these ancient words?`;

  // Get first 50 days that need reflection questions
  const days = await db
    .select()
    .from(readingPlanDays)
    .where(eq(readingPlanDays.planId, 23))
    .orderBy(readingPlanDays.dayNumber)
    .limit(50);

  let updated = 0;
  
  for (const day of days) {
    if (day.reflectionQuestions && day.reflectionQuestions.length > 50) {
      continue;
    }

    try {
      await db
        .update(readingPlanDays)
        .set({ reflectionQuestions: reflectionTemplate })
        .where(eq(readingPlanDays.id, day.id));
      
      console.log(`✅ Added reflection questions to Day ${day.dayNumber}`);
      updated++;
    } catch (error) {
      console.log(`❌ Error updating Day ${day.dayNumber}`);
    }
  }

  console.log(`📊 Updated ${updated} days with reflection questions`);
}

addReflectionQuestions().catch(console.error);