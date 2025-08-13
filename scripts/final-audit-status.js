import { pool } from '../server/db.ts';

async function finalAuditStatus() {
  console.log('📊 FINAL AUDIT: Status of reflection question improvements...');
  
  const client = await pool.connect();
  
  try {
    // Check the specific plans from your screenshots
    const priorityPlans = [3, 4, 5, 6, 22, 23, 24, 44];
    
    console.log('\n🎯 STATUS OF KEY PLANS:');
    
    for (const planId of priorityPlans) {
      const planInfo = await client.query(`
        SELECT name, difficulty FROM reading_plans WHERE id = $1
      `, [planId]);
      
      if (planInfo.rows.length === 0) continue;
      
      const placeholderCheck = await client.query(`
        SELECT 
          COUNT(*) as total_days,
          COUNT(CASE WHEN 
            reflection_question LIKE '%How is%word a lamp%' OR
            reflection_question LIKE '%What does this%reveal%' OR
            reflection_question LIKE '%How does%connect%' OR
            reflection_question LIKE '%What stands out%' OR
            LENGTH(reflection_question) < 100 
          THEN 1 END) as placeholder_count,
          COUNT(CASE WHEN LENGTH(reflection_question) > 300 THEN 1 END) as quality_count
        FROM reading_plan_days 
        WHERE plan_id = $1
      `, [planId]);
      
      const stats = placeholderCheck.rows[0];
      const plan = planInfo.rows[0];
      
      console.log(`\n📖 Plan ${planId}: ${plan.name}`);
      console.log(`   Difficulty: ${plan.difficulty}`);
      console.log(`   Total days: ${stats.total_days}`);
      console.log(`   Still need fixing: ${stats.placeholder_count}`);
      console.log(`   High-quality reflections: ${stats.quality_count}`);
      
      if (stats.placeholder_count === '0') {
        console.log(`   ✅ COMPLETE - All reflection questions fixed!`);
      } else {
        console.log(`   ⚠️  ${stats.placeholder_count} days still need attention`);
      }
    }
    
    // Overall summary
    console.log('\n🏆 OVERALL PROGRESS SUMMARY:');
    
    const overallStats = await client.query(`
      SELECT 
        COUNT(DISTINCT rp.id) as total_plans,
        COUNT(DISTINCT CASE WHEN rp.difficulty = 'beginner' THEN rp.id END) as disciple_plans,
        COUNT(rpd.id) as total_days,
        COUNT(CASE WHEN 
          rpd.reflection_question LIKE '%How is%word a lamp%' OR
          rpd.reflection_question LIKE '%What does this%reveal%' OR
          rpd.reflection_question LIKE '%How does%connect%' OR
          rpd.reflection_question LIKE '%What stands out%' OR
          LENGTH(rpd.reflection_question) < 100 
        THEN 1 END) as remaining_placeholders
      FROM reading_plans rp
      JOIN reading_plan_days rpd ON rp.id = rpd.plan_id
      WHERE rp.difficulty = 'beginner'
    `);
    
    const overall = overallStats.rows[0];
    console.log(`📚 Total Disciple plans: ${overall.disciple_plans}`);
    console.log(`📄 Total days across all plans: ${overall.total_days}`);
    console.log(`⚠️  Days still with placeholders: ${overall.remaining_placeholders}`);
    console.log(`✅ Days successfully upgraded: ${overall.total_days - overall.remaining_placeholders}`);
    
    const completionRate = ((overall.total_days - overall.remaining_placeholders) / overall.total_days * 100).toFixed(1);
    console.log(`🎯 Completion rate: ${completionRate}%`);
    
  } finally {
    client.release();
  }
}

finalAuditStatus().catch(console.error);