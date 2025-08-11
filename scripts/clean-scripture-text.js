/**
 * Clean up scripture text by removing AI conversational prefixes
 * and ensuring only pure Bible content is displayed
 */

async function cleanScriptureText() {
  console.log('🧹 Cleaning scripture text...');

  try {
    const { default: pg } = await import('pg');
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Find entries with conversational AI prefixes
    const result = await pool.query(`
      SELECT 
        id,
        scripture_reference,
        scripture_text
      FROM reading_plan_days 
      WHERE scripture_text LIKE '%Certainly!%'
         OR scripture_text LIKE '%Here is%from the%'
         OR scripture_text LIKE '%Sure, here is%'
         OR scripture_text LIKE '%I''ll provide%'
         OR scripture_text LIKE '%Below is%'
      ORDER BY id
      LIMIT 100
    `);
    
    const entriesToClean = result.rows;
    console.log(`📊 Found ${entriesToClean.length} entries needing cleanup`);
    
    if (entriesToClean.length === 0) {
      console.log('✅ No entries need cleaning!');
      await pool.end();
      return;
    }

    let cleanedCount = 0;

    for (const entry of entriesToClean) {
      try {
        let cleanedText = entry.scripture_text;
        
        // Remove common AI conversational prefixes
        cleanedText = cleanedText
          // Remove "Certainly! Here is [book] from the [version]:"
          .replace(/^Certainly!\s*Here\s+is\s+[^:]+:\s*/i, '')
          // Remove "Sure, here is [book] from the [version]:"
          .replace(/^Sure,?\s*here\s+is\s+[^:]+:\s*/i, '')
          // Remove "Here is [book] from the [version]:"
          .replace(/^Here\s+is\s+[^:]+:\s*/i, '')
          // Remove "[Book] [chapter] from the [version]:"
          .replace(/^[1-3]?\s*[A-Za-z]+\s+\d+(?::\d+)?(?:-\d+)?\s+from\s+the\s+[^:]+:\s*/i, '')
          // Remove "[Book] [chapter] ([version]):"
          .replace(/^[1-3]?\s*[A-Za-z]+\s+\d+(?::\d+)?(?:-\d+)?\s*\([^)]+\):\s*/i, '')
          // Remove "I'll provide" or "Below is" prefixes
          .replace(/^(?:I'll provide|Below is)\s+[^:]+:\s*/i, '')
          // Remove any remaining leading colons or dashes
          .replace(/^[-:]\s*/, '')
          // Clean up extra whitespace
          .replace(/^\s+/, '')
          .trim();

        if (cleanedText !== entry.scripture_text && cleanedText.length > 0) {
          await pool.query(
            'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
            [cleanedText, entry.id]
          );
          
          cleanedCount++;
          console.log(`✅ Cleaned: ${entry.scripture_reference}`);
        }
        
      } catch (error) {
        console.error(`❌ Error cleaning ${entry.scripture_reference}:`, error.message);
      }
    }

    console.log(`\n🎉 Cleanup completed! Cleaned ${cleanedCount} entries`);
    await pool.end();
    
  } catch (error) {
    console.error('💥 Error during cleanup:', error);
  }
}

cleanScriptureText().catch(console.error);