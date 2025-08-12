/**
 * Generate unique, meaningful reflections for all reading plan days
 * This script replaces the generic "This passage reveals profound spiritual truths..." reflections
 * with contextual, personalized reflections based on the scripture content and plan type
 */

import pkg from 'pg';
const { Pool } = pkg;
import fetch from 'node-fetch';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Check if we have OpenAI API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required for generating unique reflections');
  process.exit(1);
}

// Delay function to respect API rate limits
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique reflection using OpenAI
async function generateUniqueReflection(scriptureText, scriptureReference, title, planCategory, planType, planDifficulty) {
  try {
    const prompt = `You are a skilled biblical scholar and devotional writer. Create a unique, thought-provoking devotional reflection based on the following scripture passage.

**Scripture Reference:** ${scriptureReference}
**Title:** ${title}
**Scripture Text:** ${scriptureText}

**Reading Plan Context:**
- Category: ${planCategory}
- Type: ${planType} 
- Difficulty Level: ${planDifficulty}

**Guidelines:**
1. Write a unique, meaningful reflection that goes beyond surface-level observations
2. Connect the scripture to practical daily life applications
3. Avoid generic phrases like "This passage reveals profound spiritual truths"
4. Make it specific to the scripture content and context
5. Consider the plan's category and difficulty level in your approach
6. Include insights that would be appropriate for the ${planDifficulty} level
7. Keep the reflection between 80-120 words
8. Write in an engaging, conversational tone that invites deeper contemplation

**Examples of what NOT to write:**
- "This passage reveals profound spiritual truths that speak directly to our daily walk with God"
- "These divinely inspired words contain depths of wisdom"
- Generic statements that could apply to any scripture

**Focus on:**
- Specific details from the scripture text
- Historical or cultural context when relevant
- Practical applications for modern life
- Emotional and spiritual insights unique to this passage
- Questions that arise from the text
- How this connects to the broader biblical narrative

Write only the devotional reflection content, no additional formatting or labels.`;

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
            content: 'You are a biblical scholar and devotional writer who creates unique, meaningful reflections that help people connect scripture to their daily lives.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const reflection = data.choices[0]?.message?.content?.trim();

    if (!reflection) {
      throw new Error('No reflection content generated');
    }

    // Validate the reflection doesn't contain generic phrases
    const genericPhrases = [
      'This passage reveals profound spiritual truths',
      'These divinely inspired words contain depths of wisdom',
      'As we meditate on these verses, we discover layers of meaning'
    ];

    const hasGenericPhrase = genericPhrases.some(phrase => 
      reflection.toLowerCase().includes(phrase.toLowerCase())
    );

    if (hasGenericPhrase) {
      throw new Error('Generated reflection contains generic phrases');
    }

    return reflection;

  } catch (error) {
    console.error(`Error generating reflection: ${error.message}`);
    return null;
  }
}

// Main function to update reflections
async function generateUniqueReflections() {
  try {
    console.log('🔄 Finding reading plan days with generic reflections...');

    // Get all days with generic reflections
    const result = await pool.query(`
      SELECT 
        rpd.id, 
        rpd.plan_id, 
        rpd.day_number, 
        rpd.title, 
        rpd.scripture_reference, 
        rpd.scripture_text, 
        rpd.devotional_content,
        rp.name as plan_name,
        rp.category,
        rp.type,
        rp.difficulty
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rpd.plan_id = rp.id
      WHERE rpd.devotional_content LIKE '%This passage reveals profound spiritual truths that speak directly to our daily walk with God%'
         OR rpd.devotional_content LIKE '%These divinely inspired words contain depths of wisdom%'
         OR rpd.devotional_content LIKE '%Allow these sacred words to penetrate your heart and mind%'
      ORDER BY rpd.plan_id, rpd.day_number
      LIMIT 50
    `);

    const days = result.rows;
    console.log(`Found ${days.length} days needing unique reflections`);

    let successCount = 0;
    let errorCount = 0;

    for (const day of days) {
      console.log(`\n📖 Processing: ${day.plan_name} - Day ${day.day_number}: ${day.title}`);
      console.log(`   Reference: ${day.scripture_reference}`);
      console.log(`   Category: ${day.category}, Type: ${day.type}, Difficulty: ${day.difficulty}`);

      // Skip if no scripture text
      if (!day.scripture_text || day.scripture_text.includes('Loading from Bible API')) {
        console.log('   ⚠️  Skipping - No scripture text available');
        errorCount++;
        continue;
      }

      // Generate unique reflection
      const uniqueReflection = await generateUniqueReflection(
        day.scripture_text,
        day.scripture_reference,
        day.title,
        day.category,
        day.type,
        day.difficulty
      );
      
      if (uniqueReflection) {
        // Update with unique reflection
        await pool.query(`
          UPDATE reading_plan_days 
          SET devotional_content = $1 
          WHERE id = $2
        `, [uniqueReflection, day.id]);
        
        console.log(`   ✅ Generated unique reflection (${uniqueReflection.length} chars)`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to generate unique reflection`);
        errorCount++;
      }

      // Rate limiting: wait 2 seconds between OpenAI requests
      await delay(2000);
    }

    console.log(`\n🎉 Unique reflection generation complete!`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

    // Check how many generic reflections remain
    const remainingResult = await pool.query(`
      SELECT COUNT(*) as remaining_count 
      FROM reading_plan_days 
      WHERE devotional_content LIKE '%This passage reveals profound spiritual truths that speak directly to our daily walk with God%'
         OR devotional_content LIKE '%These divinely inspired words contain depths of wisdom%'
         OR devotional_content LIKE '%Allow these sacred words to penetrate your heart and mind%'
    `);

    const remainingCount = remainingResult.rows[0].remaining_count;
    console.log(`\n📊 Remaining generic reflections: ${remainingCount}`);
    
    if (remainingCount > 0) {
      console.log('💡 Run this script again to continue processing remaining reflections');
    } else {
      console.log('🎉 All generic reflections have been replaced with unique content!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

generateUniqueReflections();