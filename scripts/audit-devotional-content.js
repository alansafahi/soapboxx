import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and } from 'drizzle-orm';

async function auditDevotionalContent() {
  console.log('🔍 Auditing Old Testament in a Year plan for missing devotional content...');
  
  // Get all days for the Old Testament plan (ID 23)
  const allDays = await db
    .select()
    .from(readingPlanDays)
    .where(eq(readingPlanDays.planId, 23))
    .orderBy(readingPlanDays.dayNumber);

  console.log(`📖 Found ${allDays.length} total days in Old Testament plan`);

  // Check for various content issues
  const issues = {
    missingDevotional: [],
    shortDevotional: [],
    missingReflection: [],
    genericContent: [],
    missingScripture: []
  };

  for (const day of allDays) {
    // Check for missing or very short devotional content
    if (!day.devotionalContent) {
      issues.missingDevotional.push(day);
    } else if (day.devotionalContent.length < 500) {
      issues.shortDevotional.push(day);
    }

    // Check for missing reflection questions (correct field name)
    if (!day.reflectionQuestion || day.reflectionQuestion.length < 100) {
      issues.missingReflection.push(day);
    }

    // Check for generic patterns
    if (day.devotionalContent && (
      day.devotionalContent.includes('establishes') ||
      day.devotionalContent.includes('demonstrates') ||
      day.devotionalContent.includes('reveals fundamental') ||
      day.devotionalContent.includes('Today\'s Old Testament passage')
    )) {
      issues.genericContent.push(day);
    }

    // Check for missing scripture
    if (!day.scriptureText || day.scriptureText.includes('Loading') || day.scriptureText.length < 50) {
      issues.missingScripture.push(day);
    }
  }

  // Report findings
  console.log('\n📊 AUDIT RESULTS:');
  console.log(`✅ Total days: ${allDays.length}`);
  
  if (issues.missingDevotional.length > 0) {
    console.log(`❌ Missing devotional content: ${issues.missingDevotional.length} days`);
    issues.missingDevotional.slice(0, 10).forEach(day => {
      console.log(`   - Day ${day.dayNumber}: ${day.title}`);
    });
  } else {
    console.log(`✅ All days have devotional content`);
  }

  if (issues.shortDevotional.length > 0) {
    console.log(`⚠️  Short devotional content (< 500 chars): ${issues.shortDevotional.length} days`);
    issues.shortDevotional.slice(0, 10).forEach(day => {
      console.log(`   - Day ${day.dayNumber}: ${day.title} (${day.devotionalContent?.length || 0} chars)`);
    });
  } else {
    console.log(`✅ All devotional content is substantial`);
  }

  if (issues.missingReflection.length > 0) {
    console.log(`❌ Missing or short reflection questions: ${issues.missingReflection.length} days`);
    issues.missingReflection.slice(0, 15).forEach(day => {
      console.log(`   - Day ${day.dayNumber}: ${day.title} (${day.reflectionQuestion?.length || 0} chars)`);
    });
    if (issues.missingReflection.length > 15) {
      console.log(`   ... and ${issues.missingReflection.length - 15} more days`);
    }
  } else {
    console.log(`✅ All days have substantial reflection questions`);
  }

  if (issues.genericContent.length > 0) {
    console.log(`⚠️  Generic devotional patterns: ${issues.genericContent.length} days`);
    issues.genericContent.slice(0, 10).forEach(day => {
      console.log(`   - Day ${day.dayNumber}: ${day.title}`);
    });
  } else {
    console.log(`✅ All devotional content is personalized`);
  }

  if (issues.missingScripture.length > 0) {
    console.log(`❌ Missing or incomplete scripture: ${issues.missingScripture.length} days`);
    issues.missingScripture.slice(0, 10).forEach(day => {
      console.log(`   - Day ${day.dayNumber}: ${day.title}`);
    });
  } else {
    console.log(`✅ All days have complete scripture text`);
  }

  console.log('\n🎯 PRIORITY ACTIONS NEEDED:');
  if (issues.missingReflection.length > 0) {
    console.log(`1. Add reflection questions to ${issues.missingReflection.length} days`);
  }
  if (issues.shortDevotional.length > 0) {
    console.log(`2. Enhance ${issues.shortDevotional.length} days with short devotional content`);
  }
  if (issues.genericContent.length > 0) {
    console.log(`3. Replace generic patterns in ${issues.genericContent.length} days`);
  }
  if (issues.missingScripture.length > 0) {
    console.log(`4. Populate scripture for ${issues.missingScripture.length} days`);
  }

  return issues;
}

auditDevotionalContent().catch(console.error);