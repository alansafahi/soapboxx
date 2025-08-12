/**
 * Replace all placeholder scripture texts with authentic Bible verses
 */

import pkg from 'pg';
const { Pool } = pkg;
import fetch from 'node-fetch';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Clean verse text by removing HTML tags and formatting
function cleanVerseText(text) {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?\s+in\s+the\s+[^:]+:\s*/i, '')
    .replace(/^[1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?\s*(?:\([^)]+\))?\s*[-:]\s*/i, '')
    .replace(/^[A-Z]{2,5}\s*[-:]\s*/i, '')
    .replace(/^\d+[A-Za-z]?¶/, '')
    .replace(/^\d+[A-Za-z]?\s+/, '')
    .replace(/^\d+[A-Za-z]?(?=[A-Z])/, '')
    .replace(/\[\d+[A-Za-z]?\]/g, '')
    .replace(/\(\d+[A-Za-z]?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch verse from Bible API
async function fetchBibleVerse(reference) {
  try {
    console.log(`Fetching: ${reference}`);
    const encodedRef = encodeURIComponent(reference);
    const response = await fetch(`https://bible-api.com/${encodedRef}?translation=kjv`, {
      headers: { 'User-Agent': 'SoapBox-SuperApp/1.0' },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const cleanedText = cleanVerseText(data.text);
    
    if (cleanedText.length < 10) {
      throw new Error('Verse text too short, likely invalid');
    }
    
    return cleanedText;
  } catch (error) {
    console.error(`Error fetching ${reference}:`, error.message);
    return null;
  }
}

// Delay function to respect API rate limits
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function populateAuthenticScriptures() {
  try {
    console.log('🔄 Fetching all reading plan days with placeholder scripture...');

    // Get all days that need authentic scripture
    const result = await pool.query(`
      SELECT id, plan_id, day_number, title, scripture_reference, scripture_text
      FROM reading_plan_days 
      WHERE scripture_text LIKE '%Loading from Bible API%'
         OR scripture_text LIKE '%Scripture text for%'
         OR scripture_text LIKE '%will be dynamically loaded%'
         OR scripture_text = 'Loading from Bible API...'
      ORDER BY plan_id, day_number
    `);

    const days = result.rows;
    console.log(`Found ${days.length} days needing authentic scripture`);

    let successCount = 0;
    let errorCount = 0;

    for (const day of days) {
      console.log(`\n📖 Processing Day ${day.day_number}: ${day.title}`);
      console.log(`   Reference: ${day.scripture_reference}`);

      // Fetch authentic scripture
      const scriptureText = await fetchBibleVerse(day.scripture_reference);
      
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
        console.log(`   ❌ Failed to fetch scripture`);
        errorCount++;
      }

      // Rate limiting: wait 1 second between requests
      await delay(1000);
    }

    console.log(`\n🎉 Scripture population complete!`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Now update devotional content to be more meaningful
    console.log('\n📝 Updating generic devotional content...');
    
    const devotionalUpdates = [
      {
        searchText: 'Today we explore',
        newText: 'This passage reveals profound spiritual truths that speak directly to our daily walk with God. The words recorded here carry weight and significance that transcends time, offering guidance and wisdom for every believer. As we meditate on these verses, we discover layers of meaning that apply to our current circumstances and spiritual growth.'
      },
      {
        searchText: 'This passage offers profound insights',
        newText: 'These divinely inspired words contain depths of wisdom that reward careful study and reflection. Each phrase has been preserved across millennia to speak into our lives today, offering practical guidance for navigating life\'s challenges while growing in spiritual maturity.'
      },
      {
        searchText: 'Take time to meditate on these verses',
        newText: 'Allow these sacred words to penetrate your heart and mind, transforming how you think and live. Scripture has the power to renew our minds, strengthen our faith, and guide our steps when we approach it with openness and reverence.'
      }
    ];

    for (const update of devotionalUpdates) {
      const updateResult = await pool.query(`
        UPDATE reading_plan_days 
        SET devotional_content = $1
        WHERE devotional_content LIKE $2
      `, [update.newText, `%${update.searchText}%`]);
      
      console.log(`   Updated ${updateResult.rowCount} devotional entries`);
    }

    console.log('\n✨ All authentic content populated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

populateAuthenticScriptures();