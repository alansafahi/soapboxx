import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, like } from 'drizzle-orm';
import { lookupBibleVerse } from '../server/bible-api.ts';

async function populateScriptureForDays() {
  try {
    console.log('🔍 Finding days with placeholder scripture...');
    
    // Find all days with placeholder scripture text
    const placeholderDays = await db
      .select()
      .from(readingPlanDays)
      .where(
        and(
          eq(readingPlanDays.planId, 23), // Old Testament in a Year plan ID
          like(readingPlanDays.scriptureText, '%[Full text of%would be inserted here]%')
        )
      );
    
    console.log(`📚 Found ${placeholderDays.length} days with placeholder scripture`);
    
    if (placeholderDays.length === 0) {
      console.log('✅ All days already have authentic scripture!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const day of placeholderDays) {
      try {
        console.log(`\n📖 Processing Day ${day.dayNumber}: ${day.scriptureReference}`);
        
        // Extract book and chapter from scripture reference
        const reference = day.scriptureReference;
        if (!reference || reference === 'TBD') {
          console.log(`⏭️  Skipping day ${day.dayNumber} - no reference available`);
          continue;
        }
        
        // Lookup the actual Bible text
        const verseResult = await lookupBibleVerse(reference, 'NIV');
        
        if (verseResult && verseResult.text) {
          // Update the database with authentic scripture
          await db
            .update(readingPlanDays)
            .set({
              scriptureText: verseResult.text
            })
            .where(eq(readingPlanDays.id, day.id));
          
          console.log(`✅ Updated Day ${day.dayNumber} with authentic scripture (${verseResult.text.length} characters)`);
          successCount++;
        } else {
          console.log(`❌ Failed to fetch scripture for Day ${day.dayNumber}: ${reference}`);
          errorCount++;
        }
        
        // Add small delay to be respectful to API
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`❌ Error processing Day ${day.dayNumber}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Scripture Population Complete:`);
    console.log(`✅ Successfully updated: ${successCount} days`);
    console.log(`❌ Failed: ${errorCount} days`);
    console.log(`📚 Total processed: ${successCount + errorCount} days`);
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the script
populateScriptureForDays().then(() => {
  console.log('🏁 Scripture population script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});