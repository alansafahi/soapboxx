import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, like } from 'drizzle-orm';

async function fetchScriptureFromAPI(reference) {
  try {
    // Convert reference to URL format (e.g., "Genesis 1" -> "genesis+1")
    const urlRef = reference.toLowerCase().replace(/\s+/g, '+').replace(/:/g, '.');
    
    const response = await fetch(`https://bible-api.com/${urlRef}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.text || null;
  } catch (error) {
    console.log(`   ❌ API failed for ${reference}: ${error.message}`);
    return null;
  }
}

async function populateAllScripture() {
  try {
    console.log('🔍 Finding all days with placeholder scripture...');
    
    // Find all days with placeholder scripture text in Old Testament plan
    const placeholderDays = await db
      .select()
      .from(readingPlanDays)
      .where(
        and(
          eq(readingPlanDays.planId, 23), // Old Testament in a Year plan ID
          like(readingPlanDays.scriptureText, '%[Full text of%would be inserted here]%')
        )
      )
      .orderBy(readingPlanDays.dayNumber);
    
    console.log(`📚 Found ${placeholderDays.length} days needing authentic scripture`);
    
    if (placeholderDays.length === 0) {
      console.log('✅ All days already have authentic scripture!');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    let batchCount = 0;
    const batchSize = 10;
    
    // Process in batches to avoid overwhelming the API
    for (let i = 0; i < placeholderDays.length; i += batchSize) {
      const batch = placeholderDays.slice(i, i + batchSize);
      batchCount++;
      
      console.log(`\n📦 Processing Batch ${batchCount} (${batch.length} days):`);
      
      for (const day of batch) {
        try {
          const reference = day.scriptureReference;
          if (!reference || reference === 'TBD') {
            console.log(`   ⏭️  Skipping Day ${day.dayNumber} - no reference`);
            continue;
          }
          
          console.log(`   📖 Day ${day.dayNumber}: ${reference}`);
          
          const scriptureText = await fetchScriptureFromAPI(reference);
          
          if (scriptureText) {
            // Update database with authentic scripture
            await db
              .update(readingPlanDays)
              .set({ scriptureText })
              .where(eq(readingPlanDays.id, day.id));
            
            console.log(`   ✅ Updated (${scriptureText.length} chars)`);
            successCount++;
          } else {
            console.log(`   ❌ Failed to fetch`);
            errorCount++;
          }
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 300));
          
        } catch (error) {
          console.error(`   ❌ Error Day ${day.dayNumber}:`, error.message);
          errorCount++;
        }
      }
      
      // Longer delay between batches
      if (i + batchSize < placeholderDays.length) {
        console.log(`   ⏳ Batch complete, waiting before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n📊 Scripture Population Results:`);
    console.log(`   ✅ Successfully updated: ${successCount} days`);
    console.log(`   ❌ Failed to fetch: ${errorCount} days`);
    console.log(`   📚 Total processed: ${successCount + errorCount} days`);
    console.log(`   📈 Success rate: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);
    
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

// Run the script
populateAllScripture().then(() => {
  console.log('\n🏁 Scripture population completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});