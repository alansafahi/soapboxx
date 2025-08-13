import { db } from '../server/db.ts';
import { readingPlanDays } from '../shared/schema.ts';
import { eq, and, like } from 'drizzle-orm';

// Map of books with their actual chapter counts
const bookChapterCounts = {
  'Obadiah': 1,      // Only 1 chapter
  'Jonah': 4,        // 4 chapters
  'Micah': 7,        // 7 chapters  
  'Nahum': 3,        // 3 chapters
  'Habakkuk': 3,     // 3 chapters
  'Zephaniah': 3,    // 3 chapters
  'Haggai': 2,       // 2 chapters
  'Joel': 3,         // 3 chapters
  'Amos': 9,         // 9 chapters
  'Hosea': 14,       // 14 chapters
  'Song of Songs': 8, // 8 chapters
  'Daniel': 12       // 12 chapters
};

async function fixInvalidReferences() {
  try {
    console.log('🔧 Fixing invalid chapter references...');
    
    // Get all days with placeholder scripture
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
    
    let fixedCount = 0;
    
    for (const day of placeholderDays) {
      const reference = day.scriptureReference;
      if (!reference || reference === 'TBD') continue;
      
      // Parse the reference to get book and chapter
      const parts = reference.split(' ');
      let bookName = parts[0];
      
      // Handle "Song of Songs"
      if (bookName === 'Song') {
        bookName = 'Song of Songs';
      }
      
      if (bookChapterCounts[bookName]) {
        const chapterMatch = reference.match(/(\d+)$/);
        if (chapterMatch) {
          const requestedChapter = parseInt(chapterMatch[1]);
          const maxChapters = bookChapterCounts[bookName];
          
          if (requestedChapter > maxChapters) {
            // Calculate which chapter to use (cycle through available chapters)
            const actualChapter = ((requestedChapter - 1) % maxChapters) + 1;
            const newReference = bookName === 'Song of Songs' 
              ? `Song of Songs ${actualChapter}`
              : `${bookName} ${actualChapter}`;
            
            console.log(`📝 Day ${day.dayNumber}: ${reference} → ${newReference}`);
            
            // Update the reference
            await db
              .update(readingPlanDays)
              .set({ 
                scriptureReference: newReference,
                title: `Day ${day.dayNumber}: ${newReference}`
              })
              .where(eq(readingPlanDays.id, day.id));
            
            fixedCount++;
          }
        }
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} invalid references`);
    
  } catch (error) {
    console.error('💥 Reference fix failed:', error);
  }
}

// Run the fix
fixInvalidReferences().then(() => {
  console.log('🏁 Reference fix completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script crashed:', error);
  process.exit(1);
});