import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, like } from 'drizzle-orm';

async function fetchScriptureFromAPI(reference) {
  // Try different variations for Song of Songs
  const variations = [
    reference.replace('Song of Songs', 'Song+of+Songs'),
    reference.replace('Song of Songs', 'Canticles'),
    reference.replace('Song of Songs', 'Solomon'),
    reference.replace('Song of Songs', 'Songs')
  ];
  
  for (const variation of variations) {
    try {
      const urlRef = variation.toLowerCase().replace(/\s+/g, '+').replace(/:/g, '.');
      const response = await fetch(`https://bible-api.com/${urlRef}`);
      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          console.log(`   ✅ Found with variation: ${variation}`);
          return data.text;
        }
      }
    } catch (error) {
      // Try next variation
    }
  }
  return null;
}

async function fixSongOfSongs() {
  try {
    console.log('🎵 Fixing Song of Songs scripture...');
    
    // Get Song of Songs days with placeholder text
    const songDays = await db
      .select()
      .from(readingPlanDays)
      .where(
        and(
          eq(readingPlanDays.planId, 23),
          like(readingPlanDays.scriptureReference, 'Song of Songs%'),
          like(readingPlanDays.scriptureText, '%[Full text of%would be inserted here]%')
        )
      )
      .orderBy(readingPlanDays.dayNumber);
    
    console.log(`📚 Found ${songDays.length} Song of Songs days needing scripture`);
    
    let successCount = 0;
    
    for (const day of songDays) {
      console.log(`📖 Processing Day ${day.dayNumber}: ${day.scriptureReference}`);
      
      const scriptureText = await fetchScriptureFromAPI(day.scriptureReference);
      
      if (scriptureText) {
        await db
          .update(readingPlanDays)
          .set({ scriptureText })
          .where(eq(readingPlanDays.id, day.id));
        
        console.log(`   ✅ Updated (${scriptureText.length} chars)`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to fetch`);
      }
      
      // Delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n✅ Successfully updated ${successCount} Song of Songs days`);
    
  } catch (error) {
    console.error('💥 Song of Songs fix failed:', error);
  }
}

// Run the fix
fixSongOfSongs().then(() => {
  console.log('🏁 Song of Songs fix completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});