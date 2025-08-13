import { pool } from '../server/db.ts';

async function findExactPlaceholders() {
  console.log('🔍 Finding exact placeholder patterns from screenshot...');
  
  const client = await pool.connect();
  
  try {
    // Check for the exact patterns visible in the screenshot
    const result = await client.query(`
      SELECT id, day_number, title, reflection_question
      FROM reading_plan_days 
      WHERE plan_id = 23 AND (
        reflection_question LIKE '%What stands out to you in today''s reading%' OR
        reflection_question LIKE '%How does this passage connect to God''s overall story%'
      )
      ORDER BY day_number 
      LIMIT 50
    `);
    
    console.log(`📖 Found ${result.rows.length} days with exact screenshot placeholders:`);
    
    result.rows.forEach(row => {
      console.log(`\nDay ${row.day_number}: ${row.title}`);
      console.log(`Full reflection: ${row.reflection_question}`);
    });

    // Also check for any reflection questions that are exactly the template we saw
    const templateCheck = await client.query(`
      SELECT id, day_number, title, reflection_question
      FROM reading_plan_days 
      WHERE plan_id = 23 AND 
        reflection_question = 'How does this passage reveal God''s character and His relationship with His people? What specific attributes of God do you see displayed in this ancient narrative?

What themes of faith, obedience, or covenant relationship emerge from this text? How do these timeless themes connect to your personal spiritual journey and contemporary challenges?

In what ways does this passage speak to modern struggles you face? How can the principles and truths demonstrated here guide your decisions, relationships, and spiritual growth?

What does this text teach about the nature of spiritual maturity and transformation? How is God calling you to deeper commitment and trust through these sacred words that have shaped believers for millennia?'
      ORDER BY day_number 
      LIMIT 10
    `);
    
    console.log(`\n🔄 Days using our generic template: ${templateCheck.rows.length}`);
    templateCheck.rows.forEach(row => {
      console.log(`Day ${row.day_number}: ${row.title} - Using our template`);
    });
    
  } finally {
    client.release();
  }
}

findExactPlaceholders().catch(console.error);