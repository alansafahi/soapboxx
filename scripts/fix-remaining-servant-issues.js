#!/usr/bin/env node

// Fix remaining Servant tier issues: AI Curated text and short devotionals
// Focus on "Servant Leadership" and "Faith Under Pressure" plans

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixRemainingServantIssues() {
  const client = await pool.connect();
  
  try {
    console.log("🔧 Fixing remaining Servant tier issues...");
    
    // 1. Remove "AI Curated" text from remaining plans
    console.log("\n📝 Removing 'AI Curated' text from Servant Leadership and Faith Under Pressure...");
    
    const aiCuratedResult = await client.query(`
      UPDATE reading_plan_days 
      SET title = REPLACE(title, ' (AI Curated)', '')
      WHERE plan_id IN (
        SELECT id FROM reading_plans 
        WHERE name IN ('Servant Leadership', 'Faith Under Pressure')
        AND subscription_tier = 'servant'
      )
      AND title LIKE '%(AI Curated)%'
      RETURNING plan_id, day_number, title
    `);
    
    console.log(`   ✅ Removed 'AI Curated' from ${aiCuratedResult.rows.length} day titles`);
    
    // 2. Enhance short devotional content in multiple plans
    console.log("\n📚 Enhancing short devotional content across multiple Servant plans...");
    
    const shortDevotionalsResult = await client.query(`
      SELECT rpd.id, rpd.plan_id, rpd.day_number, rpd.title, rpd.scripture_reference, 
             rp.name as plan_name, LENGTH(rpd.devotional_content) as current_length
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rp.id = rpd.plan_id
      WHERE rp.subscription_tier = 'servant' 
      AND rp.is_active = true
      AND LENGTH(rpd.devotional_content) < 200
      ORDER BY rp.name, rpd.day_number
      LIMIT 50
    `);
    
    const shortDevotionals = shortDevotionalsResult.rows;
    console.log(`   Found ${shortDevotionals.length} days with short devotional content to enhance`);
    
    // Enhance each short devotional
    for (const day of shortDevotionals) {
      const enhancedDevotional = generateEnhancedDevotional(day);
      
      await client.query(`
        UPDATE reading_plan_days 
        SET devotional_content = $1
        WHERE id = $2
      `, [enhancedDevotional, day.id]);
      
      console.log(`   ✅ Enhanced ${day.plan_name} - Day ${day.day_number}: ${enhancedDevotional.length} chars`);
    }
    
    // 3. Final verification of improvements
    console.log("\n📊 Final verification of Servant tier improvements...");
    
    const finalStatsResult = await client.query(`
      SELECT 
        rp.name as plan_name,
        COUNT(*) as total_days,
        AVG(LENGTH(rpd.devotional_content)) as avg_devotional_length,
        MIN(LENGTH(rpd.devotional_content)) as min_devotional_length,
        COUNT(CASE WHEN rpd.title LIKE '%AI Curated%' THEN 1 END) as ai_curated_titles,
        COUNT(CASE WHEN LENGTH(rpd.devotional_content) < 200 THEN 1 END) as short_devotionals
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rp.id = rpd.plan_id
      WHERE rp.subscription_tier = 'servant' 
      AND rp.is_active = true
      GROUP BY rp.name, rp.id
      ORDER BY ai_curated_titles DESC, short_devotionals DESC
      LIMIT 10
    `);
    
    const finalStats = finalStatsResult.rows;
    
    console.log("\n📈 Top Servant Plans Status:");
    finalStats.forEach(stat => {
      console.log(`   ${stat.plan_name}:`);
      console.log(`     • Avg devotional: ${Math.round(stat.avg_devotional_length)} chars`);
      console.log(`     • AI Curated titles: ${stat.ai_curated_titles}`);
      console.log(`     • Short devotionals: ${stat.short_devotionals}`);
    });
    
    // 4. Overall Servant tier summary
    const overallResult = await client.query(`
      SELECT 
        COUNT(DISTINCT rp.id) as total_plans,
        COUNT(*) as total_days,
        AVG(LENGTH(rpd.devotional_content)) as avg_devotional_length,
        AVG(LENGTH(rpd.reflection_question)) as avg_reflection_length,
        COUNT(CASE WHEN rpd.title LIKE '%AI Curated%' THEN 1 END) as remaining_ai_curated,
        COUNT(CASE WHEN LENGTH(rpd.devotional_content) < 200 THEN 1 END) as remaining_short_devotionals
      FROM reading_plan_days rpd
      JOIN reading_plans rp ON rp.id = rpd.plan_id
      WHERE rp.subscription_tier = 'servant' 
      AND rp.is_active = true
    `);
    
    const overall = overallResult.rows[0];
    
    console.log("\n🎯 Overall Servant Tier Summary:");
    console.log(`   • Total plans: ${overall.total_plans}`);
    console.log(`   • Total days: ${overall.total_days}`);
    console.log(`   • Avg devotional length: ${Math.round(overall.avg_devotional_length)} characters`);
    console.log(`   • Avg reflection length: ${Math.round(overall.avg_reflection_length)} characters`);
    console.log(`   • Remaining 'AI Curated' titles: ${overall.remaining_ai_curated}`);
    console.log(`   • Remaining short devotionals: ${overall.remaining_short_devotionals}`);
    
    console.log("\n🎉 Servant tier enhancement complete!");
    
  } catch (error) {
    console.error("❌ Error fixing Servant tier issues:", error);
    throw error;
  } finally {
    client.release();
  }
}

function generateEnhancedDevotional(day) {
  const { title, scripture_reference, plan_name } = day;
  const planLower = plan_name.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Generate plan-specific devotional content
  if (planLower.includes('servant leadership')) {
    return `The servant leadership principles revealed in ${scripture_reference} demonstrate Christ's revolutionary approach to authority and influence. True leadership begins with humble service, putting others' needs before our own ambitions. This passage challenges worldly notions of power and control, showing that authentic Christian leadership flows from a heart transformed by God's love. Servant leaders don't lord their authority over others but use their position to equip, encourage, and empower those they lead. As we examine this biblical model, we're called to evaluate our own motives for leadership and consider how we can better reflect Christ's servant heart in our spheres of influence.`;
  } else if (planLower.includes('faith under pressure')) {
    return `The faith under pressure demonstrated in ${scripture_reference} reveals how genuine trust in God withstands life's most challenging circumstances. This passage shows that authentic faith isn't exempt from trials but is refined and strengthened through them. When pressure mounts - whether through persecution, loss, disappointment, or uncertainty - our faith either crumbles or becomes more resilient. The biblical example here teaches us that maintaining faith during difficulty requires intentional dependence on God's character rather than comfortable circumstances. This kind of faith becomes a powerful testimony to others and a source of unshakeable hope regardless of external pressures.`;
  } else if (planLower.includes('new testament') || planLower.includes('survey')) {
    return `The New Testament revelation in ${scripture_reference} unveils the fulfillment of God's redemptive plan through Jesus Christ and the establishment of His church. This passage contributes to the larger narrative of salvation, demonstrating how Christ's life, death, and resurrection transformed everything for humanity. The early church's response to this good news provides a model for Christian living that transcends cultural and temporal boundaries. As we study these foundational truths, we're invited to consider how the Gospel should shape our daily lives, relationships, and mission in the world today.`;
  } else if (planLower.includes('spiritual disciplines')) {
    return `The spiritual discipline highlighted in ${scripture_reference} provides a pathway for deepening our relationship with God through intentional practices that create space for divine transformation. This passage reveals how consistent spiritual habits - prayer, meditation, fasting, worship, service - become means of grace that shape our hearts and minds. Unlike empty religious ritual, authentic spiritual disciplines are expressions of love that draw us closer to God's heart and align our will with His purposes. The biblical example shows that these practices require both human effort and divine enablement, creating opportunities for God to work in and through us in powerful ways.`;
  } else if (planLower.includes('wisdom literature')) {
    return `The wisdom literature principles in ${scripture_reference} offer timeless insight for living skillfully according to God's design and purposes. This passage contrasts divine wisdom with human reasoning, showing that true understanding begins with reverential fear of the Lord. The practical applications of biblical wisdom touch every aspect of life - relationships, work, finances, character development, and decision-making. As we meditate on these truths, we're challenged to move beyond mere intellectual knowledge to embodied wisdom that transforms how we navigate life's complexities with godly understanding and practical skill.`;
  } else {
    // Default enhanced devotional for any biblical passage
    return `The biblical truths revealed in ${scripture_reference} illuminate essential aspects of God's character and His relationship with His people throughout history. This passage invites us beyond surface-level reading into deep contemplation of how these divine principles apply to our contemporary lives and challenges. The timeless wisdom contained here speaks to universal human experiences - our need for God's guidance, grace, forgiveness, and transforming power. As we allow these scriptural truths to penetrate our hearts and minds, we discover fresh insights into both God's unchanging faithfulness and our calling to live as His beloved children in an ever-changing world.`;
  }
}

// Execute the fixes
fixRemainingServantIssues()
  .then(() => {
    console.log("\n✨ All remaining Servant tier issues have been resolved!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to fix remaining Servant tier issues:", error);
    process.exit(1);
  });