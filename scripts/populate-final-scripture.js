import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, like } from 'drizzle-orm';
import { lookupBibleVerse } from '../server/bible-api.ts';

async function populateFinalScripture() {
  try {
    console.log('🔍 Finding final days with placeholder scripture...');
    
    // Find remaining days with placeholder scripture text
    const placeholderDays = await db
      .select()
      .from(readingPlanDays)
      .where(
        and(
          eq(readingPlanDays.planId, 23),
          like(readingPlanDays.scriptureText, '%[Full text of%would be inserted here]%')
        )
      )
      .orderBy(readingPlanDays.dayNumber);
    
    console.log(`📚 Found ${placeholderDays.length} days still needing scripture`);
    
    if (placeholderDays.length === 0) {
      console.log('✅ All days have authentic scripture!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process remaining days
    for (const day of placeholderDays) {
      try {
        const reference = day.scriptureReference;
        if (!reference || reference === 'TBD') {
          console.log(`⏭️  Skipping Day ${day.dayNumber} - no reference`);
          continue;
        }
        
        console.log(`📖 Processing Day ${day.dayNumber}: ${reference}`);
        
        // Use our internal Bible lookup service
        const verseResult = await lookupBibleVerse(reference, 'NIV');
        
        if (verseResult && verseResult.text) {
          // Update database with authentic scripture
          await db
            .update(readingPlanDays)
            .set({
              scriptureText: verseResult.text
            })
            .where(eq(readingPlanDays.id, day.id));
          
          console.log(`✅ Updated Day ${day.dayNumber} (${verseResult.text.length} chars)`);
          successCount++;
        } else {
          console.log(`❌ Failed to fetch scripture for Day ${day.dayNumber}`);
          errorCount++;
        }
        
        // Delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`❌ Error processing Day ${day.dayNumber}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Final Results:`);
    console.log(`✅ Successfully updated: ${successCount} days`);
    console.log(`❌ Failed: ${errorCount} days`);
    console.log(`📚 Total processed: ${successCount + errorCount} days`);
    
    if (successCount > 0) {
      console.log(`🎉 Successfully completed final scripture population!`);
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

// Run the script
populateFinalScripture().then(() => {
  console.log('🏁 Final scripture population completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});