import { pool } from '../server/db.ts';

async function addReflectionQuestions() {
  console.log('🔧 Adding reflection questions using raw SQL...');
  
  const reflectionTemplate = `How does this passage reveal God's character and His relationship with His people? What specific attributes of God do you see displayed in this text?

What themes of faith, obedience, or covenant relationship emerge from this narrative? How do these ancient themes connect to your personal spiritual journey today?

In what ways does this passage speak to contemporary challenges you face? How can the principles and truths demonstrated here guide your decisions and relationships?

What does this text teach about the nature of spiritual growth and maturity? How is God calling you to deeper commitment and trust through these ancient words?`;

  const client = await pool.connect();
  
  try {
    // Get days that need reflection questions (first 100)
    const result = await client.query(
      'SELECT id, day_number, title FROM reading_plan_days WHERE plan_id = 23 AND (reflection_question IS NULL OR LENGTH(COALESCE(reflection_question, \'\')) < 50) ORDER BY day_number LIMIT 100'
    );
    
    console.log(`📖 Found ${result.rows.length} days needing reflection questions`);
    
    let updated = 0;
    
    for (const row of result.rows) {
      try {
        await client.query(
          'UPDATE reading_plan_days SET reflection_question = $1 WHERE id = $2',
          [reflectionTemplate, row.id]
        );
        
        console.log(`✅ Added reflection questions to Day ${row.day_number}: ${row.title}`);
        updated++;
      } catch (error) {
        console.log(`❌ Error updating Day ${row.dayNumber}:`, error.message);
      }
    }
    
    console.log(`📊 Updated ${updated} days with reflection questions`);
  } finally {
    client.release();
  }
}

addReflectionQuestions().catch(console.error);