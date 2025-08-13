import { pool } from '../server/db.ts';

async function checkTableStructure() {
  const client = await pool.connect();
  
  try {
    // Check the actual table structure
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reading_plan_days' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Table structure for reading_plan_days:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Check a few sample records
    const sample = await client.query(`
      SELECT id, day_number, title, 
             CASE WHEN reflection_question IS NULL THEN 'NULL' 
                  ELSE 'HAS_CONTENT(' || LENGTH(reflection_question) || ')' END as reflection_status
      FROM reading_plan_days 
      WHERE plan_id = 23 
      ORDER BY day_number 
      LIMIT 10
    `);
    
    console.log('\n📖 Sample records:');
    sample.rows.forEach(row => {
      console.log(`  Day ${row.day_number}: ${row.title} - Reflection: ${row.reflection_status}`);
    });
    
    // Count NULL vs non-NULL reflection questions
    const counts = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(reflection_question) as has_reflection,
        COUNT(*) - COUNT(reflection_question) as missing_reflection
      FROM reading_plan_days 
      WHERE plan_id = 23
    `);
    
    console.log('\n📊 Reflection question counts:');
    console.log(`  Total days: ${counts.rows[0].total}`);
    console.log(`  Have reflection: ${counts.rows[0].has_reflection}`);
    console.log(`  Missing reflection: ${counts.rows[0].missing_reflection}`);
    
  } finally {
    client.release();
  }
}

checkTableStructure().catch(console.error);