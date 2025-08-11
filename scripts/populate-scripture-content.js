/**
 * Script to populate placeholder scripture text with real Bible content
 * This script replaces "[Full text of... would be inserted here]" with actual verse text
 */

// Since this runs in the project context, we can use process.env directly
const pool = {
  query: async (text, params) => {
    // Use the existing database connection from the project
    const { default: pg } = await import('pg');
    const client = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      await client.end();
    }
  },
  end: async () => {
    // No-op since we're creating connections per query
  }
};

// Simple Bible verse lookup using OpenAI
async function lookupBibleVerse(reference, version = 'NIV') {
  try {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return null;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a Bible verse lookup assistant. Provide ONLY the exact verse text from the ${version} translation without any commentary, explanations, or additional text.`
          },
          {
            role: 'user',
            content: `Please provide the exact text of ${reference} from the ${version} Bible translation.`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return null;
    }

    return {
      reference,
      text: content.trim(),
      version,
      source: 'ChatGPT API'
    };
  } catch (error) {
    return null;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function populateScriptureContent() {
  console.log('🔍 Starting scripture content population...');

  try {
    // Get all reading plan days with placeholder text
    const placeholderQuery = `
      SELECT 
        rpd.id,
        rpd.plan_id,
        rpd.day_number,
        rpd.scripture_reference,
        rp.name as plan_name
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rpd.plan_id = rp.id
      WHERE rpd.scripture_text LIKE '%Full text of%would be inserted here%'
      ORDER BY rpd.plan_id, rpd.day_number
    `;
    
    const result = await pool.query(placeholderQuery);
    const placeholderDays = result.rows;
    
    console.log(`📊 Found ${placeholderDays.length} days with placeholder text`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const day of placeholderDays) {
      try {
        console.log(`📖 Processing: ${day.plan_name} - Day ${day.day_number} (${day.scripture_reference})`);
        
        // Try to get the Bible verse content
        const bibleResult = await lookupBibleVerse(day.scripture_reference, 'NIV');
        let verseData = null;
        
        if (bibleResult) {
          verseData = {
            text: bibleResult.text,
            reference: bibleResult.reference,
            translation: bibleResult.version,
            source: bibleResult.source
          };
        }
        
        if (verseData && verseData.text) {
          // Update the database with real scripture content
          await pool.query(
            'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
            [verseData.text, day.id]
          );
          
          successCount++;
          console.log(`✅ Updated: ${day.scripture_reference}`);
        } else {
          // If we can't get the verse, at least remove the placeholder
          const fallbackText = `Scripture reference: ${day.scripture_reference}. Please refer to your Bible for the full text.`;
          await pool.query(
            'UPDATE reading_plan_days SET scripture_text = $1 WHERE id = $2',
            [fallbackText, day.id]
          );
          
          failureCount++;
          console.log(`⚠️ Could not fetch: ${day.scripture_reference} - used fallback`);
        }
        
        // Add small delay to avoid overwhelming APIs
        await sleep(100);
        
        // Progress update every 20 items
        if ((successCount + failureCount) % 20 === 0) {
          console.log(`📈 Progress: ${successCount + failureCount}/${placeholderDays.length} processed`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${day.scripture_reference}:`, error.message);
        failureCount++;
      }
    }
    
    console.log('\n🎉 Scripture population completed!');
    console.log(`✅ Successfully populated: ${successCount} days`);
    console.log(`⚠️ Failed/fallback: ${failureCount} days`);
    console.log(`📊 Total processed: ${successCount + failureCount} days`);
    
  } catch (error) {
    console.error('💥 Fatal error during scripture population:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
populateScriptureContent().catch(console.error);