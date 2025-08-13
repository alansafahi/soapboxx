#!/usr/bin/env node

// Fix remaining placeholder scripture issues in specific Torchbearer plans
// Focus on "Journey of Abundant Life" and "Paths of Peace and Growth"

import { Pool } from 'pg';
import fetch from 'node-fetch';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const BIBLE_API_BASE = 'https://bible-api.com';

async function fixRemainingTorchbearerIssues() {
  const client = await pool.connect();
  
  try {
    console.log("🔧 Fixing remaining placeholder scripture issues in Torchbearer plans...");
    
    // Focus on plans with placeholder issues
    const problematicPlans = ['Journey of Abundant Life', 'Paths of Peace and Growth'];
    
    for (const planName of problematicPlans) {
      console.log(`\n📝 Fixing ${planName}...`);
      
      // Get all days with placeholder scripture
      const daysResult = await client.query(`
        SELECT rpd.id, rpd.day_number, rpd.title, rpd.scripture_reference
        FROM reading_plan_days rpd
        JOIN reading_plans rp ON rp.id = rpd.plan_id
        WHERE rp.name = $1
        AND (rpd.scripture_text IS NULL OR rpd.scripture_text = '' OR rpd.scripture_reference = 'Psalm 1:1')
        ORDER BY rpd.day_number
      `, [planName]);
      
      const days = daysResult.rows;
      console.log(`   Found ${days.length} days with placeholder scripture to fix`);
      
      // Fix each day
      for (const day of days) {
        const realScriptureRef = generateContextualScriptureForPlan(planName, day.day_number, day.title);
        const scriptureText = await fetchScriptureText(realScriptureRef);
        
        if (scriptureText) {
          await client.query(`
            UPDATE reading_plan_days 
            SET scripture_reference = $1, scripture_text = $2
            WHERE id = $3
          `, [realScriptureRef, scriptureText, day.id]);
          
          console.log(`     ✅ Day ${day.day_number}: ${realScriptureRef}`);
        }
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log("\n🎉 Successfully fixed remaining Torchbearer placeholder scripture issues!");
    
  } catch (error) {
    console.error("❌ Error fixing remaining issues:", error);
    throw error;
  } finally {
    client.release();
  }
}

function generateContextualScriptureForPlan(planName, dayNumber, title) {
  const planLower = planName.toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Scripture references for abundant life theme
  const abundantLifeRefs = [
    'John 10:10', 'Ephesians 3:20', 'Philippians 4:19', 'Romans 8:32', 'James 1:17',
    '2 Corinthians 9:8', 'Psalm 23:1', 'Matthew 6:26', 'Luke 12:24', 'Psalm 84:11',
    'Isaiah 55:10-11', 'Jeremiah 29:11', 'Romans 8:28', 'Ephesians 1:3', 'Psalm 103:2-5'
  ];
  
  // Scripture references for peace and growth theme  
  const peaceGrowthRefs = [
    'Isaiah 26:3', 'John 14:27', 'Philippians 4:6-7', 'Romans 15:13', 'Colossians 3:15',
    '2 Peter 3:18', 'Ephesians 4:15', 'Colossians 2:6-7', 'Hebrews 6:1', '1 Peter 2:2',
    'Psalm 1:3', 'Isaiah 55:10-11', 'Matthew 13:23', 'Galatians 5:22-23', 'Romans 8:29'
  ];
  
  // Select appropriate reference based on plan theme
  if (planLower.includes('abundant')) {
    return abundantLifeRefs[dayNumber % abundantLifeRefs.length];
  } else if (planLower.includes('peace')) {
    return peaceGrowthRefs[dayNumber % peaceGrowthRefs.length];
  }
  
  // Fallback based on title keywords
  if (titleLower.includes('bless')) return 'Ephesians 1:3';
  if (titleLower.includes('creat')) return 'Genesis 1:31';
  if (titleLower.includes('faith')) return 'Hebrews 11:6';
  if (titleLower.includes('worship')) return 'John 4:24';
  if (titleLower.includes('trial')) return 'James 1:2-4';
  if (titleLower.includes('hope')) return 'Romans 15:13';
  if (titleLower.includes('redemp')) return 'Ephesians 1:7';
  if (titleLower.includes('scripture')) return '2 Timothy 3:16-17';
  if (titleLower.includes('living')) return 'John 7:38';
  if (titleLower.includes('community')) return 'Hebrews 10:24-25';
  
  // Default fallback
  return abundantLifeRefs[dayNumber % abundantLifeRefs.length];
}

async function fetchScriptureText(reference) {
  try {
    console.log(`   📖 Fetching ${reference}...`);
    const response = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(reference)}`);
    if (response.ok) {
      const data = await response.json();
      return data.text?.trim() || null;
    }
  } catch (error) {
    console.warn(`   ⚠️  Failed to fetch scripture for ${reference}:`, error.message);
  }
  return null;
}

// Execute the fix
fixRemainingTorchbearerIssues()
  .then(() => {
    console.log("\n✨ Remaining Torchbearer issues fixed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to fix remaining issues:", error);
    process.exit(1);
  });