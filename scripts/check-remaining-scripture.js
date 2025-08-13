import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, like } from 'drizzle-orm';

async function checkRemainingScripture() {
  try {
    console.log('🔍 Checking remaining scripture status...');
    
    // Find remaining days with placeholder scripture text
    const placeholderDays = await db
      .select({
        id: readingPlanDays.id,
        dayNumber: readingPlanDays.dayNumber,
        title: readingPlanDays.title,
        scriptureReference: readingPlanDays.scriptureReference,
        scriptureLength: readingPlanDays.scriptureText
      })
      .from(readingPlanDays)
      .where(
        and(
          eq(readingPlanDays.planId, 23), // Old Testament in a Year plan ID
          like(readingPlanDays.scriptureText, '%[Full text of%would be inserted here]%')
        )
      )
      .orderBy(readingPlanDays.dayNumber);
    
    console.log(`📚 Found ${placeholderDays.length} days still needing scripture\n`);
    
    if (placeholderDays.length === 0) {
      console.log('✅ All days have authentic scripture!');
      return;
    }
    
    // Group by book to identify patterns
    const bookGroups = {};
    placeholderDays.forEach(day => {
      const reference = day.scriptureReference || 'No Reference';
      const book = reference.split(' ')[0] || 'Unknown';
      if (!bookGroups[book]) {
        bookGroups[book] = [];
      }
      bookGroups[book].push(day);
    });
    
    console.log('📖 Remaining chapters by book:');
    Object.keys(bookGroups).sort().forEach(book => {
      const days = bookGroups[book];
      console.log(`\n${book}: ${days.length} chapters`);
      days.slice(0, 5).forEach(day => {
        console.log(`  Day ${day.dayNumber}: ${day.scriptureReference}`);
      });
      if (days.length > 5) {
        console.log(`  ... and ${days.length - 5} more`);
      }
    });
    
  } catch (error) {
    console.error('💥 Check failed:', error);
  }
}

// Run the check
checkRemainingScripture().then(() => {
  console.log('\n🏁 Scripture check completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});