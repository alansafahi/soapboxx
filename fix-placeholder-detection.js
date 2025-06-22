/**
 * Direct Placeholder Detection and Replacement
 * Finds and replaces placeholder Bible verses with authentic scripture
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
  console.log('🔍 Starting placeholder verse detection and replacement...');
  
  try {
    // Find verses with placeholder patterns
    const placeholderQuery = `
      SELECT id, reference, text, translation
      FROM bible_verses 
      WHERE text LIKE '%Scripture according to%'
         OR text LIKE '%GOD''s Word according to%'  
         OR text LIKE '%GOD''s Message according to%'
         OR text LIKE '%Jesus said to them as recorded in%'
         OR text LIKE '%In those days it happened as recorded in%'
         OR text LIKE '%The LORD spoke as written in%'
         OR text LIKE '%As it is written in%'
         OR length(text) < 20
      LIMIT 25
    `;
    
    const result = await pool.query(placeholderQuery);
    const placeholderVerses = result.rows;
    
    console.log(`📊 Found ${placeholderVerses.length} placeholder verses to replace`);
    
    if (placeholderVerses.length === 0) {
      console.log('✅ No placeholder verses found');
      return;
    }
    
    let replacedCount = 0;
    
    for (const verse of placeholderVerses) {
      console.log(`🔄 Processing: ${verse.reference} (${verse.translation})`);
      console.log(`   Placeholder text: "${verse.text}"`);
      
      try {
        // Get authentic verse from OpenAI
        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are a Biblical scholar with access to all major Bible translations. Provide the exact, authentic Bible verse text for the requested reference and translation. Return only the verse text without commentary, quotation marks, or additional information. Be precise and accurate to the specific translation requested."
            },
            {
              role: "user", 
              content: `Please provide the exact text of ${verse.reference} from the ${verse.translation} translation of the Bible.`
            }
          ],
          max_tokens: 300,
          temperature: 0.1
        });

        const authenticText = response.choices[0]?.message?.content?.trim();
        
        if (authenticText && authenticText.length > 10 && !authenticText.toLowerCase().includes('sorry')) {
          // Update database with authentic verse
          const updateQuery = `
            UPDATE bible_verses 
            SET text = $1, updated_at = NOW()
            WHERE id = $2
          `;
          
          await pool.query(updateQuery, [authenticText, verse.id]);
          
          console.log(`✅ Updated ${verse.reference}: "${authenticText}"`);
          replacedCount++;
          
          // Small delay to respect API limits
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          console.log(`❌ Failed to get authentic text for ${verse.reference}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${verse.reference}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully replaced ${replacedCount} placeholder verses with authentic scripture`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixPlaceholderVerses().catch(console.error);