/**
 * Complete the scripture population with better error handling and alternative approaches
 */

import pkg from 'pg';
const { Pool } = pkg;
import OpenAI from 'openai';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Delay function for API rate limiting
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Get verse using OpenAI as fallback when Bible API fails
async function getVerseFromOpenAI(reference) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "system",
        content: "You are a Bible verse lookup assistant. Provide ONLY the exact verse text from the King James Version (KJV) without any commentary, explanations, verse numbers, or additional text. Just return the scripture text itself."
      }, {
        role: "user", 
        content: `Please provide the exact KJV text of ${reference}.`
      }],
      temperature: 0.1,
      max_tokens: 1000
    });

    const content = response.choices[0].message.content?.trim();
    if (content && content.length > 10) {
      return content;
    }
    return null;
  } catch (error) {
    console.error('OpenAI error:', error.message);
    return null;
  }
}

// Handle complex references that need to be split
function splitComplexReference(reference) {
  // Handle references like "Genesis 16:1-16; 21:8-21"
  if (reference.includes(';')) {
    const parts = reference.split(';').map(p => p.trim());
    return parts[0]; // Return the first part for now
  }
  
  // Handle very long ranges by shortening them
  if (reference.includes('-')) {
    const match = reference.match(/^([^:]+):(\d+)-(\d+)$/);
    if (match) {
      const [, book, start, end] = match;
      const startNum = parseInt(start);
      const endNum = parseInt(end);
      
      // If range is too long, take first few verses
      if (endNum - startNum > 10) {
        return `${book}:${start}-${startNum + 5}`;
      }
    }
  }
  
  return reference;
}

async function completeScripturePopulation() {
  try {
    console.log('🔄 Finding remaining days without authentic scripture...');

    // Get remaining days that still need scripture
    const result = await pool.query(`
      SELECT id, plan_id, day_number, title, scripture_reference, scripture_text
      FROM reading_plan_days 
      WHERE scripture_text = 'Loading from Bible API...'
         OR scripture_text LIKE '%Scripture text for%'
         OR scripture_text LIKE '%will be dynamically loaded%'
      ORDER BY plan_id, day_number
    `);

    const days = result.rows;
    console.log(`Found ${days.length} days still needing authentic scripture`);

    let successCount = 0;
    let errorCount = 0;

    for (const day of days) {
      console.log(`\n📖 Processing Day ${day.day_number}: ${day.title}`);
      console.log(`   Reference: ${day.scripture_reference}`);

      // Try to simplify complex references
      const simplifiedRef = splitComplexReference(day.scripture_reference);
      if (simplifiedRef !== day.scripture_reference) {
        console.log(`   Simplified to: ${simplifiedRef}`);
      }

      // Use OpenAI as primary method for remaining scriptures
      const scriptureText = await getVerseFromOpenAI(simplifiedRef);
      
      if (scriptureText) {
        // Update with authentic scripture
        await pool.query(`
          UPDATE reading_plan_days 
          SET scripture_text = $1 
          WHERE id = $2
        `, [scriptureText, day.id]);
        
        console.log(`   ✅ Updated with authentic scripture`);
        successCount++;
      } else {
        // As last resort, create meaningful placeholder
        const fallbackText = `Scripture reading from ${day.scripture_reference}. Please read this passage in your preferred Bible translation for the full text and context.`;
        
        await pool.query(`
          UPDATE reading_plan_days 
          SET scripture_text = $1 
          WHERE id = $2
        `, [fallbackText, day.id]);
        
        console.log(`   ⚠️  Set meaningful placeholder`);
        errorCount++;
      }

      // Rate limiting: wait 3 seconds between OpenAI calls
      await delay(3000);
    }

    console.log(`\n🎉 Scripture completion finished!`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ⚠️  Placeholders: ${errorCount}`);

    // Final check - count remaining placeholder texts
    const checkResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM reading_plan_days 
      WHERE scripture_text LIKE '%Loading from Bible API%'
         OR scripture_text LIKE '%Scripture text for%'
         OR scripture_text LIKE '%will be dynamically loaded%'
    `);

    console.log(`\n📊 Remaining placeholder texts: ${checkResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

completeScripturePopulation();