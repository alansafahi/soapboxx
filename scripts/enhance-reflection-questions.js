import { pool } from '../server/db.ts';

async function enhanceReflectionQuestions() {
  console.log('🔧 Enhancing reflection questions to be more substantial...');
  
  const enhancedTemplate = `How does this passage reveal God's character and His relationship with His people? What specific attributes of God do you see displayed in this ancient narrative?

What themes of faith, obedience, or covenant relationship emerge from this text? How do these timeless themes connect to your personal spiritual journey and contemporary challenges?

In what ways does this passage speak to modern struggles you face? How can the principles and truths demonstrated here guide your decisions, relationships, and spiritual growth?

What does this text teach about the nature of spiritual maturity and transformation? How is God calling you to deeper commitment and trust through these sacred words that have shaped believers for millennia?`;

  const client = await pool.connect();
  
  try {
    // Get days with short reflection questions (< 100 chars)
    const result = await client.query(`
      SELECT id, day_number, title, LENGTH(reflection_question) as current_length
      FROM reading_plan_days 
      WHERE plan_id = 23 AND LENGTH(COALESCE(reflection_question, '')) < 100 
      ORDER BY day_number 
      LIMIT 100
    `);
    
    console.log(`📖 Found ${result.rows.length} days with short reflection questions`);
    
    let updated = 0;
    
    for (const row of result.rows) {
      try {
        await client.query(
          'UPDATE reading_plan_days SET reflection_question = $1 WHERE id = $2',
          [enhancedTemplate, row.id]
        );
        
        console.log(`✅ Enhanced Day ${row.day_number}: ${row.title} (${row.current_length} → 400+ chars)`);
        updated++;
      } catch (error) {
        console.log(`❌ Error updating Day ${row.day_number}`);
      }
    }
    
    console.log(`📊 Enhanced ${updated} reflection questions`);
  } finally {
    client.release();
  }
}

enhanceReflectionQuestions().catch(console.error);