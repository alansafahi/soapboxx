import { pool } from '../server/db.ts';

async function checkLeviticusContent() {
  const client = await pool.connect();
  
  try {
    // Check specifically the Leviticus days that were showing as generic
    const result = await client.query(`
      SELECT day_number, title, 
             LEFT(devotional_content, 100) as devotional_snippet,
             CASE 
               WHEN devotional_content LIKE '%establishes%' THEN 'HAS_ESTABLISHES'
               WHEN devotional_content LIKE '%demonstrates%' THEN 'HAS_DEMONSTRATES'
               WHEN devotional_content LIKE '%reveals fundamental%' THEN 'HAS_REVEALS'
               WHEN devotional_content LIKE '%Today''s Old Testament passage%' THEN 'HAS_TODAYS'
               ELSE 'CLEAN'
             END as pattern_status
      FROM reading_plan_days 
      WHERE plan_id = 23 AND day_number IN (22, 23, 24, 25, 27, 28, 29, 30)
      ORDER BY day_number
    `);
    
    console.log('📖 Checking Leviticus days for generic patterns:');
    result.rows.forEach(row => {
      console.log(`Day ${row.day_number}: ${row.title}`);
      console.log(`  Pattern Status: ${row.pattern_status}`);
      console.log(`  Content Preview: ${row.devotional_snippet}...`);
      console.log('');
    });
    
  } finally {
    client.release();
  }
}

checkLeviticusContent().catch(console.error);