/**
 * Fix Placeholder Bible Verses - Replace with Authentic Scripture
 * Uses OpenAI GPT-4o to get real Bible verses for all placeholder content
 */

import OpenAI from "openai";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function fixPlaceholderVerses() {
  console.log('🔍 Starting Bible verse authenticity fix...');

  // Get all placeholder verses
  const placeholderQuery = `
    SELECT id, reference, translation, text 
    FROM bible_verses 
    WHERE text LIKE '%Scripture according to%' 
       OR text LIKE '%GOD''s Word according to%' 
       OR text LIKE '%GOD''s Message according to%'
    ORDER BY reference, translation
    LIMIT 100;
  `;

  const placeholders = await pool.query(placeholderQuery);
  console.log(`📊 Found ${placeholders.rows.length} placeholder verses to fix`);

  let fixed = 0;
  let errors = 0;

  for (const row of placeholders.rows) {
    try {
      console.log(`🔄 Fixing ${row.reference} (${row.translation})`);
      
      // Get authentic verse from OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are a Biblical scholar. Provide the exact, authentic Bible verse text for the requested reference and translation. Return only the verse text without commentary or additional information. Be precise and accurate.`
          },
          {
            role: "user", 
            content: `Please provide the exact text of ${row.reference} from the ${row.translation} translation of the Bible.`
          }
        ],
        max_tokens: 300,
        temperature: 0.1
      });

      const authenticVerse = response.choices[0]?.message?.content?.trim();
      
      if (authenticVerse && authenticVerse.length > 10) {
        // Update database with authentic verse
        await pool.query(
          'UPDATE bible_verses SET text = $1 WHERE id = $2',
          [authenticVerse, row.id]
        );
        
        console.log(`✅ Fixed: ${row.reference} (${row.translation})`);
        fixed++;
        
        // Small delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        console.log(`❌ Failed to get verse: ${row.reference} (${row.translation})`);
        errors++;
      }

    } catch (error) {
      console.error(`❌ Error fixing ${row.reference}:`, error.message);
      errors++;
    }
  }

  console.log(`\n📈 Results:`);
  console.log(`✅ Fixed: ${fixed} verses`);
  console.log(`❌ Errors: ${errors} verses`);
  console.log(`🎯 Bible authenticity restoration in progress...`);

  await pool.end();
}

// Run the fix
fixPlaceholderVerses().catch(console.error);