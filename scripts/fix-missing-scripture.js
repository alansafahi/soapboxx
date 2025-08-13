import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq } from 'drizzle-orm';

async function fetchScriptureText(reference) {
  try {
    console.log(`🔍 Fetching scripture for: ${reference}`);
    
    // Clean up the reference for API call
    const cleanRef = reference.replace(/[\s\-:]/g, '').toLowerCase();
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}`);
    
    if (!response.ok) {
      console.log(`❌ API error for ${reference}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.verses && data.verses.length > 0) {
      const scriptureText = data.verses.map(v => v.text).join(' ');
      console.log(`✅ Retrieved ${scriptureText.length} characters for ${reference}`);
      return scriptureText;
    }
    
    return null;
  } catch (error) {
    console.log(`❌ Error fetching ${reference}:`, error.message);
    return null;
  }
}

async function fixMissingScripture() {
  console.log('🔧 Fixing days with missing scripture text...');
  
  // Get all days and filter for missing scripture
  const allDays = await db
    .select()
    .from(readingPlanDays)
    .where(eq(readingPlanDays.planId, 23))
    .orderBy(readingPlanDays.dayNumber);
  
  const missingScripture = allDays.filter(day => 
    !day.scriptureText || 
    day.scriptureText.includes('Loading') || 
    day.scriptureText.trim().length < 50
  );

  console.log(`📖 Found ${missingScripture.length} days with missing or incomplete scripture`);

  let fixed = 0;
  
  for (const day of missingScripture) {
    if (!day.scriptureReference) {
      console.log(`⚠️  Day ${day.dayNumber} has no scripture reference`);
      continue;
    }

    const scriptureText = await fetchScriptureText(day.scriptureReference);
    
    if (scriptureText) {
      await db
        .update(readingPlanDays)
        .set({ scriptureText })
        .where(eq(readingPlanDays.id, day.id));
      
      console.log(`✅ Fixed Day ${day.dayNumber}: ${day.title}`);
      fixed++;
    } else {
      console.log(`❌ Could not retrieve scripture for Day ${day.dayNumber}: ${day.scriptureReference}`);
    }

    // Rate limiting - wait between API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Results: Fixed ${fixed} days with missing scripture`);
}

fixMissingScripture().catch(console.error);