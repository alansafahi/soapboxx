import { pool } from '../server/db.ts';

async function findPlaceholderReflections() {
  console.log('🔍 Finding placeholder reflection questions...');
  
  const client = await pool.connect();
  
  try {
    // Look for common placeholder patterns
    const result = await client.query(`
      SELECT id, day_number, title, 
             LEFT(reflection_question, 200) as reflection_preview,
             LENGTH(reflection_question) as length
      FROM reading_plan_days 
      WHERE plan_id = 23 AND (
        reflection_question LIKE '%What stands out to you%' OR
        reflection_question LIKE '%How does this passage connect%' OR
        reflection_question LIKE '%overall story%' OR
        reflection_question LIKE '%today''s reading%' OR
        LENGTH(reflection_question) < 200
      )
      ORDER BY day_number 
      LIMIT 20
    `);
    
    console.log(`📖 Found ${result.rows.length} days with placeholder/short reflections:`);
    
    result.rows.forEach(row => {
      console.log(`\nDay ${row.day_number}: ${row.title} (${row.length} chars)`);
      console.log(`Preview: ${row.reflection_preview}...`);
    });
    
    // Count total placeholder patterns
    const countResult = await client.query(`
      SELECT COUNT(*) as total_placeholders
      FROM reading_plan_days 
      WHERE plan_id = 23 AND (
        reflection_question LIKE '%What stands out to you%' OR
        reflection_question LIKE '%How does this passage connect%' OR
        reflection_question LIKE '%overall story%' OR
        reflection_question LIKE '%today''s reading%'
      )
    `);
    
    console.log(`\n📊 Total days with placeholder reflection patterns: ${countResult.rows[0].total_placeholders}`);
    
  } finally {
    client.release();
  }
}

findPlaceholderReflections().catch(console.error);