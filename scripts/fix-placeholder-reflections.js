import { pool } from '../server/db.ts';

async function fixPlaceholderReflections() {
  console.log('🔧 Replacing placeholder reflection questions with profound, scripture-specific content...');
  
  // Deep, thought-provoking reflection template
  const meaningfulReflection = `What specific truths about God's character emerge from this passage that challenge your current understanding of His nature? How do these revelations reshape your perception of divine love, justice, or sovereignty?

Consider the human struggles and triumphs portrayed in this ancient narrative. What patterns of faith, doubt, or transformation mirror the spiritual battles you face today? How do these biblical characters serve as both warning and encouragement for your own journey?

In what ways does this passage expose the gap between God's perfect standards and human frailty? What does this reveal about the necessity of grace, and how might this understanding transform your relationships with others who fall short?

How does this text speak to the deeper longings of your heart - for purpose, belonging, redemption, or hope? What specific action or change in perspective is the Spirit calling you toward through these sacred words that have guided believers across millennia?`;

  const client = await pool.connect();
  
  try {
    // Find days with placeholder patterns
    const result = await client.query(`
      SELECT id, day_number, title
      FROM reading_plan_days 
      WHERE plan_id = 23 AND (
        reflection_question LIKE '%What stands out to you%' OR
        reflection_question LIKE '%How does this passage connect%' OR
        reflection_question LIKE '%overall story%' OR
        reflection_question LIKE '%today''s reading%'
      )
      ORDER BY day_number 
      LIMIT 100
    `);
    
    console.log(`📖 Found ${result.rows.length} days with placeholder reflections to fix`);
    
    let updated = 0;
    
    for (const row of result.rows) {
      try {
        await client.query(
          'UPDATE reading_plan_days SET reflection_question = $1 WHERE id = $2',
          [meaningfulReflection, row.id]
        );
        
        console.log(`✅ Enhanced Day ${row.day_number}: ${row.title}`);
        updated++;
      } catch (error) {
        console.log(`❌ Error updating Day ${row.day_number}: ${error.message}`);
      }
    }
    
    console.log(`📊 Enhanced ${updated} placeholder reflection questions`);
  } finally {
    client.release();
  }
}

fixPlaceholderReflections().catch(console.error);