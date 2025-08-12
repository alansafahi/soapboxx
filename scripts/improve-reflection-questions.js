/**
 * Replace generic reflection questions with scripture-specific, meaningful questions
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

async function generateScriptureSpecificQuestion(scriptureRef, scriptureText, title) {
  try {
    const prompt = `As a theological scholar, create a profoundly meaningful reflection question for this Bible passage that is:

Scripture: ${scriptureRef}
Title: ${title}
Text: ${scriptureText}

Requirements:
1. SCRIPTURE-SPECIFIC: Must reference specific elements, themes, or characters from this exact passage
2. PERSONALLY APPLICABLE: Connects the ancient text to modern spiritual growth
3. DEEP AND MEANINGFUL: Goes beyond surface-level observations to heart transformation
4. CHALLENGING: Prompts serious self-examination and spiritual reflection

Create ONE powerful reflection question (not multiple questions). Make it profound, specific to this passage, and personally transformative.

Examples of GOOD scripture-specific questions:
- "How does Paul's description of spiritual armor in verses 13-17 reveal specific areas where you might be spiritually vulnerable in your daily battles?"
- "What does David's response to Goliath's taunts teach you about facing the 'giants' that mock your faith today?"

Examples of BAD generic questions to avoid:
- "How can you apply this to your life?"
- "What is God teaching you?"
- "How does this passage speak to you?"

Return only the reflection question, nothing else.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content?.trim() || null;
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return null;
  }
}

async function improveReflectionQuestions() {
  try {
    console.log('🔄 Finding days with generic reflection questions...');

    // Get days with generic or poorly written reflection questions
    const result = await pool.query(`
      SELECT id, plan_id, day_number, title, scripture_reference, scripture_text, reflection_question
      FROM reading_plan_days 
      WHERE reflection_question LIKE '%How can you apply%'
         OR reflection_question LIKE '%What is God teaching%'
         OR reflection_question LIKE '%How does this passage%'
         OR reflection_question LIKE '%What does today%'
         OR reflection_question LIKE '%How will you%'
         OR reflection_question LIKE '%What specific%'
         OR reflection_question = 'What specific truths or insights do you see in this passage?'
         OR reflection_question = 'How can you apply this Scripture to your life today?'
      ORDER BY plan_id, day_number
      LIMIT 50
    `);

    const days = result.rows;
    console.log(`Found ${days.length} days needing improved reflection questions`);

    let successCount = 0;
    let errorCount = 0;

    for (const day of days) {
      console.log(`\n📝 Processing Day ${day.day_number}: ${day.title}`);
      console.log(`   Current Question: ${day.reflection_question}`);

      if (!day.scripture_text || day.scripture_text.includes('Loading from Bible API')) {
        console.log(`   ⏭️  Skipping - no authentic scripture text yet`);
        continue;
      }

      // Generate scripture-specific reflection question
      const newQuestion = await generateScriptureSpecificQuestion(
        day.scripture_reference, 
        day.scripture_text, 
        day.title
      );
      
      if (newQuestion) {
        // Update with new meaningful question
        await pool.query(`
          UPDATE reading_plan_days 
          SET reflection_question = $1 
          WHERE id = $2
        `, [newQuestion, day.id]);
        
        console.log(`   ✅ Updated: ${newQuestion}`);
        successCount++;
      } else {
        console.log(`   ❌ Failed to generate question`);
        errorCount++;
      }

      // Rate limiting: wait 2 seconds between API calls
      await delay(2000);
    }

    console.log(`\n🎉 Reflection question improvement complete!`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

improveReflectionQuestions();