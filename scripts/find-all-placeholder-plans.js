import { pool } from '../server/db.ts';

async function findAllPlaceholderPlans() {
  console.log('🔍 Finding all plans with placeholder reflection questions...');
  
  const client = await pool.connect();
  
  try {
    // First, get all reading plans to understand which ones we need to fix
    const plansResult = await client.query(`
      SELECT DISTINCT rp.id, rp.name, rp.difficulty
      FROM reading_plans rp
      JOIN reading_plan_days rpd ON rp.id = rpd.plan_id
      WHERE rpd.reflection_question IS NOT NULL
      AND rp.difficulty = 'beginner'
      ORDER BY rp.id
    `);
    
    console.log(`📖 Found ${plansResult.rows.length} beginner plans with reflection questions:`);
    
    for (const plan of plansResult.rows) {
      console.log(`\nPlan ${plan.id}: ${plan.name}`);
      
      // Check for placeholder patterns in this plan
      const placeholderCheck = await client.query(`
        SELECT COUNT(*) as placeholder_count,
               COUNT(CASE WHEN LENGTH(reflection_question) < 100 THEN 1 END) as short_count
        FROM reading_plan_days 
        WHERE plan_id = $1 AND (
          reflection_question LIKE '%How is%word a lamp%' OR
          reflection_question LIKE '%What does this%reveal%' OR
          reflection_question LIKE '%How does%connect%' OR
          LENGTH(reflection_question) < 100
        )
      `, [plan.id]);
      
      const totalDays = await client.query(`
        SELECT COUNT(*) as total_days
        FROM reading_plan_days 
        WHERE plan_id = $1
      `, [plan.id]);
      
      console.log(`  - Total days: ${totalDays.rows[0].total_days}`);
      console.log(`  - Placeholder patterns: ${placeholderCheck.rows[0].placeholder_count}`);
      console.log(`  - Short reflections: ${placeholderCheck.rows[0].short_count}`);
      
      if (placeholderCheck.rows[0].placeholder_count > 0 || placeholderCheck.rows[0].short_count > 0) {
        console.log(`  ⚠️  NEEDS FIXING`);
      }
    }
    
  } finally {
    client.release();
  }
}

findAllPlaceholderPlans().catch(console.error);